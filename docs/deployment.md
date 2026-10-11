# Deployment

The site is hosted on Vercel and deployed only by GitHub Actions (`.github/workflows/ci.yml`): previews for pull requests from this repository, production for pushes to `main`. Vercel's Git integration is turned off in `apps/site/vercel.json`, so nothing reaches Vercel without passing CI.

This guide covers the one-time setup, for example when running your own fork.

## 1. Vercel project

Import the repository on Vercel and set **Root Directory** to `apps/site`, keeping "Include files outside the root directory" enabled. `apps/site/vercel.json` sets the framework, runs the install and build from the repository root (the 3D intro, then the site) and disables Git deployments.

Locally, run `npx vercel link` and note `orgId` and `projectId` from `.vercel/project.json`.

## 2. Deployment Protection

In the Vercel project, open **Settings → Deployment Protection** and enable **Protection Bypass for Automation**. Smoke tests and Lighthouse use it to reach protected preview deployments.

## 3. GitHub secrets

Under **Settings → Secrets and variables → Actions**, add:

| Secret                            | Value                                               |
| --------------------------------- | --------------------------------------------------- |
| `VERCEL_TOKEN`                    | A Vercel account token scoped to the project's team |
| `VERCEL_ORG_ID`                   | `orgId` from `.vercel/project.json`                 |
| `VERCEL_PROJECT_ID`               | `projectId` from `.vercel/project.json`             |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | The bypass secret from step 2                       |

Until they exist, preview deploys are skipped with a warning and production deploys fail.

## 4. Environments

The `preview` and `production` environments are created on first use (**Settings → Environments**). Optionally restrict `production` to the `main` branch.

## 5. Domain

Add `www.ahmedeltigani.com` as the primary domain and `ahmedeltigani.com` as a 308 redirect to it, then point DNS at Vercel.

`siteUrl` in `packages/content/src/profile.ts` must name the same host: canonical URLs, the sitemap and `robots.txt` are all built from it, and a mismatch makes Google Search Console report "Redirect error". Once the domain is final, consider adding `preload` to the HSTS header in `apps/site/next.config.ts`.

## 6. Search engines

- **Google:** add a Domain property in Google Search Console and submit `/sitemap.xml`.
- **Bing and Yandex:** set `BING_SITE_VERIFICATION` and `YANDEX_VERIFICATION` (and optionally `GOOGLE_SITE_VERIFICATION`) as Vercel production environment variables. Each one renders as a verification meta tag; unset ones render nothing.
- **IndexNow:** after every production deploy, the `notify-search-engines` job runs `scripts/indexnow.mjs`, which submits the live sitemap. The key file in `apps/site/public` must match the key the script sends.

## 7. Branch protection

Protect `main`: require pull requests and the checks `check`, `e2e`, `analyze` (CodeQL), `gitleaks` and `dependency-review`.

## Analytics

Vercel Web Analytics mounts automatically in Vercel builds (`vercel build` sets `VERCEL=1`) and is skipped everywhere else. Vercel's Hobby plan covers personal, non-commercial sites; commercial use needs a Pro plan.
