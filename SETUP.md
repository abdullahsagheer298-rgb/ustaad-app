# Setup

## Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment; not needed to run locally)
- An [Anthropic API key](https://console.anthropic.com)

## 1. Create the Supabase project

1. Go to supabase.com → New Project.
2. Pick a name (e.g. `ustaad`) and a strong database password — save that
   password somewhere safe, it's separate from the API keys below.
3. Once the project finishes provisioning, go to **Settings → API** and
   copy:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this
     one especially private — it bypasses all security rules)

## 2. Run the database migration

The schema lives in `supabase/migrations/`, applied in order. Easiest path
without installing the Supabase CLI:

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste and run the contents of `supabase/migrations/0001_init_profiles.sql`.
3. Paste and run the contents of `supabase/migrations/0002_students.sql`.
4. Paste and run the contents of `supabase/migrations/0003_study_materials.sql`
   — this one also creates the `study-materials` Storage bucket and its
   access policies, so don't skip it even though it touches Storage, not
   just the database.
5. Paste and run the contents of `supabase/migrations/0004_chat_messages.sql`
   — adds the `extracted_text` column to `study_materials` and creates the
   `chat_messages` table used by the AI teacher chat feature.

(If you do have the Supabase CLI installed and the project linked, `supabase
db push` does the same thing.)

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values from step 1, plus your Anthropic API key. See
`ENVIRONMENT.md` for what each variable does.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit:
- `http://localhost:3000` — should load without errors
- `http://localhost:3000/api/health` — should report all checks as `true`

## 5. Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, "Add New Project" → import the GitHub repo.
3. Add the same environment variables from `.env.local` in Vercel's
   Project Settings → Environment Variables.
4. Deploy.

## Regenerating database types after a schema change

Whenever `supabase/migrations/` changes, regenerate `types/database.ts` so
the app's TypeScript types stay accurate:

```bash
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

(Requires being logged into the Supabase CLI: `npx supabase login`.)
