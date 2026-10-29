import { StatusPill } from "@/components/admin/status-pill";
import type { PillTone } from "@/components/admin/status-pill";

export type ProjectStatus = "live" | "in_progress" | "archived";

export const PROJECT_STATUS: Record<
  ProjectStatus,
  { label: string; tone: PillTone; pulse?: boolean }
> = {
  live: { label: "Live", tone: "brand" },
  in_progress: { label: "In progress", tone: "neutral", pulse: true },
  archived: { label: "Archived", tone: "muted" },
};

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS[status];
  if (!s) return null;
  return (
    <StatusPill tone={s.tone} dot pulse={s.pulse}>
      {s.label}
    </StatusPill>
  );
}
