import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProjectCardData } from "@/components/public/ProjectCard";

type ProjectRow = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  tahun: number;
  status: string;
  demo_url: string | null;
  project_skill?: { skills: { name: string } }[] | null;
  project_metrics?:
    | { value: string; label: string; order: number | null }[]
    | null;
};

// Satu tempat untuk mengubah baris `projects` (+ skills & metrics) menjadi
// props ProjectCard, dipakai Home dan /projects.
export function toProjectCardData(
  supabase: SupabaseClient,
  p: ProjectRow,
): ProjectCardData {
  const metrics = [...(p.project_metrics ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const primary = metrics[0];

  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    thumbnail_url: getPublicImageUrl(supabase, p.thumbnail),
    category: p.category,
    tahun: p.tahun,
    status: p.status,
    skillNames: (p.project_skill ?? []).map((ps) => ps.skills.name),
    displayUrl: p.demo_url
      ? p.demo_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : p.slug,
    metric: primary ? { value: primary.value, label: primary.label } : null,
  };
}
