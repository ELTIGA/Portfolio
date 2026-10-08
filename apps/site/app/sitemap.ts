import type { MetadataRoute } from "next";
import { profile, projects } from "@portfolio/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: profile.siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${profile.siteUrl}/resume`, changeFrequency: "monthly", priority: 0.6 },
    ...projects.map((p) => ({ url: `${profile.siteUrl}/work/${p.slug}`, changeFrequency: "monthly" as const, priority: p.featured ? 0.8 : 0.5 })),
  ];
}
