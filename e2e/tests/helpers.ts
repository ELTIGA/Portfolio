import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Every page path listed in the sitemap, so new case studies are covered automatically. */
export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(urls.length).toBeGreaterThan(0);
  return urls;
}

/** Collects console errors, uncaught exceptions and CSP violations for the page's lifetime. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`CSP violation: ${e.violatedDirective} blocked ${e.blockedURI}`);
    });
  });
  return errors;
}
