import { MetadataRoute } from "next";

// Next.js App Router: file ini otomatis jadi /robots.txt, tidak perlu
// bikin file statis manual di /public.
// /admin/* sudah dikasih `noindex` per-halaman (Architecture.md §2.1),
// ini lapisan tambahan supaya crawler bahkan tidak coba crawl sama sekali.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}