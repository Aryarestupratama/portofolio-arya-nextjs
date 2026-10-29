import { createClient } from "@/lib/supabase/server";
import { getRecruitmentEntries } from "@/lib/supabase/queries/recruitment";
import { PageHeader } from "@/components/admin/page-header";
import { RecruitmentTable, type RecruitmentRow } from "./recruitment-table";

// PRIVATE — noindex, dan tidak pernah ada link dari halaman publik ke sini
// (Architecture.md §4). Route ini juga sudah diproteksi middleware.
export const metadata = {
  title: "Recruitment Tracker",
  robots: { index: false, follow: false },
};

export default async function RecruitmentPage() {
  const supabase = await createClient();
  const entries = await getRecruitmentEntries(supabase);

  const rows: RecruitmentRow[] = entries.map((e) => ({
    id: e.id,
    type: e.type,
    company_name: e.company_name,
    position: e.position,
    deadline_date: e.deadline_date,
    deadline_note: e.deadline_note,
    status: e.status,
  }));

  const active = rows.filter((r) => ["applied", "on_process"].includes(r.status)).length;

  return (
    <div>
      <PageHeader
        eyebrow="admin · private"
        title="Recruitment Tracker"
        description={`${rows.length} applications · ${active} in progress.`}
      />
      <RecruitmentTable entries={rows} />
    </div>
  );
}
