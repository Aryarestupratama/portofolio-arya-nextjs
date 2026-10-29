"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = { value: string; label: string; count?: number };

// Filter kategori project: baris tombol kecil, tersinkron ke URL
// (?category=...). Kategori dinamis lewat props.
export function CategoryTabs({
  categories,
  totalCount,
}: {
  categories: Category[];
  totalCount?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete("category");
    else params.set("category", value);
    const qs = params.toString();
    router.push(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  }

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
            onClick={() => setCategory(tab.value)}
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
