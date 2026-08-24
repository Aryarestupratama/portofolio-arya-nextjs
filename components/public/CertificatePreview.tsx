"use client";

import { useState } from "react";
import { Award, ExternalLink } from "lucide-react";
import { EmptyState } from "./EmptyState";

type Certificate = {
  id: number;
  title: string;
  issuer: string;
  year_start: number;
  year_end: number | null;
  certificate_url: string;
};

function displayYear(cert: Certificate) {
  return cert.year_end ? `${cert.year_start}–${cert.year_end}` : `${cert.year_start}`;
}

function previewUrl(url: string) {
  // Sembunyikan toolbar & sidebar thumbnail bawaan browser, fit ke lebar iframe
  return `${url}#toolbar=0&navpanes=0&view=FitH`;
}

// Design.md / Home.jsx (Laravel): list certificate di kiri, klik salah satu
// -> iframe preview certificate langsung tampil di kanan (tanpa pindah
// halaman). Port dari section Certificates di Home lama.
export function CertificatePreview({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [selected, setSelected] = useState<Certificate | null>(
    certificates[0] ?? null,
  );

  if (certificates.length === 0) {
    return <EmptyState message="No certificates added yet." />;
  }

  return (
    <div className="grid items-start gap-10 md:grid-cols-[1fr_1.3fr]">
      <div className="flex flex-col gap-2">
        {certificates.map((cert) => {
          const active = selected?.id === cert.id;
          return (
            <button
              key={cert.id}
              type="button"
              onClick={() => setSelected(cert)}
              className={`flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                active ? "border-[var(--ink)]" : "border-line hover:border-[var(--ink)]"
              }`}
            >
              <Award
                size={16}
                className="mt-0.5 shrink-0 text-[var(--cobalt)]"
              />
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {cert.title}
                </span>
                <span className="mt-0.5 block font-mono text-xs text-ink-soft">
                  {cert.issuer} · {displayYear(cert)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-line bg-white">
        {selected ? (
          <>
            <iframe
              key={selected.id}
              src={previewUrl(selected.certificate_url)}
              title={`Preview ${selected.title}`}
              className="min-h-[280px] w-full flex-1"
            />
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
              <span className="truncate font-mono text-xs text-ink-soft">
                {selected.title}
              </span>
              <a
                href={selected.certificate_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-[var(--cobalt)] transition-opacity hover:opacity-80"
              >
                Open in new tab
                <ExternalLink size={12} />
              </a>
            </div>
          </>
        ) : (
          <EmptyState message="Select a certificate to see the preview." />
        )}
      </div>
    </div>
  );
}