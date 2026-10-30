"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFormShell } from "./form-shell";

/**
 * Checkbox tunggal yang ter-submit lewat hidden input native
 * (nilai "on" saat dicentang, kosong saat tidak) — deterministik dan tidak
 * bergantung pada input bubble milik Radix.
 */
export function CheckboxField({
  id,
  name,
  label,
  hint,
  defaultChecked = false,
  onCheckedChange,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const { markDirty } = useFormShell();
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => {
          const next = v === true;
          setChecked(next);
          markDirty();
          onCheckedChange?.(next);
        }}
        className="mt-0.5"
      />
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      </div>
      <input type="hidden" name={name} value={checked ? "on" : ""} />
    </div>
  );
}
