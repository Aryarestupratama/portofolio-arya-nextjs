import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profile";
import { Container } from "./Container";

// Section Contact lengkap (headline, email, social icons, CV) sudah ada
// di Home (app/(public)/page.tsx, id="contact") — Footer sengaja dibuat
// minimal (cuma copyright) supaya tidak duplikat, karena Footer ini
// dirender di SEMUA halaman publik lewat layout.
//
// Server Component async supaya bisa fetch nama dari tabel `profile`,
// jadi nggak perlu hardcode manual lagi.
export async function Footer() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  return (
    <section className="bg-ink py-8 text-cream">
      <Container className="flex flex-col items-center gap-1 text-center">
        <p className="font-mono text-xs text-cream/50">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </Container>
    </section>
  );
}