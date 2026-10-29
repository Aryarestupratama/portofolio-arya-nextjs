import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecruitmentEntryById } from "@/lib/supabase/queries/recruitment";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { RecruitmentForm } from "../../recruitment-form";
import { ChecklistManager } from "../../checklist-manager";
import { RecruitmentStatusBadge } from "../../status-badge";
import { DeadlineLabel } from "../../deadline-label";
import { updateRecruitmentAction } from "../../actions";

export const metadata = {
  title: "Edit application",
  robots: { index: false, follow: false },
};

export default async function EditRecruitmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entryId = Number(id);
  if (Number.isNaN(entryId)) notFound();

  const supabase = await createClient();

  let entry;
  try {
    entry = await getRecruitmentEntryById(supabase, entryId);
  } catch {
    notFound();
  }
  if (!entry) notFound();

  const boundUpdateAction = updateRecruitmentAction.bind(null, entry.id);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/recruitment", label: "Recruitment Tracker" }}
        eyebrow="admin · private"
        title={entry.company_name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {entry.position}
            <RecruitmentStatusBadge status={entry.status} />
          </span>
        }
        actions={
          entry.application_link ? (
            <Button asChild variant="outline">
              <a href={entry.application_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={15} className="mr-1.5" />
                Open posting
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <RecruitmentForm
          isEdit
          action={boundUpdateAction}
          submitLabel="Save changes"
          defaults={{
            type: entry.type,
            company_name: entry.company_name,
            position: entry.position,
            application_link: entry.application_link,
            requirements: entry.requirements,
            description: entry.description,
            deadline_date: entry.deadline_date,
            deadline_note: entry.deadline_note,
            applying_date: entry.applying_date,
            status: entry.status,
            to_learn: entry.to_learn,
            notes: entry.notes,
          }}
        />

        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="rounded-xl border border-line bg-paper p-5">
            <h2 className="font-medium text-ink">Deadline</h2>
            <div className="mt-3">
              <DeadlineLabel date={entry.deadline_date} note={entry.deadline_note} />
            </div>
          </section>
          <ChecklistManager entryId={entry.id} checklist={entry.document_checklist ?? []} />
        </aside>
      </div>
    </div>
  );
}
