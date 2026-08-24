"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";

// Server Action khusus domain profile, terpisah dari komponen UI
// sesuai Rules.md §2.
export async function updateProfile(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  // RLS pastikan cuma authenticated yang bisa UPDATE (lihat migration),
  // jadi walau ada bug di middleware, database tetap aman (Architecture.md §4).
  const { error } = await supabase
    .from("profile")
    .update(parsed.data)
    .eq("id", 1);

  if (error) {
    return { success: false, error: { _form: [error.message] } };
  }

  // Profile dipakai di Home & (opsional) metadata root layout — revalidate
  // dua-duanya supaya publik langsung lihat perubahan (Rules.md §6).
  revalidatePath("/");
  revalidatePath("/", "layout");

  return { success: true, error: null };
}