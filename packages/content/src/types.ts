/** How a project's interactive preview is framed: browser window, terminal or macOS menu bar app. */
export type PreviewKind = "web" | "terminal" | "menubar";

export interface Project {
  /** URL segment (`/work/[slug]`) and key in the demo and diagram registries. */
  slug: string;
  name: string;
  /** One line shown on cards. */
  tagline: string;
  /** Lower number = shown first. */
  order: number;
  /** Featured projects get the home page reel; the rest are listed under "Also built". */
  featured: boolean;
  /** My role on the project, e.g. "Sole developer". */
  role: string;
  /** Current state in plain language, e.g. "In daily use by the operations team". */
  status: string;
  /** 2–3 sentences: what was built (and the problem, when `problem` is not set). */
  summary: string;
  /** The situation that made this worth building. */
  problem?: string;
  /** What changed as a result. Measured or first-hand outcomes only, no adoption claims. */
  outcome?: string;
  /** Engineering decisions and trade-offs, one sentence each. */
  decisions?: string[];
  /** Planned work, taken from the project's own backlog. */
  nextSteps?: string[];
  /** 2–3 concise bullets for the printable résumé. Falls back to the first highlights. */
  resume?: string[];
  /** Concrete capabilities and outcomes. */
  highlights: string[];
  stack: string[];
  /** Bullets for the "How it's secured & shipped" section. */
  security: string[];
  preview: PreviewKind;
  /** Public links only. Most repos are private, so this is usually empty. */
  links: { label: string; href: string }[];
}

export interface Metric {
  value: string;
  label: string;
  /** Where the number comes from. Kept for reference; not rendered. */
  source: string;
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface Experience {
  org: string;
  role: string;
  type: string;
  period: string;
  summary: string;
  /** Résumé bullets. Falls back to `summary` when absent. */
  bullets?: string[];
}

export interface Credential {
  name: string;
  issuer: string;
  year: string;
  /** Plain-language status, shown as written. */
  status: string;
}

export interface EventAttended {
  name: string;
  /** My role at the event, e.g. "Attendee". */
  role: string;
  year: string;
  image: string;
  /** Intrinsic pixel size of `image`, for layout-stable rendering. */
  width: number;
  height: number;
  alt: string;
}

export interface Profile {
  name: string;
  /** Short brand name: the header logo and the word the home page particle field assembles. */
  handle: string;
  headline: string;
  subheadline: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  languages: string[];
  /** Main photo: the hero, the desktop Notes window and structured data. */
  portrait: { src: string; alt: string; width: number; height: number };
  /** Second, informal photo for the About section. */
  casual: { src: string; alt: string; width: number; height: number };
  education: Education;
  experience: Experience[];
  credentials: Credential[];
  events: EventAttended[];
  /** Canonical origin, used for metadata, the sitemap, structured data and the résumé. */
  siteUrl: string;
  about: string[];
  skills: { group: string; items: string[] }[];
  metrics: Metric[];
  /** Two or three sentences for the top of the résumé. */
  resumeSummary?: string;
}
