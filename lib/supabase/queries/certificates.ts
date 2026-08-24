import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCertificates(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("year_start", { ascending: false });

  if (error) throw error;
  return data;
}
