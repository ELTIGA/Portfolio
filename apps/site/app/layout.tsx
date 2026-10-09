import type { Metadata, Viewport } from "next";
import { profile } from "@portfolio/content";
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import "./globals.css";

// Self-hosted at build time by next/font, so the CSP's font-src 'self' holds.
const display = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-shoulders",
  display: "swap",
  // next/font has no metrics for this family; fall back to a narrow system face instead.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
});
const sans = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-plex-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

const title = `${profile.name}: DevSecOps & AI-enabled full-stack engineer`;
const description =
  "Software engineer and Certified Ethical Hacker. Case studies of Express Ops, Viya and Gravel with interactive previews, architecture and how each one is secured and shipped.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  openGraph: { title, description, type: "website", url: "/", siteName: profile.name },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#05070a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <AnalyticsEvents analytics={Boolean(process.env.VERCEL)} />
      </body>
    </html>
  );
}
