import { z } from "zod";

// URL yang akan dirender sebagai link/gambar di halaman publik wajib
// http(s). `z.string().url()` saja menerima skema berbahaya seperti
// `javascript:alert(1)`.
export const httpUrl = (message = "URL harus diawali http:// atau https://") =>
  z
    .string()
    .url(message)
    .refine((value) => /^https?:\/\//i.test(value), { message });
