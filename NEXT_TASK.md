# Next Task

## Current status

Phase 4 is complete: the AI Teacher chat feature is live, grounded in
uploaded study material. A parent can open any subject that has material
and have their child's questions answered in a teaching style appropriate
to their class level, distinguishing material-based answers from general
knowledge. All checks (types, lint, 21 tests, build) pass. See
`PROJECT_STATUS.md`.

## Single most important next task

**Phase 5: Quiz generation and scoring, using the chat/material foundation.**

Specifically:
1. A "Test me" action on the chat page (or materials page) per subject:
   generates a short quiz (e.g. 5 questions) from the student's uploaded
   material for that subject, using the same `AIProvider` + material
   context pattern as the chat feature — ask the model for strict JSON
   output (question, options, correct index, explanation), same as the
   original standalone prototype (`ustaad.html`) did.
2. A `quiz_attempts` table (student_id, subject, score, total_questions,
   created_at) — same RLS pattern as `chat_messages`.
3. A quiz-taking UI: one question at a time, immediate feedback, a final
   score, saved to `quiz_attempts`.
4. This sets up Phase 6 (progress tracking) — don't build a progress
   dashboard yet, just make sure attempts are recorded with enough detail
   to summarize later (score, subject, date).

This is the natural next step: the original spec's flow is
teach → quiz → track progress, and Phase 4 just built the "teach" half.

## Known bugs

None currently open. See `CHANGELOG.md` for bugs found and fixed in
Phases 1–4. Phase 4 specifically: watch for `react/no-unescaped-entities`
lint errors when interpolating a possessive (`'s`) directly in JSX —
use `&apos;s` instead. Also watch for the same `@/` alias issue in any new
pure-logic file meant for Node's test runner: use relative imports there.

## Technical debt to keep in mind

- `types/database.ts` needs regenerating from the real Supabase project,
  and after adding `quiz_attempts` in Phase 5.
- No CI pipeline yet.
- No signed-URL download for materials, no edit/delete for profiles or
  materials.
- Text extraction is synchronous at upload time — fine for now, revisit
  if uploads start feeling slow.
- Old `.doc` files and images have no text extraction — the teaching chat
  and future quiz generator can't use their content yet.

## Decisions already made — don't revisit without a reason

- Stack: Next.js + Supabase + Vercel.
- AI calls happen only server-side, through `lib/ai/` — never call
  Anthropic directly from a new code path.
- Student profiles are rows in `students`, tied to a parent's
  `profiles.id` — not separate Supabase Auth users.
- Every table gets an ownership-scoping foreign key and RLS: direct
  `parent_id` check for parent-owned tables (`students`), or an `EXISTS`
  subquery through `students` for student-owned tables (`study_materials`,
  `chat_messages`, and `quiz_attempts` in Phase 5 should follow the same
  pattern).
- Subjects are free-text, not a fixed list.
- Chat and (per this plan) quizzes are scoped per student + subject,
  matching how material is organized.
- Text extraction lives only in `lib/materials/extract-text.ts` — reuse
  it rather than adding a second PDF/Word parsing path for quizzes.
