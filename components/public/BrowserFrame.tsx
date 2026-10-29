import Image from "next/image";
import { cn } from "@/lib/utils";

// Signature element (Design.md v2 §5.2): screenshot full-page dibungkus
// frame browser mini. Saat induk `.frame-host` di-hover, gambar bergeser
// pelan dari atas ke bawah (CSS murni, lihat globals.css).
// Server Component: tidak ada JavaScript client.
export function BrowserFrame({
  src,
  alt,
  url,
  className,
  sizes = "(min-width: 1024px) 45vw, 90vw",
  priority = false,
  scrollable = false,
  aspect = "aspect-[4/3]",
}: {
  src?: string | null;
  alt: string;
  /** Teks di kotak URL (tanpa protokol). */
  url: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Mode detail: area tampil bisa di-scroll manual (cocok untuk screenshot full-page), tanpa auto-scroll. */
  scrollable?: boolean;
  /** Kelas aspect-ratio area tampil. */
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-paper",
        className,
      )}
    >
      <div className="flex h-8 items-center gap-3 border-b border-line px-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded bg-surface px-2 py-0.5 text-center font-mono text-[10px] text-ink-soft">
          {url}
        </div>
        <div className="w-[34px]" aria-hidden="true" />
      </div>

      <div
        className={cn(
          "frame-viewport relative bg-surface",
          aspect,
          scrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes={sizes}
            priority={priority}
            style={{ width: "100%", height: "auto" }}
            className={scrollable ? "block" : "frame-scroll block"}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs text-ink-soft">No preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
