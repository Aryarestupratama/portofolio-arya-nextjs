import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExperiences(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    // Ongoing (year_end null) tampil paling atas dulu
    .order("year_end", { ascending: true, nullsFirst: true })
    // Lalu terbaru ke terlama berdasarkan tahun mulai
    .order("year_start", { ascending: false })
    // Tie-breaker: id terbaru (input belakangan) duluan
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}