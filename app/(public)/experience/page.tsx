import { createClient } from "@/lib/supabase/server";
import { getPublicExperiences } from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";
import { ExperienceList } from "@/components/public/ExperienceList";

export const revalidate = 3600;

export const metadata = {
  title: "Experience",
  description: "Timeline pengalaman kerja dan organisasi.",
};

export default async function ExperiencePage() {
  const supabase = await createClient();
  const experiences = await getPublicExperiences(supabase);

  return (
    <section className="pb-24 pt-10 md:pb-32 md:pt-16">
      <Container wide>
        <FadeIn>
          <p className="font-mono text-xs text-ink-soft">
            experience · {experiences.length}
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[1.02] tracking-tight text-ink">
            Experience
          </h1>
        </FadeIn>

        <div className="mt-14 max-w-4xl">
          {experiences.length === 0 ? (
            <EmptyState message="Belum ada experience ditambahkan." />
          ) : (
            <ExperienceList experiences={experiences} />
          )}
        </div>
      </Container>
    </section>
  );
}
