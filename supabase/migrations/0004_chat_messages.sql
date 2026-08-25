-- Phase 4: AI teaching chat, grounded in uploaded material.

-- Text extracted from a material at upload time (PDF/Word/text), used as
-- teaching context. Null means no extractable text (e.g. an image, an old
-- .doc file, or extraction failed) — the file itself is still stored and
-- listed either way.
alter table public.study_materials
  add column if not exists extracted_text text;

-- Chat is scoped to a student + subject, matching how material is
-- organized. Ownership follows the same EXISTS-through-students pattern
-- as study_materials, since a conversation belongs to a student, not
-- directly to a parent.
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  subject text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_student_subject_idx
  on public.chat_messages (student_id, subject, created_at);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select_own"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.students
      where students.id = chat_messages.student_id
        and students.parent_id = auth.uid()
    )
  );

create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.students
      where students.id = chat_messages.student_id
        and students.parent_id = auth.uid()
    )
  );
