"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { key: string; title: string; content: React.ReactNode };

// Accordion case study (Problem / Approach / Outcome) di sidebar detail
// project. Satu panel terbuka pada satu waktu.
export function CaseStudyAccordion({
  items,
  defaultOpen,
}: {
  items: Item[];
  defaultOpen?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(
    defaultOpen ?? items[0]?.key ?? null,
  );

  return (
    <div className="border-b border-line">
      {items.map((item) => {
        const open = openKey === item.key;
        const panelId = `case-${item.key}`;
        return (
          <div key={item.key} className="border-t border-line">
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : item.key)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {item.title}
              <Plus
                size={16}
                className={cn(
                  "shrink-0 text-ink-soft transition-transform duration-300 motion-reduce:transition-none",
                  open && "rotate-45",
                )}
              />
            </button>
            <div
              id={panelId}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-6">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
