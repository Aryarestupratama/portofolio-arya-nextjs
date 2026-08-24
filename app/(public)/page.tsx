import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import {
  getFeaturedProjects,
  getPublicSkills,
  getPublicExperiences,
  getPublicCertificates,
} from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";
import { ProjectCard } from "@/components/public/ProjectCard";
import { ProjectCarousel } from "@/components/public/ProjectCarousel";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/public/icons";
import { CertificatePreview } from "@/components/public/CertificatePreview";
import { Mail, Download } from "lucide-react";

// TODO: belum ada tabel `profile` di database (lihat Progress.md), jadi
// konten About/Contact di bawah ini hardcoded dulu. Ganti manual sampai
// ada keputusan skema untuk data profil.
const PROFILE = {
  name: "Your Name",
  aboutBio:
    "Tulis bio singkat tentang diri kamu di sini — latar belakang, minat, dan apa yang biasa kamu kerjakan sehari-hari.",
  aboutPhoto: null as string | null, // path/URL foto about, null = placeholder
  contactIntro:
    "Terbuka untuk peluang kerja, magang, maupun kolaborasi project.",
  contactEmail: "your-email@example.com",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  cvUrl: "/cv.pdf",
};

// ISR: halaman publik cache, revalidate via revalidatePath saat owner
// update konten (Architecture.md §2.1).
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();
  const [featuredProjects, skills, experiences, certificates] =
    await Promise.all([
      getFeaturedProjects(supabase),
      getPublicSkills(supabase),
      getPublicExperiences(supabase),
      getPublicCertificates(supabase),
    ]);

  const featuredWithUrls = featuredProjects.map((p) => ({
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

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {},
  );

  const recentExperiences = experiences.slice(0, 2);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section id="top" className="border-b border-line py-20 md:py-28">
        <Container>
          <FadeIn>
            <p className="font-mono text-xs text-ink-soft">hi, i&rsquo;m</p>
            <h1 className="mt-2 font-display text-[2rem] font-medium tracking-tight text-ink md:text-5xl">
              {PROFILE.name}
            </h1>
            <p className="mt-4 max-w-xl text-ink-soft">
              Developer & designer yang suka membangun produk digital dari
              nol — dari riset masalah sampai ke detail interaksi.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/projects">
                <Button className="rounded-full">Lihat Projects</Button>
              </Link>
              <a href={PROFILE.cvUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" className="rounded-full">
                  Download CV
                </Button>
              </a>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ---------- Featured Projects ---------- */}
      <section id="work" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
              projects
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Featured Projects
            </h2>
          </FadeIn>

          <div className="mt-8">
            {featuredWithUrls.length === 0 && (
              <EmptyState message="Belum ada featured project." />
            )}
            {featuredWithUrls.length >= 3 ? (
              <ProjectCarousel projects={featuredWithUrls} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {featuredWithUrls.map((p, i) => (
                  <ProjectCard
                    key={p.slug}
                    project={p}
                    delay={i * 0.1}
                    featured={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---------- Recent experience ---------- */}
      <section id="experience" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
              experience
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Recent Experience
            </h2>
          </FadeIn>

          <div className="mt-8 space-y-4">
            {recentExperiences.length === 0 && (
              <EmptyState message="Belum ada experience ditambahkan." />
            )}
            {recentExperiences.map((exp) => (
              <FadeIn key={exp.id}>
                <div className="rounded-xl border border-line bg-white p-5">
                  <p className="font-mono text-xs text-ink-soft">
                    {exp.period_text}
                  </p>
                  <p className="mt-1 font-display text-lg font-medium text-ink">
                    {exp.role_title}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">
                    {exp.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-6">
            <Link
              href="/experience"
              className="font-mono text-xs text-[var(--cobalt)] hover:underline"
            >
              Lihat semua experience →
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="border-b border-line bg-clean-white py-16 md:py-20">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
              about
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Hi! I&rsquo;m {PROFILE.name}
            </h2>

            <div className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_1.3fr]">
              <div className="flex justify-center">
                {PROFILE.aboutPhoto ? (
                  <Image
                    src={PROFILE.aboutPhoto}
                    alt="Profile photo"
                    width={224}
                    height={256}
                    className="h-64 w-56 rounded-2xl border border-line object-cover"
                  />
                ) : (
                  <div
                    className="h-64 w-56 rounded-2xl border border-line bg-white"
                    role="img"
                    aria-label="Profile photo (placeholder)"
                  />
                )}
              </div>

              <p className="text-sm leading-relaxed text-ink-soft">
                {PROFILE.aboutBio}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ---------- Skills summary ---------- */}
      <section id="skills" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
              skills
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              What I work with
            </h2>
          </FadeIn>

          <div className="mt-8 space-y-5">
            {Object.keys(skillsByCategory).length === 0 && (
              <EmptyState message="Belum ada skill ditambahkan." />
            )}
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <FadeIn key={category}>
                <p className="font-mono text-xs text-ink-soft">{category}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-line px-3 py-1 text-sm text-ink"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- Certificates (interactive preview) ---------- */}
      <section id="certificates" className="py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
              certificates
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Certificates
            </h2>
          </FadeIn>

          <div className="mt-8">
            <CertificatePreview certificates={certificates} />
          </div>
        </Container>
      </section>

      {/* ---------- Contact ---------- */}
      <section
        id="contact"
        className="border-t border-line bg-[var(--ink)] py-16 md:py-20"
      >
        <Container>
          <FadeIn>
            <div className="mb-4 text-center">
              <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
                contact
              </p>
            </div>
            <h2 className="text-center font-display text-3xl font-medium text-cream">
              {PROFILE.name} — Web Developer
            </h2>
            {PROFILE.contactIntro && (
              <p className="mx-auto mt-3 max-w-md text-center leading-relaxed text-cream/60">
                {PROFILE.contactIntro}
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-6">
              {PROFILE.contactEmail && (
                <a
                  href={`mailto:${PROFILE.contactEmail}`}
                  aria-label="Email"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <Mail size={20} />
                </a>
              )}
              {PROFILE.githubUrl && (
                <a
                  href={PROFILE.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              )}
              {PROFILE.linkedinUrl && (
                <a
                  href={PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
            </div>

            {PROFILE.cvUrl && (
              <div className="mt-8 flex justify-center">
                <a
                  href={PROFILE.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-cream"
                >
                  <Download
                    size={14}
                    className="transition-transform group-hover:translate-y-0.5"
                  />
                  Download CV
                </a>
              </div>
            )}
          </FadeIn>
        </Container>
      </section>
    </>
  );
}