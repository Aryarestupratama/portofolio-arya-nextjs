import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Kartu section form. Di desktop judul + deskripsi ada di kolom kiri, field di
 * kanan (pola editorial yang sama dengan halaman publik). Pakai `compact`
 * untuk kartu sempit (sidebar) agar susunannya vertikal.
 */
export function FormSection({
  title,
  description,
  compact = false,
  className,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-paper p-5",
        !compact && "lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8",
        className,
      )}
    >
      <header className={cn("mb-4", !compact && "lg:mb-0")}>
        <h2 className="font-medium text-ink">{title}</h2>
        {description && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Label + kontrol + hint/error. `htmlFor` harus sama dengan id kontrol. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-soft">{hint}</p>
      )}
    </div>
  );
}
