import { z } from "zod";

export const certificateSchema = z
  .object({
    title: z.string().min(1, "Judul wajib diisi").max(150),
    issuer: z.string().min(1, "Issuer wajib diisi").max(150),
    year_start: z.coerce.number().int().min(1990).max(2100),
    year_end: z.coerce.number().int().min(1990).max(2100).optional().or(z.literal("")),
    certificate_url: z.string().url("URL tidak valid"),
  })
  .refine(
    (data) =>
      !data.year_end || data.year_end === "" || data.year_end >= data.year_start,
    { message: "Tahun selesai tidak boleh sebelum tahun mulai", path: ["year_end"] },
  );

export type CertificateInput = z.infer<typeof certificateSchema>;
