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
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
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
