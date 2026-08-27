import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import {
  getProjectBySlug,
  getAllProjectSlugs,
} from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { StatusBadge } from "@/components/public/StatusBadge";
import { ProjectGallery } from "@/components/public/ProjectGallery";
import { GithubIcon } from "@/components/public/icons";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Pakai static client, BUKAN createClient() dari lib/supabase/server.ts —
  // generateStaticParams jalan saat build time tanpa HTTP request, jadi
  // tidak boleh memanggil cookies() (yang dipakai server client untuk baca
  // session). Data yang diambil di sini toh cuma slug publik, tidak butuh
  // session sama sekali.
  const supabase = createStaticClient();
  const slugs = await getAllProjectSlugs(supabase);
  return slugs.map((s) => ({ slug: s.slug }));
}

// PRD.md §4.1: title, description, OG image dinamis per project supaya
// preview bagus saat di-share ke recruiter.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

  let project;
  try {
    project = await getProjectBySlug(supabase, slug);
  } catch {
    return {};
  }
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [`/api/og?slug=${project.slug}`],
    },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  personal: "Personal",
  kuliah: "Coursework",
  client: "Client",
};

// Eyebrow pill kecil ala label, dipakai di meta row & case-study headings —
// Design.md §4.3.5.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
      {children}
    </p>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  let project;
  try {
    project = await getProjectBySlug(supabase, slug);
  } catch {
    notFound();
  }
  if (!project) notFound();

  const thumbnailUrl = getPublicImageUrl(supabase, project.thumbnail);

  const images = (project.project_images ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((img: { id: number; image_path: string }) => ({
      id: img.id,
      url: getPublicImageUrl(supabase, img.image_path),
    }));

  const metrics = (project.project_metrics ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order,
  );

  const skills = (project.project_skill ?? []).map(
    (ps: { skills: { id: number; name: string } }) => ps.skills,
  );
  const stack = skills.map((s: { name: string }) => s.name).join(", ");

  // Fallback ke `detail` kalau problem/approach/outcome semua kosong.
  const hasCaseStudy = project.problem || project.approach || project.outcome;
  const label = CATEGORY_LABEL[project.category] ?? project.category;

  return (
    <>
      {/* HERO */}
      <section className="pb-12 pt-16">
        <Container className="max-w-3xl">
          <FadeIn>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-sm font-mono text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              ← Back to Homepage
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <p className="font-mono text-xs text-[var(--cobalt)]">
                {label}
                {project.tahun ? ` · ${project.tahun}` : ""}
              </p>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="mb-6 mt-4 font-display text-3xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">
              {project.title}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
              {project.description}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* META ROW */}
      <section className="pb-12">
        <Container className="max-w-3xl">
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-2 gap-6 border-y border-line py-6 md:grid-cols-4">
              <div>
                <div className="mb-2">
                  <Eyebrow>role</Eyebrow>
                </div>
                <p className="text-sm font-medium text-ink">
                  {project.role || "—"}
                </p>
              </div>
              <div>
                <div className="mb-2">
                  <Eyebrow>timeline</Eyebrow>
                </div>
                <p className="text-sm font-medium text-ink">
                  {project.timeline || "—"}
                </p>
              </div>
              <div>
                <div className="mb-2">
                  <Eyebrow>stack</Eyebrow>
                </div>
                <p className="text-sm font-medium text-ink">{stack || "—"}</p>
              </div>
              <div>
                <div className="mb-2">
                  <Eyebrow>client</Eyebrow>
                </div>
                <p className="text-sm font-medium text-ink">
                  {project.client || "—"}
                </p>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* BODY: problem / approach / outcome (metrics digabung di outcome) */}
      <section className="pb-16">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {project.problem && (
              <FadeIn>
                <div className="mb-4">
                  <Eyebrow>the problem</Eyebrow>
                </div>
                <h2 className="mb-4 font-display text-xl font-medium text-ink">
                  What wasn&rsquo;t working
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {project.problem}
                </p>
              </FadeIn>
            )}

            {project.approach && (
              <FadeIn delay={0.05}>
                <div className="mb-4">
                  <Eyebrow>the approach</Eyebrow>
                </div>
                <h2 className="mb-4 font-display text-xl font-medium text-ink">
                  How it was built
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {project.approach}
                </p>
              </FadeIn>
            )}

            {(project.outcome || metrics.length > 0) && (
              <FadeIn delay={0.1}>
                <div className="mb-4">
                  <Eyebrow>outcome</Eyebrow>
                </div>
                <h2 className="mb-4 font-display text-xl font-medium text-ink">
                  Result
                </h2>

                {metrics.length > 0 && (
                  <div className="mb-4 grid gap-4 sm:grid-cols-3">
                    {metrics.map(
                      (m: { id: number; label: string; value: string }) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-line bg-white p-5"
                        >
                          <p className="mb-1 font-display text-2xl font-medium text-[var(--cobalt)]">
                            {m.value}
                          </p>
                          <p className="text-xs text-ink-soft">{m.label}</p>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {project.outcome && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {project.outcome}
                  </p>
                )}
              </FadeIn>
            )}

            {!hasCaseStudy && project.detail && (
              <FadeIn>
                <div className="mb-4">
                  <Eyebrow>about this project</Eyebrow>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {project.detail}
                </p>
              </FadeIn>
            )}
          </div>

          {/* Links */}
          {(project.demo_url || project.github_url) && (
            <div className="mt-12 flex gap-3">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-[var(--cobalt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  Live demo
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* GALLERY */}
      <section className="pb-16">
        <Container className="max-w-4xl">
          {images.length > 0 && (
            <div className="mb-4">
              <Eyebrow>gallery</Eyebrow>
            </div>
          )}
          <FadeIn>
            <ProjectGallery thumbnailUrl={thumbnailUrl} images={images} />
          </FadeIn>
        </Container>
      </section>

      {skills.length > 0 && (
        <section className="border-t border-line py-16">
          <Container className="max-w-3xl">
            <FadeIn>
              <p className="font-mono text-xs text-ink-soft">skills used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s: { id: number; name: string }) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-line px-3 py-1 text-sm text-ink"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </FadeIn>
          </Container>
        </section>
      )}

      {/* NEXT / BACK NAV */}
      <section className="border-t border-line">
        <Link href="/projects" className="group block py-10">
          <Container className="max-w-3xl">
            <p className="mb-2 font-mono text-xs text-ink-soft">next</p>
            <p className="font-display text-xl font-medium text-ink transition-colors group-hover:text-[var(--cobalt)]">
              Back to All Projects →
            </p>
          </Container>
        </Link>
      </section>
    </>
  );
}