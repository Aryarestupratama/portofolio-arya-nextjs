import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRecruitmentEntries } from "@/lib/supabase/queries/recruitment";
import { Button } from "@/components/ui/button";
import { RecruitmentStatusBadge } from "./status-badge";
import { DeadlineLabel } from "./deadline-label";
import { DeleteRecruitmentButton } from "./delete-button";

// PRIVATE — noindex, dan tidak pernah ada link dari halaman publik ke sini
// (Architecture.md §4). Route ini juga sudah diproteksi middleware.ts.
export const metadata = {
  title: "Recruitment Tracker",
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = {
  internship: "Internship",
  job: "Job",
};

export default async function RecruitmentPage() {
  const supabase = await createClient();
  const entries = await getRecruitmentEntries(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-ink-soft">admin · private</p>
          <h1 className="font-display text-2xl font-medium text-ink">
            Recruitment Tracker
          </h1>
        </div>
        <Link href="/admin/recruitment/new">
          <Button>+ Tambah Lamaran</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-clean-white text-left text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-medium">Perusahaan</th>
              <th className="px-4 py-2 font-medium">Posisi</th>
              <th className="px-4 py-2 font-medium">Tipe</th>
              <th className="px-4 py-2 font-medium">Deadline</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  Belum ada lamaran ditrack. Klik &ldquo;+ Tambah Lamaran&rdquo; untuk mulai.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-t border-line align-top transition-colors hover:bg-clean-white/60"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  {entry.company_name}
                </td>
                <td className="px-4 py-3 text-ink-soft">{entry.position}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {TYPE_LABEL[entry.type]}
                </td>
                <td className="px-4 py-3">
                  <DeadlineLabel
                    date={entry.deadline_date}
                    note={entry.deadline_note}
                  />
                </td>
                <td className="px-4 py-3">
                  <RecruitmentStatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/recruitment/${entry.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <DeleteRecruitmentButton
                      id={entry.id}
                      label={`${entry.company_name} — ${entry.position}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}