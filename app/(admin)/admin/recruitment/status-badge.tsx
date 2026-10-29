import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  listed: "bg-surface text-ink-soft",
  applied: "bg-brand-wash text-ink",
  on_process: "bg-brand text-paper",
  accepted: "bg-green-600 text-paper",
  rejected: "bg-destructive text-paper",
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
