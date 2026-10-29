import { createClient } from "@/lib/supabase/server";
import { getExperiences } from "@/lib/supabase/queries/experiences";
import { PageHeader } from "@/components/admin/page-header";
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
      <PageHeader
        title="Experience"
        description={`${experiences.length} entries. Shown on the public Experience section.`}
      />
      <ExperienceManager experiences={experiences} />
    </div>
  );
}
