"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { formatExperiencePeriod } from "@/lib/validations/experiences";
import { cn } from "@/lib/utils";

type Experience = {
  id: number;
  role_title: string;
  description: string;
  achievement: string | null;
  year_start: number;
  year_end: number | null;
};

// Design.md v2 §6.3: daftar kronologis, satu baris per entry
// (role kiri, periode kanan). Klik baris membuka description + achievement.
export function ExperienceList({
  experiences,
  limit,
}: {
  experiences: Experience[];
  limit?: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const items = limit ? experiences.slice(0, limit) : experiences;

  return (
    <ul className="border-b border-line">
      {items.map((exp) => {
        const open = openId === exp.id;
        const current = exp.year_end === null;
        const panelId = `exp-panel-${exp.id}`;
        return (
          <li key={exp.id} className="border-t border-line">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : exp.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className="group flex w-full items-start justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-lg font-medium tracking-tight text-ink transition-colors group-hover:text-brand md:text-xl">
                  {exp.role_title}
                </span>
                {current && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-wash px-2 py-0.5 font-mono text-[10px] text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-pulse" />
                    now
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-4">
                <span className="font-mono text-xs text-ink-soft md:text-sm">
                  {formatExperiencePeriod(exp.year_start, exp.year_end)}
                </span>
                <Plus
                  size={16}
                  className={cn(
                    "text-ink-soft transition-transform duration-300 motion-reduce:transition-none",
                    open && "rotate-45",
                  )}
                />
              </span>
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
                <div className="grid gap-6 pb-8 md:grid-cols-2">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {exp.description}
                  </p>
                  {exp.achievement && (
                    <div>
                      <p className="font-mono text-xs text-ink-soft">
                        achievement
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                        {exp.achievement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
