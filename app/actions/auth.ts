"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signInLocal, signInSupabase, signOut } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/data";
import { rateLimit } from "@/lib/ratelimit";
import { loginSchema, ok, fail, type ActionResult } from "@/lib/validation";

export async function login(input: { email: string; password: string }): Promise<ActionResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "local";
  const limit = Number(process.env.ADMIN_RATE_LIMIT_PER_MIN ?? 10);
  if (!rateLimit(`login:${ip}`, limit)) return fail("Too many attempts — wait a minute and try again.");

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid credentials.", { email: "Check email & password" });

  const session = isSupabaseConfigured()
    ? await signInSupabase(parsed.data.email, parsed.data.password)
    : await signInLocal(parsed.data.email, parsed.data.password);
  if (!session) return fail("Invalid email or password.");
  return ok(undefined, `Welcome back, ${session.email}`);
}

export async function logout(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
