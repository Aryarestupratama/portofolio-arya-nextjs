-- ============================================================
-- storage_setup.sql
-- Bucket project-images + policy, sesuai Architecture.md §2.3
-- ============================================================

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Publik boleh baca (SELECT) gambar project — bucket public + policy read.
create policy "project_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

-- Hanya authenticated (owner) yang boleh upload/update/delete.
create policy "project_images_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "project_images_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "project_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
