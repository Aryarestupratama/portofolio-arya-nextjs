"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FormDialog } from "@/components/admin/form";
import { validateCertificateFile } from "@/lib/supabase/storage";
import { upsertCertificateAction } from "./actions";

export type Certificate = {
  id: number;
  title: string;
  issuer: string;
  year_start: number;
  year_end: number | null;
  certificate_url: string; // path di storage
  certificate_display_url?: string; // public URL, untuk link preview
};

function FileInput({ hasExisting, currentUrl }: { hasExisting: boolean; currentUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <Field
      label="Certificate file"
      htmlFor="certificate_file"
      required={!hasExisting}
      error={error ?? undefined}
      hint={
        <>
          PDF, JPG, PNG or WebP, max 10MB.
          {hasExisting && currentUrl && (
            <>
              {" "}
              Leave empty to keep the{" "}
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                current file
              </a>
              .
            </>
          )}
        </>
      }
    >
      <Input
        id="certificate_file"
        name="certificate_file"
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        required={!hasExisting}
        onChange={(e) => {
          const file = e.target.files?.[0];
          const problem = file ? validateCertificateFile(file) : null;
          setError(problem);
          if (problem) e.target.value = "";
        }}
      />
    </Field>
  );
}

export function CertificateFormDialog({
  certificate,
  trigger,
}: {
  certificate?: Certificate;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={certificate ? "Edit certificate" : "Add certificate"}
      action={upsertCertificateAction}
      successMessage={certificate ? "Certificate updated" : "Certificate added"}
    >
      {certificate && (
        <>
          <input type="hidden" name="id" value={certificate.id} />
          <input type="hidden" name="existing_certificate_url" value={certificate.certificate_url} />
        </>
      )}
      <Field label="Title" htmlFor="title" required>
        <Input id="title" name="title" defaultValue={certificate?.title} required />
      </Field>
      <Field label="Issuer" htmlFor="issuer" required>
        <Input id="issuer" name="issuer" defaultValue={certificate?.issuer} required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Year started" htmlFor="year_start" required>
          <Input
            id="year_start"
            name="year_start"
            type="number"
            min={1990}
            max={2100}
            defaultValue={certificate?.year_start ?? new Date().getFullYear()}
            required
          />
        </Field>
        <Field label="Year finished" htmlFor="year_end" hint="Optional.">
          <Input id="year_end" name="year_end" type="number" min={1990} max={2100} defaultValue={certificate?.year_end ?? ""} />
        </Field>
      </div>
      <FileInput hasExisting={!!certificate} currentUrl={certificate?.certificate_display_url} />
    </FormDialog>
  );
}
