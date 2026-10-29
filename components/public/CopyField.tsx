"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Baris `label ... nilai [ikon salin]` (Design.md v2 §5.7).
export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Tersalin");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-5">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Salin ${label}`}
        className="group inline-flex min-w-0 items-center gap-2 rounded-sm font-mono text-sm text-ink-soft transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="truncate">{value}</span>
        {copied ? (
          <Check size={14} className="shrink-0 text-brand" />
        ) : (
          <Copy size={14} className="shrink-0" />
        )}
      </button>
    </div>
  );
}
