import type { Project } from "./types";

// Every claim below was read from the repo's README/docs or stated by the owner.
// TODO(owner): confirm permission to name Express Rafting publicly.
export const projects: Project[] = [
  {
    slug: "express-ops",
    name: "Express Ops",
    tagline: "Operations platform that turns manifest photos into driver lists, double-booking checks and customer documents.",
    order: 1,
    featured: true,
    role: "Sole developer, end to end",
    status: "In daily use by the operations team",
    summary:
      "I built a role-based web app that reads the photographed manifests, reconciles each one against the totals printed on the page, flags double bookings, and produces the finished driver lists and customer documents.",
    problem:
      "Tour-transfer teams were rebuilding daily driver lists and customer documents by hand from photographed manifests, against a departure clock. A miscount or a double booking has to be caught before a vehicle leaves, not after.",
    outcome:
      "In daily use by the operations team. I estimate it saves them roughly 3–5 hours a day.",
    decisions: [
      "Check every OCR result against the totals printed in the image footer, and send mismatches to an editable review queue instead of exporting them. Wrong counts surface before a vehicle leaves.",
      "Keep a person in control of corrections: rows and footer totals are editable in place, and the last reprocess can be undone with Cmd/Ctrl+Z, even after a reload.",
      "Treat the visible DOCX as authoritative. Embedded metadata is only a fast path when its fingerprint exactly matches the visible document, so manual edits always win.",
      "Store immutable driver and plate snapshots on each daily list, so editing a preset later never rewrites historical origins.",
      "Send server-to-server calls over the internal Docker network. Going through the public hostname triggered Cloudflare's managed challenge and broke Server Component rendering, so the app reads internal URLs first and falls back to public ones for local development.",
      "Gate production on CI: main is the sole production branch, and the commit that passed audit, lint, tests, typecheck and build is the one deployed over SSH, followed by a sign-in check.",
      "Invite-only, role-based access (admin, operator, guide) with no public sign-up; guides see only the Customer Lists surface.",
    ],
    resume: [
      "Sole developer of an operations platform used daily by a tour operator's team; I estimate it saves roughly 3–5 hours a day.",
      "Built a manifest pipeline (Mistral OCR) that reconciles extracted rows against printed footer totals and routes mismatches to an editable review queue; exports styled XLSX driver lists and DOCX customer lists; detects double bookings.",
      "Own CI/CD and security: dependency-audit gate, lint, tests, typecheck and build before an SSH deploy to Docker Compose; non-root multi-stage image, role-gated navigation and MFA.",
    ],
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
    tagline: "Multi-tenant B2B SaaS that turns raw manifests into reviewed passenger data, optimized routes and driver dispatch.",
    order: 2,
    featured: true,
    role: "Builder and sole developer",
    status: "Early MVP, built as a product for tour agencies beyond a single customer",
    summary:
      "Viya generalizes the Express Ops domain into a SaaS for any tour agency: ingest Excel or PDF manifests, extract structured data with a routable set of LLM and OCR providers, plan routes and dispatch drivers over the messaging apps they already use.",
    problem:
      "Tour agencies work from messy Excel and PDF manifests. Each day's passenger data has to be cleaned up, routed and sent to drivers. Express Ops solved this for one operator; Viya rebuilds the same domain as a multi-tenant product for any agency.",
    outcome:
      "A working early MVP that covers manifest to driver dispatch end to end. The repo's notes list 59 backend test files (Vitest and convex-test), and CI/CD is configured but not yet cutting over production traffic. No customers or revenue are claimed.",
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
      "Sole developer of an early-MVP multi-tenant SaaS for tour agencies: manifest ingestion with four parse providers and LLM extraction routed across five providers.",
      "Route generation on Google Maps or MapLibre with OSRM; driver dispatch over WhatsApp, Telegram and Slack with inbound status replies; Python FastAPI parsing service.",
      "Tenant isolation with Clerk and Convex ownership guards; Sentry across browser, server, edge and Python runtimes; separate local, staging and production stacks.",
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
    slug: "gravel",
    name: "Gravel",
    tagline: "Guardrails for AI agents: scope validation, human approvals, emergency stop and an audit trail.",
    order: 3,
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
      "Author of a five-crate Rust workspace that mediates AI agent tool calls: scope validation, operator approval via signed tokens, emergency stop and an audit log.",
      "Built the MCP client and interceptor layer (stdio and HTTP transports) and a ratatui terminal UI with session resume.",
      "CI runs tests, clippy and rustfmt; cargo-dist produces release builds for macOS, Linux and Windows.",
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
    order: 4,
    featured: false,
    role: "Author",
    status: "Packaged for PyPI and Homebrew; used personally",
    summary:
      "One command downloads from GoFile, PixelDrain, MediaFire, 1Fichier, UploadFlix, Mega.nz and Anonfile.de, with a dashboard-style TUI for queue management.",
    problem:
      "Each file host has its own flow: guest tokens and rate limits, wait times, captchas, passwords, client-side encryption. getit puts seven hosts behind one command, a terminal UI and an MCP server, so a person or an AI agent can run the queue.",
    outcome:
      "Published on PyPI as getit-cli with a Homebrew tap. A personal-use tool; no adoption claims.",
    decisions: [
      "Put one DownloadService facade behind the CLI, the TUI and the MCP server, so all three get identical behaviour.",
      "Make hosts self-registering extractors: adding one is a single file and a decorator, and the registry routes URLs to it.",
      "Publish progress through an event bus (progress, complete, error), so progress bars and MCP resource updates share one source instead of being wired to one UI.",
      "Limit concurrency with a semaphore in the manager, and keep resumable streaming, decryption and checksum validation in the downloader.",
      "Persist tasks in SQLite so MCP tools can poll status and cancel; the changelog notes WAL mode with a busy timeout.",
      "Read tokens from environment variables rather than config files; the changelog lists restrictive 600 permissions on config and history files and secret redaction in structured logs.",
    ],
    nextSteps: [
      "A download-history view; the SQLite task registry was built to support it.",
    ],
    resume: [
      "Author of an async Python downloader for seven file hosts with a Textual TUI, a scripting CLI and an MCP server; published on PyPI (getit-cli) with a Homebrew tap.",
      "Concurrent downloads with resume and speed limits, MD5/SHA256 verification and client-side Mega.nz AES-CTR decryption.",
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
    order: 5,
    featured: false,
    role: "Builder",
    status: "Product spec and web app",
    summary:
      "A question bank framed as virtual hospital rotations: topic, challenge and exam-simulation modes, layered explanations, streaks and quests, and a weakness model that decides what to practise next.",
    resume: [
      "Builder of a gamified, AI-coached exam-preparation app for medical graduates (Next.js, Convex, Clerk, TypeScript).",
      "Weakness analysis combining accuracy, confidence and recency drives practice sessions; includes the Clinical Poker pattern-recognition mini-game.",
    ],
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
    order: 6,
    featured: false,
    role: "Developer",
    status: "Built for one-click Vercel deployment",
    summary:
      "Customers scan a QR code at the end of a tour and reach Google, GetYourGuide, Viator or Booking.com in one tap, with channel-click analytics to prove the friction is low.",
    resume: [
      "Mobile-first Next.js page that sends customers from a QR code to Google, GetYourGuide, Viator or Booking.com in one tap.",
      "Per-channel click events for conversion visibility; channels configured in one file; built for one-click Vercel deployment.",
    ],
    highlights: [
      "Mobile-first Next.js page; channels configured in one file.",
      "Per-channel click events for conversion visibility.",
    ],
    stack: ["Next.js", "Tailwind CSS", "Vercel Analytics"],
    security: [],
    preview: "web",
    links: [],
  },
  {
    slug: "callaudioguard",
    name: "CallAudioGuard",
    tagline: "macOS menu-bar utility that detects active calls and keeps audio on the right device.",
    order: 7,
    featured: false,
    role: "Author",
    status: "Native Swift app with Homebrew cask packaging",
    summary:
      "A small native app that watches for active calls and manages audio devices so a call never lands on the wrong output.",
    resume: [
      "Native Swift macOS menu-bar app that detects active calls and manages audio devices.",
      "Distributed with a Makefile and a Homebrew cask.",
    ],
    highlights: ["Active call detection and audio device management.", "Menu-bar UI; Makefile and Homebrew cask for distribution."],
    stack: ["Swift", "macOS", "Xcode"],
    security: [],
    preview: "menubar",
    links: [],
  },
  {
    slug: "novaread",
    name: "NovaRead",
    tagline: "AI-assisted digital library: read books and get explanations, simplifications and voice help in context.",
    order: 8,
    featured: false,
    role: "Co-developer: React front end and AI integration",
    status: "Team graduation project",
    summary:
      "A library platform where users upload and read books, save quotes to a memory section, and ask an AI to explain or simplify what they are reading by text or voice. I worked on the React front end and the AI integration with Gemini and the OpenAI Realtime API.",
    resume: [
      "Co-developer on a team graduation project, working on the React front end and the AI integration (Gemini API and OpenAI Realtime API).",
      "Reading screen with in-context AI explanations and simplifications by text or voice, and a memory screen for saved quotes.",
    ],
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
