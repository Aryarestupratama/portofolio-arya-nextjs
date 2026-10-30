"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton } from "@/components/admin/icon-button";
import { StatusPill } from "@/components/admin/status-pill";
import { BulkDeleteButton, BulkSelect } from "@/components/admin/bulk-actions";
import {
  deleteSkillAction,
  deleteSkillsAction,
  setSkillsCategoryAction,
} from "./actions";
import { SkillFormDialog, type Skill } from "./skill-form-dialog";

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const allCategories = Array.from(
    new Set(skills.map((s) => s.category)),
  ).sort((a, b) => a.localeCompare(b));

  const addButton = (
    <SkillFormDialog
      allCategories={allCategories}
      trigger={
        <Button>
          <Plus size={16} className="mr-1.5" />
          Add skill
        </Button>
      }
    />
  );

  const columns: Column<Skill>[] = [
    {
      id: "name",
      header: "Name",
      sortValue: (s) => s.name,
      cell: (s) => <span className="font-medium text-ink">{s.name}</span>,
    },
    {
      id: "category",
      header: "Category",
      sortValue: (s) => s.category,
      cell: (s) => <StatusPill tone="brand">{s.category}</StatusPill>,
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-28 text-right",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <SkillFormDialog
            skill={s}
            allCategories={allCategories}
            trigger={
              <IconButton label={`Edit ${s.name}`}>
                <Pencil size={15} />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            title="Delete skill?"
            description={`Skill "${s.name}" will be permanently deleted, including its links to projects.`}
            onConfirm={() => deleteSkillAction(s.id)}
            trigger={
              <IconButton label={`Delete ${s.name}`} tone="danger">
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
        data={skills}
        columns={columns}
        rowKey={(s) => s.id}
        searchText={(s) => `${s.name} ${s.category}`}
        searchPlaceholder="Search skills…"
        noun="skills"
        defaultSort={{ id: "category", dir: "asc" }}
        pageSizeOptions={[20, 50, 100]}
        filters={[
          {
            id: "category",
            label: "Category",
            options: allCategories.map((c) => ({ value: c, label: c })),
            getValue: (s) => s.category,
          },
        ]}
        bulkActions={({ rows, clear }) => (
          <>
            <BulkSelect
              label="Move to category…"
              options={allCategories.map((c) => ({ value: c, label: c }))}
              onSelect={async (category) => {
                await setSkillsCategoryAction(rows.map((r) => r.id), category);
                clear();
              }}
              successMessage={(c) => `${rows.length} skills moved to ${c}`}
            />
            <BulkDeleteButton
              count={rows.length}
              noun={rows.length === 1 ? "skill" : "skills"}
              warning="Their links to projects are removed too."
              onDelete={async () => {
                await deleteSkillsAction(rows.map((r) => r.id));
                clear();
              }}
            />
          </>
        )}
        toolbarActions={addButton}
        emptyTitle="No skills yet"
        emptyDescription="Add the tools and technologies you want to show on your portfolio."
        emptyAction={addButton}
      />
    </div>
  );
}
