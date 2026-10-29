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
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
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
  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <CertificateFormDialog trigger={<Button>+ Add Certificate</Button>} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Issuer</th>
              <th className="px-4 py-2 font-medium">Year</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  No certificates yet.
                </td>
              </tr>
            )}
            {certificates.map((cert) => (
              <tr key={cert.id} className="border-t border-line">
                <td className="px-4 py-2 text-ink">{cert.title}</td>
                <td className="px-4 py-2 text-ink-soft">{cert.issuer}</td>
                <td className="px-4 py-2 text-ink-soft">
                  {cert.year_start}
                  {cert.year_end ? ` – ${cert.year_end}` : ""}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <CertificateFormDialog
                      certificate={cert}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <ConfirmDeleteDialog
                      title="Delete this certificate?"
                      description={`"${cert.title}" will be permanently deleted.`}
                      onConfirm={() => deleteCertificateAction(cert.id)}
                      trigger={
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}