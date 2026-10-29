import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/supabase/queries/projects";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable, type ProjectRow } from "./projects-table";

export const metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const projects = await getProjects(supabase);

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    tahun: p.tahun,
    status: p.status,
    is_featured: p.is_featured,
    thumbnailUrl: getPublicImageUrl(supabase, p.thumbnail),
  }));

  const liveCount = rows.filter((p) => p.status === "live").length;
  const featuredCount = rows.filter((p) => p.is_featured).length;

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${rows.length} projects · ${liveCount} live · ${featuredCount} featured on the home page.`}
      />
      <ProjectsTable projects={rows} />
    </div>
  );
}
