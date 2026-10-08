import { expect, test } from "@playwright/test";

// Mirrors apps/site/next.config.ts: a regression here means the hardening didn't ship.
test.describe("security headers @smoke", () => {
  for (const path of ["/", "/desktop", "/experience/index.html"]) {
    test(path, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const h = res.headers();
      expect(h["content-security-policy"]).toContain("default-src 'self'");
      expect(h["content-security-policy"]).toContain("object-src 'none'");
      expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
      expect(h["strict-transport-security"]).toContain("max-age=63072000");
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["x-frame-options"]).toBe("SAMEORIGIN");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toContain("camera=()");
      expect(h["x-powered-by"]).toBeUndefined();
    });
  }
});
