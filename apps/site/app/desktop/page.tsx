import type { Metadata } from "next";
import { profile } from "@portfolio/content";
import { Desktop } from "@/components/desktop/Desktop";

const description = `Explore ${profile.name}'s projects as interactive windows on a desktop.`;
const title = `Desktop · ${profile.name}`;

export const metadata: Metadata = {
  title: "Desktop",
  description,
  alternates: { canonical: "/desktop" },
  openGraph: { title, description, url: "/desktop", type: "website", siteName: profile.name },
  twitter: { card: "summary_large_image", title, description },
};

export default function DesktopPage() {
  return <Desktop />;
}
