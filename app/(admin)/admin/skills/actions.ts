"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { skillSchema } from "@/lib/validations/skills";
import {
  insertSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/supabase/mutations/skills";

export type SkillActionState = { error?: string } | null;

export type CreateSkillState =
  | { error: string; skill?: undefined }
  | { error?: undefined; skill: { id: number; name: string; category: string } }
  | null;

export async function upsertSkillAction(
  _prevState: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  const id = formData.get("id");
  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  try {
    if (id) {
      await updateSkill(supabase, Number(id), parsed.data);
    } else {
      await insertSkill(supabase, parsed.data);
    }
  } catch {
    return { error: "Gagal menyimpan skill. Coba lagi." };
  }

  // Skills tampil di halaman publik /skills dan dipakai di project card,
  // jadi revalidate keduanya (Rules.md §6).
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return null;
}

// Dipakai dari section Skills di form project — bikin skill baru on-the-fly
// tanpa keluar dari form project, dan langsung dapat balik `id`-nya supaya
// bisa auto-checklist di UI (Rules.md §6, revalidate publik tetap jalan).
export async function createSkillFromProjectFormAction(
  name: string,
  category: string,
): Promise<CreateSkillState> {
  const parsed = skillSchema.safeParse({ name, category });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  try {
    const skill = await insertSkill(supabase, parsed.data);
    revalidatePath("/skills");
    revalidatePath("/admin/skills");
    return { skill };
  } catch {
    return { error: "Gagal menyimpan skill baru. Coba lagi." };
  }
}

export async function deleteSkillAction(id: number) {
  const supabase = await createClient();
  await deleteSkill(supabase, id);
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
}