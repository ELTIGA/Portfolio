import { ImageResponse } from "next/og";
import { getProject, profile, projects } from "@portfolio/content";

export const alt = `Case study by ${profile.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Per-project share card, so each case study previews as itself rather than the home page. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const name = project?.name ?? profile.name;
  const tagline = project?.tagline ?? "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#05070a", color: "#e8edf2", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", color: "#ffb547", fontSize: 28 }}>ELTIGA / CASE FILE</div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>{name}</div>
        <div style={{ display: "flex", fontSize: 36, color: "#8d9aa8", marginTop: 28, lineHeight: 1.3, maxWidth: 1000 }}>{tagline}</div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: "#ffb547" }}>
          {profile.name} · ahmedeltigani.com
        </div>
      </div>
    ),
    size,
  );
}
