/**
 * Create an admin account.
 *  • Supabase mode: creates the Auth user (service role) + admin_profiles row.
 *  • Local mode:    upserts the local admin with a scrypt hash.
 * Usage: npm run create-admin -- email password [fullname]
 */
import { getAdapter, isSupabaseConfigured } from "../lib/data";
import { hashPassword } from "../lib/auth";

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npm run create-admin -- <email> <password> [full name]");
    process.exit(1);
  }
  if (password.length < 8) { console.error("Password must be at least 8 characters."); process.exit(1); }
  const adapter = getAdapter();

  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) { console.error("Auth user creation failed:", error.message); process.exit(1); }
    await adapter.upsertAdminProfile({ email, full_name: name ?? null, role: "owner", user_id: data.user?.id ?? null, must_change_password: false });
    console.log(`Admin created in Supabase Auth: ${email}`);
  } else {
    await adapter.upsertAdminProfile({ email, full_name: name ?? null, role: "owner", password_hash: hashPassword(password), must_change_password: false });
    console.log(`Local admin created: ${email}`);
  }
  process.exit(0);
}
main();
