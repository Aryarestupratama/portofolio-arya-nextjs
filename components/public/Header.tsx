import { createStaticClient } from "@/lib/supabase/static";
import { getProfile } from "@/lib/supabase/queries/profile";
import { HeaderClient } from "@/components/public/HeaderClient";

// Server Component: fetch nama & role dari tabel `profile` (sumber sama
// dengan Home/Footer, lihat Progress.md "Tambahan pasca-M4 — Profile
// table"). Logic interaktif (scroll listener, mobile menu) tetap di
// HeaderClient.tsx sebagai Client Component terpisah, sesuai
// Design.md §4.3.4.
export async function Header() {
  const supabase = createStaticClient();
  const profile = await getProfile(supabase);

  return <HeaderClient name={profile.name} role={profile.role} />;
}