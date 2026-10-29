import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { getProfile } from "@/lib/supabase/queries/profile";
import { getPublicExperiences } from "@/lib/supabase/queries/public";
import { toDirectImageUrl } from "@/lib/utils/gdrive";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";
import { AboutReader } from "@/components/public/AboutReader";

export const revalidate = 3600;

export const metadata = {
  title: "About",
  description: "A short story about me and my journey as a developer.",
};

export default async function AboutPage() {
  const supabase = createStaticClient();
  const [profile, experiences] = await Promise.all([
    getProfile(supabase),
    getPublicExperiences(supabase),
  ]);

  const photoUrl = toDirectImageUrl(profile.about_photo_url);
  const years = experiences.map((e: { year_start: number }) => e.year_start);
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = new Date().getFullYear();

  return (
    <section className="pb-24 pt-10 md:pt-16">
      <Container wide>
        <FadeIn>
          <p className="font-mono text-xs text-ink-soft">about</p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[1.02] tracking-tight text-ink">
            {profile.name}
          </h1>
        </FadeIn>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          {profile.about_bio ? (
            <AboutReader
              className="lg:col-span-9"
              text={profile.about_bio}
              minYear={minYear}
              maxYear={maxYear}
            />
          ) : (
            <div className="lg:col-span-9">
              <EmptyState message="Bio not filled in yet." />
            </div>
          )}

          <aside className="lg:col-span-3">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={`Foto ${profile.name}`}
                width={288}
                height={360}
                className="aspect-[4/5] w-56 rounded-lg border border-line object-cover md:w-72 lg:sticky lg:top-28"
              />
            )}
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 border-t border-line pt-8 text-sm">
          <Link
            href="/experience"
            className="group inline-flex items-center gap-2 text-ink transition-colors hover:text-brand"
          >
            Experience
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 text-ink transition-colors hover:text-brand"
          >
            Get in touch
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
