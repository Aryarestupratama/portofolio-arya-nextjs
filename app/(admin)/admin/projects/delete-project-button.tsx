"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { IconButton } from "@/components/admin/icon-button";
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
      title="Delete project?"
      description={`Project "${title}" and all of its images & metrics will be permanently deleted.`}
      onConfirm={() => deleteProjectAction(id, slug)}
      trigger={
        <IconButton label={`Delete ${title}`} tone="danger">
          <Trash2 size={15} />
        </IconButton>
      }
    />
  );
}
