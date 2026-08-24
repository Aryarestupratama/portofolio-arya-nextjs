-- Migration: add `certificates` bucket di Supabase Storage
-- Menggantikan certificate_url (link Google Drive) dengan file yang di-host
-- sendiri, supaya preview iframe tidak lagi bergantung ke third-party
-- cookie Google Drive (lihat diskusi terkait: iframe /preview gagal load
-- di context cross-origin karena browser blok cookie sesi Drive).

-- ---------- Kosongkan data lama ----------
-- Data lama di certificate_url berisi link Google Drive, tidak kompatibel
-- dengan alur baru (path Supabase Storage). Dikosongkan dulu supaya tidak
-- ada baris dengan data yang salah format setelah migration ini jalan.
-- BREAKING: sertifikat harus diinput ulang manual lewat admin form
-- (dengan upload file) setelah migration ini + perubahan admin form selesai.

truncate table certificates;

-- ---------- Bucket ----------
-- Public read (dipakai preview iframe & tombol "Open in new tab"),
-- upload/update/delete hanya authenticated (owner) — pola sama persis
-- dengan bucket `project-images` di storage_setup.sql.

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- ---------- Storage policies ----------

create policy "certificates_bucket_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'certificates');

create policy "certificates_bucket_insert_owner"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'certificates');

create policy "certificates_bucket_update_owner"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'certificates')
  with check (bucket_id = 'certificates');

create policy "certificates_bucket_delete_owner"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificates');

-- ---------- Kolom certificates.certificate_url ----------
-- Isinya sekarang PATH di storage bucket 'certificates' (contoh:
-- "abc123-sertifikat-aws.pdf"), BUKAN lagi link Google Drive.
-- Nama kolom sengaja tidak diubah (tetap certificate_url) untuk
-- meminimalkan perubahan — kalau mau konsistensi penuh, rename manual
-- ke certificate_path di migration terpisah + update semua query terkait.

comment on column certificates.certificate_url is
  'Path file di Supabase Storage bucket "certificates" (bukan lagi link Google Drive). Resolve via getPublicImageUrl().';
