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
  /** 2–3 sentences: the problem and what was built. */
  summary: string;
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

export interface Profile {
  name: string;
  handle: string;
  headline: string;
  subheadline: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  /** Languages spoken. Null until the owner provides them (hidden in the UI). */
  languages: string[] | null;
  /** Path under /public. Null until the owner provides a photo. */
  photo: string | null;
  /** Canonical origin, used for metadata. Replace once the domain is chosen. */
  siteUrl: string;
  about: string[];
  skills: { group: string; items: string[] }[];
  metrics: Metric[];
}
