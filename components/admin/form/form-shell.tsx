"use client";

import { createContext, useContext, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUnsavedChanges } from "@/components/admin/unsaved-changes";

type ActionResult = { error?: string } | null;

const FormShellContext = createContext<{ markDirty: () => void }>({
  markDirty: () => {},
});

/** Dipanggil komponen kustom (editor baris, skill picker, dll) saat nilainya berubah. */
export function useFormShell() {
  return useContext(FormShellContext);
}

/**
 * Bar aksi lengket di bawah form: status (unsaved / saving / error) di kiri,
 * Cancel + Save di kanan. Presentational — dipakai FormShell dan form RHF.
 */
export function FormActionBar({
  submitLabel,
  cancelHref,
  cancelLabel = "Cancel",
  dirty,
  pending,
  disableWhenClean = false,
}: {
  submitLabel: string;
  cancelHref?: string;
  cancelLabel?: string;
  dirty: boolean;
  pending: boolean;
  disableWhenClean?: boolean;
}) {
  let status: React.ReactNode = <span className="text-ink-soft">No changes yet</span>;
  if (pending) status = <span className="text-ink-soft">Saving…</span>;
  else if (dirty)
    status = (
      <span className="inline-flex items-center gap-2 text-ink">
        <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
        Unsaved changes
      </span>
    );

  return (
    <div
      className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-line bg-paper/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
    >
      <p role="status" aria-live="polite" className="min-w-0 text-sm">
        {status}
      </p>
      <div className="flex items-center gap-2 sm:shrink-0">
        {cancelHref && (
          <Button asChild variant="outline">
            <Link href={cancelHref}>{cancelLabel}</Link>
          </Button>
        )}
        <Button type="submit" disabled={pending || (disableWhenClean && !dirty)}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

/**
 * Pembungkus <form> untuk form native (FormData + Server Action):
 * - submit lewat onSubmit (bukan `action=`) supaya React TIDAK mereset isian
 *   form ketika validasi server gagal;
 * - melacak perubahan (dirty) dan mendaftarkannya ke penjaga "unsaved changes";
 * - toast sukses/gagal dan bar aksi lengket.
 */
export function FormShell({
  action,
  submitLabel,
  cancelHref,
  successMessage = "Changes saved",
  disableWhenClean = false,
  className,
  children,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref?: string;
  successMessage?: string;
  disableWhenClean?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  // Peringatan saat pindah halaman / menutup tab dikelola UnsavedChangesProvider.
  useUnsavedChanges(dirty);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await action(null, formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          setDirty(false);
          toast.success(successMessage);
        }
      } catch (err) {
        // redirect() di Server Action melempar error khusus — biarkan Next yang menangani.
        const digest = (err as { digest?: unknown } | null)?.digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <FormShellContext.Provider value={{ markDirty: () => setDirty(true) }}>
      <form
        onSubmit={handleSubmit}
        onChange={() => setDirty(true)}
        className={cn("space-y-6", className)}
      >
        {children}
        <FormActionBar
          submitLabel={submitLabel}
          cancelHref={cancelHref}
          dirty={dirty}
          pending={pending}
          disableWhenClean={disableWhenClean}
        />
      </form>
    </FormShellContext.Provider>
  );
}
