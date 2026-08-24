import { GithubIcon, LinkedinIcon, DribbbleIcon } from "./icons";
import { Container } from "./Container";

// Design.md §4.3: satu-satunya section dengan background gelap penuh
// (bg-ink), teks cream, social icon hover ke cobalt.
export function Footer() {
  return (
    <section className="bg-ink py-16 text-cream">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs text-[var(--butter-cream)]">contact</p>
        <h2 className="font-display text-2xl font-medium md:text-3xl">
          Let&rsquo;s work together
        </h2>
        <p className="max-w-md text-sm text-cream/70">
          Terbuka untuk peluang kerja, magang, maupun kolaborasi project.
        </p>
        <div className="flex gap-5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-cream/70 transition-colors hover:text-[var(--cobalt)]"
            aria-label="GitHub"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="text-cream/70 transition-colors hover:text-[var(--cobalt)]"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
          <a
            href="https://dribbble.com"
            target="_blank"
            rel="noreferrer"
            className="text-cream/70 transition-colors hover:text-[var(--cobalt)]"
            aria-label="Dribbble"
          >
            <DribbbleIcon className="h-5 w-5" />
          </a>
        </div>
      </Container>
    </section>
  );
}
