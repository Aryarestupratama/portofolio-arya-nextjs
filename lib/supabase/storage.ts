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
