"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { IconButton } from "@/components/admin/icon-button";
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
      title="Delete application?"
      description={`Entry "${label}" will be permanently deleted.`}
      onConfirm={() => deleteRecruitmentAction(id)}
      trigger={
        <IconButton label={`Delete ${label}`} tone="danger">
          <Trash2 size={15} />
        </IconButton>
      }
    />
  );
}
