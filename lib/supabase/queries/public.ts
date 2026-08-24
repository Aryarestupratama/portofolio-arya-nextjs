import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFeaturedProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_skill(skills(id, name))")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);
  if (error) throw error;
  return data;
}

export async function getAllPublicProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_skill(skills(id, name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `*,
      project_metrics(*),
      project_images(*),
      project_skill(skills(id, name, category))`,
    )
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllProjectSlugs(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("projects").select("slug");
  if (error) throw error;
  return data;
}

export async function getPublicSkills(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getPublicCertificates(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("year_start", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPublicExperiences(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw error;
  return data;
}
