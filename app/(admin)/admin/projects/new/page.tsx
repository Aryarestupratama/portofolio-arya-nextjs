import { createClient } from "@/lib/supabase/server";
import { getSkills } from "@/lib/supabase/queries/skills";
import { ProjectForm } from "../project-form";
import { createProjectAction } from "../actions";

export const metadata = {
  title: "Tambah Project",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const supabase = await createClient();
  const skills = await getSkills(supabase);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs text-ink-soft">admin</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Tambah Project
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Gallery gambar tambahan bisa diupload setelah project ini disimpan.
      </p>
      <div className="mt-6">
        <ProjectForm
          action={createProjectAction}
          allSkills={skills}
          submitLabel="Simpan & Lanjut ke Gallery"
        />
      </div>
    </div>
  );
}