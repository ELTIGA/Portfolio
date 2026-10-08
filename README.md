# Portfolio

Portfolio site for Ahmed Eltigani. Monorepo:

- `apps/site`: Next.js (App Router) + Tailwind. Recruiter-first page, case studies, security headers.
- `packages/content`: typed single source of truth for the profile and projects.

Planned (see the implementation plan): a macOS-style `/desktop` with interactive project previews, and a 3D intro shell.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Content marked `TODO(owner)` in `packages/content/src` needs real input; nothing is invented.

## Dependency audit

CI runs `npm audit --omit=dev --audit-level=moderate`, i.e. everything that ships. The full audit currently reports `braces` (GHSA-vfj7-8cjw-p6xm, ReDoS) pulled in only via `eslint-config-next → fast-glob → micromatch`, which is lint tooling that never reaches the build output and has no patched release. Re-check with `npm audit` when `eslint-config-next` updates.
