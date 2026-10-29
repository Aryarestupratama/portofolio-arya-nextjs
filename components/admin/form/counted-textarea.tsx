"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Textarea dengan penghitung karakter (batas bersifat anjuran, bukan validasi). */
export function CountedTextarea({
  recommendedMax,
  defaultValue,
  className,
  ...props
}: Omit<React.ComponentProps<"textarea">, "value"> & { recommendedMax: number }) {
  const [length, setLength] = useState(String(defaultValue ?? "").length);
  const over = length > recommendedMax;
  return (
    <div>
      <Textarea
        defaultValue={defaultValue}
        className={className}
        {...props}
        onChange={(e) => {
          setLength(e.target.value.length);
          props.onChange?.(e);
        }}
      />
      <p className={cn("mt-1 text-right font-mono text-[11px]", over ? "text-amber-600" : "text-ink-soft")}>
        {length} / {recommendedMax}
      </p>
    </div>
  );
}
