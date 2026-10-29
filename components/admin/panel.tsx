import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Kartu konten dashboard: judul, link "view all" opsional, isi. */
export function Panel({
  title,
  description,
  href,
  hrefLabel = "View all",
  className,
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col rounded-xl border border-line bg-paper", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-medium text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-soft transition-colors hover:text-brand"
          >
            {hrefLabel}
            <ArrowRight size={12} />
          </Link>
        )}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}
