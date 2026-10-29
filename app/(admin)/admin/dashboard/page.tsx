import Link from "next/link";
import { Folder, Zap, Award, Briefcase, FileText } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const SHORTCUTS = [
  { label: "Projects", href: "/admin/projects", icon: Folder },
  { label: "Skills", href: "/admin/skills", icon: Zap },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Recruitment Tracker", href: "/admin/recruitment", icon: FileText },
];

export default function DashboardPage() {
  return (
    <div>
      <p className="font-mono text-xs text-ink-soft">admin</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Dashboard
      </h1>
      <p className="mt-2 text-ink-soft">
        Semua konten portfolio dikelola dari sini. Pilih salah satu bagian
        di bawah untuk mulai.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-line bg-paper p-5 transition-colors hover:bg-surface/60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink">
              <item.icon size={18} strokeWidth={1.75} />
            </span>
            <span className="font-medium text-ink">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}