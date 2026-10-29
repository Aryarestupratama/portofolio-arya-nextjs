import { z } from "zod";
import { httpUrl } from "./url";

// Single source of truth validasi profile — dipakai di React Hook Form
// (client) dan Server Action (server), sesuai Rules.md §5.
export const profileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(150),
  tagline: z.string().max(255).optional().or(z.literal("")),
  role: z.string().max(100).optional().or(z.literal("")),
  hero_photo_url: httpUrl("Harus berupa link http(s) valid")
    .optional()
    .or(z.literal("")),
  about_bio: z.string().optional().or(z.literal("")),
  about_photo_url: httpUrl("Harus berupa link http(s) valid")
    .optional()
    .or(z.literal("")),
  contact_intro: z.string().optional().or(z.literal("")),
  contact_email: z
    .string()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  github_url: httpUrl("Harus berupa link http(s) valid").optional().or(z.literal("")),
  linkedin_url: httpUrl("Harus berupa link http(s) valid").optional().or(z.literal("")),
  dribbble_url: httpUrl("Harus berupa link http(s) valid").optional().or(z.literal("")),
  cv_url: httpUrl("Harus berupa link http(s) valid").optional().or(z.literal("")),
  location: z.string().max(150).optional().or(z.literal("")),
  availability: z.string().max(100).optional().or(z.literal("")),
  meta_description: z.string().max(300).optional().or(z.literal("")),
  site_title: z.string().max(150).optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;