# Architecture

## Goals this architecture is optimizing for

1. A working MVP fast, for two students, with real accounts and real data.
2. Nothing that blocks migrating away from Supabase, Vercel, or Anthropic
   later without a full rewrite.
3. A codebase a non-technical parent never sees, but that stays
   understandable to whoever (human or AI) works on it next.

## High-level shape

```
Browser (parent / student)
        │
        ▼
Next.js app on Vercel
  ├── Server Components / pages   (reads data, respects RLS)
  ├── API routes (/app/api/*)     (AI calls, privileged writes)
  └── middleware.ts               (keeps Supabase auth session fresh)
        │
        ▼
Supabase
  ├── Postgres (all application data, Row Level Security everywhere)
  ├── Auth (parent accounts; student profiles are app-level rows, not
  │         separate auth users, in Phase 1)
  └── Storage (uploaded study material — added in a later phase)
        │
        ▼
AI Provider (Anthropic Claude today, swappable)
```

## The three abstraction boundaries that matter

These exist specifically so a later "migrate off X" decision is a
contained change, not a rewrite.

### 1. `lib/supabase/*` — the only place that imports the Supabase SDK

- `client.ts` — browser client (client components)
- `server.ts` — server client, respects the signed-in user's session and RLS
- `admin.ts` — service-role client that bypasses RLS; server-only, used
  sparingly and deliberately

Application code should never call `@supabase/supabase-js` directly outside
these three files. If we ever move to a different backend (e.g. a custom
Postgres + custom auth), these three files are what gets rewritten — the
rest of the app talks to them, not to Supabase's API shape.

### 2. `lib/ai/*` — the only place that knows which AI vendor we use

- `types.ts` — the `AIProvider` interface every feature codes against
- `providers/anthropic-provider.ts` — today's implementation
- `index.ts` — factory, chosen by the `AI_PROVIDER` env var

To add a second provider (or switch entirely), implement `AIProvider` in a
new file under `providers/` and add one case to the factory. No other file
in the app needs to change.

### 3. `lib/config/env.ts` — the only place that reads `process.env`

Centralizing this means a hosting migration (Vercel → elsewhere) or a
renamed variable is a one-file change, and missing configuration fails
loudly and immediately with a clear message instead of a mysterious runtime
error somewhere deep in a feature.

## Data model (Phase 1)

Only one table exists so far:

- `profiles` — one row per parent account, auto-created via a database
  trigger when someone signs up through Supabase Auth. Row Level Security
  restricts each parent to their own row.

Student profiles, classes, subjects, study materials, quizzes, tests,
scores, and progress history are **not yet modeled** — that's Phase 2+.
When they're added, they will all carry a `parent_id` (or similar)
foreign key and RLS policies following the same pattern as `profiles`, so
one parent's account can never read another's data.

## Why Next.js API routes instead of a separate backend service

Phase 1 goal is a working MVP for two children, not a distributed system.
Next.js API routes give us a real server boundary (so the Anthropic API key
and the Supabase service role key never reach the browser) without standing
up and deploying a second service. If usage ever grows enough to need a
dedicated backend (e.g. heavy background processing for uploaded study
material), that logic can move to its own service later — the API route
files are thin enough to move without dragging business logic with them, as
long as new features keep logic in `lib/` rather than inline in route
handlers.

## What Phase 1 deliberately does NOT include

- Student-facing UI of any kind
- Study material upload/storage
- Quiz/test generation or scoring
- Progress tracking
- Parent dashboard
- Camera-based monitoring (explicitly out of scope until requested)

These are unbuilt, not stubbed — there's no placeholder code to work around
later.
