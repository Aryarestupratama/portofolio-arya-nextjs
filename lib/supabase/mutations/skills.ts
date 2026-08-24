import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillInput } from "@/lib/validations/skills";

export async function insertSkill(supabase: SupabaseClient, data: SkillInput) {
  const { error } = await supabase.from("skills").insert(data);
  if (error) throw error;
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
