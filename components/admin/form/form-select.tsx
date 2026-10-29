"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormShell } from "./form-shell";

/**
 * Select Radix yang ikut ter-submit sebagai field native (`name`) dan
 * menandai form sebagai dirty saat nilainya diganti.
 */
export function FormSelect({
  id,
  name,
  defaultValue,
  options,
  placeholder,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const { markDirty } = useFormShell();
  return (
    <Select name={name} defaultValue={defaultValue} onValueChange={markDirty}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
