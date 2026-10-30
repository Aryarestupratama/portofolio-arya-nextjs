import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/static";

// Next.js App Router: file ini otomatis jadi /sitemap.xml.
// Route yang SENGAJA tidak dimasukkan (sesuai keputusan project):
// - /skills, /certificates → sudah tidak ada halaman standalone, cuma
//   section di Home (lihat diskusi penghapusan halaman ini)
// - /admin/* → private, di-block juga di robots.ts
// - /login → tidak perlu diindex
// ISR: tanpa ini sitemap hanya dibuat saat build dan project baru
// tidak muncul sampai redeploy. Juga di-revalidate dari admin.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";
  const supabase = createStaticClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/experience`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const { data: projects, error } = await supabase
    .from("projects")
    .select("slug, updated_at");

  if (error) {
    // Kalau query gagal, tetap kembalikan static routes daripada bikin
    // seluruh /sitemap.xml error 500 — mending sitemap parsial daripada
    // tidak ada sama sekali.
    console.error("sitemap: failed to fetch projects", error.message);
    return staticRoutes;
  }

  const projectRoutes: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}