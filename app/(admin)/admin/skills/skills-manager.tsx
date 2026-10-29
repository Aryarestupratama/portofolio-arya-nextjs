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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton } from "@/components/admin/icon-button";
import { StatusPill } from "@/components/admin/status-pill";
import {
  upsertSkillAction,
  deleteSkillAction,
  type SkillActionState,
} from "./actions";

type Skill = { id: number; name: string; category: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function CategoryField({
  allCategories,
  defaultValue,
}: {
  allCategories: string[];
  defaultValue?: string;
}) {
  const NEW_OPTION = "__new__";
  // Kalau skill sedang diedit punya kategori yang sudah ada di list, mulai
  // dengan itu terpilih di dropdown. Kalau kategorinya somehow tidak ada di
  // list (data lama/typo), anggap sebagai "kategori baru" supaya nilainya
  // tidak hilang.
  const initialIsKnown = defaultValue ? allCategories.includes(defaultValue) : false;
  const [mode, setMode] = useState<"select" | "new">(
    defaultValue && !initialIsKnown ? "new" : "select",
  );
  const [selected, setSelected] = useState(
    defaultValue && initialIsKnown ? defaultValue : allCategories[0] ?? "",
  );
  const [newCategory, setNewCategory] = useState(
    defaultValue && !initialIsKnown ? defaultValue : "",
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor="category-select">Kategori</Label>
      {mode === "select" ? (
        <select
          id="category-select"
          value={selected}
          onChange={(e) => {
            if (e.target.value === NEW_OPTION) {
              setMode("new");
              setNewCategory("");
            } else {
              setSelected(e.target.value);
            }
          }}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {allCategories.length === 0 && (
            <option value="" disabled>
              Belum ada kategori
            </option>
          )}
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value={NEW_OPTION}>+ Tambah kategori baru...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <Input
            id="category-select"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Frontend, Backend, Tools, ..."
            required
            autoFocus
          />
          {allCategories.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("select");
                setSelected(allCategories[0] ?? "");
              }}
            >
              Batal
            </Button>
          )}
        </div>
      )}
      <input
        type="hidden"
        name="category"
        value={mode === "select" ? selected : newCategory}
      />
    </div>
  );
}

function SkillFormDialog({
  skill,
  allCategories,
  trigger,
}: {
  skill?: Skill;
  allCategories: string[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<SkillActionState, FormData>(
    upsertSkillAction,
    null,
  );

  // Tutup dialog otomatis setelah submit sukses (state null tanpa error,
  // dan bukan render pertama).
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted && !state?.error) setOpen(false);
  }, [state, submitted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? "Edit Skill" : "Tambah Skill"}</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          className="space-y-4"
        >
          {skill && <input type="hidden" name="id" value={skill.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" defaultValue={skill?.name} required />
          </div>
          <CategoryField allCategories={allCategories} defaultValue={skill?.category} />
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
        toolbarActions={addButton}
        emptyTitle="No skills yet"
        emptyDescription="Add the tools and technologies you want to show on your portfolio."
        emptyAction={addButton}
      />
    </div>
  );
}
