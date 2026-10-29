"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RecruitmentActionState } from "./actions";

type RecruitmentDefaults = {
  type?: string;
  company_name?: string;
  position?: string;
  application_link?: string | null;
  requirements?: string | null;
  description?: string | null;
  deadline_date?: string | null;
  deadline_note?: string | null;
  applying_date?: string | null;
  status?: string;
  to_learn?: string | null;
  notes?: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : label}
    </Button>
  );
}

export function RecruitmentForm({
  action,
  defaults,
  submitLabel,
  showChecklistInput = false,
}: {
  action: (
    prevState: RecruitmentActionState,
    formData: FormData,
  ) => Promise<RecruitmentActionState>;
  defaults?: RecruitmentDefaults;
  submitLabel: string;
  showChecklistInput?: boolean;
}) {
  const [state, formAction] = useActionState<RecruitmentActionState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-line bg-paper p-5">
        <h2 className="font-display text-lg font-medium text-ink">
          Info Lamaran
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Nama Perusahaan</Label>
            <Input
              id="company_name"
              name="company_name"
              defaultValue={defaults?.company_name}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position">Posisi</Label>
            <Input
              id="position"
              name="position"
              defaultValue={defaults?.position}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipe</Label>
            <select
              id="type"
              name="type"
              defaultValue={defaults?.type ?? "internship"}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="internship">Internship</option>
              <option value="job">Job</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={defaults?.status ?? "listed"}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="listed">Listed</option>
              <option value="applied">Applied</option>
              <option value="on_process">On Process</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="no_response">No Response</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="application_link">Link Lamaran (opsional)</Label>
          <Input
            id="application_link"
            name="application_link"
            type="url"
            placeholder="https://..."
            defaultValue={defaults?.application_link ?? ""}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="applying_date">Tanggal Apply</Label>
            <Input
              id="applying_date"
              name="applying_date"
              type="date"
              defaultValue={defaults?.applying_date ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline_date">Tanggal Deadline</Label>
            <Input
              id="deadline_date"
              name="deadline_date"
              type="date"
              defaultValue={defaults?.deadline_date ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline_note">Catatan Deadline</Label>
            <Input
              id="deadline_note"
              name="deadline_note"
              placeholder="rolling basis, dst"
              defaultValue={defaults?.deadline_note ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-paper p-5">
        <h2 className="font-display text-lg font-medium text-ink">Detail</h2>

        <div className="space-y-1.5">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            name="requirements"
            rows={3}
            defaultValue={defaults?.requirements ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={defaults?.description ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to_learn">Yang perlu dipelajari</Label>
          <Textarea
            id="to_learn"
            name="to_learn"
            rows={3}
            defaultValue={defaults?.to_learn ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Catatan lain</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaults?.notes ?? ""}
          />
        </div>

        {showChecklistInput && (
          <div className="space-y-1.5">
            <Label htmlFor="checklist_raw">
              Checklist Dokumen (satu baris satu item)
            </Label>
            <Textarea
              id="checklist_raw"
              name="checklist_raw"
              rows={3}
              placeholder={"CV\nPortfolio\nSurat Lamaran"}
            />
            <p className="text-xs text-ink-soft">
              Setelah disimpan, checklist ini bisa dicentang satu-per-satu di
              halaman edit.
            </p>
          </div>
        )}
      </section>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}