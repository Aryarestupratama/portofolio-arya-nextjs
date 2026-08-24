import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { getProjectBySlug } from "@/lib/supabase/queries/public";

export const runtime = "edge";

// Architecture.md §2.2: dynamic OG image generation via @vercel/og
// (Next.js built-in next/og). Dipanggil dari generateMetadata() di
// app/(public)/projects/[slug]/page.tsx.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const supabase = await createClient();
  let project;
  try {
    project = await getProjectBySlug(supabase, slug);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F7F4EC", // cream
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: "monospace",
            color: "#8A8578", // ink-soft
          }}
        >
          {project.category} · {project.tahun}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#1C1B18", // ink
            marginTop: 24,
            lineHeight: 1.1,
          }}
        >
          {project.title}
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#8A8578",
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          {project.description}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
