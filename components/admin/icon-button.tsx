import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "default" | "danger";

const toneClass = (tone: Tone) =>
  cn(
    "size-8 rounded-md p-0",
    tone === "danger" && "hover:bg-destructive/10 hover:text-destructive",
  );

/**
 * Tombol ikon kecil untuk aksi baris tabel. `label` dipakai sebagai
 * aria-label + tooltip native. Bisa dipakai sebagai `trigger` Dialog
 * (meneruskan ref + props lewat asChild).
 */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: Tone }
>(({ label, tone = "default", className, children, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="icon"
    aria-label={label}
    title={label}
    className={cn(toneClass(tone), className)}
    {...props}
  >
    {children}
  </Button>
));
IconButton.displayName = "IconButton";

/** Versi link (navigasi) dari IconButton. */
export function IconLinkButton({
  href,
  label,
  tone = "default",
  external = false,
  children,
}: {
  href: string;
  label: string;
  tone?: Tone;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={toneClass(tone)}
    >
      <Link
        href={href}
        aria-label={label}
        title={label}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </Link>
    </Button>
  );
}
