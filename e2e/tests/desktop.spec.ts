import { projects } from "@portfolio/content";
import { expect, test } from "@playwright/test";

test.describe("desktop", () => {
  test("?open=<slug> opens that project's window", async ({ page }) => {
    const project = projects.find((p) => p.featured) ?? projects[0];
    await page.goto(`/desktop?open=${project.slug}`);
    const win = page.getByRole("group", { name: project.name, exact: true });
    await expect(win).toBeVisible();
    await win.getByRole("button", { name: `Close ${project.name}` }).click();
    await expect(win).toBeHidden();
  });

  test("narrow screens get a link back to the portfolio", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/desktop");
    await expect(page.getByRole("heading", { name: "Best on a larger screen" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to the portfolio" })).toHaveAttribute("href", "/");
  });
});
