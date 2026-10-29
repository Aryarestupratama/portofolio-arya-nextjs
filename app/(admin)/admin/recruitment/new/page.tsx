import { PageHeader } from "@/components/admin/page-header";
import { RecruitmentForm } from "../recruitment-form";
import { createRecruitmentAction } from "../actions";

export const metadata = {
  title: "New application",
  robots: { index: false, follow: false },
};

export default function NewRecruitmentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        back={{ href: "/admin/recruitment", label: "Recruitment Tracker" }}
        eyebrow="admin · private"
        title="New application"
        description="Track an internship or job you want to apply for."
      />
      <RecruitmentForm
        action={createRecruitmentAction}
        submitLabel="Save application"
        showChecklistInput
      />
    </div>
  );
}
