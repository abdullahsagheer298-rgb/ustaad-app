/**
 * Centralized environment variable access.
 *
 * Nothing outside this file should read from `process.env` directly.
 * That keeps every third-party dependency (Supabase, the AI provider,
 * future services) swappable without hunting through the codebase for
 * scattered `process.env.X` references.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in — see SETUP.md.`
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: () =>
      required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    // Service role key must NEVER be exposed to the client.
    // Only ever import this from server-side code (API routes, server components).
    serviceRoleKey: () =>
      required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
  ai: {
    provider: () => process.env.AI_PROVIDER || "anthropic",
    anthropicApiKey: () => required("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY),
  },
  speech: {
    // Optional: only needed for Urdu voice playback. Everything else in
    // the app works without this set.
    elevenLabsApiKey: () => process.env.ELEVENLABS_API_KEY,
  },
  app: {
    // Used for building absolute URLs (auth redirects, etc.) across environments.
    url: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};
