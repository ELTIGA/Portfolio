import { profile, type Project } from "@portfolio/content";
import { isTraining, jobTitle } from "./markdown";

// schema.org JSON-LD. Every page carries the same Person node under one @id, so search engines
// and LLMs resolve the site, the résumé and each case study to the same entity.

const site = profile.siteUrl;
const personId = `${site}/#person`;
const websiteId = `${site}/#website`;
const person = { "@id": personId };

function personNode() {
  return {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    alternateName: profile.handle,
    url: site,
    image: `${site}${profile.portrait.src}`,
    email: `mailto:${profile.email}`,
    jobTitle,
    description: profile.subheadline,
    knowsLanguage: profile.languages,
    knowsAbout: profile.skills.flatMap((g) => g.items),
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
    hasCredential: profile.credentials
      .filter((c) => !isTraining(c.status))
      .map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.name,
        recognizedBy: { "@type": "Organization", name: c.issuer },
      })),
    sameAs: [profile.github, profile.linkedin],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site,
    name: profile.name,
    description: profile.subheadline,
    inLanguage: "en",
    publisher: person,
  };
}

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${site}${item.path}`,
  })),
});

const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

export function homeJsonLd() {
  return graph(
    websiteNode(),
    {
      "@type": "ProfilePage",
      "@id": `${site}/#profile`,
      url: site,
      isPartOf: { "@id": websiteId },
      mainEntity: person,
    },
    personNode(),
  );
}

export function resumeJsonLd() {
  const url = `${site}/resume`;
  return graph(
    {
      "@type": "ProfilePage",
      "@id": `${url}#profile`,
      url,
      name: `Résumé · ${profile.name}`,
      isPartOf: { "@id": websiteId },
      mainEntity: person,
    },
    personNode(),
    breadcrumbs([
      { name: profile.name, path: "" },
      { name: "Résumé", path: "/resume" },
    ]),
  );
}

export function projectJsonLd(p: Project) {
  const url = `${site}/work/${p.slug}`;
  return graph(
    {
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: `${p.name}: ${p.tagline}`,
      description: p.tagline,
      author: person,
      publisher: person,
      isPartOf: { "@id": websiteId },
      inLanguage: "en",
      image: `${url}/opengraph-image`,
      keywords: p.stack.join(", "),
      about: {
        "@type": "CreativeWork",
        name: p.name,
        description: p.summary,
        creator: person,
        ...(p.live && { url: p.live.url }),
        ...(p.links.length > 0 && { sameAs: p.links.map((l) => l.href) }),
      },
    },
    personNode(),
    breadcrumbs([
      { name: profile.name, path: "" },
      { name: p.name, path: `/work/${p.slug}` },
    ]),
  );
}

/** Script-safe JSON for a `<script type="application/ld+json">` body. */
export const jsonLdHtml = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
