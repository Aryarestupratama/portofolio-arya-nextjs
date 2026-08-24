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
  upsertSkillAction,
  deleteSkillAction,
  type SkillActionState,
} from "./actions";

type Skill = { id: number; name: string; category: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function SkillFormDialog({
  skill,
  trigger,
}: {
  skill?: Skill;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<SkillActionState, FormData>(
    upsertSkillAction,
    null,
  );

  // Tutup dialog otomatis setelah submit sukses (state null tanpa error,
  // dan bukan render pertama).
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted && !state?.error) setOpen(false);
  }, [state, submitted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? "Edit Skill" : "Tambah Skill"}</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setSubmitted(true);
            formAction(fd);
          }}
          className="space-y-4"
        >
          {skill && <input type="hidden" name="id" value={skill.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" defaultValue={skill?.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              name="category"
              placeholder="Frontend, Backend, Tools, ..."
              defaultValue={skill?.category}
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

export function SkillsManager({ skills }: { skills: Skill[] }) {
  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <SkillFormDialog trigger={<Button>+ Tambah Skill</Button>} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-clean-white text-left text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Kategori</th>
              <th className="px-4 py-2 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {skills.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                  Belum ada skill. Klik &ldquo;+ Tambah Skill&rdquo; untuk mulai.
                </td>
              </tr>
            )}
            {skills.map((skill) => (
              <tr key={skill.id} className="border-t border-line">
                <td className="px-4 py-2 text-ink">{skill.name}</td>
                <td className="px-4 py-2 text-ink-soft">{skill.category}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <SkillFormDialog
                      skill={skill}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <ConfirmDeleteDialog
                      title="Hapus skill?"
                      description={`Skill "${skill.name}" akan dihapus permanen, termasuk relasinya ke project.`}
                      onConfirm={() => deleteSkillAction(skill.id)}
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
