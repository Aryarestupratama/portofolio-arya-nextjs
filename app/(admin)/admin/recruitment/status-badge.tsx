import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  listed: "bg-clean-white text-ink-soft",
  applied: "bg-[var(--butter-cream)] text-ink",
  on_process: "bg-[var(--cobalt)] text-white",
  accepted: "bg-green-600 text-white",
  rejected: "bg-red-600 text-white",
  no_response: "bg-ink-soft/20 text-ink-soft",
};

const LABEL: Record<string, string> = {
  listed: "Listed",
  applied: "Applied",
  on_process: "On Process",
  accepted: "Accepted",
  rejected: "Rejected",
  no_response: "No Response",
};

export function RecruitmentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px] whitespace-nowrap",
        STYLES[status],
      )}
    >
      {LABEL[status]}
    </span>
  );
}
