"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

// Pecah bio menjadi blok baca. Utamakan paragraf (baris kosong); kalau
// hanya ada 1-2 paragraf, pecah per ~2 kalimat supaya efeknya terasa.
function toChunks(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length >= 3) return paragraphs;

  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(" "));
  }
  return chunks.length ? chunks : paragraphs;
}

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
  minYear,
  maxYear,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  minYear: number;
  maxYear: number;
}) {
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);
  const year = useTransform(progress, (v) =>
    Math.round(minYear + Math.min(Math.max(v, 0), 1) * (maxYear - minYear)),
  );

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
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ["start center", "end center"],
  });
  const chunks = toChunks(text);
  const showRail = minYear !== null && minYear < maxYear && !reduceMotion;

  return (
    <div className={className}>
      <div className="grid gap-10 lg:grid-cols-9">
        <div className="lg:col-span-3">
          {showRail && (
            <YearRail
              progress={scrollYProgress}
              minYear={minYear}
              maxYear={maxYear}
            />
          )}
        </div>
        <div ref={bodyRef} className="pb-[20vh] lg:col-span-6">
          {chunks.map((chunk, i) =>
            reduceMotion ? (
              <p key={i} className={paragraphClass}>
                {chunk}
              </p>
            ) : (
              <FadeParagraph key={i} text={chunk} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
