# Changelog

## Phase 1 — Foundation

- Scaffolded Next.js (App Router, TypeScript, Tailwind) project.
- Added Supabase integration: browser client, session-aware server client,
  service-role admin client.
- Added `profiles` table migration with Row Level Security and an
  auto-create-on-signup trigger.
- Added a provider-agnostic `AIProvider` interface with an Anthropic/Claude
  implementation behind it.
- Centralized environment variable access with validation.
- Added `/api/health` configuration-check endpoint.
- Added auth session refresh via `proxy.ts` (Next.js 16 convention).
- Removed default Google Fonts dependency (Geist) from the starter
  template — replaced with system fonts, avoiding a build-time external
  network dependency.
- Wrote full documentation set: `README.md`, `ARCHITECTURE.md`,
  `SETUP.md`, `ENVIRONMENT.md`, `PROJECT_STATUS.md`, `NEXT_TASK.md`.
- Verified: TypeScript type-check, ESLint, and production build all pass.

## Phase 2 — Parent authentication and student profiles

- Added `students` table migration with Row Level Security, scoped to
  `parent_id`.
- Added sign-up, login, sign-out, and email-confirmation flows using
  Supabase Auth (`lib/auth/actions.ts`, `app/login`, `app/signup`,
  `app/auth/confirm`).
- Added a protected `(dashboard)` route group with a server-side auth
  guard (`app/(dashboard)/layout.tsx`).
- Added the "My Children" page: lists a parent's students, form to add a
  new one (`app/(dashboard)/children`).
- Added pure validation logic for student input
  (`lib/students/validation.ts`), shared between the UI and the server
  action.
- Home page (`/`) now redirects to `/children` or `/login` based on
  session state.
- Added the project's first automated tests: 5 unit tests covering
  student input validation, run via `npm run test`.
- Fixed: `middleware.ts` silently ignored on Next.js 16.2+ — renamed to
  `proxy.ts`.
- Fixed: `.gitignore`'s `.env*` pattern was also blocking `.env.example`.
- Fixed: hand-written `types/database.ts` was missing the required
  `Relationships` field on each table, silently breaking `insert()` types.
- Fixed: a `"use server"` file cannot export a plain constant — moved
  `emptyAuthState` out of `lib/auth/actions.ts` into `lib/auth/state.ts`.
- Verified: TypeScript type-check, ESLint, unit tests, and production
  build all pass.

## Phase 3 — Study material upload

- Added `study_materials` table with RLS scoped through `students` via an
  `EXISTS` subquery (materials belong to a student, not directly to a
  parent).
- Added a private Supabase Storage bucket (`study-materials`) with
  folder-prefix storage policies keyed on `{parent_uid}/{student_id}/...`.
- Added the per-student page (`app/(dashboard)/children/[studentId]`)
  listing uploaded materials grouped by subject, plus an upload form.
- Added `uploadMaterialAction`: validates file type/size, uploads to
  Storage, records metadata, and rolls back the storage write if the
  metadata insert fails.
- Added `lib/materials/validation.ts` (pure, testable) and 7 new unit
  tests (12 total across the project).
- Fixed: a `@/` path-alias import in the new validation module broke
  Node's native test runner (Next.js resolves the alias, Node doesn't) —
  switched to a relative import.
- Verified: TypeScript type-check, ESLint, unit tests, and production
  build all pass.

## Phase 4 — AI Teacher chat, grounded in uploaded material

- Added server-side text extraction (`lib/materials/extract-text.ts`)
  using `pdf-parse` for PDFs and `mammoth` for `.docx`; plain text read
  directly. Old `.doc` and images have no extractor yet (stored as
  `null`, file still kept and listed).
- Added `extracted_text` column to `study_materials`, populated at
  upload time.
- Added `chat_messages` table with RLS following the `study_materials`
  `EXISTS`-through-`students` pattern.
- Added the chat feature: `lib/chat/validation.ts`, `lib/chat/prompt.ts`
  (grounded system prompt, distinguishes material vs. general knowledge),
  `lib/chat/queries.ts`, `lib/chat/actions.ts` (uses the existing
  `AIProvider` interface), and the chat page/UI at
  `/children/[studentId]/chat`, linked from each subject on the
  materials page.
- Added 9 new unit tests (21 total) covering message validation, material
  context truncation, and system prompt construction.
- Fixed: an unescaped apostrophe in JSX (`student.full_name}'s`) tripped
  `react/no-unescaped-entities` — switched to `&apos;s`.
- Verified: TypeScript type-check, ESLint, unit tests, and production
  build all pass, including the new `pdf-parse`/`mammoth` server
  dependencies bundling correctly.

## Phase 4.1 — Voice input and voice output for the chat

- Added `lib/chat/use-speech.ts`: two client hooks wrapping browser-native
  speech APIs — `useSpeechToText` (tap-to-talk via `SpeechRecognition`,
  Chrome/Edge only) and `useTextToSpeech` (read-aloud via
  `speechSynthesis`, broadly supported). No new API keys or costs — both
  are built into the browser.
- Updated the chat panel: a microphone button fills the question box by
  voice instead of typing; every teacher reply is read aloud
  automatically as it arrives, plus a 🔊 replay button on each past
  reply. The mic button only appears when the browser supports it, with
  a plain-text note otherwise.
- Fixed: an ESLint disable comment (`react-hooks/set-state-in-effect`)
  was placed one line too early, so it silently failed to suppress the
  intended warning on the following line — multi-line comments push
  `eslint-disable-next-line` targeting past where you'd expect; keep the
  directive on the line immediately above the code it covers.
- Verified: TypeScript type-check, ESLint, unit tests (21, unchanged —
  the speech hooks are browser-API-dependent and not meaningfully unit
  testable outside a browser), and production build all pass.

## Phase 4.2 — Urdu voice support

- Added an English/Urdu toggle on the chat page. Speech recognition
  (microphone) uses `ur-PK` when Urdu is selected — Chrome's recognition
  handles spoken Urdu reasonably well.
- Text-to-speech now checks whether the device actually has an Urdu voice
  installed (`hasVoiceFor`) and shows a plain-language warning if not,
  rather than silently mispronouncing Urdu text with a fallback English
  voice. This is a genuine device limitation, not something fixable in
  the app — Windows needs an Urdu speech voice installed (Settings > Time
  & Language > Speech) for correct playback.
- The Urdu input field now displays right-to-left (`dir="rtl"`).
- Updated the teacher system prompt to reply in whichever language the
  student's message is written in (Urdu or English), so a spoken/typed
  Urdu question gets an Urdu answer rather than defaulting to English.
- Added 1 new unit test (22 total) confirming the prompt includes the
  language-matching instruction.
- Verified: TypeScript type-check, ESLint, unit tests, and production
  build all pass.

## Phase 4.3 — Azure Urdu voice output

- Added `/api/speech` server route: converts Urdu text to speech via
  Azure Cognitive Services (voice: `ur-PK-UzmaNeural`), since no browser
  ships a built-in Urdu voice. Requires `AZURE_SPEECH_KEY` and
  `AZURE_SPEECH_REGION` — returns 501 cleanly if unset, so the rest of
  the app is unaffected when this isn't configured.
- Updated `useTextToSpeech`: automatically uses the browser voice for
  English, and falls back to the Azure route for Urdu only when the
  device has no local Urdu voice. Reports back whether it actually
  worked (`ok` / `unconfigured` / `error`) so the UI shows an honest,
  specific message instead of assuming success.
- Added `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` as optional
  environment variables (`lib/config/env.ts`, `.env.example`,
  `ENVIRONMENT.md`).
- Verified: TypeScript type-check, ESLint, unit tests (22, unchanged —
  the new code is either a thin API route or browser-dependent, not
  meaningfully unit testable), and production build all pass, including
  the new `/api/speech` route.

## Phase 4.4 — Switched Urdu voice from Azure to ElevenLabs

- Replaced the Azure-based `/api/speech` implementation with ElevenLabs
  (`eleven_v3` model, which is the ElevenLabs model that supports Urdu).
  Reason: Azure requires a credit card to sign up even for its free
  tier; ElevenLabs' free tier (10,000 characters/month) needs no card.
- Renamed environment variables: `AZURE_SPEECH_KEY` /
  `AZURE_SPEECH_REGION` → single `ELEVENLABS_API_KEY`.
- No changes to the client-side hook or chat UI — the swap is entirely
  contained in `/api/speech`, since the client only ever talks to that
  route, never to the voice provider directly.
- Verified: TypeScript type-check, ESLint, unit tests (22, unchanged),
  and production build all pass.
