"use client";

import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { ProjectCard, type ProjectCardData } from "@/components/public/ProjectCard";
import { CategoryTabs, type Category } from "@/components/public/CategoryTabs";

type ViewProps = {
  projects: ProjectCardData[];
  categories: Category[];
  active: string;
  onSelect?: (value: string) => void;
};

// Tampilan murni (tanpa hook). Dipakai juga sebagai fallback Suspense
// di server: isinya sama dengan kondisi "All", jadi tidak ada kedip.
export function ProjectsView({
  projects,
  categories,
  active,
  onSelect,
}: ViewProps) {
  const visible = active
    ? projects.filter((p) => p.category === active)
    : projects;

  return (
    <>
      <div className="mt-10">
        <CategoryTabs
          categories={categories}
          totalCount={projects.length}
          active={active}
          onSelect={onSelect}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
        {visible.length === 0 && (
          <div className="col-span-full">
            <EmptyState message="Belum ada project di kategori ini." />
          </div>
        )}
        {visible.map((p, i) => (
          <ProjectCard key={p.slug} project={p} delay={(i % 3) * 0.06} />
        ))}
      </div>
    </>
  );
}

// Filter dilakukan di client dari data yang sudah dikirim server, jadi
// halaman /projects bisa statis (ISR) dan ganti kategori tanpa request.
// URL tetap disinkronkan (?category=...) lewat history API, yang
// didukung langsung oleh useSearchParams di Next.js.
export function ProjectsExplorer({
  projects,
  categories,
}: Omit<ViewProps, "active" | "onSelect">) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    const qs = params.toString();
    window.history.pushState(null, "", qs ? `/projects?${qs}` : "/projects");
  }

  return (
    <ProjectsView
      projects={projects}
      categories={categories}
      active={active}
      onSelect={handleSelect}
    />
  );
}
