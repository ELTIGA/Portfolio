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
```

CI (`.github/workflows/ci.yml`) runs audit, lint, typecheck and build on every push and pull request.

## Content rules

`packages/content/src` holds only facts the owner confirmed or the project READMEs state. `TODO(owner)` marks items awaiting confirmation (company-name permissions, CEH verification link). Don't add claims that aren't backed.

## Dependency audit

CI runs `npm audit --omit=dev --audit-level=moderate`, i.e. everything that ships. The full audit currently reports `braces` (GHSA-vfj7-8cjw-p6xm, ReDoS) pulled in only via `eslint-config-next → fast-glob → micromatch`: lint tooling that never reaches the build output and has no patched release. Re-check when `eslint-config-next` updates.

## Credits and licenses

The 3D intro engine is based on [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) (MIT, © 2024 Henry Heffernan). Only code ideas and structure are reused; the room is rebuilt procedurally and no assets were copied. See `apps/shell/LICENSE-THIRD-PARTY.md` (also served at `/experience/licenses.txt`).

## Deploy

Vercel project rooted at the repo; build command `npm run build`, output `apps/site/.next`. Point `ahmedeltigani.com` at it. Vercel Analytics mounts automatically on Vercel only.
