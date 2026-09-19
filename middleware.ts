/**
 * Edge guard for /admin/* (except /admin/login).
 * Local Demo Mode: verifies the HMAC-signed session cookie (Web Crypto).
 * Supabase mode: verifies the Supabase auth cookie via @supabase/ssr.
 * NOTE: this is UX-level protection; every Server Action re-checks server-side.
 */
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "imn_admin_session";

async function verifyLocal(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const enc = new TextEncoder();
  return crypto.subtle
    .importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, enc.encode(body)))
    .then((buf) => {
      const expected = b64url(new Uint8Array(buf));
      if (expected !== sig) return false;
      try {
        const payload = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
        return typeof payload.exp === "number" && payload.exp > Date.now();
      } catch {
        return false;
      }
    });
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname.startsWith("/admin/login");

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createServerClient } = await import("@supabase/ssr");
    let user = false;
    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );
    const { data } = await supabase.auth.getUser();
    user = !!data.user;
    if (!user && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (user && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
    return response;
  }

  const secret = process.env.ADMIN_SESSION_SECRET || "imn-local-demo-secret-change-me";
  const valid = await verifyLocal(req.cookies.get(ADMIN_COOKIE)?.value, secret);
  if (!valid && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (valid && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
