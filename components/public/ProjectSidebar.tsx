import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "./icons";
import { StackChip } from "./StackChip";
import { StatusBadge } from "./StatusBadge";
import { CaseStudyAccordion } from "./CaseStudyAccordion";

type Metric = { id: number; value: string; label: string };

type SidebarProject = {
  title: string;
  description: string;
  detail: string | null;
  category: string;
  tahun: number | null;
  status: string;
  role: string | null;
  timeline: string | null;
  client: string | null;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  demo_url: string | null;
  github_url: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  personal: "Personal",
  kuliah: "Coursework",
  client: "Client",
};

type CaseItem = { key: string; title: string; content: React.ReactNode };

const bodyClass = "whitespace-pre-line text-sm leading-relaxed text-ink-soft";

// Sidebar sticky halaman detail (Design.md v2 §9.1): judul, stack, meta,
// accordion case study (metrics di dalam Outcome), dan link.
export function ProjectSidebar({
  project,
  metrics,
  skillNames,
}: {
  project: SidebarProject;
  metrics: Metric[];
  skillNames: string[];
}) {
  const facts = [
    { label: "role", value: project.role },
    { label: "timeline", value: project.timeline },
    { label: "client", value: project.client },
  ].filter((f) => f.value);

  const items: CaseItem[] = [];

  if (project.problem) {
    items.push({
      key: "problem",
      title: "What wasn’t working",
      content: <p className={bodyClass}>{project.problem}</p>,
    });
  }

  if (project.approach) {
    items.push({
      key: "approach",
      title: "How it was built",
      content: <p className={bodyClass}>{project.approach}</p>,
    });
  }

  if (project.outcome || metrics.length > 0) {
    items.push({
      key: "outcome",
      title: "Result",
      content: (
        <div className="space-y-5">
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div key={m.id} className="rounded-md border border-line p-4">
                  <p className="font-mono text-xl font-medium text-brand">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{m.label}</p>
                </div>
              ))}
            </div>
          )}
          {project.outcome && <p className={bodyClass}>{project.outcome}</p>}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <ArrowLeft size={14} /> Back to work
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs text-ink-soft">
            {CATEGORY_LABEL[project.category] ?? project.category}
            {project.tahun ? ` · ${project.tahun}` : ""}
          </p>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="mt-4 text-3xl font-medium leading-[1.1] tracking-tight text-ink md:text-4xl">
          {project.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {project.description}
        </p>
      </div>

      {skillNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skillNames.map((name) => (
            <StackChip key={name}>{name}</StackChip>
          ))}
        </div>
      )}

      {facts.length > 0 && (
        <dl className="border-t border-line">
          {facts.map((f) => (
            <div
              key={f.label}
              className="flex items-baseline justify-between gap-4 border-b border-line py-3"
            >
              <dt className="font-mono text-xs text-ink-soft">{f.label}</dt>
              <dd className="text-right text-sm text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {items.length > 0 ? (
        <CaseStudyAccordion
          items={items}
          defaultOpen={items.some((i) => i.key === "outcome") ? "outcome" : undefined}
        />
      ) : (
        project.detail && <p className={bodyClass}>{project.detail}</p>
      )}

      {(project.demo_url || project.github_url) && (
        <div className="flex flex-wrap gap-3">
          {project.demo_url && (
            <Button asChild>
              <a href={project.demo_url} target="_blank" rel="noreferrer">
                Live demo
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button asChild variant="outline">
              <a href={project.github_url} target="_blank" rel="noreferrer">
                <GithubIcon className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
