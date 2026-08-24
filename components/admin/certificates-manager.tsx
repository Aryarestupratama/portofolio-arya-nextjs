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
  certificate_url: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
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
            {certificate ? "Edit Certificate" : "Tambah Certificate"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          className="space-y-4"
        >
          {certificate && (
            <input type="hidden" name="id" value={certificate.id} />
          )}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" name="title" defaultValue={certificate?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuer">Issuer</Label>
            <Input id="issuer" name="issuer" defaultValue={certificate?.issuer} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year_start">Tahun mulai</Label>
              <Input
                id="year_start"
                name="year_start"
                type="number"
                defaultValue={certificate?.year_start}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year_end">Tahun selesai (opsional)</Label>
              <Input
                id="year_end"
                name="year_end"
                type="number"
                defaultValue={certificate?.year_end ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="certificate_url">Link bukti sertifikat</Label>
            <Input
              id="certificate_url"
              name="certificate_url"
              type="url"
              placeholder="https://..."
              defaultValue={certificate?.certificate_url}
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600" role="alert">
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
        <CertificateFormDialog trigger={<Button>+ Tambah Certificate</Button>} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-clean-white text-left text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-medium">Judul</th>
              <th className="px-4 py-2 font-medium">Issuer</th>
              <th className="px-4 py-2 font-medium">Tahun</th>
              <th className="px-4 py-2 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  Belum ada sertifikat.
                </td>
              </tr>
            )}
            {certificates.map((cert) => (
              <tr
                key={cert.id}
                className="border-t border-line transition-colors hover:bg-clean-white/60"
              >
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
                      title="Hapus sertifikat?"
                      description={`Sertifikat "${cert.title}" akan dihapus permanen.`}
                      onConfirm={async () => {
                        await deleteCertificateAction(cert.id);
                      }}
                      trigger={
                        <Button variant="destructive" size="sm">
                          Hapus
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