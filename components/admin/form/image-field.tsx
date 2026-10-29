"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { validateImageFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

/**
 * Input gambar dengan preview, validasi tipe/ukuran di client (sebelum upload),
 * dan tombol hapus pilihan. Gambar saat ini (`currentUrl`) tampil sebagai
 * preview awal. Beri `key={currentUrl}` dari pemanggil agar ter-reset setelah simpan.
 */
export function ImageField({
  id,
  name,
  currentUrl,
  required = false,
}: {
  id: string;
  name: string;
  currentUrl?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = preview ?? currentUrl ?? null;

  function clearSelection() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      clearSelection();
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Thumbnail preview" className="size-full object-cover object-top" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-soft">
            <ImagePlus size={22} strokeWidth={1.5} />
            <span className="text-xs">No image yet</span>
          </div>
        )}
        {preview && (
          <button
            type="button"
            onClick={clearSelection}
            aria-label="Discard selected image"
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required && !currentUrl}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-line text-xs font-medium text-ink transition-colors hover:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand",
        )}
      >
        {shown ? "Replace image" : "Choose image"}
      </label>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-soft">JPG, PNG or WebP, max 5MB.</p>
      )}
    </div>
  );
}
