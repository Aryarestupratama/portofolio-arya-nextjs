"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFormShell } from "@/components/admin/form";
import { createSkillFromProjectFormAction } from "@/app/(admin)/admin/skills/actions";

export type Skill = { id: number; name: string; category: string };

const NEW_CATEGORY = "__new__";

/**
 * Pemilih skill berbentuk chip (toggle) per kategori + form tambah skill
 * on-the-fly. Pilihan di-submit lewat hidden input `skill_ids` (native), bukan
 * checkbox Radix yang tidak reliable untuk grup.
 */
export function SkillPicker({
  allSkills,
  selected,
  onChange,
}: {
  allSkills: Skill[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const { markDirty } = useFormShell();
  const [created, setCreated] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const skills = [...allSkills, ...created.filter((c) => !allSkills.some((s) => s.id === c.id))];
  const categories = Array.from(new Set(skills.map((s) => s.category))).sort((a, b) =>
    a.localeCompare(b),
  );

  const q = query.trim().toLowerCase();
  const visible = skills.filter((s) => !q || s.name.toLowerCase().includes(q));
  const grouped = visible.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    markDirty();
  }

  function resetNewForm() {
    setAdding(false);
    setName("");
    setCategory("");
    setNewCategoryMode(false);
    setError(null);
  }

  function createSkill() {
    const cat = (newCategoryMode ? category : category || categories[0] || "").trim();
    if (!name.trim() || !cat) {
      setError("Name and category are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createSkillFromProjectFormAction(name.trim(), cat);
      if (!result || result.error || !result.skill) {
        setError(result?.error ?? "Could not save the new skill.");
        return;
      }
      const skill = result.skill;
      setCreated((prev) => [...prev, skill]);
      onChange([...selected, skill.id]);
      markDirty();
      resetNewForm();
    });
  }

  function onEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      createSkill();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-ink-soft">{selected.length} selected</p>
        {skills.length > 10 && (
          <div className="relative w-48">
            <Search aria-hidden size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              placeholder="Filter skills…"
              aria-label="Filter skills"
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}
      </div>

      {skills.length === 0 && (
        <p className="text-sm text-ink-soft">No skills yet. Add one below.</p>
      )}
      {skills.length > 0 && visible.length === 0 && (
        <p className="text-sm text-ink-soft">No skills match “{query}”.</p>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="font-mono text-xs text-ink-soft">{cat}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((skill) => {
              const on = selected.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(skill.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    on
                      ? "border-brand bg-brand-wash text-brand"
                      : "border-line text-ink hover:border-ink",
                  )}
                >
                  {on && <Check size={13} />}
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!adding ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} className="mr-1.5" />
          New skill
        </Button>
      ) : (
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onEnter}
              placeholder="Skill name, e.g. Next.js"
              aria-label="Skill name"
              autoFocus
            />
            {newCategoryMode ? (
              <div className="flex gap-2">
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="New category name"
                  aria-label="New category"
                />
                {categories.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewCategoryMode(false);
                      setCategory("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <Select
                value={category || categories[0] || ""}
                onValueChange={(v) => {
                  if (v === NEW_CATEGORY) {
                    setNewCategoryMode(true);
                    setCategory("");
                  } else setCategory(v);
                }}
              >
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY}>+ New category…</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={createSkill}>
              {pending ? "Saving…" : "Save skill"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetNewForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {selected.map((id) => (
        <input key={id} type="hidden" name="skill_ids" value={id} />
      ))}
    </div>
  );
}
