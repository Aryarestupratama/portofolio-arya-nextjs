import { cn } from "@/lib/utils";

const STYLES: Record<string, { wrap: string; dot: string }> = {
  live: { wrap: "bg-brand-wash text-ink", dot: "bg-brand" },
  in_progress: {
    wrap: "bg-surface text-ink",
    dot: "bg-ink-soft motion-safe:animate-pulse",
  },
  archived: { wrap: "bg-surface text-ink-soft", dot: "bg-ink-soft/50" },
};

const LABEL: Record<string, string> = {
  live: "live",
  in_progress: "in progress",
  archived: "archived",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.archived;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]",
        style.wrap,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {LABEL[status] ?? status}
    </span>
  );
}
