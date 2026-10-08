import AxeBuilder from "@axe-core/playwright";
import { projects } from "@portfolio/content";
import { expect, test } from "@playwright/test";

const featured = projects.find((p) => p.featured) ?? projects[0];
const pages = ["/", `/work/${featured.slug}`, "/resume", "/desktop"];

test.describe("accessibility", () => {
  for (const path of pages) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        blocking.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}x) ${v.nodes[0]?.target.join(" ")}`),
      ).toEqual([]);
    });
  }
});
