import { z } from "zod";

export const experienceSchema = z.object({
  role_title: z.string().min(1, "Role wajib diisi"),
  period_text: z.string().min(1, "Periode wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  achievement: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
