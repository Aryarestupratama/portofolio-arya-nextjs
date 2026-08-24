import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExperiences(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
}
