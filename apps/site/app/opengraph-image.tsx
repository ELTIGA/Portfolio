import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { profile } from "@portfolio/content";

export const alt = `${profile.name}: DevSecOps & AI-enabled full-stack engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const file = await readFile(path.join(process.cwd(), "app/og-portrait.jpg"));
  const src = `data:image/jpeg;base64,${file.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#05070a", color: "#e8edf2", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, flex: 1 }}>
          <div style={{ display: "flex", color: "#ffb547", fontSize: 28 }}>ELTIGA.</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>{profile.name}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#8d9aa8", marginTop: 24, lineHeight: 1.3 }}>
            DevSecOps & AI-enabled full-stack engineer
          </div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 26, color: "#ffb547" }}>ahmedeltigani.com</div>
        </div>
        <img src={src} alt="" width={504} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
