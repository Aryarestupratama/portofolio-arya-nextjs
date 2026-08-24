import { createClient } from "@/lib/supabase/server";
import { getSkills } from "@/lib/supabase/queries/skills";
import { SkillsManager } from "./skills-manager";

export const metadata = {
  title: "Skills",
  robots: { index: false, follow: false },
};

export default async function SkillsPage() {
  const supabase = await createClient();
  const skills = await getSkills(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-ink-soft">admin</p>
          <h1 className="font-display text-2xl font-medium text-ink">
            Skills
          </h1>
        </div>
      </div>
      <SkillsManager skills={skills} />
    </div>
  );
}