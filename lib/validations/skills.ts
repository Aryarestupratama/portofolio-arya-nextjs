import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  category: z.string().min(1, "Category is required").max(50, "Category must be 50 characters or fewer"),
});

export type SkillInput = z.infer<typeof skillSchema>;
