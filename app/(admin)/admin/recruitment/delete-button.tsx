"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteRecruitmentAction } from "./actions";

export function DeleteRecruitmentButton({
  id,
  label,
}: {
  id: number;
  label: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Hapus lamaran?"
      description={`Entry "${label}" akan dihapus permanen.`}
      onConfirm={() => deleteRecruitmentAction(id)}
      trigger={
        <Button variant="destructive" size="sm">
          Hapus
        </Button>
      }
    />
  );
}
