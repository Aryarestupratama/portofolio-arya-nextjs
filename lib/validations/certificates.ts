import { z } from "zod";

const yearEndSchema = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().int().min(1990).max(2100).optional(),
);

export const certificateSchema = z
  .object({
    title: z.string().min(1, "Judul wajib diisi").max(150),
    issuer: z.string().min(1, "Issuer wajib diisi").max(150),
    year_start: z.coerce.number().int().min(1990).max(2100),
    year_end: yearEndSchema,
    // Sekarang path file di storage bucket "certificates", bukan URL Drive.
    certificate_url: z.string().min(1, "Sertifikat wajib diupload"),
  })
  .refine(
    (data) => data.year_end === undefined || data.year_end >= data.year_start,
    { message: "Tahun selesai tidak boleh sebelum tahun mulai", path: ["year_end"] },
  );

export type CertificateInput = z.infer<typeof certificateSchema>;