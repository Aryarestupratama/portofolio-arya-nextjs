/**
 * Convert berbagai format link share Google Drive jadi direct-view image
 * URL yang bisa dipakai di <img src>.
 *
 * Format yang didukung:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Link non-Drive (http/https biasa) — dikembalikan apa adanya, dianggap
 *   sudah direct image URL (misal dari provider lain).
 *
 * Kalau tidak match pattern apapun (bukan URL valid), return null supaya
 * caller bisa fallback ke placeholder.
 */
export function toDirectImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Ekstrak FILE_ID dari beberapa pola URL Google Drive yang umum dipakai
  // saat user klik "Share" di Drive.
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/FILE_ID/view
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, // /open?id=FILE_ID
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/, // /uc?id=FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/, // fallback: query param id= di mana saja
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      // lh3.googleusercontent.com lebih reliable buat direct-embed
      // dibanding drive.google.com/uc (kadang kena rate-limit/redirect
      // ke halaman warning untuk file besar).
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  // Bukan link Google Drive — anggap sudah direct URL, kembalikan apa adanya.
  return trimmed;
}