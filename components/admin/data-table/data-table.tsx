"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FilterSelect } from "./filter-select";
import { TablePagination } from "./table-pagination";
import { useTableState, type SortDir } from "./use-table-state";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Jika diisi, header bisa diklik untuk sorting. null selalu di urutan akhir. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Class untuk <th> dan <td>, mis. "w-24" atau "text-right". */
  className?: string;
  /** Sembunyikan kolom di bawah breakpoint tertentu. */
  hideBelow?: "sm" | "md" | "lg";
};

export type TableFilter<T> = {
  id: string; // dipakai sebagai nama query param (jangan q/page/size/sort/dir)
  label: string;
  options: { value: string; label: string }[];
  /** Teks opsi "semua", default `All <label>`. */
  allLabel?: string;
  getValue: (row: T) => string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  /** Teks yang dicari untuk tiap baris (gabungkan field yang relevan). */
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: TableFilter<T>[];
  defaultSort?: { id: string; dir: SortDir };
  pageSizeOptions?: number[];
  /** Tombol aksi di kanan toolbar, mis. "+ Add skill". */
  toolbarActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Ditampilkan di empty state saat data benar-benar kosong. */
  emptyAction?: React.ReactNode;
  /** Kata benda untuk hitungan, mis. "skills". */
  noun?: string;
  /**
   * Jika diisi, tabel punya kolom checkbox dan bar aksi massal muncul saat ada
   * baris terpilih. `rows` hanya berisi baris terpilih yang lolos filter aktif
   * (baris terpilih yang tersembunyi filter tidak ikut terkena aksi).
   */
  bulkActions?: (ctx: { rows: T[]; clear: () => void }) => React.ReactNode;
};

const HIDE: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

function compare(a: string | number | null | undefined, b: string | number | null | undefined) {
  const aNull = a === null || a === undefined || a === "";
  const bNull = b === null || b === undefined || b === "";
  if (aNull && bNull) return 0;
  if (aNull) return 1; // null selalu di bawah, apapun arahnya (ditangani pemanggil)
  if (bNull) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function SearchInput({
  committed,
  placeholder,
  onCommit,
}: {
  committed: string;
  placeholder: string;
  onCommit: (value: string) => void;
}) {
  // draft = teks yang sedang diketik (belum masuk URL); null = ikuti URL.
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const value = draft ?? committed;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function schedule(next: string) {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onCommit(next);
      setDraft(null);
    }, 250);
  }

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <Search aria-hidden size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={value}
        onChange={(e) => schedule(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-paper pl-9 pr-9 text-sm text-ink transition-colors placeholder:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setDraft(null);
            onCommit("");
          }}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft hover:bg-surface hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <Skeleton className="h-10 rounded-none" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mt-px h-14 rounded-none bg-surface" />
        ))}
      </div>
    </div>
  );
}

function DataTableInner<T>({
  data,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Search…",
  filters = [],
  defaultSort,
  pageSizeOptions = [10, 20, 50],
  toolbarActions,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  noun = "items",
  bulkActions,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const state = useTableState({
    filterIds: filters.map((f) => f.id),
    defaultPageSize: pageSizeOptions[0],
    defaultSort,
  });

  const activeFilterCount =
    filters.filter((f) => state.filters[f.id]).length + (state.q.trim() ? 1 : 0);

  // Data admin kecil (puluhan–ratusan baris), jadi dihitung langsung tiap render.
  const filtered = (() => {
    const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return data.filter((row) => {
      for (const f of filters) {
        const selected = state.filters[f.id];
        if (selected && f.getValue(row) !== selected) return false;
      }
      if (tokens.length === 0) return true;
      const haystack = searchText(row).toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  })();

  const sorted = (() => {
    const col = columns.find((c) => c.id === state.sortId);
    if (!col?.sortValue) return filtered;
    const get = col.sortValue;
    const dir = state.sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const aNull = va === null || va === undefined || va === "";
      const bNull = vb === null || vb === undefined || vb === "";
      if (aNull || bNull) return compare(va, vb); // null tetap di akhir
      return compare(va, vb) * dir;
    });
  })();

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / state.size));
  const page = Math.min(state.page, pageCount);
  const rows = sorted.slice((page - 1) * state.size, page * state.size);

  const isEmptyData = data.length === 0;

  // ---- Selection ----
  const selectable = !!bulkActions;
  const selectedRows = selectable ? sorted.filter((r) => selected.has(rowKey(r))) : [];
  const pageSelectedCount = rows.filter((r) => selected.has(rowKey(r))).length;
  const pageAllSelected = rows.length > 0 && pageSelectedCount === rows.length;
  const pagePartlySelected = pageSelectedCount > 0 && !pageAllSelected;
  const allMatchingSelected = total > 0 && selectedRows.length === total;

  function toggleRow(key: string | number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (pageAllSelected) rows.forEach((r) => next.delete(rowKey(r)));
      else rows.forEach((r) => next.add(rowKey(r)));
      return next;
    });
  }

  function selectAllMatching() {
    setSelected(new Set(sorted.map((r) => rowKey(r))));
  }

  const clearSelection = () => setSelected(new Set());
  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="space-y-4">
      {!isEmptyData && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            committed={state.q}
            placeholder={searchPlaceholder}
            onCommit={state.setSearch}
          />
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <FilterSelect
                key={f.id}
                label={f.label}
                allLabel={f.allLabel}
                value={state.filters[f.id]}
                options={f.options}
                onChange={(v) => state.setFilter(f.id, v)}
                className="w-auto min-w-36"
              />
            ))}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={state.clearAll} className="h-10 px-3">
                <X size={14} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
          {toolbarActions && <div className="flex items-center gap-2 sm:ml-auto">{toolbarActions}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-paper">
        {isEmptyData ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface text-ink-soft">
              <Inbox size={22} strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-medium text-ink">{emptyTitle}</p>
            {emptyDescription && <p className="mt-1 max-w-sm text-sm text-ink-soft">{emptyDescription}</p>}
            {emptyAction && <div className="mt-5">{emptyAction}</div>}
          </div>
        ) : (
          <>
            {selectable && selectedRows.length > 0 && (
              <div
                role="region"
                aria-label="Bulk actions"
                className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-brand-wash/70 px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-ink">
                  {selectedRows.length} selected
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {bulkActions({ rows: selectedRows, clear: clearSelection })}
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {!allMatchingSelected && total > rows.length && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-brand" onClick={selectAllMatching}>
                      Select all {total}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearSelection}>
                    Clear selection
                  </Button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left">
                  <tr>
                    {selectable && (
                      <th scope="col" className="w-10 px-4 py-2.5">
                        <Checkbox
                          aria-label="Select all rows on this page"
                          checked={pageAllSelected ? true : pagePartlySelected ? "indeterminate" : false}
                          onCheckedChange={togglePage}
                          disabled={rows.length === 0}
                        />
                      </th>
                    )}
                    {columns.map((col) => {
                      const sortable = !!col.sortValue;
                      const active = state.sortId === col.id;
                      return (
                        <th
                          key={col.id}
                          scope="col"
                          aria-sort={active ? (state.sortDir === "asc" ? "ascending" : "descending") : undefined}
                          className={cn(
                            "whitespace-nowrap px-4 py-2.5 text-xs font-medium text-ink-soft",
                            col.hideBelow && HIDE[col.hideBelow],
                            col.className,
                          )}
                        >
                          {sortable ? (
                            <button
                              type="button"
                              onClick={() => state.toggleSort(col.id)}
                              className={cn(
                                "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                active && "text-ink",
                              )}
                            >
                              {col.header}
                              {active ? (
                                state.sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                              ) : (
                                <ChevronsUpDown size={12} className="opacity-50" />
                              )}
                            </button>
                          ) : (
                            col.header
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={colCount}>
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                          <span className="flex size-12 items-center justify-center rounded-full bg-surface text-ink-soft">
                            <SearchX size={22} strokeWidth={1.5} />
                          </span>
                          <p className="mt-4 font-medium text-ink">No matching {noun}</p>
                          <p className="mt-1 text-sm text-ink-soft">Try a different search or clear the filters.</p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={state.clearAll}>
                            Clear filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const key = rowKey(row);
                      const isSelected = selected.has(key);
                      return (
                      <tr
                        key={key}
                        data-selected={isSelected || undefined}
                        className={cn(
                          "border-t border-line align-middle transition-colors hover:bg-surface/60",
                          isSelected && "bg-brand-wash/40 hover:bg-brand-wash/60",
                        )}
                      >
                        {selectable && (
                          <td className="w-10 px-4 py-3">
                            <Checkbox
                              aria-label={`Select row ${key}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(key)}
                            />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className={cn("px-4 py-3", col.hideBelow && HIDE[col.hideBelow], col.className)}
                          >
                            {col.cell(row)}
                          </td>
                        ))}
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={page}
              pageCount={pageCount}
              size={state.size}
              total={total}
              sizeOptions={pageSizeOptions}
              onPage={state.setPage}
              onSize={state.setSize}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Tabel admin generik: search (debounce), filter dropdown, sorting header,
 * pagination, empty state. Semua state tersimpan di URL. Data diterima penuh
 * dari server lalu diproses di client (cukup untuk skala portfolio personal).
 */
export function DataTable<T>(props: DataTableProps<T>) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataTableInner {...props} />
    </Suspense>
  );
}
