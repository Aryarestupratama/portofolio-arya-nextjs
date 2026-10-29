import Link from "next/link";
import { BrowserFrame } from "./BrowserFrame";
import { StackChip } from "./StackChip";
import { StatusBadge } from "./StatusBadge";
import { FadeIn } from "./FadeIn";

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
        className="frame-host group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      >
        <BrowserFrame
          src={project.thumbnail_url}
          alt={`${project.title} — screenshot`}
          url={project.displayUrl}
        />

        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="text-lg font-medium tracking-tight text-ink transition-colors group-hover:text-brand md:text-xl">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-1 font-mono text-xs text-ink-soft">
          {project.category} · {project.tahun}
        </p>

        {project.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {project.description}
          </p>
        )}

        {project.skillNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.skillNames.slice(0, 4).map((name) => (
              <StackChip key={name}>{name}</StackChip>
            ))}
          </div>
        )}

        {project.metric && (
          <div className="mt-5 flex items-baseline gap-3 border-t border-line pt-4">
            <span className="font-mono text-2xl font-medium text-brand">
              {project.metric.value}
            </span>
            <span className="text-xs text-ink-soft">{project.metric.label}</span>
          </div>
        )}
      </Link>
    </FadeIn>
  );
}
