"use client";

import { Fragment, useCallback, useState } from "react";
import Image from "next/image";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type ProjectImage = { id: number; url: string; caption: string | null };

// Design.md §4.3.1: grid thumbnail (semua gambar sekaligus, tanpa
// pagination) -> klik buka lightbox modal (prev/next, caption, index
// counter, close button). Port langsung dari GalleryDialog.jsx (Laravel),
// disesuaikan ke Headless UI v2 (named import, bukan dot-notation) dan
// next/image.
export function GalleryDialog({ images }: { images: ProjectImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    },
    [images.length],
  );
  const showNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
    },
    [images.length],
  );

  if (images.length === 0) return null;

  const dur = reduceMotion ? "duration-0" : "duration-200";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className="relative aspect-video overflow-hidden rounded-xl border border-line transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
            aria-label={img.caption ? `Buka gambar: ${img.caption}` : `Buka gambar ${i + 1}`}
          >
            <Image
              src={img.url}
              alt={img.caption ?? ""}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <Transition show={activeIndex !== null} as={Fragment}>
        <Dialog onClose={close} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter={`ease-out ${dur}`}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={`ease-in ${dur}`}
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/80" aria-hidden="true" onClick={close} />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-6">
            <TransitionChild
              as={Fragment}
              enter={`ease-out ${dur}`}
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave={`ease-in ${dur}`}
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-full max-w-3xl">
                {activeIndex !== null && (
                  <>
                    <button
                      onClick={close}
                      aria-label="Tutup galeri"
                      className="absolute -top-10 right-0 rounded-sm text-cream/80 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream md:-right-10 md:top-0"
                    >
                      <X size={22} />
                    </button>

                    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                      <Image
                        src={images[activeIndex].url}
                        alt={images[activeIndex].caption ?? ""}
                        fill
                        sizes="(min-width: 768px) 768px, 100vw"
                        className="object-contain"
                      />
                    </div>

                    {images[activeIndex].caption && (
                      <p className="mt-3 text-center font-mono text-sm text-cream">
                        {images[activeIndex].caption}
                      </p>
                    )}

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={showPrev}
                          aria-label="Gambar sebelumnya"
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/50 p-2 text-cream transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={showNext}
                          aria-label="Gambar berikutnya"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/50 p-2 text-cream transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <p className="absolute -bottom-8 left-0 right-0 text-center font-mono text-xs text-cream/60">
                          {activeIndex + 1} / {images.length}
                        </p>
                      </>
                    )}
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}