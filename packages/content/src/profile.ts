import type { Profile } from "./types";

// TODO(owner): everything marked TODO needs real input. Nothing here is invented:
// metrics come from the owner's own statements or from the repos' READMEs.
export const profile: Profile = {
  name: "Ahmed Eltigani",
  handle: "ELTIGA",
  headline: "I build and secure production software, end to end.",
  subheadline:
    "Recent graduate working across DevSecOps and AI-enabled full-stack engineering. I designed and shipped Express Ops, an operations platform a tour operator's team uses every day.",
  availability: "Open to remote roles · contract or full-time",
  email: "Eltiga@protonmail.com",
  github: "https://github.com/ELTIGA",
  linkedin: "https://www.linkedin.com/in/ahmed-eltigani/",
  languages: null, // TODO(owner): e.g. ["English", "Arabic", "Turkish"]
  photo: null, // TODO(owner): professional photo
  siteUrl: "https://example.com", // TODO(owner): custom domain
  about: [
    // TODO(owner): replace with your own words after the LinkedIn/background interview.
    "I'm a recent graduate who learns by shipping. Most of my work is a single-developer product, from the first schema to the CI pipeline that deploys it.",
    "I care about the unglamorous half of software: audit gates in CI, tenant isolation, observability and safe defaults, alongside the features users actually see.",
  ],
  skills: [
    {
      group: "Product engineering",
      items: ["TypeScript", "React", "Next.js", "Convex", "Tailwind CSS", "Python", "Rust", "Swift"],
    },
    {
      group: "DevSecOps",
      items: ["GitHub Actions", "Docker / Compose", "Dependency auditing", "Sentry", "Clerk / RBAC", "Self-hosted deploys"],
    },
    {
      group: "AI & automation",
      items: ["LLM extraction pipelines", "OCR (Mistral, Docling, LlamaParse)", "MCP servers", "Agent guardrails"],
    },
  ],
  metrics: [
    {
      value: "3–5 hrs/day",
      label: "saved for the operations team by Express Ops",
      source: "Owner-stated range. TODO(owner): confirm and add the before/after.",
    },
    {
      value: "5 LLM providers",
      label: "routed for structured extraction in Viya",
      source: "Viya README lists five extraction providers.",
    },
    {
      value: "3 channels",
      label: "for driver dispatch: WhatsApp, Telegram, Slack",
      source: "Viya README.",
    },
    {
      value: "5 CI gates",
      label: "audit, lint, tests, typecheck and build before every deploy",
      source: "Express Ops README (audit, lint, test, tsc, build).",
    },
  ],
};
