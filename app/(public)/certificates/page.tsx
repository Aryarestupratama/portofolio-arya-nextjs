import { createClient } from "@/lib/supabase/server";
import { getPublicCertificates } from "@/lib/supabase/queries/public";
import { Container } from "@/components/public/Container";
import { FadeIn } from "@/components/public/FadeIn";
import { EmptyState } from "@/components/public/EmptyState";

export const revalidate = 3600;

export const metadata = {
  title: "Certificates",
  description: "Daftar sertifikat dan pencapaian.",
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const certificates = await getPublicCertificates(supabase);

  return (
    <section className="py-16">
      <Container>
        <FadeIn>
          <p className="inline-block rounded-md bg-[var(--butter-cream)] px-2 py-1 font-mono text-xs text-ink">
            certificates
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">
            Certificates
          </h1>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.length === 0 && (
            <div className="col-span-full">
              <EmptyState message="Belum ada sertifikat ditambahkan." />
            </div>
          )}
          {certificates.map((cert) => (
            <FadeIn key={cert.id}>
              <a
                href={cert.certificate_url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-line bg-white p-5 transition-colors hover:border-[var(--ink)]"
              >
                <p className="font-mono text-xs text-ink-soft">
                  {cert.year_start}
                  {cert.year_end ? ` – ${cert.year_end}` : ""}
                </p>
                <p className="mt-1 font-display text-lg font-medium text-ink">
                  {cert.title}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{cert.issuer}</p>
                <p className="mt-3 font-mono text-xs text-[var(--cobalt)]">
                  Lihat sertifikat →
                </p>
              </a>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
