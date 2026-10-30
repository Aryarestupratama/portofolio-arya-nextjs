"use client";

import { Toaster } from "@/components/ui/sonner";

/**
 * Satu-satunya Toaster untuk area admin (juga halaman login). Berbeda dengan
 * halaman publik (bottom-center), admin memakai pojok kanan atas supaya tidak
 * menimpa action bar lengket di bawah form. Di mobile, offset atas memberi
 * ruang untuk top bar admin (h-14).
 */
export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      offset={{ top: 24, right: 24 }}
      mobileOffset={{ top: 68, left: 16, right: 16 }}
      closeButton
      toastOptions={{
        classNames: {
          error: "!border-destructive/40",
        },
      }}
    />
  );
}
