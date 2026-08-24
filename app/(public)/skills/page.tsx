import { createClient } from "@/lib/supabase/server";
import { getPublicSkills } from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";

export const revalidate = 3600;

export const metadata = {
  title: "Skills",
  description: "Daftar skill dan tools yang dikuasai.",
};

export default async function SkillsPage() {
  const supabase = await createClient();
  const skills = await getPublicSkills(supabase);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {},
  );

  return (
    <section className="py-16">
      <Container>
        <FadeIn>
          <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
            skills
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">
            Skills
          </h1>
        </FadeIn>

        <div className="mt-10 space-y-8">
          {Object.keys(skillsByCategory).length === 0 && (
            <EmptyState message="Belum ada skill ditambahkan." />
          )}
          {Object.entries(skillsByCategory).map(([category, items]) => (
            <FadeIn key={category}>
              <p className="font-mono text-xs text-ink-soft">{category}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border border-line px-4 py-1.5 text-sm text-ink"
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
  );
}
