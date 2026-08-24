"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { certificateSchema } from "@/lib/validations/certificates";
import {
  insertCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/supabase/mutations/certificates";

export type CertificateActionState = { error?: string } | null;

export async function upsertCertificateAction(
  _prevState: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const id = formData.get("id");
  const yearEnd = formData.get("year_end");

  const parsed = certificateSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer"),
    year_start: formData.get("year_start"),
    year_end: yearEnd === "" ? "" : yearEnd,
    certificate_url: formData.get("certificate_url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  try {
    if (id) {
      await updateCertificate(supabase, Number(id), parsed.data);
    } else {
      await insertCertificate(supabase, parsed.data);
    }
  } catch {
    return { error: "Gagal menyimpan sertifikat. Coba lagi." };
  }

  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
  return null;
}

export async function deleteCertificateAction(id: number) {
  const supabase = await createClient();
  await deleteCertificate(supabase, id);
  revalidatePath("/certificates");
  revalidatePath("/admin/certificates");
}
