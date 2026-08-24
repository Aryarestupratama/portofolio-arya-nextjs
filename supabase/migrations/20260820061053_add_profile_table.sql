-- Migration: add `profile` table (single row, owner data)
-- Menggantikan object PROFILE hardcoded di app/(public)/page.tsx & Footer.tsx
-- Lihat Progress.md "Yang belum dikerjakan" & diskusi profile field.

create table if not exists profile (
  id smallint primary key default 1,
  name varchar(150) not null default 'Your Name',
  tagline varchar(255),               -- baris singkat di bawah nama, Hero
  role varchar(100),                  -- contoh: "Web Developer"
  about_bio text,
  about_photo_url varchar,            -- link Google Drive
  contact_intro text,
  contact_email varchar(255),
  github_url varchar,
  linkedin_url varchar,
  dribbble_url varchar,
  cv_url varchar,                     -- link Google Drive
  location varchar(150),
  availability varchar(100),          -- contoh: "Open to work"
  meta_description varchar(300),      -- default SEO description, layout.tsx
  site_title varchar(150),            -- default SEO title, layout.tsx
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- single-row guard: hanya boleh ada 1 baris (id selalu 1)
  constraint profile_singleton check (id = 1)
);

-- reuse trigger updated_at yang sama polanya dengan tabel lain
-- (asumsikan function set_updated_at() sudah ada dari init_schema.sql;
-- kalau belum ada, uncomment block di bawah)
-- create or replace function set_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

create trigger profile_set_updated_at
  before update on profile
  for each row
  execute function set_updated_at();

-- seed 1 row default supaya query getProfile() selalu ada hasil
insert into profile (id, name)
values (1, 'Your Name')
on conflict (id) do nothing;

-- RLS: SELECT publik (dipakai di Home & layout.tsx), mutasi hanya authenticated
alter table profile enable row level security;

create policy "profile_select_public"
  on profile for select
  to anon, authenticated
  using (true);

create policy "profile_update_owner"
  on profile for update
  to authenticated
  using (true)
  with check (true);

-- sengaja TIDAK ada policy insert/delete untuk siapapun (termasuk
-- authenticated) — baris cuma dibuat sekali lewat seed di atas, owner
-- cuma boleh UPDATE, bukan bikin baris baru atau hapus.
