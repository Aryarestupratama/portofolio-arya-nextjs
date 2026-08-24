import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "project-images";

// Rules.md §5: upload gambar divalidasi tipe (jpg/png/webp) & ukuran maks
// 5MB sebelum dikirim ke Supabase Storage.
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "File harus berformat JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Ukuran file maksimal 5MB.";
  }
  return null;
}

export async function uploadProjectImage(
  supabase: SupabaseClient,
  file: File,
  folder: string,
) {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const ext = file.name.split(".").pop();
  const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;
  return data.path;
}

export function getPublicImageUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------- Certificates bucket ----------
// Bucket terpisah dari project-images (lihat migration
// add_certificates_storage.sql). Public read, tapi file bisa PDF/gambar
// jadi tipe & max size beda dari validateImageFile.

const CERT_BUCKET = "certificates";
const ALLOWED_CERT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_CERT_SIZE_BYTES = 10 * 1024 * 1024;

export function validateCertificateFile(file: File) {
  if (!ALLOWED_CERT_TYPES.includes(file.type)) {
    return "File harus berformat PDF, JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_CERT_SIZE_BYTES) {
    return "Ukuran file maksimal 10MB.";
  }
  return null;
}

export async function uploadCertificateFile(
  supabase: SupabaseClient,
  file: File,
) {
  const error = validateCertificateFile(file);
  if (error) throw new Error(error);

  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { data, error: uploadError } = await supabase.storage
    .from(CERT_BUCKET)
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;
  return data.path;
}

// Dipakai untuk resolve certificates.certificate_url (path) -> public URL,
// baik di admin (link "lihat file saat ini") maupun di halaman publik
// (iframe preview / "Open in new tab").
export function getCertificateUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage.from(CERT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Hapus file lama di bucket certificates supaya tidak nyisa orphan file
// saat owner replace file (edit) atau hapus record. Sengaja tidak throw
// kalau gagal (misal path sudah tidak ada) — proses utama (update/delete
// row) tetap harus lanjut/berhasil walau cleanup storage gagal.
export async function deleteCertificateFile(
  supabase: SupabaseClient,
  path: string,
) {
  if (!path) return;
  const { error } = await supabase.storage.from(CERT_BUCKET).remove([path]);
  if (error) {
    console.error("Gagal hapus file certificate lama:", path, error.message);
  }
}