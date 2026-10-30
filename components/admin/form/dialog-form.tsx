"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ActionResult = { error?: string } | null;

/**
 * Dialog berisi form (create/edit cepat). Pola sama dengan FormShell:
 * submit lewat onSubmit (isian TIDAK ter-reset saat server menolak), error
 * tampil inline di dalam dialog, sukses → toast + dialog menutup sendiri.
 * Konten dialog di-unmount saat ditutup, jadi state form selalu bersih
 * saat dibuka lagi — tidak perlu effect untuk reset.
 */
export function FormDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Save",
  successMessage = "Saved",
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  successMessage?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (pending) return; // jangan tutup di tengah proses simpan
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await action(null, formData);
        if (result?.error) {
          // Dialog tetap terbuka supaya isian bisa diperbaiki.
          toast.error(result.error);
          return;
        }
        toast.success(successMessage);
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={pending} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
