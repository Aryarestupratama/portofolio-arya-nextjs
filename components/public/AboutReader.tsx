"use client";

import { useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { parseAboutBio } from "@/lib/utils/about-bio";

const paragraphClass =
  "py-5 text-2xl leading-snug text-ink md:text-3xl md:leading-snug";

function FadeParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.2"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.12, 1, 1, 0.12]);
  const blur = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [6, 0, 0, 6]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.p ref={ref} style={{ opacity, filter }} className={paragraphClass}>
      {text}
    </motion.p>
  );
}

// Rail tahun di kiri (Design.md v2): garis-garis tipis, dengan penanda
// brand + tahun yang bergerak mengikuti progres scroll.
function YearRail({
  progress,
  resolveYear,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  resolveYear: (progress: number) => number;
}) {
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);
  const year = useTransform(progress, (v) => resolveYear(v));

  return (
    <div className="sticky top-28 hidden h-[50vh] lg:block" aria-hidden="true">
      <div className="flex h-full flex-col justify-between">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="block h-px w-6 bg-line" />
        ))}
      </div>
      <motion.div
        style={{ top }}
        className="absolute left-0 flex -translate-y-1/2 items-center gap-3"
      >
        <span className="block h-px w-6 bg-brand" />
        <motion.span className="font-mono text-sm text-brand">{year}</motion.span>
      </motion.div>
    </div>
  );
}

export function AboutReader({
  text,
  minYear,
  maxYear,
  className,
}: {
  text: string;
  minYear: number | null;
  maxYear: number;
  className?: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ["start center", "end center"],
  });
  const chunks = parseAboutBio(text);
  const bioYears = chunks.flatMap((c) => (c.year === null ? [] : [c.year]));
  const chaptered = bioYears.length > 0;
  const showRail =
    !reduceMotion &&
    (chaptered
      ? new Set(bioYears).size > 1
      : minYear !== null && minYear < maxYear);

  // Tahun di rail: kalau bio punya penanda [tahun], ikuti paragraf yang sedang
  // berada di tengah layar; kalau tidak, interpolasi linear seperti sebelumnya.
  const resolveYear = useCallback(
    (v: number) => {
      const progress = Math.min(Math.max(v, 0), 1);
      const body = bodyRef.current;
      if (chaptered && body) {
        const y = progress * body.offsetHeight;
        let active = 0;
        chunkRefs.current.forEach((el, i) => {
          if (el && el.offsetTop <= y) active = i;
        });
        return chunks[active]?.year ?? bioYears[0];
      }
      const from = minYear ?? maxYear;
      return Math.round(from + progress * (maxYear - from));
    },
    // chunks diturunkan dari `text`; hitung ulang hanya saat bio berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, chaptered, minYear, maxYear],
  );

  return (
    <div className={className}>
      <div className="grid gap-10 lg:grid-cols-9">
        <div className="lg:col-span-3">
          {showRail && (
            <YearRail progress={scrollYProgress} resolveYear={resolveYear} />
          )}
        </div>
        <div ref={bodyRef} className="relative pb-[20vh] lg:col-span-6">
          {chunks.map((chunk, i) => {
            // Label tahun inline saat rail tidak tampil (mobile / reduced motion).
            const isNewYear = chunk.year !== null && chunk.year !== chunks[i - 1]?.year;
            return (
              <div
                key={i}
                ref={(el) => {
                  chunkRefs.current[i] = el;
                }}
              >
                {isNewYear && (
                  <p
                    className={`pt-8 font-mono text-sm text-brand ${showRail ? "lg:hidden" : ""}`}
                  >
                    {chunk.year}
                  </p>
                )}
                {reduceMotion ? (
                  <p className={paragraphClass}>{chunk.text}</p>
                ) : (
                  <FadeParagraph text={chunk.text} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
