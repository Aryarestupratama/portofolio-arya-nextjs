"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Wrapper sonner tanpa next-themes (site hanya light mode).
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-md !border !border-line !bg-paper !text-ink !shadow-none !font-sans",
        },
      }}
      {...props}
    />
  );
}
