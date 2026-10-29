import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/supabase/queries/projects";
import { getSkills } from "@/lib/supabase/queries/skills";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { FormSection } from "@/components/admin/form";
import {
  ProjectStatusPill,
  type ProjectStatus,
} from "@/components/admin/project-status-pill";
import { ProjectForm } from "../../project-form";
import { ProjectImagesManager } from "../../project-images-manager";
import { updateProjectAction } from "../../actions";

export const metadata = {
  title: "Edit project",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (Number.isNaN(projectId)) notFound();

  const supabase = await createClient();

  let project;
  try {
    project = await getProjectById(supabase, projectId);
  } catch {
    notFound();
  }
  if (!project) notFound();

  const skills = await getSkills(supabase);

  const boundUpdateAction = updateProjectAction.bind(
    null,
    project.id,
    project.slug,
  );

  const images = (project.project_images ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((img: { id: number; image_path: string }) => ({
      id: img.id,
      image_path: img.image_path,
      url: getPublicImageUrl(supabase, img.image_path),
    }));

  const selectedSkillIds = (project.project_skill ?? []).map(
    (ps: { skill_id: number }) => ps.skill_id,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/projects", label: "Projects" }}
        eyebrow="edit project"
        title={project.title}
        description={
          <span className="inline-flex items-center gap-2">
            <ProjectStatusPill status={project.status as ProjectStatus} />
            <span className="font-mono text-xs">/projects/{project.slug}</span>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} className="mr-1.5" />
              View on site
            </a>
          </Button>
        }
      />

      <ProjectForm
        isEdit
        action={boundUpdateAction}
        allSkills={skills}
        submitLabel="Save changes"
        currentThumbnailUrl={getPublicImageUrl(supabase, project.thumbnail)}
        defaults={{
          title: project.title,
          description: project.description,
          detail: project.detail,
          category: project.category,
          tahun: project.tahun,
          role: project.role,
          timeline: project.timeline,
          client: project.client,
          problem: project.problem,
          approach: project.approach,
          outcome: project.outcome,
          demo_url: project.demo_url,
          github_url: project.github_url,
          is_featured: project.is_featured,
          status: project.status,
          metrics: [...(project.project_metrics ?? [])]
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
            .map((m: { label: string; value: string }) => ({
              label: m.label,
              value: m.value,
            })),
          selectedSkillIds,
        }}
      >
        <FormSection
          title="Gallery"
          description="Extra screenshots shown on the project page. Uploads are saved immediately."
        >
          <ProjectImagesManager
            projectId={project.id}
            slug={project.slug}
            images={images}
          />
        </FormSection>
      </ProjectForm>
    </div>
  );
}
