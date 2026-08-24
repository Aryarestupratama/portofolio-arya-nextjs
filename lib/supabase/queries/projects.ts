import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProjectById(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `*,
      project_metrics(*),
      project_images(*),
      project_skill(skill_id, skills(id, name, category))`,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
