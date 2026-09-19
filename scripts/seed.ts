/**
 * Seed runner for Supabase mode (Local Demo Mode seeds automatically on first run).
 * Usage: npm run seed   (with Supabase env vars present)
 */
import { getAdapter, isSupabaseConfigured } from "../lib/data";
import { runSeed } from "../lib/data/seed";

async function main() {
  if (!isSupabaseConfigured()) {
    console.log("Local Demo Mode seeds automatically — nothing to do.");
    return;
  }
  const adapter = getAdapter();
  await runSeed(adapter);
  console.log("Seed complete against Supabase.");
  process.exit(0);
}
main();
