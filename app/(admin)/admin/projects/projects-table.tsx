"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { IconLinkButton } from "@/components/admin/icon-button";
import {
  PROJECT_STATUS,
  ProjectStatusPill,
  type ProjectStatus,
} from "@/components/admin/project-status-pill";
import { CATEGORY_LABEL, categoryLabel } from "@/lib/utils/category";
import { DeleteProjectButton } from "./delete-project-button";

export type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  tahun: number;
  status: ProjectStatus;
  is_featured: boolean;
  thumbnailUrl: string;
};

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const addButton = (
    <Button asChild>
      <Link href="/admin/projects/new">
        <Plus size={16} className="mr-1.5" />
        Add project
      </Link>
    </Button>
  );

  const columns: Column<ProjectRow>[] = [
    {
      id: "project",
      header: "Project",
      sortValue: (p) => p.title,
      cell: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={p.thumbnailUrl}
            alt={`${p.title} thumbnail`}
            width={64}
            height={48}
            className="h-12 w-16 shrink-0 rounded-md border border-line bg-surface object-cover object-top"
          />
          <div className="min-w-0 max-w-sm">
            <Link
              href={`/admin/projects/${p.id}/edit`}
              className="line-clamp-1 font-medium text-ink hover:text-brand"
            >
              {p.title}
            </Link>
            <p className="line-clamp-1 text-xs text-ink-soft">{p.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      hideBelow: "md",
      sortValue: (p) => p.category,
      cell: (p) => <span className="text-ink-soft">{categoryLabel(p.category)}</span>,
    },
    {
      id: "year",
      header: "Year",
      hideBelow: "sm",
      sortValue: (p) => p.tahun,
      cell: (p) => <span className="font-mono text-xs text-ink-soft">{p.tahun}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (p) => p.status,
      cell: (p) => <ProjectStatusPill status={p.status} />,
    },
    {
      id: "featured",
      header: "Featured",
      hideBelow: "lg",
      sortValue: (p) => (p.is_featured ? 1 : 0),
      cell: (p) =>
        p.is_featured ? (
          <Star size={15} className="fill-brand text-brand" aria-label="Featured" />
        ) : (
          <span className="text-ink-soft/50" aria-label="Not featured">
            —
          </span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-36 text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <IconLinkButton href={`/projects/${p.slug}`} label={`View ${p.title} on site`} external>
            <ExternalLink size={15} />
          </IconLinkButton>
          <IconLinkButton href={`/admin/projects/${p.id}/edit`} label={`Edit ${p.title}`}>
            <Pencil size={15} />
          </IconLinkButton>
          <DeleteProjectButton id={p.id} slug={p.slug} title={p.title} />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <DataTable
        data={projects}
        columns={columns}
        rowKey={(p) => p.id}
        searchText={(p) =>
          `${p.title} ${p.description} ${p.slug} ${categoryLabel(p.category)} ${p.tahun}`
        }
        searchPlaceholder="Search projects…"
        noun="projects"
        defaultSort={{ id: "year", dir: "desc" }}
        filters={[
          {
            id: "status",
            label: "Status",
            options: Object.entries(PROJECT_STATUS).map(([value, s]) => ({ value, label: s.label })),
            getValue: (p) => p.status,
          },
          {
            id: "category",
            label: "Category",
            options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
            getValue: (p) => p.category,
          },
          {
            id: "featured",
            label: "Featured",
            allLabel: "Featured: any",
            options: [
              { value: "yes", label: "Featured only" },
              { value: "no", label: "Not featured" },
            ],
            getValue: (p) => (p.is_featured ? "yes" : "no"),
          },
        ]}
        toolbarActions={addButton}
        emptyTitle="No projects yet"
        emptyDescription="Create your first case study to show on the portfolio."
        emptyAction={addButton}
      />
    </div>
  );
}
