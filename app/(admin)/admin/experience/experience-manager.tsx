"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton } from "@/components/admin/icon-button";
import { StatusPill } from "@/components/admin/status-pill";
import { formatExperiencePeriod } from "@/lib/validations/experiences";
import { BulkDeleteButton } from "@/components/admin/bulk-actions";
import { deleteExperienceAction, deleteExperiencesAction } from "./actions";
import {
  ExperienceFormDialog,
  type Experience,
} from "./experience-form-dialog";

export function ExperienceManager({
  experiences,
}: {
  experiences: Experience[];
}) {
  const addButton = (
    <ExperienceFormDialog
      trigger={
        <Button>
          <Plus size={16} className="mr-1.5" />
          Add experience
        </Button>
      }
    />
  );

  const columns: Column<Experience>[] = [
    {
      id: "role",
      header: "Role",
      sortValue: (e) => e.role_title,
      cell: (e) => (
        <div className="min-w-0 max-w-md">
          <p className="font-medium text-ink">{e.role_title}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
            {e.description}
          </p>
        </div>
      ),
    },
    {
      id: "period",
      header: "Period",
      sortValue: (e) => e.year_start,
      cell: (e) => (
        <span className="whitespace-nowrap font-mono text-xs text-ink-soft">
          {formatExperiencePeriod(e.year_start, e.year_end)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      hideBelow: "sm",
      sortValue: (e) => (e.year_end === null ? 0 : 1),
      cell: (e) =>
        e.year_end === null ? (
          <StatusPill tone="brand" dot pulse>
            Ongoing
          </StatusPill>
        ) : (
          <StatusPill tone="muted">Finished</StatusPill>
        ),
    },
    {
      id: "achievement",
      header: "Achievement",
      hideBelow: "md",
      cell: (e) =>
        e.achievement ? (
          <StatusPill tone="neutral">Filled</StatusPill>
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-28 text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <ExperienceFormDialog
            experience={e}
            trigger={
              <IconButton label={`Edit ${e.role_title}`}>
                <Pencil size={15} />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            title="Delete experience?"
            description={`Entry "${e.role_title}" will be permanently deleted.`}
            onConfirm={() => deleteExperienceAction(e.id)}
            trigger={
              <IconButton label={`Delete ${e.role_title}`} tone="danger">
                <Trash2 size={15} />
              </IconButton>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <DataTable
        data={experiences}
        columns={columns}
        rowKey={(e) => e.id}
        searchText={(e) =>
          `${e.role_title} ${e.description} ${e.achievement ?? ""}`
        }
        searchPlaceholder="Search experience…"
        noun="experience entries"
        defaultSort={{ id: "period", dir: "desc" }}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "ongoing", label: "Ongoing" },
              { value: "finished", label: "Finished" },
            ],
            getValue: (e) => (e.year_end === null ? "ongoing" : "finished"),
          },
        ]}
        bulkActions={({ rows, clear }) => (
          <BulkDeleteButton
            count={rows.length}
            noun={rows.length === 1 ? "entry" : "entries"}
            onDelete={async () => {
              await deleteExperiencesAction(rows.map((r) => r.id));
              clear();
            }}
          />
        )}
        toolbarActions={addButton}
        emptyTitle="No experience yet"
        emptyDescription="Add your work, freelance, or organization experience."
        emptyAction={addButton}
      />
    </div>
  );
}
