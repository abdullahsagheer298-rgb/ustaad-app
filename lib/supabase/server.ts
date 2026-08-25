import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for use in server components, route handlers, and
 * server actions. Runs as the currently signed-in user (respects Row
 * Level Security) — use admin.ts instead when you deliberately need to
 * bypass RLS from trusted server code.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabase.url(), env.supabase.anonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called from a Server Component in some cases, where
          // cookies can't be mutated. Safe to ignore if middleware is
          // refreshing the session (see middleware.ts).
        }
      },
    },
  });
}
