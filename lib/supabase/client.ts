"use client";

/**
 * Supabase client for use in the browser (client components).
 *
 * This is the ONLY place a browser-side Supabase client should be created.
 * If we ever migrate away from Supabase, this file (plus server.ts and
 * admin.ts) is the boundary that needs to change — application code should
 * import from here, never from `@supabase/supabase-js` directly.
 */
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/config/env";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(env.supabase.url(), env.supabase.anonKey());
}
