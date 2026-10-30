"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recruitmentSchema } from "@/lib/validations/recruitment";
import type { ChecklistItem } from "@/lib/validations/recruitment";
import {
  insertRecruitmentEntry,
  updateRecruitmentEntry,
  deleteRecruitmentEntry,
  setChecklist,
} from "@/lib/supabase/mutations/recruitment";
import { getRecruitmentEntryById } from "@/lib/supabase/queries/recruitment";

export type RecruitmentActionState = { error?: string } | null;

// Catatan: tabel ini PRIVATE total (Architecture.md §4) — tidak ada
// revalidatePath ke halaman publik mana pun di seluruh file ini, karena
// memang tidak ada route publik yang menampilkan data recruitment.

function readFormData(formData: FormData) {
  return recruitmentSchema.safeParse({
    type: formData.get("type"),
    company_name: formData.get("company_name"),
    position: formData.get("position"),
    application_link: formData.get("application_link"),
    requirements: formData.get("requirements"),
    description: formData.get("description"),
    deadline_date: formData.get("deadline_date"),
    deadline_note: formData.get("deadline_note"),
    applying_date: formData.get("applying_date"),
    status: formData.get("status"),
    to_learn: formData.get("to_learn"),
    notes: formData.get("notes"),
    checklist_raw: formData.get("checklist_raw"),
  });
}

export async function createRecruitmentAction(
  _prevState: RecruitmentActionState,
  formData: FormData,
): Promise<RecruitmentActionState> {
  const parsed = readFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const supabase = await createClient();

  try {
    await insertRecruitmentEntry(supabase, parsed.data);
  } catch {
    return { error: "Could not save the application. Please try again." };
  }

  revalidatePath("/admin/recruitment");
  redirect("/admin/recruitment");
}

export async function updateRecruitmentAction(
  id: number,
  _prevState: RecruitmentActionState,
  formData: FormData,
): Promise<RecruitmentActionState> {
  const parsed = readFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const supabase = await createClient();

  try {
    await updateRecruitmentEntry(supabase, id, parsed.data);
  } catch {
    return { error: "Could not save the application. Please try again." };
  }

  revalidatePath("/admin/recruitment");
  revalidatePath(`/admin/recruitment/${id}/edit`);
  return null;
}

export async function deleteRecruitmentAction(id: number) {
  const supabase = await createClient();
  await deleteRecruitmentEntry(supabase, id);
  revalidatePath("/admin/recruitment");
}

export async function toggleChecklistItemAction(
  entryId: number,
  itemIndex: number,
) {
  const supabase = await createClient();
  const entry = await getRecruitmentEntryById(supabase, entryId);
  const checklist: ChecklistItem[] = entry.document_checklist ?? [];

  const updated = checklist.map((c, i) =>
    i === itemIndex ? { ...c, done: !c.done } : c,
  );

  await setChecklist(supabase, entryId, updated);
  revalidatePath(`/admin/recruitment/${entryId}/edit`);
}

export async function addChecklistItemAction(
  entryId: number,
  itemName: string,
) {
  if (!itemName.trim()) return;

  const supabase = await createClient();
  const entry = await getRecruitmentEntryById(supabase, entryId);
  const checklist: ChecklistItem[] = entry.document_checklist ?? [];

  await setChecklist(supabase, entryId, [
    ...checklist,
    { item: itemName.trim(), done: false },
  ]);
  revalidatePath(`/admin/recruitment/${entryId}/edit`);
}

export async function removeChecklistItemAction(
  entryId: number,
  itemIndex: number,
) {
  const supabase = await createClient();
  const entry = await getRecruitmentEntryById(supabase, entryId);
  const checklist: ChecklistItem[] = entry.document_checklist ?? [];

  const updated = checklist.filter((_, i) => i !== itemIndex);
  await setChecklist(supabase, entryId, updated);
  revalidatePath(`/admin/recruitment/${entryId}/edit`);
}
