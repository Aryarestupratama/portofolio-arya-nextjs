import type { SupabaseClient } from "@supabase/supabase-js";
import type { CertificateInput } from "@/lib/validations/certificates";

function normalize(data: CertificateInput) {
  return {
    ...data,
    year_end: data.year_end === undefined ? null : data.year_end,
  };
}

export async function insertCertificate(
  supabase: SupabaseClient,
  data: CertificateInput,
) {
  const { error } = await supabase.from("certificates").insert(normalize(data));
  if (error) throw error;
}

export async function updateCertificate(
  supabase: SupabaseClient,
  id: number,
  data: CertificateInput,
) {
  const { error } = await supabase
    .from("certificates")
    .update(normalize(data))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCertificate(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCertificates(supabase: SupabaseClient, ids: number[]) {
  const { error } = await supabase.from("certificates").delete().in("id", ids);
  if (error) throw error;
}
