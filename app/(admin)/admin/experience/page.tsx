import { createClient } from "@/lib/supabase/server";
import { getExperiences } from "@/lib/supabase/queries/experiences";
import { ExperienceManager } from "./experience-manager";

export const metadata = {
  title: "Experience",
  robots: { index: false, follow: false },
};

export default async function ExperiencePage() {
  const supabase = await createClient();
  const experiences = await getExperiences(supabase);

  return (
    <div>
      <p className="font-mono text-xs text-ink-soft">admin</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Experience
      </h1>
      <ExperienceManager experiences={experiences} />
    </div>
  );
}
