"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteProjectAction } from "./actions";

export function DeleteProjectButton({
  id,
  slug,
  title,
}: {
  id: number;
  slug: string;
  title: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Hapus project?"
      description={`Project "${title}" beserta semua gambar & metrics-nya akan dihapus permanen.`}
      onConfirm={() => deleteProjectAction(id, slug)}
      trigger={
        <Button variant="destructive" size="sm" className="flex-1">
          Hapus
        </Button>
      }
    />
  );
}
