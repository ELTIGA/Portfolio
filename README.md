# Portfolio

Portfolio for Ahmed Eltigani (ahmedeltigani.com), built to get one thing done: an email from a hiring manager.

## What's in it

- `/` — fast, server-rendered recruiter page: hero, proof, selected work, experience and credentials, security and delivery, toolbox, about, contact.
- `/work/[slug]` — a case study per project: problem, what it does, an **interactive preview** on invented sample data, architecture diagram, engineering decisions, how it's secured and shipped.
- `/desktop` — a macOS-style desktop (draggable windows, dock, terminal, mail, about) where every project opens as an interactive window.
- `/resume` — printable, ATS-friendly résumé generated from the same content.
- Optional 3D intro (`apps/shell`), shown only on capable desktop clients, always skippable; the plain page stays in the DOM underneath.

## Layout

| Path | What |
| --- | --- |
| `apps/site` | Next.js (App Router) + Tailwind. Pages, desktop, demos, diagrams |
| `apps/shell` | Standalone Vite + three.js 3D intro (not an npm workspace). Built into `apps/site/public/experience` |
| `packages/content` | Typed single source of truth for profile and projects |
| `scripts/build-shell.mjs` | Builds the shell and copies it (and its licenses) into the site |

Interactive demos live in `apps/site/components/demos/<slug>/`. Each is client-only, self-contained, lazy-loaded and uses invented data, following the contract documented in `components/demos/registry.tsx`.

## Develop

```bash
npm install
npm run dev                 # site on http://localhost:3000 (3D intro needs `npm run build:shell` once)
npm run lint && npm run typecheck
npm run build               # shell + site
npm run audit:ci
npm run test:e2e            # Playwright + axe against `next start` (run `npx playwright install chromium` once)
npm run lhci                # Lighthouse CI budgets against `next start`
```

E2E specs live in `e2e/tests` and read their route list from `/sitemap.xml`, so a new case study is covered automatically. Specs tagged `@smoke` are the subset that also runs against deployed URLs (`BASE_URL=https://… npm run test:smoke`).

## Content rules

`packages/content/src` holds only facts the owner confirmed or the project READMEs state. `TODO(owner)` marks items awaiting confirmation (company-name permissions, CEH verification link). Don't add claims that aren't backed.

## Dependency audit

CI runs `npm audit --omit=dev --audit-level=moderate`, i.e. everything that ships. The full audit currently reports `braces` (GHSA-vfj7-8cjw-p6xm, ReDoS) pulled in only via `eslint-config-next → fast-glob → micromatch`: lint tooling that never reaches the build output and has no patched release. Re-check when `eslint-config-next` updates.

## Credits and licenses

The 3D intro engine is based on [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) (MIT, © 2024 Henry Heffernan). Only code ideas and structure are reused; the room is rebuilt procedurally and no assets were copied. See `apps/shell/LICENSE-THIRD-PARTY.md` (also served at `/experience/licenses.txt`).

## CI/CD

Hosting is Vercel. GitHub Actions is the only path to a deployment: the Vercel Git integration is off (`apps/site/vercel.json`), so nothing ships unless every gate passes.

```
PR / push to main ─► check ─► e2e ───────────────────────────────┐
  audit, lint,        Playwright + axe                            │
  typecheck, build    vs `next start`                             │
PR (same repo) ─► deploy-preview ─► verify-preview                │
                  vercel build +    @smoke + Lighthouse CI        │
                  deploy --prebuilt vs preview URL; PR comment    │
push to main ─────────────────────────────────────────────────────┴─► deploy-production ─► verify-production
                                                                         --prod, serialized    @smoke vs the new deployment
```

| Workflow | Runs on | What |
| --- | --- | --- |
| `ci.yml` | PRs, pushes to `main` | Gates, preview/production deploys, post-deploy smoke tests, Lighthouse budgets (a11y, SEO ≥ 95 and best practices ≥ 90 block; perf ≥ 85 warns) |
| `codeql.yml` | PRs, `main`, weekly | CodeQL `security-extended` for JS/TS |
| `security.yml` | PRs, `main`, weekly | gitleaks over full history (checksum-pinned CLI); dependency review blocking moderate+ runtime advisories |
| `dependabot.yml` | weekly | npm (root and `apps/shell`) and GitHub Actions, grouped; `next`/`react` move together |

Every third-party action is pinned to a commit SHA, `GITHUB_TOKEN` defaults to read-only, and only the PR-comment and CodeQL jobs get write scopes. Fork and Dependabot PRs run the gates but never receive deploy secrets.

### One-time setup

1. **Default branch.** The workflows deploy from `main`. Create `main` from the current default branch and make it the repo default (Settings → General).
2. **Vercel project.** Import the repo on Vercel, set **Root Directory** to `apps/site` and keep "Include files outside the root directory" on. `apps/site/vercel.json` sets the framework, the install and build commands (the shell plus the site, from the repo root) and turns off Git deployments. Locally, run `npx vercel link` and copy `orgId`/`projectId` from `.vercel/project.json`.
3. **Deployment Protection.** In the Vercel project → Settings → Deployment Protection, enable **Protection Bypass for Automation**. Smoke tests and Lighthouse use it to reach protected previews.
4. **GitHub secrets** (Settings → Secrets and variables → Actions): `VERCEL_TOKEN` (an account token scoped to this project's team), `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` and `VERCEL_AUTOMATION_BYPASS_SECRET`. Until they exist, preview deploys are skipped with a warning and production deploys fail loudly.
5. **Environments** (Settings → Environments): `preview` and `production` are created on first use. Optionally restrict `production` to the `main` branch.
6. **Domain.** Add `ahmedeltigani.com` (and `www`) to the Vercel project and point DNS at it. Once the domain is final, consider adding `preload` to HSTS in `next.config.ts`.
7. **Branch protection on `main`.** Require the checks `check`, `e2e`, `analyze` (CodeQL), `gitleaks` and `dependency-review`, and require PRs before merging.

Vercel Analytics mounts automatically in Vercel builds (`vercel build` sets `VERCEL=1`). Hobby is free for a personal, non-commercial site; if the site ever earns money, move to Pro.
