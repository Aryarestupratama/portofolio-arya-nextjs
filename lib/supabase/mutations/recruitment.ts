import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecruitmentInput, ChecklistItem } from "@/lib/validations/recruitment";
import { parseChecklistRaw } from "@/lib/validations/recruitment";

function normalize(data: RecruitmentInput) {
  return {
    type: data.type,
    company_name: data.company_name,
    position: data.position,
    application_link: data.application_link || null,
    requirements: data.requirements || null,
    description: data.description || null,
    deadline_date: data.deadline_date || null,
    deadline_note: data.deadline_note || null,
    applying_date: data.applying_date || null,
    status: data.status,
    to_learn: data.to_learn || null,
    notes: data.notes || null,
  };
}

export async function insertRecruitmentEntry(
  supabase: SupabaseClient,
  data: RecruitmentInput,
) {
  const checklist = parseChecklistRaw(data.checklist_raw);
  const { error } = await supabase.from("recruitment_entries").insert({
    ...normalize(data),
    document_checklist: checklist.length > 0 ? checklist : null,
  });
  if (error) throw error;
}

export async function updateRecruitmentEntry(
  supabase: SupabaseClient,
  id: number,
  data: RecruitmentInput,
) {
  const { error } = await supabase
    .from("recruitment_entries")
    .update(normalize(data))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecruitmentEntry(
  supabase: SupabaseClient,
  id: number,
) {
  const { error } = await supabase
    .from("recruitment_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- Checklist (jsonb column) operations ----------

export async function setChecklist(
  supabase: SupabaseClient,
  id: number,
  checklist: ChecklistItem[],
) {
  const { error } = await supabase
    .from("recruitment_entries")
    .update({ document_checklist: checklist.length > 0 ? checklist : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecruitmentEntries(
  supabase: SupabaseClient,
  ids: number[],
) {
  const { error } = await supabase.from("recruitment_entries").delete().in("id", ids);
  if (error) throw error;
}

export async function setRecruitmentStatus(
  supabase: SupabaseClient,
  ids: number[],
  status: string,
) {
  const { error } = await supabase
    .from("recruitment_entries")
    .update({ status })
    .in("id", ids);
  if (error) throw error;
}
