"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  Zap,
  Award,
  FileText,
  Briefcase,
  ExternalLink,
  User,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

const NAV_GROUPS = [
  { 
    title: "Overview", 
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
      { label: "Profile", href: "/admin/profile", icon: User },
    ] 
  },
  {
    title: "Portfolio",
    items: [
      { label: "Projects", href: "/admin/projects", icon: Folder },
      { label: "Skills", href: "/admin/skills", icon: Zap },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
      { label: "Experience", href: "/admin/experience", icon: Briefcase },
    ],
  },
  {
    title: "Internal",
    items: [
      { label: "Recruitment Tracker", href: "/admin/recruitment", icon: FileText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between border-r border-line bg-surface">
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <p className="mb-1 font-display text-lg font-medium text-ink">Arya Restu Pratama</p>
        <p className="mb-8 font-mono text-[11px] text-ink-soft">admin panel</p>

        <nav className="flex-1 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft/70">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-surface text-ink"
                          : "text-ink-soft hover:bg-surface/60 hover:text-ink"
                      }`}
                    >
                      <item.icon size={16} strokeWidth={1.75} className="shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-1 px-3 pb-6">
        <div className="mb-2 border-t border-line pt-4 px-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            <ExternalLink size={16} strokeWidth={1.75} className="shrink-0" />
            View live site
          </a>
        </div>
        <div className="px-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}