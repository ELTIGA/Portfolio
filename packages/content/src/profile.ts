import type { Profile } from "./types";

// Bio, experience, credentials and headline metrics, used across the site, the résumé and
// social metadata. Every claim is first-hand or documented in the project's own repository.
//
// The text in this file is © Ahmed Eltigani, all rights reserved. It is not covered by the
// MIT license that applies to the code (see "License" in the README).
export const profile: Profile = {
  name: "Ahmed Eltigani",
  handle: "ELTIGA",
  headline: "I build software a team runs on every day, and I make it hard to break.",
  subheadline:
    "Sole developer of Express Ops, the operations platform a tour operator's team works in daily. Software engineering graduate and Certified Ethical Hacker, working across DevSecOps and AI-enabled full-stack development.",
  availability: "Open to remote roles · contract or full-time",
  email: "Eltiga@protonmail.com",
  github: "https://github.com/ELTIGA",
  linkedin: "https://www.linkedin.com/in/ahmed-eltigani/",
  languages: ["English", "Arabic", "Turkish"],
  siteUrl: "https://www.ahmedeltigani.com",
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
      period: "Jul 2026 – present",
      summary:
        "Sole developer of Express Ops for a tour operator. Express Ops is used daily by the operations team and saves roughly 3–5 hours a day.",
      bullets: [
        "Build and run Express Ops alone: the platform the operations team now works in every day.",
        "Turn photographed manifests into ready-to-send driver and customer lists, so staff stop retyping bookings by hand.",
        "Catch mistakes before drivers see them: every scan is checked against the manifest totals and double bookings are flagged.",
        "Keep every release safe: security and quality checks gate each deploy, and staff see only what their role allows.",
      ],
    },
    {
      org: "Fyluim",
      role: "UI/UX & front-end developer",
      type: "Employee",
      period: "2023 – 2024",
      summary: "UI/UX design and front-end development at a company building web3 technologies and trading bots.",
      bullets: [
        "Designed and built the dashboards and trading-bot interfaces used by over 1,000 customers.",
        "Helped design and build the company's landing page.",
        "Turned customer complaints and reported front-end bugs into fixes, so the product kept getting easier to use.",
      ],
    },
  ],
  credentials: [
    {
      name: "Certified Ethical Hacker (CEH)",
      issuer: "EC-Council",
      year: "2026",
      status: "Earned 2026, currently valid",
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
      width: 900,
      height: 816,
      alt: "Ahmed Eltigani wearing an attendee badge in front of the AWS Cloud and AI Day Türkiye backdrop",
    },
    {
      name: "Google for Developers Day: Istanbul",
      role: "Participant",
      year: "2026",
      image: "/images/event-google-devday-2026.webp",
      width: 900,
      height: 690,
      alt: "Ahmed Eltigani on stage in front of a Google for Developers Day: Istanbul screen showing the Bosphorus Bridge",
    },
    {
      name: "TEKNOFEST",
      role: "Participant",
      year: "2023",
      image: "/images/event-teknofest-2023.webp",
      width: 900,
      height: 576,
      alt: "Ahmed Eltigani wearing a TEKNOFEST lanyard in front of a green wall of plants and neon icons",
    },
  ],
  about: [
    "I graduated in Software Engineering from Nişantaşı University in 2026. Before that I spent a year as a UI/UX and front-end developer at Fyluim, a web3 and trading-bot company.",
    "Since July 2026 I've been the only developer on Express Ops for a tour operator. I wrote the first schema and I run the CI pipeline that deploys it. Most of my time goes to the parts users never see: audit gates, tenant isolation, observability and safe defaults.",
    "I'm a Certified Ethical Hacker (EC-Council, 2026). I also build guardrails for AI agents: scope checks, human approvals and an emergency stop.",
    "Networking is part of my toolkit too: subnetting, routing, switching and VLANs. At home I run a lab with a DNS server, a NAS and Jellyfin. I'm comfortable on the Linux command line, manage hypervisors in Proxmox and VMware Workstation Pro, have worked with KVM, and I'm currently learning SIEM work in Splunk.",
  ],
  resumeSummary:
    "Certified Ethical Hacker and software engineer who ships software a team relies on every day. Sole developer of Express Ops, the platform a tour operator's operations team runs on, secured from the first commit.",
  skills: [
    {
      group: "Product engineering",
      items: ["TypeScript", "React", "Next.js", "Convex", "Tailwind CSS", "UI/UX design", "Python", "Rust", "Swift"],
    },
    {
      group: "DevSecOps",
      items: [
        "CI/CD (GitHub Actions)",
        "Docker / Compose",
        "Dependency auditing",
        "Sentry",
        "Role-based access control (RBAC, Clerk)",
      ],
    },
    {
      group: "Offensive security (CEH)",
      items: [
        "Kali Linux: Nmap, Wireshark, Burp Suite, Metasploit, wafw00f",
        "Reconnaissance & footprinting",
        "Network scanning & enumeration",
        "Vulnerability analysis",
        "System hacking & privilege escalation",
        "Web app attacks (SQL injection, XSS)",
        "Sniffing & session hijacking",
        "Social engineering",
        "Wireless, IoT & cloud security",
        "Cryptography",
      ],
    },
    {
      group: "AI & automation",
      items: ["LLM extraction pipelines", "OCR (Mistral, Docling, LlamaParse)", "MCP servers", "Agent guardrails"],
    },
    {
      group: "Infrastructure",
      items: [
        "TCP/IP, IPv4/IPv6 subnetting",
        "Routing (static, OSPF)",
        "Switching (VLANs, STP, EtherChannel)",
        "ACLs, NAT, DHCP, DNS",
        "Linux CLI",
        "Proxmox VE",
        "VMware Workstation Pro",
        "KVM",
        "Home lab: DNS server, NAS, Jellyfin",
        "Splunk / SIEM (learning)",
      ],
    },
  ],
  metrics: [
    {
      value: "3–5 hrs/day",
      label: "saved for the operations team by Express Ops (my estimate)",
      source: "My own estimate, given as a range.",
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
