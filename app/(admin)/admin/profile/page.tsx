import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profile";
import { missingProfileFields, PROFILE_FIELDS } from "@/lib/utils/profile";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

// Halaman admin selalu SSR, data selalu fresh (Architecture.md §2.1).
export default async function AdminProfilePage() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  const missing = missingProfileFields(profile);
  const filled = PROFILE_FIELDS.length - missing.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Used on the home page (Hero, About, Contact) and as the default SEO metadata."
        actions={
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} className="mr-1.5" />
              View site
            </a>
          </Button>
        }
      />

      <div className="rounded-xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Profile completeness</span>
          <span className="font-mono text-xs text-ink-soft">
            {filled}/{PROFILE_FIELDS.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${(filled / PROFILE_FIELDS.length) * 100}%` }}
          />
        </div>
        {missing.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft">Still empty: {missing.join(", ")}.</p>
        )}
      </div>

      <ProfileForm defaultValues={profile} />
    </div>
  );
}
