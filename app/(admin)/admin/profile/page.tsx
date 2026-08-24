import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profile";
import { ProfileForm } from "./profile-form";

// Halaman admin selalu SSR, data selalu fresh (Architecture.md §2.1).
export default async function AdminProfilePage() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-ink">
        Edit Profile
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Konten ini dipakai di halaman Home (Hero, About, Contact) dan
        metadata SEO default.
      </p>

      <div className="mt-6">
        <ProfileForm defaultValues={profile} />
      </div>
    </div>
  );
}