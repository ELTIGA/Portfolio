import type { Project } from "./types";

// One entry per project: home page reel, case study, desktop window and résumé.
// Every claim is first-hand or documented in the project's own repository.
//
// The text in this file is © Ahmed Eltigani, all rights reserved. It is not covered by the
// MIT license that applies to the code (see "License" in the README).
export const projects: Project[] = [
  {
    slug: "express-ops",
    name: "Express Ops",
    tagline:
      "Operations platform that turns manifest photos into driver lists, double-booking checks and customer documents.",
    order: 1,
    featured: true,
    role: "Sole developer",
    status: "In daily use by the operations team",
    summary:
      "I built a role-based web app that reads the photographed manifests, reconciles each one against the totals printed on the page, flags double bookings, and produces the finished driver lists and customer documents.",
    problem:
      "Tour-transfer teams were rebuilding daily driver lists and customer documents by hand from photographed manifests, against a departure clock. A miscount or a double booking has to be caught before a vehicle leaves, not after.",
    outcome: "In daily use by the operations team. I estimate it saves them roughly 3–5 hours a day.",
    decisions: [
      "Check every OCR result against the totals printed in the image footer, and send mismatches to an editable review queue instead of exporting them. Wrong counts surface before a vehicle leaves.",
      "Keep a person in control of corrections: rows and footer totals are editable in place, and the last reprocess can be undone with Cmd/Ctrl+Z, even after a reload.",
      "Treat the visible DOCX as authoritative. Embedded metadata is only a fast path when its fingerprint exactly matches the visible document, so manual edits always win.",
      "Store immutable driver and plate snapshots on each daily list, so editing a preset later never rewrites historical origins.",
      "Send server-to-server calls over the internal Docker network. Going through the public hostname triggered Cloudflare's managed challenge and broke Server Component rendering, so the app reads internal URLs first and falls back to public ones for local development.",
      "Gate production on CI: main is the sole production branch, and the commit that passed audit, lint, tests, typecheck and build is the one deployed over SSH, followed by a sign-in check.",
      "Invite-only, role-based access (admin, operator, guide) with no public sign-up; guides see only the Customer Lists surface.",
    ],
    resume: ["Live in production for a tour operator; I own it end to end, from database design to deployment."],
    highlights: [
      "Manifest extractor: OCR per image, reconciled against the footer totals; failures and mismatches go to an editable review queue with undo.",
      "Driver's List: batches of per-shift screenshots become one styled XLSX with per-driver subtotals and a grand total.",
      "List Maker: imports group workbooks, classifies bookings, routes languages by agency and phone country, exports formatted DOCX lists.",
      "Double-booking detector ranks duplicate guests across or within agencies by severity.",
      "Customer Lists with role-aware import, live restaurant rosters, presence and audit workflows. Guides see only their own surface.",
      "Saves the operations team roughly 3–5 hours a day.",
    ],
    stack: ["Next.js", "TypeScript", "Convex", "Mistral OCR", "Docker Compose", "GitHub Actions", "Vitest"],
    security: [
      "Every push and PR runs a dependency audit, lint, unit tests, typecheck and a production build.",
      "A green push to main deploys the same commit to the production host over SSH, then verifies the sign-in endpoint.",
      "Recent audit failures (ip-address, undici advisories) were patched via lockfile-only updates.",
      "Server-to-server calls use internal Docker-network URLs so they never hit the Cloudflare managed challenge.",
      "Role-gated navigation, MFA in account settings, and a non-root multi-stage Docker image.",
    ],
    preview: "web",
    links: [],
  },
  {
    slug: "viya",
    name: "Viya",
    tagline:
      "Multi-tenant B2B SaaS that turns raw manifests into reviewed passenger data, optimized routes and driver dispatch.",
    order: 2,
    featured: true,
    role: "Builder",
    status: "Early MVP, built as a product for tour agencies beyond a single customer",
    summary:
      "Viya generalizes the Express Ops domain into a SaaS for any tour agency: ingest Excel or PDF manifests, extract structured data with a routable set of LLM and OCR providers, plan routes and dispatch drivers over the messaging apps they already use.",
    problem:
      "Tour agencies work from messy Excel and PDF manifests. Each day's passenger data has to be cleaned up, routed and sent to drivers. Express Ops solved this for one operator; Viya rebuilds the same domain as a multi-tenant product for any agency.",
    outcome:
      "A working early MVP that covers the whole path from manifest upload to driver dispatch. The repo's notes list 59 backend test files (Vitest and convex-test), and CI/CD is configured but not yet cutting over production traffic. No customers or revenue are claimed.",
    decisions: [
      "Route extraction across five LLM providers behind one layer (MiniMax by default, with a fallback chain across the others) instead of tying the pipeline to one vendor.",
      "Give spreadsheets a fast path: structured Excel files can skip much of the OCR and LLM work that photographed or PDF manifests need.",
      "Bound the cost of large documents: token budgets and timeouts scale with input size, big non-spreadsheet files are extracted in chunks and merged with de-duplication, and oversized parse output is truncated with an explicit flag.",
      "Block route generation until every passenger's location is resolved. Missing, failed or ambiguous geocodes stop it; low-confidence results only warn.",
      "Protect the geocoding stack with a circuit breaker and provider-aware caching, and score confidence on one model across Google, Nominatim and Pelias so labels stay consistent.",
      "Isolate tenants first: Clerk organization context plus Convex ownership guards on every business read and write, and channel credentials encrypted before storage.",
      "Use Slack as per-driver direct messages with signature validation and duplicate suppression, rather than a shared-channel workflow.",
    ],
    nextSteps: [
      "Chain extraction server-side right after a successful parse; today the client triggers it when the review page mounts.",
      "Add a multi-tenant security regression suite covering IDOR attempts and cross-tenant foreign-key linking.",
      "Scheduled dispatch for a future date and time.",
      "Tooling to rotate the encryption key and re-encrypt channel credentials.",
      "Team invites and role-based privileges for organization members.",
    ],
    resume: [
      "Early-stage SaaS that takes tour agencies from a messy booking manifest to dispatched drivers over WhatsApp, Telegram or Slack.",
    ],
    highlights: [
      "Four parse providers (Docling, native sheet, Mistral OCR, LlamaParse) and five LLM extraction providers behind one routing layer.",
      "Route generation with manual reordering on a dual map stack: Google Maps and MapLibre with OSRM directions.",
      "Driver dispatch over WhatsApp, Telegram and Slack, including inbound status replies and interactive confirmations.",
      "Fleet and capacity management; weather widget backed by MET Norway data with caching.",
      "Python FastAPI microservice for document parsing.",
    ],
    stack: ["Next.js", "TypeScript", "Convex", "Clerk", "Python / FastAPI", "Docling", "MapLibre", "Sentry", "Docker"],
    security: [
      "Clerk authentication with tenant-scoped access controls in the Convex backend.",
      "Sentry across browser, server and edge runtimes, plus the Python service, with documented privacy rules.",
      "Separate local, staging and production stacks; local backend and dashboard bind to loopback only.",
      "Security best-practice, performance and UI/UX audit reports kept in the repo.",
      "Linting and static analysis configured for both TypeScript and Python (ESLint, flake8, mypy, DeepSource).",
    ],
    preview: "web",
    links: [],
  },
  {
    slug: "lietner",
    name: "Lietner",
    tagline: "Leitner-system flashcards on a 3D desk. Free, open source, works offline, with optional sync.",
    order: 3,
    featured: true,
    role: "Author",
    status: "Live at lietner.app · open source under the MIT license",
    summary:
      "Five wooden boxes sit on a three.js desk. Each due card lifts out, flips to show its answer and files itself into the next box, or back into box 1 if you missed it. The same desk works on phones, tablets and desktops, fully offline as a guest; signing in syncs decks and progress between devices.",
    problem:
      "Plain flashcard apps feel flat. Lietner makes the Leitner system visible: cards physically move between boxes, so progress shows on the desk. It is built for students studying on their own, mostly on phones, who should be able to start a deck on a laptop, review on the bus and lose nothing, with or without an account.",
    outcome:
      "Live at lietner.app with public source on GitHub. CI runs lint, typecheck, unit tests and a build; pgTAP row-level-security tests and sync integration tests against a local Supabase stack; and Playwright end-to-end tests on desktop Chrome, an emulated iPhone and iPad, and a browser with WebGL disabled. No user numbers are claimed.",
    decisions: [
      "Make IndexedDB on the device the source of truth, and the server a per-account mirror. Guests never download the Supabase SDK; it is loaded with import() only when someone signs in.",
      "Sync with last write wins per row, enforced by SQL triggers: updated_at is capped at the server clock so a device with a fast clock can't win every conflict, and deletions are final tombstones.",
      "Pull by a server-stamped server_at cursor with keyset paging and a 60-second lookback, so an offline edit pushed days later is still picked up by every device.",
      "Isolate accounts with Postgres row-level security, covered by pgTAP tests that run in CI against a local Supabase stack.",
      "Render the three.js scene on demand, cap the pixel ratio on phones and drop quality automatically when frames run slow.",
      "Keep the UI behind DeskView and CardView interfaces, so a plain-DOM text mode for browsers without WebGL runs the identical review flow.",
      "Never let card text reach telemetry: page views are cookieless, and Sentry events and breadcrumbs pass through a scrubber with its own tests.",
      "Keep scheduling as pure functions over integer calendar days, so time zones and daylight-saving shifts never move a card by a day.",
    ],
    resume: [
      "Open-source flashcard app (lietner.app) that works fully offline and syncs safely across devices; tested on desktop, iPhone and iPad.",
    ],
    highlights: [
      "Classic Leitner schedule: boxes come due every 1, 2, 4, 8 and 16 days, with a mastered tray.",
      "Phones and tablets get a portrait desk, tap to flip and swipe to grade; desktops get keyboard shortcuts and one-step undo.",
      "Cards in any language or script, including right-to-left. Import CSV/TSV (including Anki's export) or paste JSON cards written by your own AI.",
      "Installable PWA that works fully offline, with a text mode for browsers without WebGL.",
      "Optional sign-in with Google or a 6-digit email code syncs decks between devices; guest data never leaves the browser.",
      "JSON export and import of everything, and account deletion from Settings.",
    ],
    stack: ["TypeScript", "Vite", "three.js", "GSAP", "IndexedDB", "Supabase", "Workbox PWA", "Vitest", "Playwright"],
    security: [
      "Row-level security limits every account to its own rows; pgTAP tests prove the isolation in CI.",
      "SQL triggers cap client timestamps at the server clock and make deletions final.",
      "Telemetry is cookieless page views plus Sentry crash reports with card text scrubbed out; no ads, no data sales.",
      "Synced data lives in the EU (Supabase, Ireland); grade history never leaves the device.",
      "Signing out flushes unsynced changes first, then wipes account data from the device.",
    ],
    preview: "web",
    live: {
      url: "https://lietner.app",
      poster: {
        src: "/images/work/lietner.webp",
        alt: "Lietner on a desktop: a flashcard lifted above five wooden boxes on a walnut desk",
        width: 1280,
        height: 800,
      },
    },
    links: [
      { label: "Live site", href: "https://lietner.app" },
      { label: "Source on GitHub", href: "https://github.com/ELTIGA/lietner" },
    ],
  },
  {
    slug: "gravel",
    name: "Gravel",
    tagline: "Guardrails for AI agents: scope validation, human approvals, emergency stop and an audit trail.",
    order: 4,
    featured: true,
    role: "Author",
    status: "Rust workspace with a terminal UI",
    summary:
      "Gravel is a terminal app that mediates every tool call: it checks scope, asks the operator to approve, can halt everything instantly, and records what happened.",
    problem:
      "An AI agent that can run tools can act on targets it was never meant to touch. It needs enforced limits and a human who can say no, and that control has to sit between the agent and the tool transport.",
    outcome:
      "Version 0.1.0 (February 2026): a five-crate Rust workspace with CI for tests, clippy and rustfmt, and cargo-dist release automation for macOS, Linux and Windows.",
    decisions: [
      "Model each tool call as a typed lifecycle: raw request, scoped request, then a signed approval token. Execution proceeds only with the token.",
      "Validate scope before anything runs: targets are extracted from tool arguments and checked against allow and block lists, including CIDR ranges. Violations are denied and logged.",
      "Layer the workspace with dependencies pointing inward: the security crate sits below MCP, agent and UI, so policy changes do not touch rendering or model backends.",
      "Queue approvals and process them in order in a focused terminal overlay, so the operator reviews one request at a time.",
      "Design emergency stop to halt new requests and cancel or deny pending work, leaving an audit trail.",
      "Use one typed command contract (UiIntent) and typed orchestrator events between the UI and the runtime, instead of parsing strings.",
    ],
    resume: [
      "Safety layer for AI agents, in Rust: agents can't act outside their scope without human approval, and one switch stops them.",
    ],
    highlights: [
      "Shared domain layer for sessions, tool requests and configuration.",
      "Security crate for scope validation, approvals, emergency stop and audit.",
      "MCP client and interceptor layer for tool execution.",
      "Agent runtime with pluggable model backends, plus a terminal UI with session resume.",
    ],
    stack: ["Rust", "MCP", "Terminal UI", "Cargo workspace"],
    security: [
      "Defensive by design: every tool request passes scope validation and operator approval before it runs.",
      "Emergency stop and an audit trail of what ran.",
      "Cargo workspace with format, clippy and test commands as the quality gate.",
    ],
    preview: "terminal",
    links: [],
  },
  {
    slug: "getit",
    name: "getit",
    tagline: "File-host downloader with a terminal UI, a scripting CLI and an MCP server so AI agents can drive it.",
    order: 5,
    featured: false,
    role: "Author",
    status: "Packaged for PyPI and Homebrew; used personally",
    summary:
      "One command downloads from GoFile, PixelDrain, MediaFire, 1Fichier, UploadFlix, Mega.nz and Anonfile.de, with a dashboard-style TUI for queue management.",
    problem:
      "Each file host has its own flow: guest tokens and rate limits, wait times, captchas, passwords, client-side encryption. getit puts seven hosts behind one command, a terminal UI and an MCP server, so a person or an AI agent can run the queue.",
    outcome: "Published on PyPI as getit-cli with a Homebrew tap. A personal-use tool; no adoption claims.",
    decisions: [
      "Put one DownloadService facade behind the CLI, the TUI and the MCP server, so all three get identical behaviour.",
      "Make hosts self-registering extractors: adding one is a single file and a decorator, and the registry routes URLs to it.",
      "Publish progress through an event bus (progress, complete, error), so progress bars and MCP resource updates share one source instead of being wired to one UI.",
      "Limit concurrency with a semaphore in the manager, and keep resumable streaming, decryption and checksum validation in the downloader.",
      "Persist tasks in SQLite so MCP tools can poll status and cancel; the changelog notes WAL mode with a busy timeout.",
      "Read tokens from environment variables rather than config files; the changelog lists restrictive 600 permissions on config and history files and secret redaction in structured logs.",
    ],
    nextSteps: ["A download-history view; the SQLite task registry was built to support it."],
    resume: [
      "Published download tool (PyPI, Homebrew) for seven file hosts, usable by people, scripts and AI agents, with built-in integrity checks.",
    ],
    highlights: [
      "Concurrent downloads with smart resume, speed limits and recursive folder support.",
      "Client-side Mega.nz AES-CTR decryption; MD5/SHA256 integrity checks.",
      "Built-in MCP server: agents can list remote folders, start, poll and cancel downloads.",
      "Async engine, SQLite-backed task registry and an event bus for progress streaming.",
    ],
    stack: ["Python", "asyncio", "Textual", "SQLite", "MCP"],
    security: [
      "Credentials and tokens are read from environment variables rather than config files.",
      "Integrity verification of downloaded files; password-protected link handling.",
      "CI plus automated PR review configured on the repository.",
    ],
    preview: "terminal",
    links: [],
  },
  {
    slug: "amc-prep",
    name: "AMC Prep",
    tagline: "Gamified, AI-coached exam preparation for medical graduates.",
    order: 6,
    featured: false,
    role: "Builder",
    status: "Product spec and web app",
    summary:
      "A question bank framed as virtual hospital rotations: topic, challenge and exam-simulation modes, layered explanations, streaks and quests, and a weakness model that decides what to practise next.",
    resume: ["AI-coached exam prep for medical graduates that finds each student's weak spots and drills them."],
    highlights: [
      "Weakness analysis combining accuracy, confidence and recency to drive challenge sessions.",
      "Clinical Poker pattern-recognition mini-game.",
      "Admin tooling for question quality, broadcasts and campaigns, specified with role-based access.",
    ],
    stack: ["Next.js", "Convex", "Clerk", "TypeScript"],
    security: [],
    preview: "web",
    links: [],
  },
  {
    slug: "review-router",
    name: "Review Router",
    tagline: "One-tap landing page that sends customers from a QR code to the review site where their booking lives.",
    order: 7,
    featured: false,
    role: "Developer",
    status: "Live on Vercel",
    summary:
      "Customers scan a QR code at the end of a rafting tour and pick where they booked. Google, GetYourGuide and TripAdvisor open their review pages in one tap; Viator and Booking.com only accept reviews from their own post-trip email, so those cards say so instead of sending people to a dead end.",
    resume: ["QR-code page that sends tour customers straight to the right review site, in eight languages."],
    highlights: [
      "One-tap review links for Google, GetYourGuide and TripAdvisor (GetYourGuide checks the booking first); honest email hints for Viator and Booking.com.",
      "Eight languages, picked from a saved choice or the browser's Accept-Language header, with right-to-left layouts for Arabic and Persian.",
      "Mobile-first Next.js page; channels configured in one file.",
      "Per-channel click events for conversion visibility.",
    ],
    stack: ["Next.js", "Tailwind CSS", "Vercel Analytics"],
    security: [],
    preview: "web",
    live: {
      url: "https://express-take-reviews.vercel.app",
      poster: {
        src: "/images/work/review-router.webp",
        alt: "The review page on a phone: “Loved your adventure?” above review buttons for Google, GetYourGuide, TripAdvisor, Viator and Booking.com",
        width: 600,
        height: 1231,
      },
    },
    links: [{ label: "Live site", href: "https://express-take-reviews.vercel.app" }],
  },
  {
    slug: "callaudioguard",
    name: "CallAudioGuard",
    tagline: "macOS menu-bar utility that detects active calls and keeps audio on the right device.",
    order: 8,
    featured: false,
    role: "Author",
    status: "Native Swift app with Homebrew cask packaging",
    summary:
      "A small native app that watches for active calls and manages audio devices so a call never lands on the wrong output.",
    resume: ["macOS menu-bar app that detects active calls and manages audio devices; shipped through Homebrew."],
    highlights: [
      "Active call detection and audio device management.",
      "Menu-bar UI; Makefile and Homebrew cask for distribution.",
    ],
    stack: ["Swift", "macOS", "Xcode"],
    security: [],
    preview: "menubar",
    links: [],
  },
  {
    slug: "novaread",
    name: "NovaRead",
    tagline: "AI-assisted digital library: read books and get explanations, simplifications and voice help in context.",
    order: 9,
    featured: false,
    role: "Co-developer: React front end and AI integration",
    status: "Team graduation project",
    summary:
      "A library platform where users upload and read books, save quotes to a memory section, and ask an AI to explain or simplify what they are reading by text or voice. I worked on the React front end and the AI integration with Gemini and the OpenAI Realtime API.",
    resume: ["Team graduation project: built the React front end and the AI reading assistant (text and voice)."],
    highlights: [
      "Reading screen with real-time AI explanations and simplifications.",
      "Memory screen for saving quotes and highlights.",
      "Voice and text interaction with the AI assistant.",
    ],
    stack: ["React", "Tailwind CSS", "Gemini API", "OpenAI Realtime API"],
    security: [],
    preview: "web",
    links: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
