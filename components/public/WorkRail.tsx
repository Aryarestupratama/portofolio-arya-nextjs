"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Pengganti ProjectCarousel 3D: rail horizontal scroll-snap. Tombol
// prev/next hanya muncul kalau isinya memang melebihi lebar (>= 3 card
// di desktop). Dengan 1-2 project, tampil sebagai baris biasa.
export function WorkRail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  function scrollByCard(direction: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = (first?.offsetWidth ?? el.clientWidth * 0.8) + 20;
    el.scrollBy({
      left: direction * step,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  const showControls = canPrev || canNext;

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-medium tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        <div
          className={cn(
            "flex gap-2 transition-opacity",
            showControls ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous projects"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30 disabled:hover:border-line"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next projects"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30 disabled:hover:border-line"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        role="region"
        aria-label={title}
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden px-6 pb-8 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {Children.toArray(children).map((child, i) => (
          <div
            key={i}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
