"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  toggleChecklistItemAction,
  addChecklistItemAction,
  removeChecklistItemAction,
} from "./actions";

type ChecklistItem = { item: string; done: boolean };

export function ChecklistManager({
  entryId,
  checklist,
}: {
  entryId: number;
  checklist: ChecklistItem[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <section className="space-y-4 rounded-xl border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-ink">
          Checklist Dokumen
        </h2>
        {checklist.length > 0 && (
          <span className="font-mono text-xs text-ink-soft">
            {doneCount}/{checklist.length} selesai
          </span>
        )}
      </div>

      {checklist.length === 0 && (
        <p className="text-sm text-ink-soft">Belum ada item checklist.</p>
      )}

      <ul className="space-y-2">
        {checklist.map((item, i) => (
          <li key={`${item.item}-${i}`} className="flex items-center gap-3">
            <Checkbox
              checked={item.done}
              disabled={isPending}
              onCheckedChange={() =>
                startTransition(() => toggleChecklistItemAction(entryId, i))
              }
            />
            <span
              className={
                item.done ? "flex-1 text-sm text-ink-soft line-through" : "flex-1 text-sm text-ink"
              }
            >
              {item.item}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => removeChecklistItemAction(entryId, i))
              }
              className="text-xs text-destructive hover:underline"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>

      <form
        action={() => {
          const value = inputRef.current?.value ?? "";
          startTransition(async () => {
            await addChecklistItemAction(entryId, value);
            if (inputRef.current) inputRef.current.value = "";
          });
        }}
        className="flex gap-2"
      >
        <Input ref={inputRef} placeholder="Nama dokumen baru..." />
        <Button type="submit" variant="outline" disabled={isPending}>
          + Tambah
        </Button>
      </form>
    </section>
  );
}