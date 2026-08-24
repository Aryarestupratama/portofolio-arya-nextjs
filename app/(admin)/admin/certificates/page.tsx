import { createClient } from "@/lib/supabase/server";
import { getCertificates } from "@/lib/supabase/queries/certificates";
import { CertificatesManager } from "./certificates-manager";

export const metadata = {
  title: "Certificates",
  robots: { index: false, follow: false },
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const certificates = await getCertificates(supabase);

  return (
    <div>
      <p className="font-mono text-xs text-ink-soft">admin</p>
      <h1 className="font-display text-2xl font-medium text-ink">
        Certificates
      </h1>
      <CertificatesManager certificates={certificates} />
    </div>
  );
}