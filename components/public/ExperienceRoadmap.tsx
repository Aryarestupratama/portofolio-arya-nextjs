"use client";

import { useEffect, useRef, useState } from "react";

type Experience = {
  id: number;
  role_title: string;
  period_text: string;
  description: string;
  achievement: string | null;
};

// Reveal sekali ("one-shot") begitu elemen masuk viewport — konsisten
// dengan pola scroll-in di seluruh site.
function useReveal(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

// Schema.md tidak punya kolom is_current, jadi deteksi status "ongoing"
// murni dari regex scan period_text (present/sekarang/now/current).
function isOngoing(periodText: string) {
  return /present|sekarang|now|current|saat ini/i.test(periodText);
}

function RoadmapNode({
  exp,
  index,
  isLast,
  align,
}: {
  exp: Experience;
  index: number;
  isLast: boolean;
  align: "left" | "right";
}) {
  const [ref, inView] = useReveal(0.3);
  const current = isOngoing(exp.period_text);
  const fromLeft = align === "left";

  const content = (
    <div
      className="transition-all ease-out"
      style={{
        transitionDuration: "700ms",
        transitionDelay: inView ? `${index * 90}ms` : "0ms",
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateX(0)"
          : `translateX(${fromLeft ? "-" : ""}18px)`,
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 font-mono text-xs"
        style={{ justifyContent: fromLeft ? "flex-end" : "flex-start" }}
      >
        <span
          className={`rounded-md px-2 py-0.5 font-medium uppercase tracking-wide ${
            current ? "" : "text-ink-soft"
          }`}
          style={
            current
              ? { color: "var(--cobalt)", backgroundColor: "var(--butter-cream)" }
              : undefined
          }
        >
          {current ? "Saat ini" : "Selesai"}
        </span>
        <span className="text-ink-soft">{exp.period_text}</span>
      </div>

      <h3 className="mb-1 font-display text-lg font-medium text-ink md:text-xl">
        {exp.role_title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-soft">{exp.description}</p>
      {exp.achievement && (
        <p className="mt-3 whitespace-pre-line text-sm text-ink">
          {exp.achievement}
        </p>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-[40px_1fr] gap-x-4 md:grid-cols-[1fr_48px_1fr] md:gap-x-14"
    >
      {/* Kolom kiri (desktop saja) */}
      <div className="hidden md:block">{fromLeft ? content : null}</div>

      {/* Rel tengah: dot + connector, dipakai bareng mobile & desktop */}
      <div className="flex flex-col items-center">
        <span
          className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ease-out"
          style={{
            transitionDuration: "500ms",
            transitionDelay: inView ? `${index * 90}ms` : "0ms",
            borderColor: current ? "var(--cobalt)" : "var(--ink)",
            backgroundColor: current
              ? "transparent"
              : inView
                ? "var(--ink)"
                : "transparent",
            transform: inView ? "scale(1)" : "scale(0.4)",
            opacity: inView ? 1 : 0,
          }}
        >
          {current && (
            <>
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full"
                style={{ backgroundColor: "var(--cobalt)", opacity: 0.35 }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--cobalt)" }}
              />
            </>
          )}
        </span>

        {!isLast && (
          <div className="relative mt-1 min-h-[120px] w-px flex-1 overflow-hidden bg-line md:min-h-[180px]">
            <div
              className="absolute inset-x-0 top-0 w-full bg-ink transition-transform ease-out"
              style={{
                height: "100%",
                transitionDuration: "600ms",
                transitionDelay: inView ? `${index * 90 + 200}ms` : "0ms",
                transform: inView ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "top",
              }}
            />
          </div>
        )}
      </div>

      {/* Kolom kanan: selalu dipakai di mobile, dipakai di desktop kalau align kanan */}
      <div className="pb-16 md:pb-28">
        <div className="md:hidden">{content}</div>
        <div className="hidden md:block">{!fromLeft ? content : null}</div>
      </div>
    </div>
  );
}

export function ExperienceRoadmap({
  experiences,
  limit,
}: {
  experiences: Experience[];
  limit?: number;
}) {
  // `experiences` datang terurut dari kolom `order` (terbaru duluan).
  // Kalau di-limit, ambil dari AWAL array supaya home page nampilin yang
  // paling baru.
  const items = limit ? experiences.slice(0, limit) : experiences;

  return (
    <div>
      {items.map((exp, i) => (
        <RoadmapNode
          key={exp.id}
          exp={exp}
          index={i}
          isLast={i === items.length - 1}
          align={i % 2 === 0 ? "left" : "right"}
        />
      ))}
    </div>
  );
}