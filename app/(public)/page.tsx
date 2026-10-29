import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCertificateUrl } from "@/lib/supabase/storage";
import { getProfile } from "@/lib/supabase/queries/profile";
import { toDirectImageUrl } from "@/lib/utils/gdrive";
import { toProjectCardData } from "@/lib/utils/project-card";
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
import { WorkRail } from "@/components/public/WorkRail";
import { SectionShell } from "@/components/public/SectionShell";
import { ExperienceRoadmap } from "@/components/public/ExperienceRoadmap";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/public/icons";
import { CertificatePreview } from "@/components/public/CertificatePreview";
import { Mail, Download, ArrowRight, ArrowUpRight } from "lucide-react";

// ISR: halaman publik cache, revalidate via revalidatePath saat owner
// update konten (Architecture.md §2.1). Server Action updateProfile
// juga panggil revalidatePath("/") jadi perubahan profile langsung
// kepakai tanpa perlu redeploy.
export const revalidate = 3600;

// Kata terakhir tagline dirender sebagai aksen serif italic (Design.md v2 §6.1).
function splitTagline(text: string) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return { rest: words.join(" "), last };
}

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

  const featured = featuredProjects.map((p) => toProjectCardData(supabase, p));

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

  const heroTitle = splitTagline(
    profile.tagline || `Hi, I'm ${profile.name}`,
  );
  const heroFacts = [
    { label: "role", value: profile.role, live: false },
    { label: "location", value: profile.location, live: false },
    { label: "status", value: profile.availability, live: true },
  ].filter((f): f is { label: string; value: string; live: boolean } =>
    Boolean(f.value),
  );

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section id="top" className="border-b border-line pb-20 pt-16 md:pb-28 md:pt-28">
        <Container wide>
          <FadeIn>
            <p className="font-mono text-xs text-ink-soft md:text-sm">
              hello, i&rsquo;m {profile.name}
            </p>
            <h1 className="mt-6 max-w-6xl text-balance text-[clamp(2.5rem,7vw,6.5rem)] font-medium leading-[1.02] tracking-tight text-ink">
              {heroTitle.rest}{" "}
              <span className="box-decoration-clone rounded-md bg-brand-wash px-[0.14em] font-serif text-[1.06em] font-normal italic text-brand">
                {heroTitle.last}
              </span>
            </h1>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#work">
                  View work
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              {profile.cv_url && (
                <Button asChild size="lg" variant="outline">
                  <a href={profile.cv_url} target="_blank" rel="noreferrer">
                    CV
                    <ArrowUpRight size={16} className="ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </FadeIn>

          {heroFacts.length > 0 && (
            <FadeIn delay={0.1}>
              <dl className="mt-16 grid border-t border-line sm:grid-cols-3 md:mt-24">
                {heroFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="border-b border-line py-5 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
                  >
                    <dt className="font-mono text-xs text-ink-soft">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 flex items-center gap-2 text-sm text-ink md:text-base">
                      {fact.live && (
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                        </span>
                      )}
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          )}
        </Container>
      </section>

      {/* ---------- Selected work ---------- */}
      <SectionShell id="work" index="01" label="work">
        {featured.length === 0 ? (
          <EmptyState message="Belum ada featured project." />
        ) : (
          <WorkRail title="Selected work">
            {featured.map((p, i) => (
              <ProjectCard key={p.slug} project={p} delay={i * 0.08} />
            ))}
          </WorkRail>
        )}

        <div className="mt-4">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-ink transition-colors hover:text-brand"
          >
            All projects
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </SectionShell>

      {/* ---------- Recent experience ---------- */}
      <section id="experience" className="border-b border-line py-16">
        <Container>
          <FadeIn>
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-white">
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
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-white">
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
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-white">
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
            <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-white">
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
              <p className="inline-block rounded-md bg-[var(--cobalt)] px-2 py-1 font-mono text-xs text-white">
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