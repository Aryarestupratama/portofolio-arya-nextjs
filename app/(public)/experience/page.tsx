import { createClient } from "@/lib/supabase/server";
import { getPublicExperiences } from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";
import { ExperienceRoadmap } from "@/components/public/ExperienceRoadmap";

export const revalidate = 3600;

export const metadata = {
  title: "Experience",
  description: "Timeline pengalaman kerja dan organisasi.",
};

export default async function ExperiencePage() {
  const supabase = await createClient();
  const experiences = await getPublicExperiences(supabase);

  return (
    <section className="py-16">
      <Container>
        <FadeIn>
          <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
            experience
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">
            Experience
          </h1>
        </FadeIn>

        <div className="mt-10">
          {experiences.length === 0 ? (
            <EmptyState message="Belum ada experience ditambahkan." />
          ) : (
            <ExperienceRoadmap experiences={experiences} />
          )}
        </div>
      </Container>
    </section>
  );
}
