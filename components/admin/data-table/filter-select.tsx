"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Radix Select tidak mengizinkan value "" pada item, jadi opsi "semua"
// memakai sentinel ini dan dipetakan kembali ke "" untuk pemanggil.
const ALL = "__all__";

/** Dropdown filter bergaya shadcn (Radix Select). */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
  className?: string;
}) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
      <SelectTrigger
        aria-label={label}
        className={cn(value && "border-brand/40 bg-brand-wash/50", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel ?? `All ${label.toLowerCase()}`}</SelectItem>
        <SelectSeparator />
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
