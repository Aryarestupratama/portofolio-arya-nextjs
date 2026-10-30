import { z } from "zod";

export const recruitmentSchema = z.object({
  type: z.enum(["internship", "job"], { message: "Type is required" }),
  company_name: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  application_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  deadline_date: z.string().optional().or(z.literal("")),
  deadline_note: z.string().optional().or(z.literal("")),
  applying_date: z.string().optional().or(z.literal("")),
  status: z.enum(
    ["listed", "applied", "on_process", "accepted", "rejected", "no_response"],
    { message: "Status is required" },
  ),
  to_learn: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  // Satu baris satu item checklist, hanya dipakai saat CREATE
  // (edit pakai interactive checklist terpisah, lihat checklist-manager).
  checklist_raw: z.string().optional().or(z.literal("")),
});

export type RecruitmentInput = z.infer<typeof recruitmentSchema>;

export type ChecklistItem = { item: string; done: boolean };

export function parseChecklistRaw(raw: string | undefined): ChecklistItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((item) => ({ item, done: false }));
}
