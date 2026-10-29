import * as React from "react"
import { cn } from "@/lib/utils"

// Komponen shadcn/ui `skeleton` (versi standar). Warna `bg-accent`
// dipetakan ke `brand-wash` di globals.css, jadi otomatis on-brand.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
