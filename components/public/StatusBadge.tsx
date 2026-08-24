import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  live: "bg-[var(--cobalt)] text-white",
  in_progress: "bg-[var(--butter-cream)] text-ink",
  archived: "bg-[var(--ink-soft)]/20 text-ink-soft",
};

const LABEL: Record<string, string> = {
  live: "live",
  in_progress: "in progress",
  archived: "archived",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px]",
        STYLES[status],
      )}
    >
      {LABEL[status]}
    </span>
  );
}
