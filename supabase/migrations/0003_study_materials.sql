-- Phase 3: study material upload.
--
-- Materials belong to a specific student (not directly to a parent), since
-- material is organized per-child per the product spec. Ownership still
-- traces back to a parent through students.parent_id, so RLS here uses an
-- EXISTS subquery against students rather than a direct parent_id column —
-- one less denormalized field to keep in sync.

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  subject text not null,
  file_name text not null,
  storage_path text not null unique,
  file_type text not null,
  file_size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists study_materials_student_id_idx on public.study_materials (student_id);

alter table public.study_materials enable row level security;

create policy "study_materials_select_own"
  on public.study_materials for select
  using (
    exists (
      select 1 from public.students
      where students.id = study_materials.student_id
        and students.parent_id = auth.uid()
    )
  );

create policy "study_materials_insert_own"
  on public.study_materials for insert
  with check (
    exists (
      select 1 from public.students
      where students.id = study_materials.student_id
        and students.parent_id = auth.uid()
    )
  );

create policy "study_materials_delete_own"
  on public.study_materials for delete
  using (
    exists (
      select 1 from public.students
      where students.id = study_materials.student_id
        and students.parent_id = auth.uid()
    )
  );

-- Private storage bucket for the actual uploaded files. Metadata lives in
-- the table above; the bucket holds only bytes.
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', false)
on conflict (id) do nothing;

-- Files are stored at paths shaped "{parent_uid}/{student_id}/{filename}",
-- so a simple folder-prefix check against auth.uid() is enough to scope
-- access — no join needed at the storage layer.
create policy "study_materials_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "study_materials_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "study_materials_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
