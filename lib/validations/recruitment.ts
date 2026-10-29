import { z } from "zod";
import { httpUrl } from "./url";

export const recruitmentSchema = z.object({
  type: z.enum(["internship", "job"], { message: "Tipe wajib dipilih" }),
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  position: z.string().min(1, "Posisi wajib diisi"),
  application_link: httpUrl("URL tidak valid (harus http/https)").optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  deadline_date: z.string().optional().or(z.literal("")),
  deadline_note: z.string().optional().or(z.literal("")),
  applying_date: z.string().optional().or(z.literal("")),
  status: z.enum(
    ["listed", "applied", "on_process", "accepted", "rejected", "no_response"],
    { message: "Status wajib dipilih" },
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
