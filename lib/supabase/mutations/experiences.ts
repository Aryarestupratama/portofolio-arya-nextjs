import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExperienceInput } from "@/lib/validations/experiences";

function normalize(data: ExperienceInput) {
  return {
    ...data,
    achievement: data.achievement === "" ? null : data.achievement,
    year_end: data.year_end ?? null,
  };
}

export async function insertExperience(
  supabase: SupabaseClient,
  data: ExperienceInput,
) {
  const { error } = await supabase.from("experiences").insert(normalize(data));
  if (error) throw error;
}

export async function updateExperience(
  supabase: SupabaseClient,
  id: number,
  data: ExperienceInput,
) {
  const { error } = await supabase
    .from("experiences")
    .update(normalize(data))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExperience(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw error;
}