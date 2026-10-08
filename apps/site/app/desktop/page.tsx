import type { Metadata } from "next";
import { Desktop } from "@/components/desktop/Desktop";

export const metadata: Metadata = {
  title: "Desktop",
  description: "Explore Ahmed Eltigani's projects as interactive windows on a desktop.",
  alternates: { canonical: "/desktop" },
};

export default async function DesktopPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { open } = await searchParams;
  return <Desktop initial={open} />;
}
