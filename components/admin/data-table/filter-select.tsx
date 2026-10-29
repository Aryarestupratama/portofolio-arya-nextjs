import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dropdown filter berbasis <select> native (ringan, aksesibel, mobile-friendly). */
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
    <div className={cn("relative", className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border bg-paper py-2 pl-3 pr-9 text-sm text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          value ? "border-brand/40 bg-brand-wash/50" : "border-line",
        )}
      >
        <option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}
