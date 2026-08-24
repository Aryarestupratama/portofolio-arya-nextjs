import { z } from "zod";

export const experienceSchema = z
  .object({
    role_title: z.string().min(1, "Role wajib diisi"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    achievement: z.string().optional().or(z.literal("")),
    year_start: z.coerce
      .number()
      .int()
      .min(1900, "Tahun mulai tidak valid")
      .max(2100, "Tahun mulai tidak valid"),
    // Kosong / tidak diisi berarti masih berjalan (ongoing) -> disimpan null
    year_end: z.coerce
      .number()
      .int()
      .min(1900, "Tahun selesai tidak valid")
      .max(2100, "Tahun selesai tidak valid")
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.year_end === null ||
      data.year_end === undefined ||
      data.year_end >= data.year_start,
    {
      message: "Tahun selesai tidak boleh sebelum tahun mulai",
      path: ["year_end"],
    },
  );

export type ExperienceInput = z.infer<typeof experienceSchema>;

// Dipakai di admin & public untuk generate label periode otomatis
export function formatExperiencePeriod(
  yearStart: number,
  yearEnd: number | null,
): string {
  return yearEnd == null ? `${yearStart} — Sekarang` : `${yearStart} — ${yearEnd}`;
}