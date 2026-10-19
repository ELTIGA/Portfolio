import { profile, projects } from "@portfolio/content";
import { expect, test } from "@playwright/test";
import { sitemapPaths } from "./helpers";

test.describe("seo @smoke", () => {
  test("robots.txt keeps the 3D shell out of indexes", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/Disallow: \/experience\//);
    expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test("robots.txt names the AI crawlers and keeps them out of the 3D shell", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "GPTBot", "ClaudeBot"]) {
      const group = body.split(/\n\s*\n/).find((g) => g.includes(`User-Agent: ${bot}`));
      expect(group, bot).toMatch(/Disallow: \/experience\//);
    }
  });

  test("llms.txt and llms-full.txt index every project", async ({ request }) => {
    for (const path of ["/llms.txt", "/llms-full.txt"]) {
      const res = await request.get(path);
      expect(res.ok(), path).toBeTruthy();
      expect(res.headers()["content-type"]).toContain("text/markdown");
      const body = await res.text();
      expect(body).toContain(`# ${profile.name}`);
      for (const p of projects) expect(body, `${path} ${p.slug}`).toContain(p.name);
    }
  });

  test("every page has a Markdown twin with a canonical back to the HTML", async ({ request }) => {
    const pages = ["/", "/resume", ...projects.map((p) => `/work/${p.slug}`)];
    for (const path of pages) {
      const html = await request.get(path);
      const md = path === "/" ? "/index.md" : `${path}.md`;
      expect(html.headers()["link"], path).toContain(`<${md}>; rel="alternate"; type="text/markdown"`);
      const res = await request.get(md);
      expect(res.status(), md).toBe(200);
      expect(res.headers()["content-type"]).toContain("text/markdown");
      expect(res.headers()["link"]).toMatch(/rel="canonical"/);
      expect(await res.text()).toMatch(/^# /);
    }
  });

  test("case studies carry Article and Person structured data", async ({ page }) => {
    const p = projects[0];
    await page.goto(`/work/${p.slug}`);
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const types = (JSON.parse(raw ?? "{}")["@graph"] as { "@type": string }[]).map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Article", "Person", "BreadcrumbList"]));
    await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
      "href",
      new RegExp(`/work/${p.slug}\\.md$`),
    );
  });

  test("sitemap lists every project", async ({ request }) => {
    const paths = await sitemapPaths(request);
    for (const p of projects) expect(paths).toContain(`/work/${p.slug}`);
  });

  test("open graph image is a PNG", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("home page has canonical and social metadata", async ({ page }) => {
    await page.goto("/");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical?.replace(/\/$/, "")).toBe(profile.siteUrl);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
  });
});
