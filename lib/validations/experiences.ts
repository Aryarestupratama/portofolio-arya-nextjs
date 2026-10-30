import { z } from "zod";

export const experienceSchema = z
  .object({
    role_title: z.string().min(1, "Role is required"),
    description: z.string().min(1, "Description is required"),
    achievement: z.string().optional().or(z.literal("")),
    year_start: z.coerce
      .number()
      .int()
      .min(1900, "Start year must be between 1900 and 2100")
      .max(2100, "Start year must be between 1900 and 2100"),
    // Kosong / tidak diisi berarti masih berjalan (ongoing) -> disimpan null
    year_end: z.coerce
      .number()
      .int()
      .min(1900, "End year must be between 1900 and 2100")
      .max(2100, "End year must be between 1900 and 2100")
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.year_end === null ||
      data.year_end === undefined ||
      data.year_end >= data.year_start,
    {
      message: "End year cannot be before start year",
      path: ["year_end"],
    },
  );

export type ExperienceInput = z.infer<typeof experienceSchema>;

// Dipakai di admin & public untuk generate label periode otomatis
export function formatExperiencePeriod(
  yearStart: number,
  yearEnd: number | null,
): string {
  return yearEnd == null ? `${yearStart} — Present` : `${yearStart} — ${yearEnd}`;
}