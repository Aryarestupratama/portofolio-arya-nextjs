import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  Award,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileText,
  Folder,
  Plus,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/supabase/queries/projects";
import { getSkills } from "@/lib/supabase/queries/skills";
import { getCertificates } from "@/lib/supabase/queries/certificates";
import { getExperiences } from "@/lib/supabase/queries/experiences";
import { getRecruitmentEntries } from "@/lib/supabase/queries/recruitment";
import { getProfile } from "@/lib/supabase/queries/profile";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { daysUntil, timeAgo } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { StatCard } from "@/components/admin/stat-card";
import {
  ProjectStatusPill,
  type ProjectStatus,
} from "@/components/admin/project-status-pill";
import { DeadlineLabel } from "../recruitment/deadline-label";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const PIPELINE = [
  { value: "listed", label: "Listed" },
  { value: "applied", label: "Applied" },
  { value: "on_process", label: "On process" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No response" },
];

// Field profile yang sebaiknya terisi supaya halaman publik terlihat lengkap.
const PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "tagline", label: "tagline" },
  { key: "about_bio", label: "about bio" },
  { key: "about_photo_url", label: "about photo" },
  { key: "cv_url", label: "CV link" },
  { key: "contact_email", label: "contact email" },
  { key: "github_url", label: "GitHub" },
  { key: "linkedin_url", label: "LinkedIn" },
];

type Attention = { id: string; text: string; href: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const [projects, skills, certificates, experiences, applications, profile] =
    await Promise.all([
      getProjects(supabase),
      getSkills(supabase),
      getCertificates(supabase),
      getExperiences(supabase),
      getRecruitmentEntries(supabase),
      getProfile(supabase),
    ]);

  const firstName = String(profile?.name ?? "").split(" ")[0] || "there";

  // ---- Stats ----
  const liveCount = projects.filter((p) => p.status === "live").length;
  const featuredCount = projects.filter((p) => p.is_featured).length;
  const categoryCount = new Set(skills.map((s) => s.category)).size;
  const ongoingCount = experiences.filter((e) => e.year_end === null).length;
  const activeApplications = applications.filter((a) =>
    ["applied", "on_process"].includes(a.status),
  ).length;

  // ---- Needs attention ----
  const attention: Attention[] = [];

  const overdue = applications.filter(
    (a) => a.status === "listed" && a.deadline_date && daysUntil(a.deadline_date) < 0,
  ).length;
  if (overdue > 0) {
    attention.push({
      id: "overdue",
      text: `${overdue} listed application${overdue > 1 ? "s" : ""} past the deadline`,
      href: "/admin/recruitment?status=listed&deadline=overdue",
    });
  }

  const dueSoon = applications.filter(
    (a) =>
      a.status === "listed" &&
      a.deadline_date &&
      daysUntil(a.deadline_date) >= 0 &&
      daysUntil(a.deadline_date) <= 7,
  ).length;
  if (dueSoon > 0) {
    attention.push({
      id: "soon",
      text: `${dueSoon} application${dueSoon > 1 ? "s" : ""} not yet sent, due within 7 days`,
      href: "/admin/recruitment?status=listed&deadline=soon",
    });
  }

  const noCaseStudy = projects.filter(
    (p) => !p.problem?.trim() && !p.approach?.trim() && !p.outcome?.trim(),
  ).length;
  if (noCaseStudy > 0) {
    attention.push({
      id: "case-study",
      text: `${noCaseStudy} project${noCaseStudy > 1 ? "s have" : " has"} no case study (problem / approach / outcome)`,
      href: "/admin/projects",
    });
  }

  if (projects.length > 0 && featuredCount === 0) {
    attention.push({
      id: "featured",
      text: "No featured project, so the home page “Selected work” is empty",
      href: "/admin/projects?featured=no",
    });
  }

  const missingProfile = PROFILE_FIELDS.filter(
    (f) => !String(profile?.[f.key] ?? "").trim(),
  ).map((f) => f.label);
  if (missingProfile.length > 0) {
    attention.push({
      id: "profile",
      text: `Profile is missing: ${missingProfile.join(", ")}`,
      href: "/admin/profile",
    });
  }

  // ---- Upcoming deadlines ----
  const upcoming = applications
    .filter(
      (a) =>
        a.deadline_date &&
        daysUntil(a.deadline_date) >= 0 &&
        ["listed", "applied", "on_process"].includes(a.status),
    )
    .sort((a, b) => String(a.deadline_date).localeCompare(String(b.deadline_date)))
    .slice(0, 5);

  // ---- Pipeline ----
  const pipelineCounts = PIPELINE.map((s) => ({
    ...s,
    count: applications.filter((a) => a.status === s.value).length,
  }));
  const maxCount = Math.max(1, ...pipelineCounts.map((s) => s.count));

  // ---- Recent projects ----
  const recent = [...projects]
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's going on with your portfolio.`}
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={15} className="mr-1.5" />
                View site
              </a>
            </Button>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus size={16} className="mr-1.5" />
                Add project
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={projects.length}
          hint={`${liveCount} live · ${featuredCount} featured`}
          href="/admin/projects"
          icon={Folder}
        />
        <StatCard
          label="Skills"
          value={skills.length}
          hint={`${categoryCount} categories`}
          href="/admin/skills"
          icon={Zap}
        />
        <StatCard
          label="Certificates"
          value={certificates.length}
          hint={certificates[0] ? `Latest: ${certificates[0].year_start}` : "None yet"}
          href="/admin/certificates"
          icon={Award}
        />
        <StatCard
          label="Experience"
          value={experiences.length}
          hint={`${ongoingCount} ongoing`}
          href="/admin/experience"
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Needs attention" description="Things worth fixing next">
          {attention.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <CheckCircle2 size={16} className="text-brand" />
              Everything looks good.
            </p>
          ) : (
            <ul className="space-y-1">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="-mx-2 flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm text-ink transition-colors hover:bg-surface"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                    <span>{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Upcoming deadlines"
          description="Open applications, soonest first"
          href="/admin/recruitment"
        >
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-soft">No upcoming deadlines.</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/recruitment/${a.id}/edit`}
                      className="line-clamp-1 text-sm font-medium text-ink hover:text-brand"
                    >
                      {a.company_name}
                    </Link>
                    <p className="line-clamp-1 text-xs text-ink-soft">{a.position}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <DeadlineLabel date={a.deadline_date} note={null} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Application pipeline"
          description={`${applications.length} total · ${activeApplications} in progress`}
          href="/admin/recruitment"
          hrefLabel="Open tracker"
        >
          {applications.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <FileText size={15} />
              No applications tracked yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {pipelineCounts.map((s) => (
                <li key={s.value}>
                  <Link
                    href={`/admin/recruitment?status=${s.value}`}
                    className="group block"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-ink-soft group-hover:text-ink">{s.label}</span>
                      <span className="font-mono text-ink">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-brand transition-[width]"
                        style={{ width: `${(s.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recently updated projects" href="/admin/projects">
        {recent.length === 0 ? (
          <p className="text-sm text-ink-soft">No projects yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <Image
                  src={getPublicImageUrl(supabase, p.thumbnail)}
                  alt={`${p.title} thumbnail`}
                  width={64}
                  height={48}
                  className="h-12 w-16 shrink-0 rounded-md border border-line bg-surface object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/projects/${p.id}/edit`}
                    className="line-clamp-1 font-medium text-ink hover:text-brand"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-ink-soft">Updated {timeAgo(p.updated_at)}</p>
                </div>
                <ProjectStatusPill status={p.status as ProjectStatus} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
