"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectActionState } from "./actions";

type Skill = { id: number; name: string; category: string };

type ProjectDefaults = {
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
  thumbnail?: string;
  metrics?: { label: string; value: string }[];
  selectedSkillIds?: number[];
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : label}
    </Button>
  );
}

export function ProjectForm({
  action,
  defaults,
  allSkills,
  submitLabel,
  currentThumbnailUrl,
}: {
  action: (
    prevState: ProjectActionState,
    formData: FormData,
  ) => Promise<ProjectActionState>;
  defaults?: ProjectDefaults;
  allSkills: Skill[];
  submitLabel: string;
  currentThumbnailUrl?: string;
}) {
  const [state, formAction] = useActionState<ProjectActionState, FormData>(
    action,
    null,
  );

  const metricsDefault = (defaults?.metrics ?? [])
    .map((m) => `${m.label}|${m.value}`)
    .join("\n");

  const skillsByCategory = allSkills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-8">
      {/* ---------- Info Dasar ---------- */}
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">
          Info Dasar
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" name="title" defaultValue={defaults?.title} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">
            Deskripsi singkat (1–2 kalimat, tampil di card listing)
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={defaults?.description}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="detail">Detail panjang (opsional)</Label>
          <Textarea
            id="detail"
            name="detail"
            rows={4}
            defaultValue={defaults?.detail ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              name="category"
              defaultValue={defaults?.category ?? "personal"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <option value="personal">Personal</option>
              <option value="kuliah">Kuliah</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tahun">Tahun</Label>
            <Input
              id="tahun"
              name="tahun"
              type="number"
              defaultValue={defaults?.tahun}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={defaults?.status ?? "in_progress"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <option value="live">Live</option>
              <option value="in_progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <Checkbox
              id="is_featured"
              name="is_featured"
              defaultChecked={defaults?.is_featured}
            />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={defaults?.role ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              name="timeline"
              placeholder="10 weeks"
              defaultValue={defaults?.timeline ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              name="client"
              placeholder="Series B fintech"
              defaultValue={defaults?.client ?? ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input
              id="demo_url"
              name="demo_url"
              type="url"
              defaultValue={defaults?.demo_url ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              defaultValue={defaults?.github_url ?? ""}
            />
          </div>
        </div>
      </section>

      {/* ---------- Case Study ---------- */}
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">
          Case Study
        </h2>
        <p className="text-xs text-ink-soft">
          Kalau problem/approach/outcome semua dikosongkan, halaman publik
          otomatis fallback ke &ldquo;Detail panjang&rdquo; di atas (Design.md §2.3).
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="problem">Problem</Label>
          <Textarea id="problem" name="problem" rows={3} defaultValue={defaults?.problem ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="approach">Approach</Label>
          <Textarea id="approach" name="approach" rows={3} defaultValue={defaults?.approach ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="outcome">Outcome</Label>
          <Textarea id="outcome" name="outcome" rows={3} defaultValue={defaults?.outcome ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="metrics_raw">
            Metrics (satu baris satu metric, format: <code>label|value</code>)
          </Label>
          <Textarea
            id="metrics_raw"
            name="metrics_raw"
            rows={3}
            placeholder={"largest account load time|8s → 1.2s\nbundle size|420kb → 180kb"}
            defaultValue={metricsDefault}
          />
        </div>
      </section>

      {/* ---------- Thumbnail ---------- */}
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">
          Thumbnail
        </h2>
        {currentThumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentThumbnailUrl}
            alt="Thumbnail saat ini"
            className="h-32 w-56 rounded-md object-cover"
          />
        )}
        <div className="space-y-1.5">
          <Label htmlFor="thumbnail">
            {currentThumbnailUrl
              ? "Ganti thumbnail (opsional)"
              : "Upload thumbnail"}
          </Label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-ink-soft file:mr-4 file:rounded-md file:border-0 file:bg-clean-white file:px-3 file:py-2 file:text-sm file:text-ink"
          />
          <p className="text-xs text-ink-soft">
            JPG/PNG/WebP, maksimal 5MB.
          </p>
        </div>
      </section>

      {/* ---------- Skills ---------- */}
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">Skills</h2>
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category}>
            <p className="font-mono text-xs text-ink-soft">{category}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink"
                >
                  <Checkbox
                    name="skill_ids"
                    value={String(skill.id)}
                    defaultChecked={defaults?.selectedSkillIds?.includes(skill.id)}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>
        ))}
        {allSkills.length === 0 && (
          <p className="text-sm text-ink-soft">
            Belum ada skill. Tambahkan dulu di halaman Skills.
          </p>
        )}
      </section>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}