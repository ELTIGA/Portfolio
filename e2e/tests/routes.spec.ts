import { expect, test } from "@playwright/test";
import { sitemapPaths, watchErrors } from "./helpers";

test.describe("routes @smoke", () => {
  test("every sitemap page renders cleanly", async ({ page, request }) => {
    const paths = await sitemapPaths(request);
    expect(paths).toEqual(expect.arrayContaining(["/", "/resume"]));
    expect(paths.some((p) => p.startsWith("/work/"))).toBeTruthy();

    for (const path of paths) {
      await test.step(path, async () => {
        const errors = watchErrors(page);
        const res = await page.goto(path, { waitUntil: "networkidle" });
        expect(res?.status(), path).toBe(200);
        await expect(page.locator("h1").first(), path).toBeVisible();
        expect(errors, `${path} logged errors`).toEqual([]);
      });
    }
  });

  test("desktop renders without errors", async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto("/desktop", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    // The Projects (Finder) window opens on mount.
    await expect(page.getByRole("group", { name: "Projects" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("unknown routes return 404", async ({ request }) => {
    const res = await request.get("/this-page-does-not-exist");
    expect(res.status()).toBe(404);
  });
});
