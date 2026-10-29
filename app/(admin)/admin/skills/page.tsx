import { createClient } from "@/lib/supabase/server";
import { getSkills } from "@/lib/supabase/queries/skills";
import { PageHeader } from "@/components/admin/page-header";
import { SkillsManager } from "./skills-manager";

export const metadata = {
  title: "Skills",
  robots: { index: false, follow: false },
};

export default async function SkillsPage() {
  const supabase = await createClient();
  const skills = await getSkills(supabase);
  const categoryCount = new Set(skills.map((s) => s.category)).size;

  return (
    <div>
      <PageHeader
        title="Skills"
        description={`${skills.length} skills in ${categoryCount} categories. Shown on the public Skills section.`}
      />
      <SkillsManager skills={skills} />
    </div>
  );
}
