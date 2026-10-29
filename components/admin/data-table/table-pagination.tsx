import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Nomor halaman dengan elipsis: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function TablePagination({
  page,
  pageCount,
  size,
  total,
  sizeOptions,
  onPage,
  onSize,
}: {
  page: number;
  pageCount: number;
  size: number;
  total: number;
  sizeOptions: number[];
  onPage: (page: number) => void;
  onSize: (size: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);
  const nav = "size-8 p-0";

  return (
    <div className="flex flex-col gap-3 border-t border-line bg-paper px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-ink-soft">
        <span className="font-mono text-xs">
          {from}–{to} of {total}
        </span>
        <label className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline">Rows</span>
          <select
            aria-label="Rows per page"
            value={size}
            onChange={(e) => onSize(Number(e.target.value))}
            className="h-8 rounded-md border border-line bg-paper px-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className={nav} aria-label="First page" disabled={page === 1} onClick={() => onPage(1)}>
            <ChevronsLeft size={15} />
          </Button>
          <Button variant="ghost" size="icon" className={nav} aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft size={15} />
          </Button>
          {pageWindow(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} aria-hidden className="px-1 text-ink-soft">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant="ghost"
                size="icon"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPage(p)}
                className={cn(
                  nav,
                  "font-mono text-xs",
                  p === page && "bg-ink text-paper hover:bg-ink hover:text-paper",
                )}
              >
                {p}
              </Button>
            ),
          )}
          <Button variant="ghost" size="icon" className={nav} aria-label="Next page" disabled={page === pageCount} onClick={() => onPage(page + 1)}>
            <ChevronRight size={15} />
          </Button>
          <Button variant="ghost" size="icon" className={nav} aria-label="Last page" disabled={page === pageCount} onClick={() => onPage(pageCount)}>
            <ChevronsRight size={15} />
          </Button>
        </nav>
      )}
    </div>
  );
}
