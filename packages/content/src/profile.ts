import type { Profile } from "./types";

// Facts here come from the owner's own statements (interview) or the repos' READMEs.
// Nothing is invented. TODO(owner) marks items awaiting confirmation.
export const profile: Profile = {
  name: "Ahmed Eltigani",
  handle: "ELTIGA",
  headline: "I build and secure production software, end to end.",
  subheadline:
    "Software engineering graduate working across DevSecOps and AI-enabled full-stack development. I designed and shipped Express Ops, an operations platform a tour operator's team uses every day.",
  availability: "Open to remote roles · contract or full-time",
  email: "Eltiga@protonmail.com",
  github: "https://github.com/ELTIGA",
  linkedin: "https://www.linkedin.com/in/ahmed-eltigani/",
  languages: ["English", "Arabic", "Turkish"],
  siteUrl: "https://ahmedeltigani.com",
  portrait: {
    src: "/images/ahmed-portrait.webp",
    alt: "Ahmed Eltigani, in a dark linen blazer and white shirt, standing against a plain wall",
    width: 960,
    height: 1200,
  },
  casual: {
    src: "/images/ahmed-casual.webp",
    alt: "Ahmed Eltigani smiling on a waterfront boardwalk",
    width: 900,
    height: 1199,
  },
  education: {
    school: "Nişantaşı University",
    degree: "B.Sc. Software Engineering",
    year: "Graduated 2026",
  },
  experience: [
    {
      org: "Express Rafting",
      role: "Freelance developer",
      type: "Contract",
      period: "Jul 2026 – present", // TODO(owner): owner will handle permission to name the company publicly
      summary:
        "Sole developer of Express Ops for a tour operator. Express Ops is used daily by the operations team and saves roughly 3–5 hours a day.",
      bullets: [
        "Sole developer of Express Ops, an operations platform for a tour operator: schema, role-based UI, OCR pipeline, CI/CD and production deployment.",
        "Used daily by the operations team; I estimate it saves them roughly 3–5 hours a day.",
      ],
    },
    {
      org: "Fyluim", // TODO(owner): confirm it's fine to name Fyluim on the site
      role: "UI/UX & front-end developer",
      type: "Employee",
      period: "2023 – 2024",
      summary: "UI/UX design and front-end development at a company building web3 technologies and trading bots.",
      bullets: ["UI/UX design and front-end development at a company building web3 technologies and trading bots."],
    },
  ],
  credentials: [
    {
      name: "Certified Ethical Hacker (CEH)",
      issuer: "EC-Council",
      year: "2026",
      status: "Earned 2026, currently valid", // TODO(owner): add credential ID / verification link if available
    },
    {
      name: "AWS Skill Builder training",
      issuer: "Amazon Web Services",
      year: "Self-paced",
      status: "Training completed (not an AWS certification)",
    },
  ],
  events: [
    {
      name: "AWS Cloud and AI Day Türkiye",
      role: "Attendee",
      year: "2026",
      image: "/images/event-aws-2026.webp",
      alt: "Ahmed Eltigani wearing an attendee badge in front of the AWS Cloud and AI Day Türkiye backdrop",
    },
    {
      name: "TEKNOFEST",
      role: "Participant",
      year: "2023",
      image: "/images/event-teknofest-2023.webp",
      alt: "Ahmed Eltigani wearing a TEKNOFEST lanyard in front of a green wall of plants and neon icons",
    },
  ],
  about: [
    "I graduated in Software Engineering from Nişantaşı University in 2026. Before that I spent a year as a UI/UX and front-end developer at Fyluim, a web3 and trading-bot company.",
    "Since July 2026 I've been the sole developer on Express Ops for a tour operator: from the first schema to the CI pipeline that deploys it. I care about the unglamorous half of software: audit gates, tenant isolation, observability and safe defaults.",
    "I'm also a Certified Ethical Hacker (2026), and I build tools that put guardrails around AI agents.",
  ],
  resumeSummary:
    "Software engineering graduate (B.Sc., 2026) working across DevSecOps and AI-enabled full-stack development. Sole developer of Express Ops, an operations platform a tour operator's team uses every day, with CI/CD, dependency auditing and role-based access built in. Certified Ethical Hacker (EC-Council, 2026).",
  skills: [
    {
      group: "Product engineering",
      items: ["TypeScript", "React", "Next.js", "Convex", "Tailwind CSS", "UI/UX design", "Python", "Rust", "Swift"],
    },
    {
      group: "DevSecOps",
      items: ["GitHub Actions", "Docker / Compose", "Dependency auditing", "Sentry", "Clerk / RBAC", "Ethical hacking (CEH)"],
    },
    {
      group: "AI & automation",
      items: ["LLM extraction pipelines", "OCR (Mistral, Docling, LlamaParse)", "MCP servers", "Agent guardrails"],
    },
  ],
  metrics: [
    {
      value: "3–5 hrs/day",
      label: "saved for the operations team by Express Ops (owner's estimate)",
      source: "Owner-stated range.",
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
