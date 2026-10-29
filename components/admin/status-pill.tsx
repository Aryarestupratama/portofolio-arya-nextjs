import { cn } from "@/lib/utils";

export type PillTone =
  | "neutral"
  | "brand"
  | "solid"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const TONES: Record<PillTone, string> = {
  neutral: "bg-surface text-ink",
  brand: "bg-brand-wash text-brand",
  solid: "bg-brand text-paper",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  muted: "bg-surface text-ink-soft",
};

const DOTS: Record<PillTone, string> = {
  neutral: "bg-ink-soft",
  brand: "bg-brand",
  solid: "bg-paper",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  muted: "bg-ink-soft/60",
};

/** Pill kecil generik untuk status/kategori di tabel admin. */
export function StatusPill({
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
  children,
}: {
  tone?: PillTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] leading-5",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", DOTS[tone], pulse && "animate-pulse")}
        />
      )}
      {children}
    </span>
  );
}
