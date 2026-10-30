"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { certificateSchema } from "@/lib/validations/certificates";
import {
  uploadCertificateFile,
  deleteCertificateFile,
} from "@/lib/supabase/storage";
import {
  insertCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/supabase/mutations/certificates";
import { getCertificates } from "@/lib/supabase/queries/certificates";

export type CertificateActionState = { error?: string } | null;

export async function upsertCertificateAction(
  _prevState: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const id = formData.get("id");
  const yearEnd = formData.get("year_end");
  const file = formData.get("certificate_file") as File | null;
  // Path lama, dikirim via hidden input saat edit — dipakai kalau owner
  // tidak upload file baru (tidak wajib re-upload tiap edit).
  const existingUrl = (formData.get("existing_certificate_url") as string) || "";

  const supabase = await createClient();

  let certificate_url = existingUrl;
  let uploadedNewFile = false;

  if (file && file.size > 0) {
    try {
      certificate_url = await uploadCertificateFile(supabase, file);
      uploadedNewFile = true;
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Could not upload the certificate file.",
      };
    }
  }

  const parsed = certificateSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer"),
    year_start: formData.get("year_start"),
    year_end: yearEnd === "" ? "" : yearEnd,
    certificate_url,
  });

  if (!parsed.success) {
    // Kalau validasi gagal tapi kita sudah terlanjur upload file baru,
    // hapus lagi supaya tidak jadi orphan (record tidak jadi tersimpan).
    if (uploadedNewFile) await deleteCertificateFile(supabase, certificate_url);
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  try {
    if (id) {
      await updateCertificate(supabase, Number(id), parsed.data);
    } else {
      await insertCertificate(supabase, parsed.data);
    }
  } catch {
    if (uploadedNewFile) await deleteCertificateFile(supabase, certificate_url);
    return { error: "Could not save the certificate. Please try again." };
  }

  // Row berhasil disimpan dengan file baru -> file lama sudah tidak
  // direferensikan lagi, hapus supaya bucket tidak nyisa orphan.
  if (uploadedNewFile && existingUrl && existingUrl !== certificate_url) {
    await deleteCertificateFile(supabase, existingUrl);
  }

  revalidatePath("/"); // certificates hanya tampil di Home
  revalidatePath("/admin/certificates");
  return null;
}

export async function deleteCertificateAction(id: number) {
  const supabase = await createClient();

  // Ambil path file dulu sebelum row-nya dihapus, supaya file di storage
  // ikut kehapus juga (tidak nyisa orphan).
  const certificates = await getCertificates(supabase);
  const target = certificates.find((c) => c.id === id);

  await deleteCertificate(supabase, id);

  if (target?.certificate_url) {
    await deleteCertificateFile(supabase, target.certificate_url);
  }

  revalidatePath("/"); // certificates hanya tampil di Home
  revalidatePath("/admin/certificates");
}