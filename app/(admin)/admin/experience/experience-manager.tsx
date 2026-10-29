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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { formatExperiencePeriod } from "@/lib/validations/experiences";
import {
  upsertExperienceAction,
  deleteExperienceAction,
  type ExperienceActionState,
} from "./actions";

type Experience = {
  id: number;
  role_title: string;
  description: string;
  achievement: string | null;
  year_start: number;
  year_end: number | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function ExperienceFormDialog({
  experience,
  trigger,
}: {
  experience?: Experience;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOngoing, setIsOngoing] = useState(
    experience ? experience.year_end === null : true,
  );
  const [state, formAction] = useActionState<ExperienceActionState, FormData>(
    upsertExperienceAction,
    null,
  );

  useEffect(() => {
    if (submitted && !state?.error) setOpen(false);
  }, [state, submitted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {experience ? "Edit Experience" : "Tambah Experience"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          className="space-y-4"
        >
          {experience && <input type="hidden" name="id" value={experience.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="role_title">Role</Label>
            <Input
              id="role_title"
              name="role_title"
              placeholder="Freelance Designer & Developer"
              defaultValue={experience?.role_title}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="year_start">Tahun Mulai</Label>
              <Input
                id="year_start"
                name="year_start"
                type="number"
                placeholder="2023"
                defaultValue={experience?.year_start}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year_end">Tahun Selesai</Label>
              <Input
                id="year_end"
                name="year_end"
                type="number"
                placeholder="2024"
                defaultValue={experience?.year_end ?? ""}
                disabled={isOngoing}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_ongoing"
              name="is_ongoing"
              checked={isOngoing}
              onCheckedChange={(checked) => setIsOngoing(checked === true)}
            />
            <Label htmlFor="is_ongoing" className="font-normal">
              Masih berjalan sampai sekarang
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={experience?.description}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="achievement">
              Achievement (opsional, bebas format)
            </Label>
            <Textarea
              id="achievement"
              name="achievement"
              rows={5}
              placeholder={"Tulis paragraf, atau satu baris satu poin, misal:\n- Meningkatkan performa 3x\n- Memimpin 4 project"}
              defaultValue={experience?.achievement ?? ""}
            />
            <p className="text-xs text-ink-soft">
              Konsisten satu gaya per entry: jangan campur paragraf panjang
              dengan bullet super singkat (Rules.md §7).
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

export function ExperienceManager({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <ExperienceFormDialog trigger={<Button>+ Tambah Experience</Button>} />
      </div>

      <div className="mt-4 space-y-3">
        {experiences.length === 0 && (
          <p className="rounded-xl border border-line bg-paper px-4 py-8 text-center text-ink-soft">
            Belum ada experience.
          </p>
        )}
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-xl border border-line bg-paper p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{exp.role_title}</p>
                <p className="font-mono text-xs text-ink-soft">
                  {formatExperiencePeriod(exp.year_start, exp.year_end)}
                </p>
                <p className="mt-2 text-sm text-ink-soft">{exp.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <ExperienceFormDialog
                  experience={exp}
                  trigger={
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  }
                />
                <ConfirmDeleteDialog
                  title="Hapus experience?"
                  description={`Entry "${exp.role_title}" akan dihapus permanen.`}
                  onConfirm={() => deleteExperienceAction(exp.id)}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Hapus
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}