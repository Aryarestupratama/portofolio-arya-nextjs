import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecruitmentEntryById } from "@/lib/supabase/queries/recruitment";
import { RecruitmentForm } from "../../recruitment-form";
import { ChecklistManager } from "../../checklist-manager";
import { updateRecruitmentAction } from "../../actions";

export const metadata = {
  title: "Edit Lamaran",
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
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs text-ink-soft">admin · private</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Edit Lamaran
      </h1>

      <div className="mt-6 space-y-6">
        <RecruitmentForm
          action={boundUpdateAction}
          submitLabel="Simpan Perubahan"
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

        <ChecklistManager
          entryId={entry.id}
          checklist={entry.document_checklist ?? []}
        />
      </div>
    </div>
  );
}