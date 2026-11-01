// Dipakai di sisi browser saja (butuh canvas).
//
// Kenapa ada: file dikirim lewat Server Action, dan body request dibatasi
// 4MB oleh next.config.ts sekaligus 4,5MB oleh Vercel Functions (tidak bisa
// diubah). Di atas itu server membalas 413 sebelum kode kita jalan. Jadi
// gambar yang besar (screenshot full-page, foto kamera) dikecilkan dulu di
// browser supaya selalu muat.

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Batas file asli yang masih mau dibaca browser untuk dikompres.
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
// Target hasil kompres. Lebih kecil dari batas server (3,5MB) agar ada ruang
// untuk field form lain yang ikut terkirim.
export const TARGET_BYTES = 3 * 1024 * 1024;

const MAX_WIDTH = 2400;
// Batas total piksel agar aman di canvas browser (termasuk mobile).
const MAX_PIXELS = 24_000_000;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

export function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Memastikan gambar muat dikirim ke server. File kecil dikembalikan apa
 * adanya; file besar dikecilkan (WebP, atau JPEG kalau browser tidak bisa
 * encode WebP) sampai <= TARGET_BYTES. Melempar Error berisi pesan yang
 * siap ditampilkan.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("File must be a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Image is larger than 25MB. Please choose a smaller one.");
  }
  if (file.size <= TARGET_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read this image. Try a different file.");
  }

  try {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const outType = probe.toDataURL("image/webp").startsWith("data:image/webp")
      ? "image/webp"
      : "image/jpeg";
    const ext = outType === "image/webp" ? "webp" : "jpg";

    let scale = Math.min(
      1,
      MAX_WIDTH / bitmap.width,
      Math.sqrt(MAX_PIXELS / (bitmap.width * bitmap.height)),
    );

    for (let attempt = 0; attempt < 6; attempt++) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      if (outType === "image/jpeg") {
        ctx.fillStyle = "#fff"; // JPEG tidak punya transparansi
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bitmap, 0, 0, width, height);

      for (const quality of [0.9, 0.8, 0.7]) {
        const blob = await toBlob(canvas, outType, quality);
        if (blob && blob.size <= TARGET_BYTES) {
          const base = file.name.replace(/\.[^.]+$/, "") || "image";
          return new File([blob], `${base}.${ext}`, { type: outType });
        }
      }
      scale *= 0.8;
    }
  } finally {
    bitmap.close();
  }

  throw new Error("Could not shrink this image enough. Try a smaller one.");
}
