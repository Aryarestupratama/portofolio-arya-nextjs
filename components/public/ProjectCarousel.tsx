"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type Project = {
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  tahun: number;
  status: string;
};

// Design.md §4.3.1: carousel 3D-ish dengan autoplay, center card besar +
// deskripsi, side card offset+scale+opacity, tombol prev/next, dan dot
// pagination. Port langsung dari ProjectCarousel.jsx (Laravel). Hanya
// dipakai saat projects.length >= 3.
export function ProjectCarousel({
  projects,
  autoPlayInterval = 5000,
}: {
  projects: Project[];
  autoPlayInterval?: number;
}) {
  const router = useRouter();
  const count = projects.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number) => setCurrentIndex(((idx % count) + count) % count),
    [count],
  );

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Autoplay — reset setiap kali index berubah (termasuk navigasi manual).
  useEffect(() => {
    if (count <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % count);
    }, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, currentIndex, autoPlayInterval]);

  function handleCardClick(idx: number) {
    if (idx === currentIndex) {
      router.push(`/projects/${projects[idx].slug}`);
    } else {
      goTo(idx);
    }
  }

  if (count === 0) return null;

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="relative flex h-[380px] select-none items-center justify-center sm:h-[420px] md:h-[480px]">
        {projects.map((project, idx) => {
          let offset = idx - currentIndex;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          const animate = isCenter
            ? { x: "0%", scale: 1, opacity: 1, zIndex: 30 }
            : isVisible
              ? {
                  x: offset < 0 ? "-62%" : "62%",
                  scale: 0.82,
                  opacity: 0.55,
                  zIndex: 20,
                }
              : {
                  x: offset < 0 ? "-100%" : "100%",
                  scale: 0.7,
                  opacity: 0,
                  zIndex: 10,
                };

          return (
            <motion.div
              key={project.slug}
              className="absolute w-[280px] sm:w-[340px] md:w-[420px]"
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
              animate={animate}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={() => isVisible && handleCardClick(idx)}
            >
              <div
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition-colors ${
                  isCenter
                    ? "border-ink shadow-xl"
                    : "border-line shadow-sm hover:border-ink"
                }`}
              >
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-clean-white">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    sizes="420px"
                    className="object-contain"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-xs text-ink-soft">
                      {project.category} · {project.tahun}
                    </p>
                    <StatusBadge status={project.status} />
                  </div>
                  <h3 className="mb-2 font-display text-base font-medium text-ink transition-colors group-hover:text-[var(--cobalt)] md:text-lg">
                    {project.title}
                  </h3>
                  {isCenter && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Project sebelumnya"
            className="absolute left-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt sm:-left-4"
          >
            <ChevronLeft size={18} className="text-ink" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Project berikutnya"
            className="absolute right-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt sm:-right-4"
          >
            <ChevronRight size={18} className="text-ink" />
          </button>

          <div className="mt-10 flex items-center justify-center gap-2 relative z-40">
            {projects.map((project, idx) => (
              <button
                key={project.slug}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Ke project ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-ink" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}