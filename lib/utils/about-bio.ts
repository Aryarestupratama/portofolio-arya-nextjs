// Parser bio untuk halaman About.
//
// Format yang didukung (semua opsional, bio lama tetap jalan):
//   - Paragraf dipisah baris kosong.
//   - Awali paragraf dengan "[2025]" untuk membuka bab tahun baru. Paragraf
//     berikutnya tanpa penanda mewarisi tahun terakhir. Penanda tidak ditampilkan.
//   - Tanpa penanda dan < 3 paragraf: dipecah per ~2 kalimat (perilaku lama).

export type BioChunk = { text: string; year: number | null };

const MARKER = /^\[(\d{4})\]\s*/;

function splitParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function parseAboutBio(raw: string): BioChunk[] {
  const paragraphs = splitParagraphs(raw);
  const hasMarkers = paragraphs.some((p) => MARKER.test(p));

  if (!hasMarkers && paragraphs.length < 3) {
    const sentences = raw
      .replace(/\s+/g, " ")
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    const chunks: BioChunk[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push({ text: sentences.slice(i, i + 2).join(" "), year: null });
    }
    return chunks.length
      ? chunks
      : paragraphs.map((text) => ({ text, year: null }));
  }

  let current: number | null = null;
  const chunks: BioChunk[] = paragraphs.map((p) => {
    const m = p.match(MARKER);
    if (m) current = Number(m[1]);
    return { text: m ? p.replace(MARKER, "") : p, year: current };
  });

  // Paragraf pembuka tanpa penanda ikut tahun bab pertama.
  const firstYear = chunks.find((c) => c.year !== null)?.year ?? null;
  return chunks.map((c) => (c.year === null ? { ...c, year: firstYear } : c));
}

// Ringkasan untuk landing page: bio panjang cukup tampil paragraf pembukanya.
export function getBioSummary(raw: string): string {
  const paragraphs = splitParagraphs(raw);
  const hasMarkers = paragraphs.some((p) => MARKER.test(p));
  if (!hasMarkers && paragraphs.length < 3) return raw;
  return (paragraphs[0] ?? "").replace(MARKER, "");
}
