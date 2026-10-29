import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionShell } from "./SectionShell";
import { FadeIn } from "./FadeIn";
import { CopyField } from "./CopyField";
import { Button } from "@/components/ui/button";

type Profile = {
  contact_intro: string | null;
  contact_email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  dribbble_url: string | null;
  cv_url: string | null;
};

const stripUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

// Design.md v2 §6.6: statement besar, tombol, CopyField email, social rows.
export function ContactSection({ profile }: { profile: Profile }) {
  const socials = [
    { label: "GitHub", url: profile.github_url },
    { label: "LinkedIn", url: profile.linkedin_url },
    { label: "Dribbble", url: profile.dribbble_url },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <SectionShell id="contact" index="05" label="contact" className="border-b-0">
      <FadeIn>
        <h2 className="max-w-3xl text-2xl leading-snug text-ink md:text-4xl">
          {profile.contact_intro ||
            "If you would like to work together or just say hi, I'm always happy to chat."}
        </h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {profile.contact_email && (
            <Button asChild size="lg">
              <a href={`mailto:${profile.contact_email}`}>Email me</a>
            </Button>
          )}
          {profile.cv_url && (
            <Button asChild size="lg" variant="outline">
              <a href={profile.cv_url} target="_blank" rel="noreferrer">
                Download CV
              </a>
            </Button>
          )}
        </div>

        <div className="mt-14 max-w-2xl">
          {profile.contact_email && (
            <CopyField label="Mail" value={profile.contact_email} />
          )}
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 border-t border-line py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="text-sm text-ink">{s.label}</span>
              <span className="inline-flex min-w-0 items-center gap-2 font-mono text-sm text-ink-soft transition-colors group-hover:text-brand">
                <span className="truncate">{stripUrl(s.url)}</span>
                <ArrowUpRight size={14} className="shrink-0" />
              </span>
            </Link>
          ))}
          <div className="border-t border-line" />
        </div>
      </FadeIn>
    </SectionShell>
  );
}
