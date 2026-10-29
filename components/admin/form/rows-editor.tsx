"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormShell } from "./form-shell";

type Row = { id: number; values: string[] };

/**
 * Editor daftar baris dinamis (tambah / hapus). Setiap baris punya satu atau
 * lebih kolom input. Hasilnya diserialisasi ke satu hidden input `name`
 * lewat `serialize`, sehingga kontrak FormData server tidak berubah.
 */
export function RowsEditor({
  name,
  initial,
  placeholders,
  addLabel,
  serialize,
  emptyHint,
}: {
  name: string;
  initial: string[][];
  placeholders: string[];
  addLabel: string;
  serialize: (rows: string[][]) => string;
  emptyHint?: string;
}) {
  const nextId = useRef(initial.length);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((values, i) => ({ id: i, values })),
  );
  const { markDirty } = useFormShell();
  const cols = placeholders.length;

  function update(next: Row[]) {
    setRows(next);
    markDirty();
  }

  function addRow() {
    update([...rows, { id: nextId.current++, values: Array(cols).fill("") }]);
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && emptyHint && <p className="text-sm text-ink-soft">{emptyHint}</p>}
      {rows.map((row, ri) => (
        <div key={row.id} className="flex items-center gap-2">
          <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {placeholders.map((ph, ci) => (
              <Input
                key={ci}
                value={row.values[ci] ?? ""}
                placeholder={ph}
                aria-label={`${ph} (row ${ri + 1})`}
                onChange={(e) =>
                  update(
                    rows.map((r) =>
                      r.id === row.id
                        ? { ...r, values: r.values.map((v, i) => (i === ci ? e.target.value : v)) }
                        : r,
                    ),
                  )
                }
                onKeyDown={(e) => {
                  // Enter menambah baris baru, bukan submit form.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRow();
                  }
                }}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove row ${ri + 1}`}
            className="size-9 shrink-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => update(rows.filter((r) => r.id !== row.id))}
          >
            <X size={15} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus size={14} className="mr-1.5" />
        {addLabel}
      </Button>
      <input type="hidden" name={name} value={serialize(rows.map((r) => r.values))} />
    </div>
  );
}
