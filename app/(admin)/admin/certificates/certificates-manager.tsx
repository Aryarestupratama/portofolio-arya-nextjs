"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconButton, IconLinkButton } from "@/components/admin/icon-button";
import {
  upsertCertificateAction,
  deleteCertificateAction,
  type CertificateActionState,
} from "./actions";

type Certificate = {
  id: number;
  title: string;
  issuer: string;
  year_start: number;
  year_end: number | null;
  certificate_url: string; // path di storage
  certificate_display_url?: string; // public URL, buat link preview
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

function CertificateFormDialog({
  certificate,
  trigger,
}: {
  certificate?: Certificate;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction] = useActionState<CertificateActionState, FormData>(
    upsertCertificateAction,
    null,
  );

  useEffect(() => {
    if (submitted && !state?.error) setOpen(false);
  }, [state, submitted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {certificate ? "Edit Certificate" : "Add Certificate"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          encType="multipart/form-data"
          className="space-y-4"
        >
          {certificate && (
            <input type="hidden" name="id" value={certificate.id} />
          )}
          <input
            type="hidden"
            name="existing_certificate_url"
            value={certificate?.certificate_url ?? ""}
          />
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={certificate?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuer">Issuer</Label>
            <Input id="issuer" name="issuer" defaultValue={certificate?.issuer} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year_start">Start year</Label>
              <Input
                id="year_start"
                name="year_start"
                type="number"
                defaultValue={certificate?.year_start}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year_end">End year (optional)</Label>
              <Input
                id="year_end"
                name="year_end"
                type="number"
                defaultValue={certificate?.year_end ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="certificate_file">Certificate file</Label>
            <Input
              id="certificate_file"
              name="certificate_file"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              required={!certificate}
            />
            {certificate?.certificate_display_url && (
              <a
                href={certificate.certificate_display_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-mono text-xs text-brand hover:underline"
              >
                View current file
              </a>
            )}
            <p className="text-xs text-ink-soft">
              {certificate ? "Leave empty to keep the current file. " : ""}
              PDF, JPG, PNG, or WebP — max 10MB.
            </p>
          </div>
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
