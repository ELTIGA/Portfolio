export type PreviewKind = "web" | "terminal" | "menubar";

export interface Project {
  slug: string;
  name: string;
  /** One line shown on cards. */
  tagline: string;
  /** Lower number = shown first. */
  order: number;
  featured: boolean;
  role: string;
  status: string;
  /** 2–3 sentences: what was built (and the problem, when `problem` is not set). */
  summary: string;
  /** The situation that made this worth building. Facts from the repo docs or the owner only. */
  problem?: string;
  /** What changed as a result. Only measured or owner-stated outcomes; no adoption claims. */
  outcome?: string;
  /** Engineering decisions and trade-offs, each taken from repo docs. One sentence each. */
  decisions?: string[];
  /** Documented roadmap items (from the repo's own backlog), never invented. */
  nextSteps?: string[];
  /** 2–3 concise bullets for the printable résumé. Falls back to the first highlights. */
  resume?: string[];
  /** Concrete capabilities / outcomes. Facts only. */
  highlights: string[];
  stack: string[];
  /** "How it's secured & shipped". Facts verified against the repo. */
  security: string[];
  preview: PreviewKind;
  /** Public links only. Most repos are private, so this is usually empty. */
  links: { label: string; href: string }[];
}

export interface Metric {
  value: string;
  label: string;
  /** Source of the number; shown only in dev notes. */
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
  /** What the owner actually did there. Never "speaker" unless true. */
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
  handle: string;
  headline: string;
  subheadline: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  languages: string[];
  portrait: { src: string; alt: string; width: number; height: number };
  casual: { src: string; alt: string; width: number; height: number };
  education: Education;
  experience: Experience[];
  credentials: Credential[];
  events: EventAttended[];
  /** Canonical origin, used for metadata. Replace once the domain is chosen. */
  siteUrl: string;
  about: string[];
  skills: { group: string; items: string[] }[];
  metrics: Metric[];
  /** Two or three sentences for the top of the résumé. */
  resumeSummary?: string;
}
