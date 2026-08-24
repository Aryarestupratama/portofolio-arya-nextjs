import type { SupabaseClient } from "@supabase/supabase-js";

// RLS memastikan hanya authenticated (owner) yang bisa SELECT tabel ini
// (Schema.md §8) — tidak ada anon policy sama sekali.
export async function getRecruitmentEntries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("recruitment_entries")
    .select("*")
    .order("deadline_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

export async function getRecruitmentEntryById(
  supabase: SupabaseClient,
  id: number,
) {
  const { data, error } = await supabase
    .from("recruitment_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
