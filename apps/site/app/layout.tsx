import type { Metadata, Viewport } from "next";
import { profile } from "@portfolio/content";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import "./globals.css";

const title = `${profile.name}: DevSecOps & AI-enabled full-stack engineer`;
const description =
  "I build and secure production software end to end. Express Ops, Viya and Gravel: case studies, interactive previews and how each one is shipped and secured.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  openGraph: { title, description, type: "website", url: "/", siteName: profile.name },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0b0e11", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-dvh antialiased">
        {children}
        <AnalyticsEvents analytics={Boolean(process.env.VERCEL)} />
      </body>
    </html>
  );
}
