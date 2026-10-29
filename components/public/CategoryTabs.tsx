"use client";

import { cn } from "@/lib/utils";

export type Category = { value: string; label: string; count?: number };

// Filter kategori project: baris tombol kecil. Stateless; state aktif
// dikelola ProjectsExplorer (tersinkron ke URL ?category=...).
export function CategoryTabs({
  categories,
  totalCount,
  active,
  onSelect,
}: {
  categories: Category[];
  totalCount?: number;
  active: string;
  onSelect?: (value: string) => void;
}) {
  const tabs: Category[] = [
    { value: "", label: "All", count: totalCount },
    ...categories,
  ];

  return (
    <div
      role="group"
      aria-label="Filter kategori project"
      className="flex flex-wrap gap-2"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect?.(tab.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "font-mono text-[10px]",
                  isActive ? "text-paper/70" : "text-ink-soft",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
