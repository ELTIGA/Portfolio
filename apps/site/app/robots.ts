import type { MetadataRoute } from "next";
import { profile } from "@portfolio/content";

// AI crawlers are named so the policy is explicit rather than assumed. All are allowed, the
// training crawlers included: a portfolio gains from being known to models. To opt out of
// training only, move the "training" group to `disallow: "/"`; search and user-triggered
// fetches (what gets the site cited in answers) are separate groups and stay allowed.
//
// A named group does not inherit from "*", so each one repeats the disallow list.
const disallow = ["/experience/", "/md/"];

const aiCrawlers = {
  search: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Applebot", "DuckAssistBot"],
  user: ["ChatGPT-User", "Claude-User", "Perplexity-User", "MistralAI-User"],
  training: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"],
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...Object.values(aiCrawlers).map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${profile.siteUrl}/sitemap.xml`,
  };
}
