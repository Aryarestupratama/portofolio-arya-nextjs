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
import { ExperienceList } from "@/components/public/ExperienceList";
import { CertificateList } from "@/components/public/CertificateList";
import { ContactSection } from "@/components/public/ContactSection";
import { StackChip } from "@/components/public/StackChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";

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

      {/* ---------- Experience ---------- */}
      <SectionShell id="experience" index="02" label="experience">
        <h2 className="mb-8 text-2xl font-medium tracking-tight text-ink md:text-4xl">
          Experience
        </h2>
        {experiences.length === 0 ? (
          <EmptyState message="Belum ada experience ditambahkan." />
        ) : (
          <ExperienceList experiences={experiences} limit={4} />
        )}
        <div className="mt-8">
          <Link
            href="/experience"
            className="group inline-flex items-center gap-2 text-sm text-ink transition-colors hover:text-brand"
          >
            All experience
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </SectionShell>

      {/* ---------- About ---------- */}
      <SectionShell id="about" index="03" label="about">
        <FadeIn>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="sr-only">About {profile.name}</h2>
              {profile.about_bio ? (
                <p className="max-w-3xl whitespace-pre-line text-2xl leading-snug text-ink md:text-4xl">
                  {profile.about_bio}
                </p>
              ) : (
                <EmptyState message="Bio belum diisi." />
              )}
            </div>
            {aboutPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aboutPhotoUrl}
                alt={`Foto ${profile.name}`}
                width={288}
                height={360}
                className="aspect-[4/5] w-56 rounded-lg border border-line object-cover md:w-72"
              />
            )}
          </div>
        </FadeIn>
      </SectionShell>

      {/* ---------- Skills + Certificates ---------- */}
      <SectionShell index="04" label="proof">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div id="skills" className="scroll-mt-24">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-ink">
              Skills
            </h2>
            {Object.keys(skillsByCategory).length === 0 ? (
              <EmptyState message="Belum ada skill ditambahkan." />
            ) : (
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, items]) => (
                  <FadeIn key={category}>
                    <p className="font-mono text-xs text-ink-soft">
                      {category}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <StackChip key={skill.id} className="px-2.5 py-1.5 text-xs">
                          {skill.name}
                        </StackChip>
                      ))}
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>

          <div id="certificates" className="scroll-mt-24">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-ink">
              Certificates
            </h2>
            <CertificateList certificates={certificatesWithUrls} />
          </div>
        </div>
      </SectionShell>

      {/* ---------- Contact ---------- */}
      <ContactSection profile={profile} />
    </>
  );
}
