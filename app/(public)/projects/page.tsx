import { createClient } from "@/lib/supabase/server";
import { getAllPublicProjects } from "@/lib/supabase/queries/public";
import { toProjectCardData } from "@/lib/utils/project-card";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";
import { ProjectCard } from "@/components/public/ProjectCard";
import { CategoryTabs } from "@/components/public/CategoryTabs";

export const revalidate = 3600;

export const metadata = {
  title: "Projects",
  description: "Kumpulan project & studi kasus.",
};

const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "kuliah", label: "Kuliah" },
  { value: "client", label: "Client" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();
  const allProjects = await getAllPublicProjects(supabase);

  const filtered = category
    ? allProjects.filter((p) => p.category === category)
    : allProjects;

  const projects = filtered.map((p) => toProjectCardData(supabase, p));

  const categories = CATEGORIES.map((c) => ({
    ...c,
    count: allProjects.filter((p) => p.category === c.value).length,
  }));

  return (
    <section className="pb-24 pt-10 md:pb-32 md:pt-16">
      <Container wide>
        <FadeIn>
          <p className="font-mono text-xs text-ink-soft">
            projects · {allProjects.length}
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[1.02] tracking-tight text-ink">
            Projects
          </h1>
        </FadeIn>

        <div className="mt-10">
          <CategoryTabs
            categories={categories}
            totalCount={allProjects.length}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {projects.length === 0 && (
            <div className="col-span-full">
              <EmptyState message="Belum ada project di kategori ini." />
            </div>
          )}
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} delay={(i % 3) * 0.06} />
          ))}
        </div>
      </Container>
    </section>
  );
}
