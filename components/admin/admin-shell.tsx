"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UnsavedChangesProvider } from "@/components/admin/unsaved-changes";

/**
 * Kerangka admin: sidebar tetap di desktop (lg+), drawer + top bar di mobile.
 * Auth tetap dicek server-side di (admin)/layout.tsx; komponen ini hanya UI.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Drawer terbuka hanya selama pathname sama dengan saat dibuka, jadi otomatis
  // menutup setelah navigasi (juga navigasi yang tertunda dialog konfirmasi).
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPath(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <UnsavedChangesProvider>
    <div className="min-h-screen bg-paper font-sans lg:flex">
      {/* Desktop */}
      <div className="sticky top-0 hidden h-screen lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="-ml-2 flex size-10 items-center justify-center rounded-md text-ink hover:bg-surface"
        >
          <Menu size={20} />
        </button>
        <Link href="/admin/dashboard" className="font-mono text-xs text-ink-soft">
          admin panel
        </Link>
        <span className="size-10" aria-hidden />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative h-full w-60 animate-in slide-in-from-left duration-200">
            <AdminSidebar />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute -right-12 top-3 flex size-9 items-center justify-center rounded-full bg-paper text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
    </UnsavedChangesProvider>
  );
}
