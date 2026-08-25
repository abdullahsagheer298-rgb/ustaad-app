# Project Status

_Last updated: Phase 4 completion._

## Completed

**Phase 1 — Foundation**
- Next.js (App Router, TypeScript, Tailwind) scaffolded
- Supabase client set up for three contexts: browser, server (RLS-aware),
  admin (service role, server-only)
- AI provider abstraction (`AIProvider` interface) with an Anthropic/Claude
  implementation behind it
- Centralized, validated environment variable access
- `/api/health` configuration-check endpoint

**Phase 2 — Parent authentication and student profiles**
- `students` table with Row Level Security, scoped to `parent_id`
- Sign-up, login, sign-out, email confirmation via Supabase Auth
- Protected `(dashboard)` route group with a server-side auth guard
- "My Children" page: list + add student

**Phase 3 — Study material upload**
- `study_materials` table, RLS scoped through `students.parent_id`
- Private Supabase Storage bucket with folder-prefix storage policies
- Per-student page listing materials grouped by subject, with upload form

**Phase 4 — AI Teacher chat, grounded in uploaded material**
- Server-side text extraction at upload time: PDF (`pdf-parse`), Word
  `.docx` (`mammoth`), and plain text — stored in a new
  `study_materials.extracted_text` column. Old `.doc` and images have no
  extractor yet and store `null` (file still stored and listed either way).
- `chat_messages` table, scoped to `student_id` + `subject`, RLS following
  the same `EXISTS`-through-`students` pattern as `study_materials`.
- Chat page (`/children/[studentId]/chat?subject=...`) linked from each
  subject heading on the materials page — only subjects with uploaded
  material get a "Chat about X" link.
- `sendMessageAction` retrieves the student's extracted material for that
  subject, builds a grounded teacher system prompt (distinguishing
  material-based answers from general knowledge, per the original spec),
  and calls the existing `AIProvider` interface — no new direct calls to
  Anthropic.
- Teaching style follows the spec: simple language for the student's
  class level, one question at a time, guides rather than gives answers
  outright, encourages and corrects gently.
- Voice input (tap-to-talk, Chrome/Edge) and voice output (replies read
  aloud automatically, broadly supported) using the browser's built-in
  speech APIs — no new costs or API keys. Added for students who can't
  yet read or write fluently.
- 9 new unit tests (21 total): chat message validation, material-context
  truncation, and system-prompt construction.

## Not built yet (by design)

- Quiz or test generation
- Scoring or progress tracking
- Parent dashboard (beyond "My Children" + per-student material list)
- Homework / revision features
- Editing or deleting a student profile, or deleting an uploaded material
- Viewing/downloading an already-uploaded file
- Text extraction for old `.doc` files or images (no OCR)
- Camera-based monitoring (explicitly deferred until requested)

## Checks run (Phase 4)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Pass, 0 errors |
| `npx eslint .` | ✅ Pass, 0 errors/warnings (1 caught and fixed: unescaped apostrophe) |
| `npm run test` (21 unit tests) | ✅ Pass, 21/21 |
| `npm run build` | ✅ Pass — new route `/children/[studentId]/chat` generated; `pdf-parse`/`mammoth` bundle correctly server-side |

Not yet tested: an actual chat exchange against a live Supabase project
and a real Anthropic API call (needs migration `0004` run and a real
`ANTHROPIC_API_KEY`). That's the first thing to test by hand once deployed:
upload a PDF, wait for it to process, open its subject's chat, ask a
question, and confirm the answer reflects the uploaded content.

## Known limitations / technical debt

- `types/database.ts` needs regenerating from the real Supabase project,
  and after every future migration — remember the `Relationships` field
  on any new table.
- No CI pipeline yet.
- No edit/delete UI for student profiles or materials.
- No signed-URL download for uploaded materials yet.
- File type checking trusts the browser-reported MIME type.
- Text extraction happens synchronously during upload — a very large PDF
  could make the upload request slow. Fine for a private MVP; a background
  job would be the fix at scale.
- No retry/backoff on the AI provider call — a transient Anthropic error
  surfaces directly as "the teacher couldn't respond right now."
