import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Next.js App Router: file ini otomatis jadi /sitemap.xml.
// Route yang SENGAJA tidak dimasukkan (sesuai keputusan project):
// - /skills, /certificates → sudah tidak ada halaman standalone, cuma
//   section di Home (lihat diskusi penghapusan halaman ini)
// - /admin/* → private, di-block juga di robots.ts
// - /login → tidak perlu diindex
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";
  const supabase = await createClient();

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
    console.error("sitemap: gagal fetch projects", error.message);
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