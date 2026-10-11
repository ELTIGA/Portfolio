# Security policy

This repository is the source of [ahmedeltigani.com](https://www.ahmedeltigani.com). If you find a security issue in the site, its deployments or this repository, I want to hear about it.

## Reporting a vulnerability

Please report privately, not in a public issue or pull request.

- **Email:** [Eltiga@protonmail.com](mailto:Eltiga@protonmail.com), with a subject starting with `Security:`

Include what you found, where (URL or file and line), steps to reproduce and the impact you expect. A proof of concept helps, but keep it minimal.

I'll acknowledge your report as soon as I can, normally within a week, keep you updated while I work on a fix, and credit you once it ships if you'd like.

## Scope

In scope:

- The production site and its Vercel preview deployments
- The code in this repository, including the 3D intro in `apps/shell`
- The GitHub Actions workflows and deployment pipeline

Out of scope:

- Denial-of-service or load testing, spam and social engineering
- Vulnerabilities in third-party services (Vercel, GitHub) that are not caused by this project's configuration; please report those to the vendor
- Automated scanner output without a demonstrated impact

## Supported versions

Only the current `main` branch, which is what runs in production, receives fixes.

## Safe harbor

Good-faith research that follows this policy is welcome, and I won't pursue legal action over it. Avoid accessing data that isn't yours, degrading the service or disrupting other visitors, and give me reasonable time to fix an issue before you disclose it publicly.
