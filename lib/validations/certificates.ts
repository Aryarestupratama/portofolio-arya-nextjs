import { z } from "zod";

const yearEndSchema = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce
    .number({ message: "End year must be a number" })
    .int("End year must be a whole number")
    .min(1990, "End year must be between 1990 and 2100")
    .max(2100, "End year must be between 1990 and 2100")
    .optional(),
);

export const certificateSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(150, "Title must be 150 characters or fewer"),
    issuer: z.string().min(1, "Issuer is required").max(150, "Issuer must be 150 characters or fewer"),
    year_start: z.coerce
      .number({ message: "Start year is required" })
      .int("Start year must be a whole number")
      .min(1990, "Start year must be between 1990 and 2100")
      .max(2100, "Start year must be between 1990 and 2100"),
    year_end: yearEndSchema,
    // Berisi path file di storage bucket "certificates", bukan URL Drive.
    certificate_url: z.string().min(1, "Certificate file is required"),
  })
  .refine(
    (data) => data.year_end === undefined || data.year_end >= data.year_start,
    { message: "End year cannot be before start year", path: ["year_end"] },
  );

export type CertificateInput = z.infer<typeof certificateSchema>;