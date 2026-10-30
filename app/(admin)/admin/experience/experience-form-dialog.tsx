"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxField, Field, FormDialog } from "@/components/admin/form";
import { upsertExperienceAction } from "./actions";

export type Experience = {
  id: number;
  role_title: string;
  description: string;
  achievement: string | null;
  year_start: number;
  year_end: number | null;
};

export function ExperienceFormDialog({
  experience,
  trigger,
}: {
  experience?: Experience;
  trigger: React.ReactNode;
}) {
  const [ongoing, setOngoing] = useState(experience ? experience.year_end === null : false);

  return (
    <FormDialog
      trigger={trigger}
      title={experience ? "Edit experience" : "Add experience"}
      action={upsertExperienceAction}
      successMessage={experience ? "Experience updated" : "Experience added"}
    >
      {experience && <input type="hidden" name="id" value={experience.id} />}
      <Field label="Role" htmlFor="role_title" required>
        <Input id="role_title" name="role_title" placeholder="Freelance Designer & Developer" defaultValue={experience?.role_title} required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Year started" htmlFor="year_start" required>
          <Input
            id="year_start"
            name="year_start"
            type="number"
            min={1900}
            max={2100}
            defaultValue={experience?.year_start ?? new Date().getFullYear()}
            required
          />
        </Field>
        <Field label="Year finished" htmlFor="year_end">
          <Input
            id="year_end"
            name="year_end"
            type="number"
            min={1900}
            max={2100}
            disabled={ongoing}
            placeholder={ongoing ? "Present" : ""}
            defaultValue={experience?.year_end ?? ""}
          />
        </Field>
      </div>
      <CheckboxField
        id="is_ongoing"
        name="is_ongoing"
        label="Still ongoing"
        defaultChecked={ongoing}
        onCheckedChange={setOngoing}
      />
      <Field label="Description" htmlFor="description" required>
        <Textarea id="description" name="description" rows={3} defaultValue={experience?.description} required />
      </Field>
      <Field
        label="Achievements"
        htmlFor="achievement"
        hint="Free format: a paragraph, or one point per line. Keep one style per entry so the public page stays consistent."
      >
        <Textarea id="achievement" name="achievement" rows={4} defaultValue={experience?.achievement ?? ""} />
      </Field>
    </FormDialog>
  );
}
