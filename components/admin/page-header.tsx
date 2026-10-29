import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Header standar semua halaman admin: eyebrow mono kecil, judul, deskripsi
 * opsional, dan slot aksi (tombol) di kanan.
 */
export function PageHeader({
  eyebrow = "admin",
  title,
  description,
  actions,
  back,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Link kembali di atas judul, mis. { href: "/admin/projects", label: "Projects" }. */
  back?: { href: string; label: string };
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-brand"
          >
            <ArrowLeft size={13} />
            {back.label}
          </Link>
        )}
        <p className="font-mono text-xs text-ink-soft">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
