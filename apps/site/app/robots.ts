import type { MetadataRoute } from "next";
import { profile } from "@portfolio/content";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/experience/"] }, sitemap: `${profile.siteUrl}/sitemap.xml` };
}
