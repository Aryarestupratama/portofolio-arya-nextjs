import { z } from "zod";

// Batas jumlah id per aksi massal: mencegah payload berlebihan dan query
// `in (...)` yang terlalu panjang.
export const MAX_BULK = 200;

export const idsSchema = z
  .array(z.number().int().positive())
  .min(1, "Select at least one item")
  .max(MAX_BULK, `You can change up to ${MAX_BULK} items at once`);

export function parseIds(ids: unknown): number[] {
  return idsSchema.parse(ids);
}
