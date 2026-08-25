import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client using the service role key.
 *
 * This BYPASSES Row Level Security entirely. Only use it for trusted
 * server-side operations that genuinely need elevated access (e.g. a
 * scheduled job, an admin-only API route). Never import this into any
 * client component — the `server-only` import above will throw a build
 * error if it accidentally ends up in client-side code.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.supabase.url(), env.supabase.serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
