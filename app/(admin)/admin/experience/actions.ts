"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { experienceSchema } from "@/lib/validations/experiences";
import {
  insertExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/supabase/mutations/experiences";

export type ExperienceActionState = { error?: string } | null;

export async function upsertExperienceAction(
  _prevState: ExperienceActionState,
  formData: FormData,
): Promise<ExperienceActionState> {
  const id = formData.get("id");
  const isOngoing = formData.get("is_ongoing") === "on";
  const yearEndRaw = formData.get("year_end");

  const parsed = experienceSchema.safeParse({
    role_title: formData.get("role_title"),
    description: formData.get("description"),
    achievement: formData.get("achievement"),
    year_start: formData.get("year_start"),
    // Kalau checkbox "Masih berjalan" dicentang, paksa null walau ada isian
    year_end: isOngoing ? null : yearEndRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  try {
    if (id) {
      await updateExperience(supabase, Number(id), parsed.data);
    } else {
      await insertExperience(supabase, parsed.data);
    }
  } catch {
    return { error: "Gagal menyimpan experience. Coba lagi." };
  }

  revalidatePath("/experience");
  revalidatePath("/");
  revalidatePath("/admin/experience");
  return null;
}

export async function deleteExperienceAction(id: number) {
  const supabase = await createClient();
  await deleteExperience(supabase, id);
  revalidatePath("/experience");
  revalidatePath("/");
  revalidatePath("/admin/experience");
}