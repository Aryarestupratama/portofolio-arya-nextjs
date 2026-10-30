import { z } from "zod";

// Rules.md §7: description idealnya 1–2 kalimat (tidak divalidasi ketat via
// Zod, cukup dibatasi visual/UX di form + placeholder helper text).
export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title must be 150 characters or fewer"),
  description: z.string().min(1, "Description is required"),
  detail: z.string().optional().or(z.literal("")),
  category: z.enum(["personal", "kuliah", "client"], {
    message: "Category is required",
  }),
  tahun: z.coerce
    .number({ message: "Year is required" })
    .int("Year must be a whole number")
    .min(1990, "Year must be between 1990 and 2100")
    .max(2100, "Year must be between 1990 and 2100"),
  role: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  client: z.string().optional().or(z.literal("")),
  problem: z.string().optional().or(z.literal("")),
  approach: z.string().optional().or(z.literal("")),
  outcome: z.string().optional().or(z.literal("")),
  demo_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  is_featured: z.coerce.boolean().optional().default(false),
  status: z.enum(["live", "archived", "in_progress"], {
    message: "Status is required",
  }),
  // Simplified input: satu baris satu metric, format "label|value".
  // Diparse jadi rows project_metrics di mutation layer.
  metrics_raw: z.string().optional().or(z.literal("")),
  // Datang sebagai string[] dari checkbox form data, dikonversi ke number[].
  skill_ids: z.array(z.coerce.number()).optional().default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export function parseMetricsRaw(raw: string | undefined) {
  if (!raw) return [] as { label: string; value: string; order: number }[];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, value] = line.split("|").map((s) => s?.trim() ?? "");
      return { label: label || "-", value: value || "-", order: index };
    });
}
