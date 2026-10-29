"use client";

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconLinkButton } from "@/components/admin/icon-button";
import { DeadlineLabel } from "./deadline-label";
import { DeleteRecruitmentButton } from "./delete-button";
import { RecruitmentStatusBadge } from "./status-badge";

export type RecruitmentRow = {
  id: number;
  type: "internship" | "job";
  company_name: string;
  position: string;
  deadline_date: string | null;
  deadline_note: string | null;
  status: string;
};

const TYPE_LABEL: Record<string, string> = { internship: "Internship", job: "Job" };

const STATUS_OPTIONS = [
  { value: "listed", label: "Listed" },
  { value: "applied", label: "Applied" },
  { value: "on_process", label: "On Process" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No Response" },
];

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function deadlineBucket(r: RecruitmentRow) {
  if (!r.deadline_date) return "none";
  const d = daysUntil(r.deadline_date);
  if (d < 0) return "overdue";
  if (d <= 7) return "soon";
  return "later";
}

export function RecruitmentTable({ entries }: { entries: RecruitmentRow[] }) {
  const addButton = (
    <Button asChild>
      <Link href="/admin/recruitment/new">
        <Plus size={16} className="mr-1.5" />
        Add application
      </Link>
    </Button>
  );

  const columns: Column<RecruitmentRow>[] = [
    {
      id: "company",
      header: "Company",
      sortValue: (r) => r.company_name,
      cell: (r) => (
        <div className="min-w-0 max-w-xs">
          <Link
            href={`/admin/recruitment/${r.id}/edit`}
            className="font-medium text-ink hover:text-brand"
          >
            {r.company_name}
          </Link>
          <p className="line-clamp-1 text-xs text-ink-soft">{r.position}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      hideBelow: "md",
      sortValue: (r) => r.type,
      cell: (r) => <span className="text-ink-soft">{TYPE_LABEL[r.type]}</span>,
    },
    {
      id: "deadline",
      header: "Deadline",
      sortValue: (r) => r.deadline_date,
      cell: (r) => <DeadlineLabel date={r.deadline_date} note={r.deadline_note} />,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (r) => r.status,
      cell: (r) => <RecruitmentStatusBadge status={r.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-24 text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <IconLinkButton
            href={`/admin/recruitment/${r.id}/edit`}
            label={`Edit ${r.company_name}`}
          >
            <Pencil size={15} />
          </IconLinkButton>
          <DeleteRecruitmentButton
            id={r.id}
            label={`${r.company_name} — ${r.position}`}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <DataTable
        data={entries}
        columns={columns}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.company_name} ${r.position} ${TYPE_LABEL[r.type]}`}
        searchPlaceholder="Search company or position…"
        noun="applications"
        defaultSort={{ id: "deadline", dir: "asc" }}
        filters={[
          { id: "status", label: "Status", options: STATUS_OPTIONS, getValue: (r) => r.status },
          {
            id: "type",
            label: "Type",
            options: [
              { value: "internship", label: "Internship" },
              { value: "job", label: "Job" },
            ],
            getValue: (r) => r.type,
          },
          {
            id: "deadline",
            label: "Deadline",
            allLabel: "Any deadline",
            options: [
              { value: "overdue", label: "Overdue" },
              { value: "soon", label: "Within 7 days" },
              { value: "later", label: "Later" },
              { value: "none", label: "No deadline" },
            ],
            getValue: deadlineBucket,
          },
        ]}
        toolbarActions={addButton}
        emptyTitle="No applications tracked yet"
        emptyDescription="Track internships and jobs you want to apply to. This page is private."
        emptyAction={addButton}
      />
    </div>
  );
}
