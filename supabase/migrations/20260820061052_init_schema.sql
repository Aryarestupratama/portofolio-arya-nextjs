-- ============================================================
-- init_schema.sql
-- Initial schema for Portfolio Website (based on Schema.md)
-- ============================================================

-- ---------- ENUM TYPES ----------

create type project_category as enum ('personal', 'kuliah', 'client');
create type project_status as enum ('live', 'archived', 'in_progress');
create type recruitment_type as enum ('internship', 'job');
create type recruitment_status as enum ('listed', 'applied', 'on_process', 'accepted', 'rejected', 'no_response');

-- ---------- HELPER: auto-update updated_at ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. projects
-- ============================================================

create table projects (
  id bigint generated always as identity primary key,
  title varchar(150) not null,
  slug varchar(150) not null unique,
  description text not null,
  detail text,
  category project_category not null,
  tahun smallint not null,
  role varchar(100),
  timeline varchar(100),
  client varchar(150),
  problem text,
  approach text,
  outcome text,
  demo_url varchar,
  github_url varchar,
  thumbnail varchar not null,
  is_featured boolean not null default false,
  status project_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_is_featured on projects (is_featured);

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ============================================================
-- 2. project_metrics
-- ============================================================

create table project_metrics (
  id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  value varchar not null,
  label varchar not null,
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_project_metrics_project_id on project_metrics (project_id);

create trigger trg_project_metrics_updated_at
  before update on project_metrics
  for each row execute function set_updated_at();

-- ============================================================
-- 3. project_images
-- ============================================================

create table project_images (
  id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  image_path varchar not null,
  caption varchar,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_project_images_project_id on project_images (project_id);

create trigger trg_project_images_updated_at
  before update on project_images
  for each row execute function set_updated_at();

-- ============================================================
-- 4. skills
-- ============================================================

create table skills (
  id bigint generated always as identity primary key,
  name varchar(100) not null,
  category varchar(50) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_skills_updated_at
  before update on skills
  for each row execute function set_updated_at();

-- ============================================================
-- 5. project_skill (pivot)
-- ============================================================

create table project_skill (
  project_id bigint not null references projects(id) on delete cascade,
  skill_id bigint not null references skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

-- ============================================================
-- 6. certificates
-- ============================================================

create table certificates (
  id bigint generated always as identity primary key,
  title varchar(150) not null,
  issuer varchar(150) not null,
  year_start smallint not null,
  year_end smallint,
  certificate_url varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_certificates_updated_at
  before update on certificates
  for each row execute function set_updated_at();

-- ============================================================
-- 7. experiences
-- ============================================================

create table experiences (
  id bigint generated always as identity primary key,
  role_title varchar not null,
  period_text varchar not null,
  description text not null,
  achievement text,
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_experiences_updated_at
  before update on experiences
  for each row execute function set_updated_at();

-- ============================================================
-- 8. recruitment_entries (PRIVATE)
-- ============================================================

create table recruitment_entries (
  id bigint generated always as identity primary key,
  type recruitment_type not null,
  company_name varchar not null,
  position text not null,
  application_link varchar,
  requirements text,
  document_checklist jsonb,
  description text,
  deadline_date date,
  deadline_note varchar,
  applying_date date,
  status recruitment_status not null default 'listed',
  to_learn text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recruitment_entries_status on recruitment_entries (status);

create trigger trg_recruitment_entries_updated_at
  before update on recruitment_entries
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Rules.md §3: semua tabel WAJIB RLS aktif sebelum go-live.
-- Tabel publik: SELECT terbuka utk anon, mutasi hanya authenticated.
-- recruitment_entries: TIDAK ADA SELECT utk anon sama sekali.
-- ============================================================

alter table projects enable row level security;
alter table project_metrics enable row level security;
alter table project_images enable row level security;
alter table skills enable row level security;
alter table project_skill enable row level security;
alter table certificates enable row level security;
alter table experiences enable row level security;
alter table recruitment_entries enable row level security;

-- ---------- projects ----------

create policy "projects_select_public"
  on projects for select
  to anon, authenticated
  using (true);

create policy "projects_insert_owner"
  on projects for insert
  to authenticated
  with check (true);

create policy "projects_update_owner"
  on projects for update
  to authenticated
  using (true)
  with check (true);

create policy "projects_delete_owner"
  on projects for delete
  to authenticated
  using (true);

-- ---------- project_metrics ----------

create policy "project_metrics_select_public"
  on project_metrics for select
  to anon, authenticated
  using (true);

create policy "project_metrics_insert_owner"
  on project_metrics for insert
  to authenticated
  with check (true);

create policy "project_metrics_update_owner"
  on project_metrics for update
  to authenticated
  using (true)
  with check (true);

create policy "project_metrics_delete_owner"
  on project_metrics for delete
  to authenticated
  using (true);

-- ---------- project_images ----------

create policy "project_images_select_public"
  on project_images for select
  to anon, authenticated
  using (true);

create policy "project_images_insert_owner"
  on project_images for insert
  to authenticated
  with check (true);

create policy "project_images_update_owner"
  on project_images for update
  to authenticated
  using (true)
  with check (true);

create policy "project_images_delete_owner"
  on project_images for delete
  to authenticated
  using (true);

-- ---------- skills ----------

create policy "skills_select_public"
  on skills for select
  to anon, authenticated
  using (true);

create policy "skills_insert_owner"
  on skills for insert
  to authenticated
  with check (true);

create policy "skills_update_owner"
  on skills for update
  to authenticated
  using (true)
  with check (true);

create policy "skills_delete_owner"
  on skills for delete
  to authenticated
  using (true);

-- ---------- project_skill (pivot) ----------

create policy "project_skill_select_public"
  on project_skill for select
  to anon, authenticated
  using (true);

create policy "project_skill_insert_owner"
  on project_skill for insert
  to authenticated
  with check (true);

create policy "project_skill_update_owner"
  on project_skill for update
  to authenticated
  using (true)
  with check (true);

create policy "project_skill_delete_owner"
  on project_skill for delete
  to authenticated
  using (true);

-- ---------- certificates ----------

create policy "certificates_select_public"
  on certificates for select
  to anon, authenticated
  using (true);

create policy "certificates_insert_owner"
  on certificates for insert
  to authenticated
  with check (true);

create policy "certificates_update_owner"
  on certificates for update
  to authenticated
  using (true)
  with check (true);

create policy "certificates_delete_owner"
  on certificates for delete
  to authenticated
  using (true);

-- ---------- experiences ----------

create policy "experiences_select_public"
  on experiences for select
  to anon, authenticated
  using (true);

create policy "experiences_insert_owner"
  on experiences for insert
  to authenticated
  with check (true);

create policy "experiences_update_owner"
  on experiences for update
  to authenticated
  using (true)
  with check (true);

create policy "experiences_delete_owner"
  on experiences for delete
  to authenticated
  using (true);

-- ---------- recruitment_entries (PRIVATE) ----------
-- Tidak ada policy SELECT untuk anon/public sama sekali.
-- Semua operasi (termasuk SELECT) hanya untuk authenticated (owner).

create policy "recruitment_entries_select_owner"
  on recruitment_entries for select
  to authenticated
  using (true);

create policy "recruitment_entries_insert_owner"
  on recruitment_entries for insert
  to authenticated
  with check (true);

create policy "recruitment_entries_update_owner"
  on recruitment_entries for update
  to authenticated
  using (true)
  with check (true);

create policy "recruitment_entries_delete_owner"
  on recruitment_entries for delete
  to authenticated
  using (true);