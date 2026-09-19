/**
 * Admin authentication (server-side only). Customers never authenticate.
 *  • Supabase mode: Supabase Auth (@supabase/ssr) + admin_profiles link.
 *  • Local Demo Mode: scrypt-hashed password in admin_profiles + HMAC-signed
 *    HttpOnly cookie (the same cookie format middleware verifies on the edge).
 */
import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { AdminSession } from "@/lib/types";
import { getAdapter, isSupabaseConfigured } from "@/lib/data";

export const ADMIN_COOKIE = "imn_admin_session";
const LOCAL_DEV_SECRET = "imn-local-demo-secret-change-me";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || LOCAL_DEV_SECRET;
}

/* ── cookie token (edge-safe HMAC) ─────────────────────────────────────── */
export function signToken(payload: { email: string; name?: string | null; role?: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifyToken(token: string | undefined): { email: string; name?: string | null; role?: string; exp: number } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exp: number; email: string };
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ── password hashing (local mode) ─────────────────────────────────────── */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const got = crypto.scryptSync(password, salt, 64);
  const exp = Buffer.from(hash, "hex");
  return got.length === exp.length && crypto.timingSafeEqual(got, exp);
}

/* ── session helpers ───────────────────────────────────────────────────── */
export async function getSession(): Promise<AdminSession | null> {
  if (isSupabaseConfigured()) {
    const { createServerClient } = await import("@supabase/ssr");
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
    );
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) return null;
    const adapter = getAdapter();
    const profile = await adapter.getAdminByEmail(data.user.email);
    if (!profile) return null; // authenticated but not an admin
    return { email: profile.email, name: profile.full_name, role: profile.role };
  }
  const cookieStore = await cookies();
  const payload = verifyToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!payload) return null;
  return { email: payload.email, name: payload.name ?? null, role: (payload.role as AdminSession["role"]) ?? "owner" };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function signInLocal(email: string, password: string): Promise<AdminSession | null> {
  const adapter = getAdapter();
  const profile = await adapter.getAdminByEmail(email);
  if (!profile || !verifyPassword(password, profile.password_hash)) return null;
  const session = { email: profile.email, name: profile.full_name, role: profile.role };
  const token = signToken({ email: session.email, name: session.name, role: session.role, exp: Date.now() + 1000 * 60 * 60 * 12 });
  const cookieStore = await cookies();
  const prod = process.env.NODE_ENV === "production";
  cookieStore.set(ADMIN_COOKIE, token, {
    // SameSite=None + Secure so the session also works when the site is
    // embedded in a cross-site iframe (e.g. sandboxed live previews).
    httpOnly: true, sameSite: prod ? "none" : "lax", secure: prod,
    path: "/", maxAge: 60 * 60 * 12,
  });
  return session;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const { createServerClient } = await import("@supabase/ssr");
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (list) => list.forEach((c) => cookieStore.set(c.name, c.value, { ...c.options, httpOnly: false, secure: false })) } },
    );
    await supabase.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Supabase-mode sign-in is performed with @supabase/ssr in the login action. */
export async function signInSupabase(email: string, password: string): Promise<AdminSession | null> {
  const { createServerClient } = await import("@supabase/ssr");
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach((c) => cookieStore.set(c.name, c.value, { ...c.options, httpOnly: false, secure: false, sameSite: "lax", path: "/" })),
      },
    },
  );
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) return null;
  const adapter = getAdapter();
  let profile = await adapter.getAdminByEmail(data.user.email);
  if (!profile) {
    profile = await adapter.upsertAdminProfile({ email: data.user.email, full_name: data.user.user_metadata?.full_name ?? null, role: "owner", user_id: data.user.id });
  }
  return { email: profile.email, name: profile.full_name, role: profile.role };
}
