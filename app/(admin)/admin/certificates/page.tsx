import { createClient } from "@/lib/supabase/server";
import { getCertificates } from "@/lib/supabase/queries/certificates";
import { getCertificateUrl } from "@/lib/supabase/storage";
import { PageHeader } from "@/components/admin/page-header";
import { CertificatesManager } from "./certificates-manager";

export const metadata = {
  title: "Certificates",
  robots: { index: false, follow: false },
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const certificates = await getCertificates(supabase);

  const certificatesWithUrls = certificates.map((cert) => ({
    ...cert,
    certificate_display_url: getCertificateUrl(supabase, cert.certificate_url),
  }));

  return (
    <div>
      <PageHeader
        title="Certificates"
        description={`${certificates.length} certificates. Shown on the public Certificates section.`}
      />
      <CertificatesManager certificates={certificatesWithUrls} />
    </div>
  );
}