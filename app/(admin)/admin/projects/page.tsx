import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/supabase/queries/projects";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { DeleteProjectButton } from "./delete-project-button";

export const metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  archived: "Archived",
  in_progress: "In Progress",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const projects = await getProjects(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-ink-soft">admin</p>
          <h1 className="font-display text-2xl font-medium text-ink">
            Projects
          </h1>
        </div>
        <Link href="/admin/projects/new">
          <Button>+ Tambah Project</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <p className="col-span-full rounded-xl border border-line bg-white px-4 py-8 text-center text-ink-soft">
            Belum ada project. Klik &ldquo;+ Tambah Project&rdquo; untuk mulai.
          </p>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="overflow-hidden rounded-xl border border-line bg-white transition-colors hover:bg-clean-white/60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPublicImageUrl(supabase, project.thumbnail)}
              alt={project.title}
              className="h-36 w-full object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-ink-soft">
                  {project.category} · {project.tahun}
                </p>
                <span className="rounded-full bg-clean-white px-2 py-0.5 font-mono text-[10px] text-ink">
                  {STATUS_LABEL[project.status]}
                </span>
              </div>
              <p className="mt-1 font-display text-lg font-medium text-ink">
                {project.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                {project.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <DeleteProjectButton id={project.id} slug={project.slug} title={project.title} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}