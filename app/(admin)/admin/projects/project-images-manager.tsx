"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { IconButton } from "@/components/admin/icon-button";
import { validateImageFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { addProjectImageAction, deleteProjectImageAction } from "./actions";

type ProjectImage = { id: number; image_path: string; url: string };

/**
 * Gallery project: grid gambar + dropzone (klik atau drag & drop, multi-file).
 * Tidak memakai <form> sendiri sehingga aman diletakkan di dalam form project.
 */
export function ProjectImagesManager({
  projectId,
  slug,
  images,
}: {
  projectId: number;
  slug: string;
  images: ProjectImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of list) {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(`${file.name}: ${problem}`);
        continue;
      }
      const fd = new FormData();
      fd.set("image", file);
      const result = await addProjectImageAction(projectId, slug, fd);
      if (result?.error) toast.error(`${file.name}: ${result.error}`);
      else ok++;
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (ok > 0) toast.success(ok === 1 ? "Image uploaded" : `${ok} images uploaded`);
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="group relative overflow-hidden rounded-lg border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Gallery image ${i + 1}`} className="aspect-[4/3] w-full object-cover object-top" />
              <span className="absolute left-2 top-2 rounded bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] text-paper">
                {i + 1}
              </span>
              <div className="absolute right-1.5 top-1.5 rounded-md bg-paper/90 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <ConfirmDeleteDialog
                  title="Delete this image?"
                  description="The image will be permanently removed from the project gallery."
                  onConfirm={() => deleteProjectImageAction(img.id, projectId, slug)}
                  trigger={
                    <IconButton label={`Delete image ${i + 1}`} tone="danger">
                      <Trash2 size={14} />
                    </IconButton>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-brand bg-brand-wash" : "border-line bg-surface/50",
        )}
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin text-ink-soft" />
        ) : (
          <ImagePlus size={20} strokeWidth={1.5} className="text-ink-soft" />
        )}
        <p className="text-sm text-ink">
          {uploading ? "Uploading…" : "Drag images here, or"}{" "}
          {!uploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-brand hover:underline"
            >
              browse files
            </button>
          )}
        </p>
        <p className="text-xs text-ink-soft">JPG, PNG or WebP, max 5MB each. Full-page screenshots work best.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload gallery images"
          onChange={(e) => e.target.files && void upload(e.target.files)}
        />
      </div>
    </div>
  );
}
