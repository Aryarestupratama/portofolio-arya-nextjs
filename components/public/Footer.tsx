import Link from "next/link";
import { createStaticClient } from "@/lib/supabase/static";
import { getProfile } from "@/lib/supabase/queries/profile";
import { Container } from "./Container";
import { GiantWordmark } from "./GiantWordmark";

// Design.md v2 §6.7: baris kecil (copyright + back to top) dan nama
// raksasa. Dirender di SEMUA halaman publik lewat layout.
export async function Footer() {
  const supabase = createStaticClient();
  const profile = await getProfile(supabase);

  return (
    <footer className="bg-paper pb-6 pt-16 md:pt-24">
      <Container wide>
        <div className="flex items-center justify-between gap-4 font-mono text-xs text-ink-soft">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <Link
            href="/#top"
            className="rounded-sm transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Back to top ↑
          </Link>
        </div>
        <div className="mt-8 md:mt-12">
          <GiantWordmark text={profile.name} />
        </div>
      </Container>
    </footer>
  );
}
