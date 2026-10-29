import { Suspense } from "react";
import { createStaticClient } from "@/lib/supabase/static";
import { getAllPublicProjects } from "@/lib/supabase/queries/public";
import { toProjectCardData } from "@/lib/utils/project-card";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import {
  ProjectsExplorer,
  ProjectsView,
} from "@/components/public/ProjectsExplorer";

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

export default async function ProjectsPage() {
  const supabase = createStaticClient();
  const allProjects = await getAllPublicProjects(supabase);

  // Semua project dikirim ke client; filter kategori dilakukan di
  // ProjectsExplorer (lihat komentar di sana). Halaman jadi statis/ISR.
  const projects = allProjects.map((p) => toProjectCardData(supabase, p));

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

        {/* useSearchParams di dalam ProjectsExplorer wajib dibungkus
            Suspense agar halaman tetap bisa di-prerender. Fallback =
            tampilan "All" yang sama persis. */}
        <Suspense
          fallback={
            <ProjectsView
              projects={projects}
              categories={categories}
              active=""
            />
          }
        >
          <ProjectsExplorer projects={projects} categories={categories} />
        </Suspense>
      </Container>
    </section>
  );
}
