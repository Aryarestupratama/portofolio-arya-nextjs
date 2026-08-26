"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = { id: string | number; url: string };

// Design.md §4.3.5: main-image viewer (crossfade 200ms saat ganti) +
// thumbnail strip berpaginasi (3 kolom mobile, 4 kolom sm+), prev/next +
// dot indicator. Port langsung dari gallery custom di ProjectDetail.jsx
// (Laravel) — BUKAN GalleryDialog (lightbox modal); dua pola ini berbeda,
// dan ProjectDetail memang tidak pernah memakai GalleryDialog di source
// aslinya.
export function ProjectGallery({
  thumbnailUrl,
  images,
}: {
  thumbnailUrl: string;
  images: GalleryImage[];
}) {
  // Thumbnail selalu jadi gambar pertama; dedup kalau ada gambar lain yang
  // persis sama URL-nya dengan thumbnail.
  const galleryImages: GalleryImage[] = [
    { id: "thumbnail", url: thumbnailUrl },
    ...images.filter((img) => img.url !== thumbnailUrl),
  ].filter((img) => img.url);

  const [activeUrl, setActiveUrl] = useState(thumbnailUrl);
  const [displayUrl, setDisplayUrl] = useState(thumbnailUrl);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (activeUrl === displayUrl) return;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayUrl(activeUrl);
      setVisible(true);
    }, 200);
    return () => clearTimeout(t);
  }, [activeUrl, displayUrl]);

  const [columns, setColumns] = useState(3);
  const [page, setPage] = useState(0);
  const [gridVisible, setGridVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setColumns(mq.matches ? 4 : 3);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const totalPages = Math.max(1, Math.ceil(galleryImages.length / columns));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const pagedImages = galleryImages.slice(
    page * columns,
    page * columns + columns,
  );
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  function goToPage(next: number) {
    if (next === page) return;
    setGridVisible(false);
    setTimeout(() => {
      setPage(next);
      setGridVisible(true);
    }, 150);
  }

  if (galleryImages.length === 0) return null;

  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-2xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt=""
          className={`h-full w-full object-contain transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {galleryImages.length > columns && (
        <div className="relative mt-4">
          <div
            className={`grid grid-cols-3 gap-3 transition-opacity duration-150 sm:grid-cols-4 ${
              gridVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {pagedImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveUrl(img.url)}
                aria-label="View image"
                aria-current={activeUrl === img.url}
                className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                  activeUrl === img.url
                    ? "scale-[1.02] border-[var(--cobalt)]"
                    : "border-line hover:border-ink-soft"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>

          {hasPrev && (
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              aria-label="Previous images"
              className="absolute -left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt md:-left-5"
            >
              <ChevronLeft size={18} className="text-ink" />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              aria-label="Next images"
              className="absolute -right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt md:-right-5"
            >
              <ChevronRight size={18} className="text-ink" />
            </button>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === page ? "w-4 bg-[var(--cobalt)]" : "w-1.5 bg-line"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {galleryImages.length > 1 && galleryImages.length <= columns && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {galleryImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveUrl(img.url)}
              aria-label="View image"
              aria-current={activeUrl === img.url}
              className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                activeUrl === img.url
                  ? "scale-[1.02] border-[var(--cobalt)]"
                  : "border-line hover:border-ink-soft"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}