"use client";

import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton, IconLinkButton } from "@/components/admin/icon-button";
import { deleteCertificateAction } from "./actions";
import {
  CertificateFormDialog,
  type Certificate,
} from "./certificate-form-dialog";

export function CertificatesManager({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const addButton = (
    <CertificateFormDialog
      trigger={
        <Button>
          <Plus size={16} className="mr-1.5" />
          Add certificate
        </Button>
      }
    />
  );

  const issuers = Array.from(new Set(certificates.map((c) => c.issuer))).sort(
    (a, b) => a.localeCompare(b),
  );
  const years = Array.from(new Set(certificates.map((c) => c.year_start))).sort(
    (a, b) => b - a,
  );

  const columns: Column<Certificate>[] = [
    {
      id: "title",
      header: "Title",
      sortValue: (c) => c.title,
      cell: (c) => <span className="font-medium text-ink">{c.title}</span>,
    },
    {
      id: "issuer",
      header: "Issuer",
      sortValue: (c) => c.issuer,
      hideBelow: "sm",
      cell: (c) => <span className="text-ink-soft">{c.issuer}</span>,
    },
    {
      id: "year",
      header: "Year",
      sortValue: (c) => c.year_start,
      cell: (c) => (
        <span className="whitespace-nowrap font-mono text-xs text-ink-soft">
          {c.year_start}
          {c.year_end ? ` – ${c.year_end}` : ""}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-36 text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          {c.certificate_display_url && (
            <IconLinkButton
              href={c.certificate_display_url}
              label={`Open file for ${c.title}`}
              external
            >
              <ExternalLink size={15} />
            </IconLinkButton>
          )}
          <CertificateFormDialog
            certificate={c}
            trigger={
              <IconButton label={`Edit ${c.title}`}>
                <Pencil size={15} />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            title="Delete this certificate?"
            description={`"${c.title}" will be permanently deleted.`}
            onConfirm={() => deleteCertificateAction(c.id)}
            trigger={
              <IconButton label={`Delete ${c.title}`} tone="danger">
                <Trash2 size={15} />
              </IconButton>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <DataTable
        data={certificates}
        columns={columns}
        rowKey={(c) => c.id}
        searchText={(c) => `${c.title} ${c.issuer} ${c.year_start}`}
        searchPlaceholder="Search certificates…"
        noun="certificates"
        defaultSort={{ id: "year", dir: "desc" }}
        filters={[
          {
            id: "issuer",
            label: "Issuer",
            options: issuers.map((i) => ({ value: i, label: i })),
            getValue: (c) => c.issuer,
          },
          {
            id: "year",
            label: "Year",
            options: years.map((y) => ({ value: String(y), label: String(y) })),
            getValue: (c) => String(c.year_start),
          },
        ]}
        toolbarActions={addButton}
        emptyTitle="No certificates yet"
        emptyDescription="Upload a certificate to show it on your portfolio."
        emptyAction={addButton}
      />
    </div>
  );
}
