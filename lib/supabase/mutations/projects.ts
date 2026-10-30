import type { SupabaseClient } from "@supabase/supabase-js";
import { parseMetricsRaw, type ProjectInput } from "@/lib/validations/projects";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Rules.md §3: slug di-generate otomatis dari title (server-side, saat
// create), dengan fallback penambahan suffix angka kalau ada duplikat.
async function generateUniqueSlug(
  supabase: SupabaseClient,
  title: string,
  excludeId?: number,
) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;

  // Loop sampai ketemu slug yang belum dipakai (selain oleh row ini sendiri
  // saat update).
  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

function baseProjectRow(data: ProjectInput) {
  return {
    title: data.title,
    description: data.description,
    detail: data.detail || null,
    category: data.category,
    tahun: data.tahun,
    role: data.role || null,
    timeline: data.timeline || null,
    client: data.client || null,
    problem: data.problem || null,
    approach: data.approach || null,
    outcome: data.outcome || null,
    demo_url: data.demo_url || null,
    github_url: data.github_url || null,
    is_featured: data.is_featured ?? false,
    status: data.status,
  };
}

async function syncMetrics(
  supabase: SupabaseClient,
  projectId: number,
  metricsRaw: string | undefined,
) {
  // Delete-then-insert: paling simpel untuk sinkronisasi list kecil seperti
  // metrics, dibanding diff insert/update/delete satu-satu.
  const { error: delError } = await supabase
    .from("project_metrics")
    .delete()
    .eq("project_id", projectId);
  if (delError) throw delError;

  const rows = parseMetricsRaw(metricsRaw);
  if (rows.length === 0) return;

  const { error: insError } = await supabase.from("project_metrics").insert(
    rows.map((r) => ({ ...r, project_id: projectId })),
  );
  if (insError) throw insError;
}

async function syncSkills(
  supabase: SupabaseClient,
  projectId: number,
  skillIds: number[],
) {
  const { error: delError } = await supabase
    .from("project_skill")
    .delete()
    .eq("project_id", projectId);
  if (delError) throw delError;

  if (skillIds.length === 0) return;

  const { error: insError } = await supabase.from("project_skill").insert(
    skillIds.map((skill_id) => ({ project_id: projectId, skill_id })),
  );
  if (insError) throw insError;
}

export async function insertProject(
  supabase: SupabaseClient,
  data: ProjectInput,
  thumbnailPath: string,
) {
  const slug = await generateUniqueSlug(supabase, data.title);

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({ ...baseProjectRow(data), slug, thumbnail: thumbnailPath })
    .select("id")
    .single();

  if (error) throw error;

  await syncMetrics(supabase, inserted.id, data.metrics_raw);
  await syncSkills(supabase, inserted.id, data.skill_ids ?? []);

  return inserted.id as number;
}

export async function updateProject(
  supabase: SupabaseClient,
  id: number,
  data: ProjectInput,
  thumbnailPath?: string,
) {
  // Slug tidak diregenerate otomatis lagi saat title berubah setelah create,
  // supaya link yang sudah dishare ke recruiter (PRD.md §6) tidak berubah
  // diam-diam. Regenerasi slug manual bisa ditambah sebagai fitur terpisah
  // kalau dibutuhkan.
  const row: Record<string, unknown> = baseProjectRow(data);
  if (thumbnailPath) row.thumbnail = thumbnailPath;

  const { error } = await supabase.from("projects").update(row).eq("id", id);
  if (error) throw error;

  await syncMetrics(supabase, id, data.metrics_raw);
  await syncSkills(supabase, id, data.skill_ids ?? []);
}

export async function deleteProject(supabase: SupabaseClient, id: number) {
  // project_metrics, project_images, project_skill semua on delete cascade
  // (lihat Schema.md) jadi cukup hapus row projects-nya.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function addProjectImage(
  supabase: SupabaseClient,
  projectId: number,
  imagePath: string,
) {
  // Hitung urutan otomatis dari jumlah gambar yang sudah ada (0, 1, 2, ...).
  // Sebelumnya nilai order diisi dari Date.now() di pemanggilnya — itu bug:
  // Date.now() menghasilkan angka 13 digit (milidetik sejak 1970), jauh
  // melebihi batas kolom `order` yang bertipe `integer` di Postgres
  // (maks ~2.1 miliar), makanya insert gagal dengan error "out of range".
  const { count, error: countError } = await supabase
    .from("project_images")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (countError) throw countError;

  const { error } = await supabase
    .from("project_images")
    .insert({ project_id: projectId, image_path: imagePath, order: count ?? 0 });
  if (error) throw error;
}

export async function deleteProjectImage(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("project_images").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteProjects(supabase: SupabaseClient, ids: number[]) {
  // project_metrics, project_images, project_skill ikut terhapus (on delete cascade)
  const { error } = await supabase.from("projects").delete().in("id", ids);
  if (error) throw error;
}

export async function setProjectsFeatured(
  supabase: SupabaseClient,
  ids: number[],
  isFeatured: boolean,
) {
  const { error } = await supabase
    .from("projects")
    .update({ is_featured: isFeatured })
    .in("id", ids);
  if (error) throw error;
}

export async function setProjectsStatus(
  supabase: SupabaseClient,
  ids: number[],
  status: "live" | "in_progress" | "archived",
) {
  const { error } = await supabase.from("projects").update({ status }).in("id", ids);
  if (error) throw error;
}
