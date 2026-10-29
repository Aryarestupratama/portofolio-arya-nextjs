import Link from "next/link";
import { BrowserFrame } from "./BrowserFrame";
import { StackChip } from "./StackChip";
import { StatusBadge } from "./StatusBadge";
import { FadeIn } from "./FadeIn";
import { categoryLabel } from "@/lib/utils/category";

export type ProjectCardData = {
  slug: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  category: string;
  tahun: number;
  status: string;
  skillNames: string[];
  /** Tanpa protokol, untuk kotak URL di BrowserFrame. */
  displayUrl: string;
  /** Metric utama (order terkecil) dari project_metrics, kalau ada. */
  metric?: { value: string; label: string } | null;
};

// Design.md v2 §5.3: BrowserFrame + judul + 1 baris deskripsi + meta mono +
// chip stack + metric highlight. Seluruh card adalah satu link; hover
// pada link memicu auto-scroll screenshot (class `frame-host`).
export function ProjectCard({
  project,
  delay = 0,
}: {
  project: ProjectCardData;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="frame-host group flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      >
        <BrowserFrame
          src={project.thumbnail_url}
          alt={`${project.title} — screenshot`}
          url={project.displayUrl}
          aspect="aspect-[2/1]"
        />

        <div className="mt-5 flex items-start justify-between gap-4">
          {/* Tinggi judul dikunci 2 baris supaya semua card sejajar,
              meskipun ada judul yang panjang. */}
          <h3 className="line-clamp-2 min-h-[2lh] text-lg font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-brand md:text-xl">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-1 font-mono text-xs text-ink-soft">
          {categoryLabel(project.category).toLowerCase()} · {project.tahun}
        </p>

        {/* Deskripsi selalu memakai tinggi 2 baris (walau teksnya 1 baris). */}
        <p className="mt-3 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-ink-soft">
          {project.description}
        </p>

        {project.skillNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.skillNames.slice(0, 4).map((name) => (
              <StackChip key={name}>{name}</StackChip>
            ))}
          </div>
        )}

        {/* mt-auto: metric selalu menempel di dasar card. */}
        {project.metric && (
          <div className="mt-auto pt-5">
            <div className="flex items-baseline gap-3 border-t border-line pt-4">
              <span className="font-mono text-2xl font-medium text-brand">
                {project.metric.value}
              </span>
              <span className="text-xs text-ink-soft">
                {project.metric.label}
              </span>
            </div>
          </div>
        )}
      </Link>
    </FadeIn>
  );
}
