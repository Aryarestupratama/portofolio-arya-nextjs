import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import {
  getProjectBySlug,
  getAllProjectSlugs,
  getProjectNavList,
} from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { BrowserFrame } from "@/components/public/BrowserFrame";
import { ProjectSidebar } from "@/components/public/ProjectSidebar";

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

const displayUrl = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

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

  const images = [...(project.project_images ?? [])]
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((img: { id: number; image_path: string; caption: string | null }) => ({
      id: img.id,
      caption: img.caption,
      url: getPublicImageUrl(supabase, img.image_path),
    }))
    .filter((img) => img.url !== thumbnailUrl);

  const metrics = [...(project.project_metrics ?? [])].sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order,
  );
  const skillNames: string[] = (project.project_skill ?? []).map(
    (ps: { skills: { name: string } }) => ps.skills.name,
  );

  const frameUrl = project.demo_url ? displayUrl(project.demo_url) : project.slug;

  // Next project: urutan sama dengan listing, berputar ke awal di akhir.
  const navList = await getProjectNavList(supabase);
  const index = navList.findIndex((p: { slug: string }) => p.slug === slug);
  const next =
    navList.length > 1 && index >= 0
      ? navList[(index + 1) % navList.length]
      : null;

  return (
    <>
      <section className="pb-20 pt-10 md:pb-28 md:pt-14">
        <Container wide>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:col-span-8">
              {thumbnailUrl && (
                <FadeIn>
                  <BrowserFrame
                    scrollable
                    priority
                    aspect="aspect-[16/10]"
                    src={thumbnailUrl}
                    alt={`${project.title} — screenshot`}
                    url={frameUrl}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                </FadeIn>
              )}
              {images.map(
                (img: { id: number; url: string; caption: string | null }) => (
                  <FadeIn key={img.id}>
                    <figure>
                      <BrowserFrame
                        scrollable
                        aspect="aspect-[16/10]"
                        src={img.url}
                        alt={img.caption || `${project.title} — screenshot`}
                        url={frameUrl}
                        sizes="(min-width: 1024px) 66vw, 100vw"
                      />
                      {img.caption && (
                        <figcaption className="mt-2 font-mono text-xs text-ink-soft">
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  </FadeIn>
                ),
              )}
            </div>

            <aside className="order-1 min-w-0 lg:order-2 lg:col-span-4">
              <ProjectSidebar
                project={project}
                metrics={metrics}
                skillNames={skillNames}
              />
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-line">
        <Link
          href={next ? `/projects/${next.slug}` : "/projects"}
          className="group block py-14 md:py-20"
        >
          <Container wide>
            <p className="font-mono text-xs text-ink-soft">
              {next ? "next project" : "all projects"}
            </p>
            <p className="mt-3 flex items-center gap-4 text-3xl font-medium tracking-tight text-ink transition-colors group-hover:text-brand md:text-6xl">
              {next ? next.title : "Back to all projects"}
              <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 md:h-10 md:w-10" />
            </p>
            {next?.description && (
              <p className="mt-4 line-clamp-2 max-w-xl text-sm text-ink-soft">
                {next.description}
              </p>
            )}
          </Container>
        </Link>
      </section>
    </>
  );
}
