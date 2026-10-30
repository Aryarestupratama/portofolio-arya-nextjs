"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

/** Tombol hapus massal dengan dialog konfirmasi (menyebut jumlah item). */
export function BulkDeleteButton({
  count,
  noun,
  onDelete,
  warning,
}: {
  count: number;
  noun: string;
  /** Jalankan server action hapus + `clear()` setelahnya. */
  onDelete: () => Promise<void>;
  /** Peringatan tambahan di dialog, mis. "images & metrics ikut terhapus". */
  warning?: string;
}) {
  return (
    <ConfirmDeleteDialog
      title={`Delete ${count} ${noun}?`}
      description={`${count} ${noun} will be permanently deleted.${warning ? ` ${warning}` : ""} This cannot be undone.`}
      confirmLabel={`Delete ${count}`}
      successMessage={`${count} ${noun} deleted`}
      onConfirm={onDelete}
      trigger={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={14} className="mr-1.5" />
          Delete
        </Button>
      }
    />
  );
}

/**
 * Dropdown aksi massal: memilih sebuah opsi langsung menjalankan `onSelect`
 * ke semua baris terpilih. Nilainya tidak "menempel" (selalu kembali ke label).
 */
export function BulkSelect({
  label,
  options,
  onSelect,
  successMessage,
}: {
  label: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => Promise<void>;
  successMessage: (value: string) => string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value=""
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          try {
            await onSelect(value);
            toast.success(successMessage(value));
          } catch {
            toast.error("Could not update the selected items. Please try again.");
          }
        })
      }
    >
      <SelectTrigger aria-label={label} className="h-8 w-auto min-w-36 gap-2 px-3 text-xs">
        <SelectValue placeholder={pending ? "Updating…" : label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
