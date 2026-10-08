import type { Metadata } from "next";
import { Desktop } from "@/components/desktop/Desktop";

export const metadata: Metadata = {
  title: "Desktop",
  description: "Explore Ahmed Eltigani's projects as interactive windows on a desktop.",
  alternates: { canonical: "/desktop" },
};

export default function DesktopPage() {
  return <Desktop />;
}
