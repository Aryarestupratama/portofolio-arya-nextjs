import { Container } from "./Container";
import { cn } from "@/lib/utils";

// Pola section Design.md v2 §4: label mono bernomor di kolom kiri
// (sticky di desktop), konten di kolom kanan, garis tipis sebagai pemisah.
export function SectionShell({
  id,
  index,
  label,
  children,
  className,
}: {
  id?: string;
  index: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-16 border-b border-line py-20 md:py-32", className)}
    >
      <Container wide>
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <p className="font-mono text-xs text-ink-soft md:sticky md:top-24">
              {index} / {label}
            </p>
          </div>
          <div className="min-w-0 md:col-span-9">{children}</div>
        </div>
      </Container>
    </section>
  );
}
