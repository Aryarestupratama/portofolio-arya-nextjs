"use client";

import { useRef, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  toggleChecklistItemAction,
  addChecklistItemAction,
  removeChecklistItemAction,
} from "./actions";

type ChecklistItem = { item: string; done: boolean };

/** Checklist dokumen interaktif — tiap aksi langsung tersimpan ke server. */
export function ChecklistManager({
  entryId,
  checklist,
}: {
  entryId: number;
  checklist: ChecklistItem[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Aksi checklist langsung tersimpan; gagal → notifikasi, bukan diam-diam.
  function run(task: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await task();
      } catch {
        toast.error("Could not update the checklist. Please try again.");
      }
    });
  }

  const doneCount = checklist.filter((c) => c.done).length;
  const percent = checklist.length === 0 ? 0 : (doneCount / checklist.length) * 100;

  return (
    <section className="rounded-xl border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-ink">Document checklist</h2>
        {checklist.length > 0 && (
          <span className="font-mono text-xs text-ink-soft">
            {doneCount}/{checklist.length}
          </span>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      )}

      {checklist.length === 0 && (
        <p className="mt-3 text-sm text-ink-soft">No checklist items yet.</p>
      )}

      <ul className="mt-4 space-y-1">
        {checklist.map((item, i) => (
          <li key={`${item.item}-${i}`} className="group flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-surface/70">
            <Checkbox
              id={`check-${i}`}
              checked={item.done}
              disabled={isPending}
              onCheckedChange={() => run(() => toggleChecklistItemAction(entryId, i))}
            />
            <label
              htmlFor={`check-${i}`}
              className={cn("flex-1 cursor-pointer text-sm", item.done ? "text-ink-soft line-through" : "text-ink")}
            >
              {item.item}
            </label>
            <button
              type="button"
              disabled={isPending}
              aria-label={`Remove ${item.item}`}
              onClick={() => run(() => removeChecklistItemAction(entryId, i))}
              className="rounded p-1 text-ink-soft opacity-100 transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      <form
        action={() => {
          const value = inputRef.current?.value ?? "";
          if (!value.trim()) return;
          run(async () => {
            await addChecklistItemAction(entryId, value);
            if (inputRef.current) inputRef.current.value = "";
          });
        }}
        className="mt-4 flex gap-2"
      >
        <Input ref={inputRef} placeholder="New document…" aria-label="New checklist item" />
        <Button type="submit" variant="outline" disabled={isPending} aria-label="Add checklist item">
          <Plus size={16} />
        </Button>
      </form>
    </section>
  );
}
