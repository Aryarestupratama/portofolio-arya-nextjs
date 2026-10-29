import { createClient } from "@/lib/supabase/server";
import { getSkills } from "@/lib/supabase/queries/skills";
import { PageHeader } from "@/components/admin/page-header";
import { FormSection } from "@/components/admin/form";
import { ProjectForm } from "../project-form";
import { createProjectAction } from "../actions";

export const metadata = {
  title: "New project",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const supabase = await createClient();
  const skills = await getSkills(supabase);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/projects", label: "Projects" }}
        title="New project"
        description="Fill in the basics and upload a thumbnail. You can add gallery images right after saving."
      />
      <ProjectForm
        action={createProjectAction}
        allSkills={skills}
        submitLabel="Save & continue"
      >
        <FormSection title="Gallery" description="Extra screenshots shown on the project page.">
          <p className="text-sm text-ink-soft">
            Save the project first, then you can upload gallery images here.
          </p>
        </FormSection>
      </ProjectForm>
    </div>
  );
}
