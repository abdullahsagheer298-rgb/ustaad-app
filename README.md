# Ustaad — AI Teacher

An AI teacher application that can teach, quiz, test, and track progress for
students — starting as a private MVP for two children, architected to scale
into a full commercial platform later.

**Status: Phase 1 (foundation) complete.** No student-facing teaching
features exist yet. See [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for what's
done and [`NEXT_TASK.md`](./NEXT_TASK.md) for what's next.

## Stack

- **Frontend & hosting:** Next.js (App Router), deployed on Vercel
- **Database, auth, storage:** Supabase (Postgres + Row Level Security)
- **AI:** Claude (Anthropic), behind a swappable provider interface

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the pieces fit together
and why, and [`SETUP.md`](./SETUP.md) to run this locally.

## Quick start

\`\`\`bash
npm install
cp .env.example .env.local   # then fill in real values — see ENVIRONMENT.md
npm run dev
\`\`\`

Visit `http://localhost:3000` and `http://localhost:3000/api/health` to
confirm your environment variables are wired up correctly.

## Documentation index

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | How the app is structured, and the abstraction boundaries that keep it portable |
| `SETUP.md` | Step-by-step local setup, including Supabase project creation |
| `ENVIRONMENT.md` | What every environment variable is for |
| `PROJECT_STATUS.md` | What's built, what isn't, as of the latest change |
| `NEXT_TASK.md` | The single next recommended development task |
| `CHANGELOG.md` | Dated log of notable changes |
