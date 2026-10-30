"use client";

import { logout } from "@/app/(admin)/admin/actions";
import { LogOut } from "lucide-react";
import { useUnsavedGuard } from "@/components/admin/unsaved-changes";

export function LogoutButton() {
  const blockIfDirty = useUnsavedGuard();

  return (
    <form
      action={logout}
      className="w-full"
      onSubmit={(e) => {
        // Ada perubahan belum tersimpan: tahan submit dan minta konfirmasi dulu.
        // Setelah dikonfirmasi, form di-submit ulang (guard sudah dikosongkan,
        // jadi kali ini tidak dicegat lagi).
        const form = e.currentTarget;
        if (blockIfDirty(() => form.requestSubmit())) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
        Logout
      </button>
    </form>
  );
}
