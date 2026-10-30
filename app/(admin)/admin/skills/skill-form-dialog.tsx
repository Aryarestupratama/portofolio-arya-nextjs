"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FormDialog } from "@/components/admin/form";
import { upsertSkillAction } from "./actions";

export type Skill = { id: number; name: string; category: string };

const NEW_OPTION = "__new__";

function CategoryField({
  categories,
  defaultValue,
}: {
  categories: string[];
  defaultValue: string;
}) {
  const hasCategories = categories.length > 0;
  const [mode, setMode] = useState<"pick" | "new">(hasCategories ? "pick" : "new");
  const [picked, setPicked] = useState(defaultValue || categories[0] || "");
  const [custom, setCustom] = useState("");
  const value = mode === "new" ? custom : picked;

  return (
    <Field label="Category" htmlFor="category" required>
      {mode === "pick" ? (
        <Select
          value={picked}
          onValueChange={(v) => {
            if (v === NEW_OPTION) {
              setMode("new");
              setCustom("");
            } else setPicked(v);
          }}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            <SelectItem value={NEW_OPTION}>+ New category…</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            id="category"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Frontend, Backend, Tools"
            autoFocus
          />
          {hasCategories && (
            <button
              type="button"
              onClick={() => setMode("pick")}
              className="shrink-0 rounded-md px-2 text-sm text-ink-soft hover:text-ink"
            >
              Back
            </button>
          )}
        </div>
      )}
      <input type="hidden" name="category" value={value} />
    </Field>
  );
}

export function SkillFormDialog({
  skill,
  allCategories,
  trigger,
}: {
  skill?: Skill;
  allCategories: string[];
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={skill ? "Edit skill" : "Add skill"}
      action={upsertSkillAction}
      successMessage={skill ? "Skill updated" : "Skill added"}
    >
      {skill && <input type="hidden" name="id" value={skill.id} />}
      <Field label="Name" htmlFor="name" required>
        <Input id="name" name="name" defaultValue={skill?.name} placeholder="e.g. Next.js" required />
      </Field>
      <CategoryField categories={allCategories} defaultValue={skill?.category ?? ""} />
    </FormDialog>
  );
}
