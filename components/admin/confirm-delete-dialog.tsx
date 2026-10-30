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

export function ConfirmDeleteDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = "Delete",
  successMessage = "Deleted",
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  confirmLabel?: string;
  successMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await onConfirm();
                  toast.success(successMessage);
                  setOpen(false);
                } catch {
                  // Dialog tetap terbuka supaya bisa dicoba lagi.
                  toast.error("Could not delete. Please try again.");
                }
              })
            }
          >
            {isPending ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
