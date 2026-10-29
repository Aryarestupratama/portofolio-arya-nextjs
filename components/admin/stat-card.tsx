import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Kartu angka ringkas yang bisa diklik menuju halaman resource-nya. */
export function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-line bg-paper p-5 transition-colors hover:border-ink/30 hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-surface text-ink-soft transition-colors group-hover:bg-brand-wash group-hover:text-brand">
          <Icon size={15} strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-medium tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </Link>
  );
}
