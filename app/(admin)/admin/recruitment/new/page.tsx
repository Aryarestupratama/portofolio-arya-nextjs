import { RecruitmentForm } from "../recruitment-form";
import { createRecruitmentAction } from "../actions";

export const metadata = {
  title: "Tambah Lamaran",
  robots: { index: false, follow: false },
};

export default function NewRecruitmentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs text-ink-soft">admin · private</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Tambah Lamaran
      </h1>
      <div className="mt-6">
        <RecruitmentForm
          action={createRecruitmentAction}
          submitLabel="Simpan"
          showChecklistInput
        />
      </div>
    </div>
  );
}