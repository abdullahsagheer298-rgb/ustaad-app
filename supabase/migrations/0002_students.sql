-- Phase 2: student profiles.
--
-- Each student belongs to exactly one parent (profiles.id). RLS ensures a
-- parent can only ever see, create, update, or delete their own children's
-- rows — this is the pattern every future table (materials, quizzes,
-- scores, progress) should follow: a parent-scoping foreign key + RLS
-- policies shaped like these.

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  class_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_parent_id_idx on public.students (parent_id);

alter table public.students enable row level security;

create policy "students_select_own"
  on public.students for select
  using (auth.uid() = parent_id);

create policy "students_insert_own"
  on public.students for insert
  with check (auth.uid() = parent_id);

create policy "students_update_own"
  on public.students for update
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "students_delete_own"
  on public.students for delete
  using (auth.uid() = parent_id);
