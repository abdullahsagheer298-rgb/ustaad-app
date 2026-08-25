# Environment Variables

All variables are declared in `.env.example`. Copy it to `.env.local` for
local development, and set the same values in Vercel's dashboard for
deployment. Never commit a file containing real values.

| Variable | Exposed to browser? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project's API URL. Safe to expose — it's a public endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase's public client key. Safe to expose by design — Row Level Security is what actually protects data, not secrecy of this key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **No — server only** | Bypasses Row Level Security entirely. Only read via `lib/supabase/admin.ts`. If this leaks, rotate it immediately in Supabase Settings → API. |
| `AI_PROVIDER` | No | Which `AIProvider` implementation to use. Currently only `anthropic`. |
| `ANTHROPIC_API_KEY` | **No — server only** | Claude API key. Only read via `lib/ai/providers/anthropic-provider.ts`. Never referenced from client components. |
| `ELEVENLABS_API_KEY` | **No — server only** | Optional. ElevenLabs API key, used only for Urdu voice playback (`/api/speech`) when the visitor's device has no local Urdu voice. Free account, no card required, at elevenlabs.io. Leave blank to skip this feature entirely. |
| `NEXT_PUBLIC_APP_URL` | Yes | The deployed app's base URL, used for building absolute links (e.g. auth email redirects) in later phases. |

## Rules this project follows

- Any variable prefixed `NEXT_PUBLIC_` is bundled into client-side
  JavaScript and is effectively public. Only put things there that are
  genuinely safe to expose.
- Every other variable is read only inside `lib/config/env.ts`, and only
  consumed from server-side files (API routes, server components, or files
  explicitly marked `"server-only"`).
- If you add a new third-party service, add its variables to
  `.env.example`, document them in the table above, and read them through
  `lib/config/env.ts` — not `process.env` directly elsewhere.
