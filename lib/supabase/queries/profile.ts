import { SupabaseClient } from "@supabase/supabase-js";

// Dipakai di Home (page.tsx), Footer, layout.tsx (metadata), dan admin
// form profile. RLS: SELECT terbuka untuk anon & authenticated.
export async function getProfile(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
}