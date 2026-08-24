import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { FadeIn } from "./FadeIn";

type Project = {
  slug: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  category: string;
  tahun: number;
  status: string;
  skillNames: string[];
};

// Design.md §4.3.1: mode "featured" (col-span-2) vs normal.
// StatusBadge (live/in_progress/archived) adalah penambahan baru sesuai
// Design.md §4.2 — bukan bagian dari desain lama, jadi tetap dipertahankan
// di samping elemen dari desain lama (fallback "No preview", CTA featured).
export function ProjectCard({
  project,
  featured = false,
  delay = 0,
}: {
  project: Project;
  featured?: boolean;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className={featured ? "sm:col-span-2" : undefined}>
      <Link href={`/projects/${project.slug}`} className="block h-full">
        <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-[var(--ink)]">
          <div
            className={featured ? "grid h-full gap-0 sm:grid-cols-2" : undefined}
          >
            <div
              className={`relative flex items-center justify-center overflow-hidden bg-[var(--clean-white)] ${featured ? "h-56 sm:h-full" : "h-44"}`}
            >
              {project.thumbnail_url ? (
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  sizes={
                    featured
                      ? "(min-width: 640px) 50vw, 100vw"
                      : "(min-width: 640px) 50vw, 100vw"
                  }
                  className="object-cover"
                />
              ) : (
                <span className="font-mono text-xs text-ink-soft">
                  No preview
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-ink-soft">
                  {project.category} · {project.tahun}
                </p>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-2 font-display text-lg font-medium text-ink group-hover:text-[var(--cobalt)]">
                {project.title}
              </p>
              {project.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {project.description}
                </p>
              )}
              {project.skillNames.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.skillNames.slice(0, 3).map((name) => (
                    <span
                      key={name}
                      className="rounded-md bg-[var(--clean-white)] px-2 py-0.5 font-mono text-[10px] text-ink"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              {featured && (
                <span className="mt-4 font-mono text-sm font-medium text-[var(--cobalt)]">
                  View case study →
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}