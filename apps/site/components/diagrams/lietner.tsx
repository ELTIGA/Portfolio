import { FlowDiagram, type DiagramProps, type FlowSpec } from "./kit";

// Source: Lietner README and docs/architecture.md.
const spec: FlowSpec = {
  title: "Lietner architecture",
  description:
    "Three rows. First, the device, which is the source of truth: a DOM overlay drives a three.js desk rendered on demand, pure Leitner rules schedule cards on integer calendar days, and IndexedDB stores every deck and card with tombstones and dirty flags. Second, optional sync for signed-in accounts: the sync engine pushes dirty rows and pulls by a server-stamped cursor, Supabase Postgres enforces row-level security per account and SQL triggers cap timestamps at the server clock, and the auth SDK is only loaded when someone signs in. Third, offline and privacy: a service worker precaches the app so guest mode works offline, and telemetry is cookieless page views plus crash reports with card text scrubbed.",
  caption:
    "Mechanism: the device owns the data. The server is an optional per-account mirror, and conflicts resolve per row with the server's clock as the ceiling.",
  lanes: [
    {
      title: "Device · source of truth",
      linkToNext: "push dirty rows · pull by server_at",
      nodes: [
        { label: ["DOM overlay"], sub: ["no UI framework;", "text mode without", "WebGL"] },
        { label: ["three.js desk"], sub: ["renders on demand;", "GSAP card", "animations"] },
        { label: ["Leitner rules"], sub: ["pure functions;", "1, 2, 4, 8, 16", "day boxes"] },
        { label: ["IndexedDB"], sub: ["tombstones,", "dirty flags,", "monotonic edits"], tone: "accent" },
      ],
    },
    {
      title: "Optional sync · signed-in accounts",
      nodes: [
        { label: ["Sync engine"], sub: ["debounced, on focus", "and reconnect;", "one tab at a time"] },
        {
          label: ["Supabase", "Postgres"],
          sub: ["row-level security;", "triggers cap time", "at the server clock"],
          tone: "accent",
        },
        { label: ["Auth"], sub: ["email code or", "Google; SDK loads", "only on sign-in"] },
      ],
    },
    {
      title: "Offline and privacy",
      nodes: [
        { label: ["Service worker"], sub: ["precached app shell;", "guest mode", "works offline"] },
        {
          label: ["Telemetry"],
          sub: ["cookieless page views;", "card text scrubbed", "from crash reports"],
          tone: "accent",
        },
      ],
    },
  ],
};

export function LietnerDiagram({ variant }: DiagramProps) {
  return <FlowDiagram spec={spec} variant={variant} />;
}
