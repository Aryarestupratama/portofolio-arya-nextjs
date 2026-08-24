-- Migration: tambah kolom hero_photo_url ke tabel profile
-- Foto di Hero section (Home), sisi kosong di sebelah headline.
-- Sama seperti about_photo_url: link Google Drive, di-convert ke
-- direct image url via lib/utils/gdrive (toDirectImageUrl).

alter table profile
  add column if not exists hero_photo_url varchar;