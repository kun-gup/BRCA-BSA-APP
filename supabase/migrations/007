-- ============================================================
-- 007_notice_rulebook_upload.sql
-- Adds rulebook PDF support to notices, using Supabase Storage.
-- Run AFTER 006.
-- ============================================================

alter table notices add column if not exists rulebook_url text;

-- Create the storage bucket (public read, since rulebooks aren't sensitive)
-- Allows PDFs and common image formats (photos of a printed rulebook are
-- fine too), capped at 10MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rulebooks', 'rulebooks', true, 10485760,
  array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp'];

-- Anyone can read/download rulebooks
drop policy if exists "rulebooks_read_all" on storage.objects;
create policy "rulebooks_read_all"
  on storage.objects for select
  using (bucket_id = 'rulebooks');

-- Only a rep/captain/vice_captain (for their own activity) or admin can
-- upload. Convention: file path must start with the activity_id, e.g.
-- "<activity_id>/cricket-rules.pdf" -- this is how we check ownership,
-- since storage.objects has no activity_id column of its own.
drop policy if exists "rulebooks_upload_own_activity" on storage.objects;
create policy "rulebooks_upload_own_activity"
  on storage.objects for insert
  with check (
    bucket_id = 'rulebooks'
    and (
      is_admin()
      or owns_activity((split_part(name, '/', 1))::uuid)
    )
  );

drop policy if exists "rulebooks_delete_own_activity" on storage.objects;
create policy "rulebooks_delete_own_activity"
  on storage.objects for delete
  using (
    bucket_id = 'rulebooks'
    and (
      is_admin()
      or owns_activity((split_part(name, '/', 1))::uuid)
    )
  );
