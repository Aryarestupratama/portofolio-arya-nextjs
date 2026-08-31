import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl, getCertificateUrl } from "@/lib/supabase/storage";
import { getProfile } from "@/lib/supabase/queries/profile";
import { toDirectImageUrl } from "@/lib/utils/gdrive";
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
import { ExperienceRoadmap } from "@/components/public/ExperienceRoadmap";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/public/icons";
import { CertificatePreview } from "@/components/public/CertificatePreview";
import { Mail, Download } from "lucide-react";

// ISR: halaman publik cache, revalidate via revalidatePath saat owner
// update konten (Architecture.md §2.1). Server Action updateProfile
// juga panggil revalidatePath("/") jadi perubahan profile langsung
// kepakai tanpa perlu redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();
  const [profile, featuredProjects, skills, experiences, certificates] =
    await Promise.all([
      getProfile(supabase),
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

  const certificatesWithUrls = certificates.map((cert) => ({
    ...cert,
    certificate_url: getCertificateUrl(supabase, cert.certificate_url),
  }));


  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {},
  );

  const aboutPhotoUrl = toDirectImageUrl(profile.about_photo_url);
  const heroPhotoUrl = toDirectImageUrl(profile.hero_photo_url);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section id="top" className="border-b border-line py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <FadeIn>
              <p className="font-mono text-xl text-ink-soft md:text-2xl">hi, i&rsquo;m</p>
              <h1 className="mt-2 font-display text-[2rem] font-medium tracking-tight text-ink md:text-5xl">
                {profile.name}
              </h1>
              {profile.tagline && (
                <p className="mt-4 max-w-xl text-ink-soft">{profile.tagline}</p>
              )}
              <div className="mt-8 flex gap-3">
                <Link href="/projects">
                  <Button className="rounded-full">View Projects</Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex justify-center md:justify-end">
                {heroPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroPhotoUrl}
                    alt={profile.name}
                    width={280}
                    height={320}
                    className="h-72 w-64 rounded-2xl border border-line object-cover md:h-80 md:w-72"
                  />
                ) : (
                  <div
                    className="h-72 w-64 rounded-2xl border border-line bg-clean-white md:h-80 md:w-72"
                    role="img"
                    aria-label="Hero photo (placeholder)"
                  />
                )}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ---------- Featured Projects ---------- */}
      <section id="work" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
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

          <div className="mt-6 flex justify-center">
            <Link href="/projects">
              <Button className="rounded-full">View All Projects</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- Recent experience ---------- */}
      <section id="experience" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
              experience
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Recent Experience
            </h2>
          </FadeIn>

          <div className="mt-8">
            {experiences.length === 0 ? (
              <EmptyState message="Belum ada experience ditambahkan." />
            ) : (
              <ExperienceRoadmap experiences={experiences} limit={3} />
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/experience">
              <Button className="rounded-full">View All Experience</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="border-b border-line bg-clean-white py-16 md:py-20">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
              about
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Hi! I&rsquo;m {profile.name}
            </h2>

            <div className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_1.3fr]">
              <div className="flex justify-center">
                {aboutPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={aboutPhotoUrl}
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

              <div>
                {profile.about_bio && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {profile.about_bio}
                  </p>
                )}
                {(profile.location || profile.availability) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.availability && (
                      <span className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink">
                        {profile.availability}
                      </span>
                    )}
                    {profile.location && (
                      <span className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-soft">
                        {profile.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ---------- Skills summary ---------- */}
      <section id="skills" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
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
                      className="rounded-full border border-line bg-[var(--butter-cream)] px-3 py-1 text-sm text-ink"
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
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
              certificates
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">
              Certificates
            </h2>
          </FadeIn>

          <div className="mt-8">
            <CertificatePreview certificates={certificatesWithUrls} />
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
              <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-[var(--butter-cream)]">
                contact
              </p>
            </div>
            <h2 className="text-center font-display text-3xl font-medium text-cream">
              {profile.name}
              {profile.role ? ` — ${profile.role}` : ""}
            </h2>
            {profile.contact_intro && (
              <p className="mx-auto mt-3 max-w-md text-center leading-relaxed text-cream/60">
                {profile.contact_intro}
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-6">
              {profile.contact_email && (
                <a
                  href={`mailto:${profile.contact_email}`}
                  aria-label="Email"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <Mail size={20} />
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="text-cream/60 transition-colors hover:text-[var(--cobalt)]"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
            </div>

            {profile.cv_url && (
              <div className="mt-8 flex justify-center">
                <a
                  href={profile.cv_url}
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