"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FormSection,
  FormSelect,
  FormShell,
  RowsEditor,
} from "@/components/admin/form";
import type { RecruitmentActionState } from "./actions";

export type RecruitmentDefaults = {
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

const TYPE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
];

const STATUS_OPTIONS = [
  { value: "listed", label: "Listed" },
  { value: "applied", label: "Applied" },
  { value: "on_process", label: "On process" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No response" },
];

export function RecruitmentForm({
  action,
  defaults,
  submitLabel,
  showChecklistInput = false,
  isEdit = false,
}: {
  action: (prev: RecruitmentActionState, formData: FormData) => Promise<RecruitmentActionState>;
  defaults?: RecruitmentDefaults;
  submitLabel: string;
  /** Hanya saat create: checklist awal (saat edit pakai ChecklistManager). */
  showChecklistInput?: boolean;
  isEdit?: boolean;
}) {
  return (
    <FormShell
      action={action}
      submitLabel={submitLabel}
      cancelHref="/admin/recruitment"
      successMessage="Application saved"
      disableWhenClean={isEdit}
    >
      <FormSection title="Application" description="Who you're applying to and for what.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company_name" required>
            <Input id="company_name" name="company_name" defaultValue={defaults?.company_name} required />
          </Field>
          <Field label="Position" htmlFor="position" required>
            <Input id="position" name="position" defaultValue={defaults?.position} required />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="type">
            <FormSelect id="type" name="type" defaultValue={defaults?.type ?? "internship"} options={TYPE_OPTIONS} />
          </Field>
          <Field label="Status" htmlFor="status">
            <FormSelect id="status" name="status" defaultValue={defaults?.status ?? "listed"} options={STATUS_OPTIONS} />
          </Field>
        </div>
        <Field label="Application link" htmlFor="application_link" hint="Optional.">
          <Input id="application_link" name="application_link" type="url" placeholder="https://" defaultValue={defaults?.application_link ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Dates" description="Deadline drives the colors and filters in the tracker.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Deadline" htmlFor="deadline_date">
            <Input id="deadline_date" name="deadline_date" type="date" defaultValue={defaults?.deadline_date ?? ""} />
          </Field>
          <Field label="Deadline note" htmlFor="deadline_note">
            <Input id="deadline_note" name="deadline_note" placeholder="Rolling basis" defaultValue={defaults?.deadline_note ?? ""} />
          </Field>
          <Field label="Applied on" htmlFor="applying_date">
            <Input id="applying_date" name="applying_date" type="date" defaultValue={defaults?.applying_date ?? ""} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Details" description="Private notes to prepare yourself.">
        <Field label="Requirements" htmlFor="requirements">
          <Textarea id="requirements" name="requirements" rows={3} defaultValue={defaults?.requirements ?? ""} />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} />
        </Field>
        <Field label="Things to learn" htmlFor="to_learn">
          <Textarea id="to_learn" name="to_learn" rows={3} defaultValue={defaults?.to_learn ?? ""} />
        </Field>
        <Field label="Other notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} />
        </Field>
      </FormSection>

      {showChecklistInput && (
        <FormSection
          title="Document checklist"
          description="You can tick items off on the edit page after saving."
        >
          <RowsEditor
            name="checklist_raw"
            initial={[["CV"], ["Portfolio"]]}
            placeholders={["Document, e.g. Cover letter"]}
            addLabel="Add document"
            serialize={(rows) =>
              rows
                .map(([v]) => (v ?? "").replace(/\n/g, " ").trim())
                .filter(Boolean)
                .join("\n")
            }
            emptyHint="No documents yet."
          />
        </FormSection>
      )}
    </FormShell>
  );
}
