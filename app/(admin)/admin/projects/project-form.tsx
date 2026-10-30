"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckboxField,
  CountedTextarea,
  Field,
  FormSection,
  FormSelect,
  FormShell,
  ImageField,
  RowsEditor,
} from "@/components/admin/form";
import { CATEGORY_LABEL } from "@/lib/utils/category";
import type { ProjectActionState } from "./actions";
import { SkillPicker, type Skill } from "./skill-picker";

export type ProjectDefaults = {
  title?: string;
  description?: string;
  detail?: string | null;
  category?: string;
  tahun?: number;
  role?: string | null;
  timeline?: string | null;
  client?: string | null;
  problem?: string | null;
  approach?: string | null;
  outcome?: string | null;
  demo_url?: string | null;
  github_url?: string | null;
  is_featured?: boolean;
  status?: string;
  metrics?: { label: string; value: string }[];
  selectedSkillIds?: number[];
};

const STATUS_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "in_progress", label: "In progress" },
  { value: "archived", label: "Archived" },
];
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

// metrics: label|value per baris (kontrak parseMetricsRaw di server).
const clean = (s: string) => s.replace(/[|\n]/g, " / ").trim();
const serializeMetrics = (rows: string[][]) =>
  rows
    .filter(([l, v]) => l?.trim() || v?.trim())
    .map(([l, v]) => `${clean(l ?? "")}|${clean(v ?? "")}`)
    .join("\n");

export function ProjectForm({
  action,
  defaults,
  allSkills,
  submitLabel,
  currentThumbnailUrl,
  isEdit = false,
  children,
}: {
  action: (prev: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  defaults?: ProjectDefaults;
  allSkills: Skill[];
  submitLabel: string;
  currentThumbnailUrl?: string;
  isEdit?: boolean;
  /** Section tambahan di kolom utama (mis. gallery), dirender sebelum action bar. */
  children?: React.ReactNode;
}) {
  const [selectedSkills, setSelectedSkills] = useState<number[]>(defaults?.selectedSkillIds ?? []);

  return (
    <FormShell
      action={action}
      submitLabel={submitLabel}
      cancelHref="/admin/projects"
      successMessage="Project saved"
      disableWhenClean={isEdit}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* ---------- Kolom utama ---------- */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Basics" description="What visitors see on the project card and at the top of the case study.">
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" defaultValue={defaults?.title} required />
            </Field>
            <Field label="Short description" htmlFor="description" required hint="1–2 sentences. Shown on listing cards.">
              <CountedTextarea id="description" name="description" rows={2} recommendedMax={160} defaultValue={defaults?.description} required />
            </Field>
            <Field label="Long detail" htmlFor="detail" hint="Optional. Used as the fallback when the case study below is empty.">
              <Textarea id="detail" name="detail" rows={4} defaultValue={defaults?.detail ?? ""} />
            </Field>
          </FormSection>

          <FormSection title="Case study" description="Problem → approach → outcome. Leave all three empty to fall back to the long detail.">
            <Field label="Problem" htmlFor="problem">
              <Textarea id="problem" name="problem" rows={3} defaultValue={defaults?.problem ?? ""} />
            </Field>
            <Field label="Approach" htmlFor="approach">
              <Textarea id="approach" name="approach" rows={3} defaultValue={defaults?.approach ?? ""} />
            </Field>
            <Field label="Outcome" htmlFor="outcome">
              <Textarea id="outcome" name="outcome" rows={3} defaultValue={defaults?.outcome ?? ""} />
            </Field>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-ink">Metrics</p>
              <p className="text-xs text-ink-soft">Shown inside Outcome. The first metric is highlighted on the project card.</p>
              <RowsEditor
                name="metrics_raw"
                initial={(defaults?.metrics ?? []).map((m) => [m.label, m.value])}
                placeholders={["Label, e.g. load time", "Value, e.g. 8s → 1.2s"]}
                addLabel="Add metric"
                serialize={serializeMetrics}
                emptyHint="No metrics yet."
              />
            </div>
          </FormSection>

          <FormSection title="Details & links" description="Shown in the meta row of the project page.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Role" htmlFor="role">
                <Input id="role" name="role" defaultValue={defaults?.role ?? ""} />
              </Field>
              <Field label="Timeline" htmlFor="timeline">
                <Input id="timeline" name="timeline" placeholder="10 weeks" defaultValue={defaults?.timeline ?? ""} />
              </Field>
              <Field label="Client" htmlFor="client">
                <Input id="client" name="client" placeholder="Series B fintech" defaultValue={defaults?.client ?? ""} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Demo URL" htmlFor="demo_url">
                <Input id="demo_url" name="demo_url" type="url" placeholder="https://" defaultValue={defaults?.demo_url ?? ""} />
              </Field>
              <Field label="GitHub URL" htmlFor="github_url">
                <Input id="github_url" name="github_url" type="url" placeholder="https://" defaultValue={defaults?.github_url ?? ""} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Skills" description="Tech used in this project. Shown as chips on the project page.">
            <SkillPicker allSkills={allSkills} selected={selectedSkills} onChange={setSelectedSkills} />
          </FormSection>

          {children}
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <FormSection compact title="Publish">
            <Field label="Status" htmlFor="status">
              <FormSelect id="status" name="status" defaultValue={defaults?.status ?? "in_progress"} options={STATUS_OPTIONS} />
            </Field>
            <CheckboxField
              id="is_featured"
              name="is_featured"
              label="Featured on home"
              hint="Shown in “Selected work” on the home page."
              defaultChecked={defaults?.is_featured ?? false}
            />
          </FormSection>

          <FormSection compact title="Classification">
            <Field label="Category" htmlFor="category">
              <FormSelect id="category" name="category" defaultValue={defaults?.category ?? "personal"} options={CATEGORY_OPTIONS} />
            </Field>
            <Field label="Year" htmlFor="tahun" required>
              <Input id="tahun" name="tahun" type="number" min={1990} max={2100} defaultValue={defaults?.tahun ?? new Date().getFullYear()} required />
            </Field>
          </FormSection>

          <FormSection compact title="Thumbnail" description={isEdit ? undefined : "Required. A full-page screenshot works best."}>
            <ImageField key={currentThumbnailUrl ?? "new"} id="thumbnail" name="thumbnail" currentUrl={currentThumbnailUrl} required />
          </FormSection>
        </aside>
      </div>
    </FormShell>
  );
}
