"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type SortDir = "asc" | "desc";

type Options = {
  filterIds: string[];
  defaultPageSize: number;
  defaultSort?: { id: string; dir: SortDir };
};

/**
 * State tabel disimpan di URL (?q=&page=&size=&sort=&dir=&<filterId>=),
 * jadi refresh / tombol back / share link mempertahankan kondisi tabel.
 * Update memakai history.replaceState (terintegrasi dengan useSearchParams
 * di Next.js), sehingga TIDAK memicu request ke server tiap ketikan.
 */
export function useTableState({ filterIds, defaultPageSize, defaultSort }: Options) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "", 10) || 1);
  const size = Number.parseInt(searchParams.get("size") ?? "", 10) || defaultPageSize;
  const sortId = searchParams.get("sort") ?? defaultSort?.id ?? null;
  const rawDir = searchParams.get("dir");
  const sortDir: SortDir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : (defaultSort?.dir ?? "asc");

  const filters: Record<string, string> = {};
  for (const id of filterIds) filters[id] = searchParams.get(id) ?? "";

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname],
  );

  const setSearch = useCallback(
    (value: string) => update({ q: value.trim() ? value : null, page: null }),
    [update],
  );

  const setFilter = useCallback(
    (id: string, value: string) => update({ [id]: value || null, page: null }),
    [update],
  );

  const setPage = useCallback(
    (next: number) => update({ page: next <= 1 ? null : String(next) }),
    [update],
  );

  const setSize = useCallback(
    (next: number) =>
      update({ size: next === defaultPageSize ? null : String(next), page: null }),
    [update, defaultPageSize],
  );

  const toggleSort = useCallback(
    (id: string) => {
      const nextDir: SortDir = sortId === id && sortDir === "asc" ? "desc" : "asc";
      update({ sort: id, dir: nextDir, page: null });
    },
    [update, sortId, sortDir],
  );

  const clearAll = useCallback(
    () =>
      update({
        q: null,
        page: null,
        ...Object.fromEntries(filterIds.map((id) => [id, null])),
      }),
    [update, filterIds],
  );

  return {
    q,
    page,
    size,
    sortId,
    sortDir,
    filters,
    setSearch,
    setFilter,
    setPage,
    setSize,
    toggleSort,
    clearAll,
  };
}
