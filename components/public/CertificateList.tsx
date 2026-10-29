"use client";

import { useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "./EmptyState";

type Certificate = {
  id: number;
  title: string;
  issuer: string;
  year_start: number;
  year_end: number | null;
  certificate_url: string;
};

function displayYear(c: Certificate) {
  return c.year_end ? `${c.year_start}–${c.year_end}` : `${c.year_start}`;
}

// Baris sertifikat; klik membuka preview (iframe) di dialog, dengan link
// "Open in new tab". Menggantikan CertificatePreview (layout 2 panel).
export function CertificateList({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [selected, setSelected] = useState<Certificate | null>(null);

  if (certificates.length === 0) {
    return <EmptyState message="No certificates added yet." />;
  }

  return (
    <>
      <ul className="border-b border-line">
        {certificates.map((cert) => (
          <li key={cert.id} className="border-t border-line">
            <button
              type="button"
              onClick={() => setSelected(cert)}
              className="group flex w-full items-start justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                  {cert.title}
                </span>
                <span className="mt-1 block font-mono text-xs text-ink-soft">
                  {cert.issuer} · {displayYear(cert)}
                </span>
              </span>
              <ArrowUpRight
                size={16}
                className="mt-0.5 shrink-0 text-ink-soft transition-colors group-hover:text-brand"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col gap-3 p-4 sm:p-6">
          {selected && (
            <>
              <DialogTitle className="pr-8 text-base md:text-lg">
                {selected.title}
              </DialogTitle>
              <DialogDescription>
                {selected.issuer} · {displayYear(selected)}
              </DialogDescription>
              <iframe
                key={selected.id}
                src={`${selected.certificate_url}#toolbar=0&navpanes=0&view=FitH`}
                title={`Preview ${selected.title}`}
                className="min-h-0 w-full flex-1 rounded-md border border-line"
              />
              <a
                href={selected.certificate_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-end font-mono text-xs text-brand hover:underline"
              >
                Open in new tab
                <ExternalLink size={12} />
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
