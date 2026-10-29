"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton } from "@/components/admin/icon-button";
import { StatusPill } from "@/components/admin/status-pill";
import { formatExperiencePeriod } from "@/lib/validations/experiences";
import {
  upsertExperienceAction,
  deleteExperienceAction,
  type ExperienceActionState,
} from "./actions";

type Experience = {
  id: number;
  role_title: string;
  description: string;
  achievement: string | null;
  year_start: number;
  year_end: number | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function ExperienceFormDialog({
  experience,
  trigger,
}: {
  experience?: Experience;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOngoing, setIsOngoing] = useState(
    experience ? experience.year_end === null : true,
  );
  const [state, formAction] = useActionState<ExperienceActionState, FormData>(
    upsertExperienceAction,
    null,
  );

  useEffect(() => {
    if (submitted && !state?.error) setOpen(false);
  }, [state, submitted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {experience ? "Edit Experience" : "Tambah Experience"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          className="space-y-4"
        >
          {experience && <input type="hidden" name="id" value={experience.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="role_title">Role</Label>
            <Input
              id="role_title"
              name="role_title"
              placeholder="Freelance Designer & Developer"
              defaultValue={experience?.role_title}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="year_start">Tahun Mulai</Label>
              <Input
                id="year_start"
                name="year_start"
                type="number"
                placeholder="2023"
                defaultValue={experience?.year_start}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year_end">Tahun Selesai</Label>
              <Input
                id="year_end"
                name="year_end"
                type="number"
                placeholder="2024"
                defaultValue={experience?.year_end ?? ""}
                disabled={isOngoing}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_ongoing"
              name="is_ongoing"
              checked={isOngoing}
              onCheckedChange={(checked) => setIsOngoing(checked === true)}
            />
            <Label htmlFor="is_ongoing" className="font-normal">
              Masih berjalan sampai sekarang
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={experience?.description}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="achievement">
              Achievement (opsional, bebas format)
            </Label>
            <Textarea
              id="achievement"
              name="achievement"
              rows={5}
              placeholder={"Tulis paragraf, atau satu baris satu poin, misal:\n- Meningkatkan performa 3x\n- Memimpin 4 project"}
              defaultValue={experience?.achievement ?? ""}
            />
            <p className="text-xs text-ink-soft">
              Konsisten satu gaya per entry: jangan campur paragraf panjang
              dengan bullet super singkat (Rules.md §7).
            </p>
          </div>
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
        toolbarActions={addButton}
        emptyTitle="No experience yet"
        emptyDescription="Add your work, freelance, or organization experience."
        emptyAction={addButton}
      />
    </div>
  );
}
