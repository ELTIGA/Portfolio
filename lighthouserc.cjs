// Lighthouse CI. With BASE_URL set it audits a deployed site (the Vercel preview in CI);
// otherwise it starts the already-built site locally with `next start`.
const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

module.exports = {
  ci: {
    collect: {
      url: ["/", "/work/express-ops", "/resume"].map((p) => base + p),
      numberOfRuns: 3,
      ...(process.env.BASE_URL
        ? {}
        : { startServerCommand: "npm run start -w @portfolio/site", startServerReadyPattern: "Ready", startServerReadyTimeout: 60000 }),
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --headless=new",
        // Vercel serves preview URLs with `X-Robots-Tag: noindex`, so crawlability is only
        // meaningful against a local build or production.
        ...(process.env.BASE_URL ? { skipAudits: ["is-crawlable"] } : {}),
        ...(bypass ? { extraHeaders: JSON.stringify({ "x-vercel-protection-bypass": bypass, "x-vercel-skip-toolbar": "1" }) } : {}),
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        // Warn only: preview cold starts and shared runners make perf scores noisy.
        "categories:performance": ["warn", { minScore: 0.85 }],
      },
    },
    // Reports stay in the workflow (uploaded as an artifact), never on public temporary storage.
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" },
  },
};
