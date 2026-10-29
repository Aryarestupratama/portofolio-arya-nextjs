// Label tampilan kategori project (nilai di database tetap
// `personal` | `kuliah` | `client`, hanya teks di UI yang berbahasa Inggris).
export const CATEGORY_LABEL: Record<string, string> = {
  personal: "Personal",
  kuliah: "Coursework",
  client: "Client",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}
