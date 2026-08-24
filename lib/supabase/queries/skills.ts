import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSkills(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
