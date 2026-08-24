-- 1. Kosongkan tabel
truncate table experiences;

-- 2. Tambah kolom baru, drop kolom lama
alter table experiences
  add column year_start smallint not null,
  add column year_end smallint,
  drop column "order",
  drop column period_text;