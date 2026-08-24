import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { getAllPublicProjects } from "@/lib/supabase/queries/public";
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

  const projects = filtered.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    thumbnail_url: getPublicImageUrl(supabase, p.thumbnail),
    category: p.category,
    tahun: p.tahun,
    status: p.status,
    skillNames: (p.project_skill ?? []).map(
      (ps: { skills: { name: string } }) => ps.skills.name,
    ),
  }));

  return (
    <section className="py-16">
      <Container>
        <FadeIn>
          <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
            projects
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">
            Projects
          </h1>
        </FadeIn>

        <div className="mt-6">
          <CategoryTabs categories={CATEGORIES} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {projects.length === 0 && (
            <div className="col-span-full">
              <EmptyState message="Belum ada project di kategori ini." />
            </div>
          )}
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} delay={i * 0.05} />
          ))}
        </div>
      </Container>
    </section>
  );
}