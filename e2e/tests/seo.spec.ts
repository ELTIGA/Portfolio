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
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`^${profile.siteUrl}/?$`));
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
  });
});
