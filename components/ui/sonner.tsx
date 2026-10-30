"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Wrapper sonner tanpa next-themes (site hanya light mode).
// Dipakai di halaman publik (bottom-center) dan admin (lihat AdminToaster).
export function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      {...props}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "!rounded-md !border !border-line !bg-paper !text-ink !shadow-none !font-sans",
          ...toastOptions?.classNames,
        },
      }}
    />
  );
}
