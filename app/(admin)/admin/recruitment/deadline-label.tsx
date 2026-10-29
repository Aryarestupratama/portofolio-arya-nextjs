import { cn } from "@/lib/utils";

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function DeadlineLabel({
  date,
  note,
}: {
  date: string | null;
  note: string | null;
}) {
  if (!date) {
    return note ? (
      <span className="text-xs text-ink-soft">{note}</span>
    ) : (
      <span className="text-xs text-ink-soft">—</span>
    );
  }

  const diff = daysUntil(date);
  const formatted = new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <span
        className={cn(
          "text-xs font-medium",
          diff < 0 && "text-destructive",
          diff >= 0 && diff <= 3 && "text-amber-600",
          diff > 3 && "text-ink",
        )}
      >
        {formatted}
        {diff < 0 && " (lewat)"}
        {diff >= 0 && diff <= 3 && ` (${diff}h lagi)`}
      </span>
      {note && <p className="text-[11px] text-ink-soft">{note}</p>}
    </div>
  );
}
