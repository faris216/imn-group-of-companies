/**
 * Adapter selection — Supabase when configured, otherwise Local Demo Mode.
 * Cached per process. Server-only module (never import from client components).
 * require() is intentional: keeps the unused driver out of the active bundle.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { DataAdapter } from "./adapter";

declare global {
  var __imnAdapter: DataAdapter | undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getAdapter(): DataAdapter {
  if (globalThis.__imnAdapter) return globalThis.__imnAdapter;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { SupabaseAdapter } = require("./adapters/supabase") as typeof import("./adapters/supabase");
    globalThis.__imnAdapter = new SupabaseAdapter();
  } else {
    const { LocalAdapter } = require("./adapters/local") as typeof import("./adapters/local");
    globalThis.__imnAdapter = new LocalAdapter();
  }
  return globalThis.__imnAdapter;
}

export type { DataAdapter };
