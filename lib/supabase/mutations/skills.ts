import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillInput } from "@/lib/validations/skills";

export async function insertSkill(supabase: SupabaseClient, data: SkillInput) {
  const { data: inserted, error } = await supabase
    .from("skills")
    .insert(data)
    .select("id, name, category")
    .single();
  if (error) throw error;
  return inserted;
}

export async function updateSkill(
  supabase: SupabaseClient,
  id: number,
  data: SkillInput,
) {
  const { error } = await supabase.from("skills").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteSkill(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteSkills(supabase: SupabaseClient, ids: number[]) {
  const { error } = await supabase.from("skills").delete().in("id", ids);
  if (error) throw error;
}

export async function setSkillsCategory(
  supabase: SupabaseClient,
  ids: number[],
  category: string,
) {
  const { error } = await supabase.from("skills").update({ category }).in("id", ids);
  if (error) throw error;
}
