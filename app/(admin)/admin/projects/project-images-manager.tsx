"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { addProjectImageAction, deleteProjectImageAction } from "./actions";

type ProjectImage = { id: number; image_path: string; url: string };

export function ProjectImagesManager({
  projectId,
  slug,
  images,
}: {
  projectId: number;
  slug: string;
  images: ProjectImage[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="space-y-4 rounded-xl border border-line bg-white p-5">
      <h2 className="font-display text-lg font-medium text-ink">
        Gallery Gambar
      </h2>

      {images.length === 0 && (
        <p className="text-sm text-ink-soft">Belum ada gambar gallery.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              className="h-24 w-full rounded-md object-cover"
            />
            <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
              <ConfirmDeleteDialog
                title="Hapus gambar ini?"
                description="Gambar akan dihapus permanen dari gallery project."
                onConfirm={() =>
                  deleteProjectImageAction(img.id, projectId, slug)
                }
                trigger={
                  <Button variant="destructive" size="sm">
                    ✕
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await addProjectImageAction(projectId, slug, formData);
            if (result?.error) setError(result.error);
            else formRef.current?.reset();
          });
        }}
        className="flex items-center gap-3"
      >
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block text-sm text-ink-soft file:mr-4 file:rounded-md file:border-0 file:bg-clean-white file:px-3 file:py-2 file:text-sm file:text-ink"
        />
        <Button type="submit" disabled={isPending} variant="outline">
          {isPending ? "Mengupload..." : "Upload"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
