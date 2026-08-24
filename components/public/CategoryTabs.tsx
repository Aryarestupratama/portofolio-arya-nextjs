"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

// Design.md §4.3.1: segmented control — pill container (bg-clean-white)
// dengan animated active indicator (layoutId) yang dapat background putih
// + shadow saat aktif. Port langsung dari CategoryTabs.jsx (Laravel);
// value/label tetap dynamic lewat props (bukan hardcoded) supaya kategori
// bisa berubah tanpa redeploy. Update search params via next/navigation
// menggantikan router.get() Inertia.
export function CategoryTabs({
  categories,
}: {
  categories: { value: string; label: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";
  const reduceMotion = useReducedMotion();

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete("category");
    else params.set("category", value);
    router.push(`/projects?${params.toString()}`, { scroll: false });
  }

  const allTabs = [{ value: "", label: "Semua" }, ...categories];

  return (
    <div
      role="group"
      aria-label="Filter kategori project"
      className="flex w-fit gap-1 rounded-full border border-line bg-clean-white p-1 font-mono text-sm"
    >
      {allTabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setCategory(tab.value)}
            className={`relative rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
              isActive ? "" : "text-ink-soft hover:text-ink"
            }`}
            style={isActive ? { color: "var(--cobalt)" } : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="category-tab-active"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}