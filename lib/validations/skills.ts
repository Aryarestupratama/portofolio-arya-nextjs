import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  category: z.string().min(1, "Kategori wajib diisi").max(50),
});

export type SkillInput = z.infer<typeof skillSchema>;
