import { profile, projects, type Project } from "@portfolio/content";

// Plain-Markdown versions of the site for AI agents and LLM crawlers: /llms.txt, /llms-full.txt
// and a .md twin of each HTML page. Built from the same content package as the pages, so the
// two never drift, and held to the same rule: nothing here that the pages don't say.

export const jobTitle = "DevSecOps & AI-enabled full-stack engineer";

const site = profile.siteUrl;
const sorted = [...projects].sort((a, b) => a.order - b.order);
// The résumé keeps to the strongest few so a skim lands on them; the full list lives at /work.
export const resumeProjects = sorted.slice(0, 5);
/** AWS Skill Builder is training, not a certification: never list it as a credential. */
export const isTraining = (status: string) => status.includes("not an AWS certification");

/** The .md twin of an HTML path: "/" -> "/index.md", "/work/x" -> "/work/x.md". */
export const markdownPath = (path: string) => (path === "/" ? "/index.md" : `${path}.md`);

const list = (items: string[] = []) => items.map((i) => `- ${i}`).join("\n");
const section = (title: string, body: string) => `## ${title}\n\n${body}`;
const doc = (...parts: (string | false | 0 | undefined)[]) => `${parts.filter(Boolean).join("\n\n")}\n`;

function contact() {
  return list([
    `Email: ${profile.email}`,
    `GitHub: ${profile.github}`,
    `LinkedIn: ${profile.linkedin}`,
    `Website: ${site}`,
  ]);
}

function credentials() {
  return list(profile.credentials.map((c) => `${c.name}, ${c.issuer}. ${c.status}.`));
}

function projectIndex() {
  return list(sorted.map((p) => `[${p.name}](${site}${markdownPath(`/work/${p.slug}`)}): ${p.tagline}`));
}

export function homeMarkdown() {
  return doc(
    `# ${profile.name}: ${jobTitle}`,
    `> ${profile.headline}`,
    profile.subheadline,
    `${profile.availability}.`,
    section("About", profile.about.join("\n\n")),
    section("Key numbers", list(profile.metrics.map((m) => `${m.value}: ${m.label}`))),
    section("Case studies", projectIndex()),
    section(
      "Experience",
      profile.experience.map((e) => `### ${e.role}, ${e.org} (${e.period})\n\n${e.type}. ${e.summary}`).join("\n\n"),
    ),
    section("Skills", list(profile.skills.map((g) => `${g.group}: ${g.items.join(", ")}`))),
    section(
      "Education and credentials",
      list([
        `${profile.education.degree}, ${profile.education.school}. ${profile.education.year}.`,
        ...profile.credentials.map((c) => `${c.name}, ${c.issuer}. ${c.status}.`),
      ]),
    ),
    section("Events", list(profile.events.map((e) => `${e.name} ${e.year} (${e.role.toLowerCase()})`))),
    section("Languages", profile.languages.join(", ")),
    section("Contact", contact()),
  );
}

export function projectMarkdown(p: Project) {
  return doc(
    `# ${p.name}`,
    `> ${p.tagline}`,
    list([`Role: ${p.role}`, `Status: ${p.status}`, `Stack: ${p.stack.join(", ")}`, `Author: ${profile.name}`]),
    p.problem && section("The problem", p.problem),
    section(p.problem ? "The build" : "Overview", p.summary),
    p.outcome && section("Result", p.outcome),
    section("What it does", list(p.highlights)),
    p.decisions?.length && section("Engineering decisions", list(p.decisions)),
    p.security.length > 0 && section("How it's secured and shipped", list(p.security)),
    p.nextSteps?.length && section("Next", list(p.nextSteps)),
    p.links.length > 0 && section("Links", list(p.links.map((l) => `[${l.label}](${l.href})`))),
    `Case study: ${site}/work/${p.slug}`,
  );
}

export function resumeMarkdown() {
  const certifications = profile.credentials.filter((c) => !isTraining(c.status));
  const training = profile.credentials.filter((c) => isTraining(c.status));
  return doc(
    `# ${profile.name}: résumé`,
    `${jobTitle}`,
    contact(),
    section("Summary", profile.resumeSummary ?? profile.subheadline),
    section(
      "Experience",
      profile.experience
        .map((e) => `### ${e.role}, ${e.org} (${e.period})\n\n${e.type}\n\n${list(e.bullets ?? [e.summary])}`)
        .join("\n\n"),
    ),
    section(
      "Projects",
      resumeProjects
        .map(
          (p) =>
            `### ${p.name} (${p.role})\n\n${list(p.resume ?? p.highlights.slice(0, 2))}\n\nStack: ${p.stack.join(", ")}`,
        )
        .join("\n\n"),
    ),
    section("Skills", list(profile.skills.map((g) => `${g.group}: ${g.items.join(", ")}`))),
    section("Education", `${profile.education.degree}, ${profile.education.school}. ${profile.education.year}.`),
    section(
      "Certifications and training",
      list([...certifications, ...training].map((c) => `${c.name}, ${c.issuer}. ${c.status}.`)),
    ),
    section("Events", list(profile.events.map((e) => `${e.name} ${e.year} (${e.role.toLowerCase()})`))),
    section("Languages", profile.languages.join(", ")),
  );
}

/** https://llmstxt.org: a short index pointing agents at the Markdown pages. */
export function llmsTxt() {
  return doc(
    `# ${profile.name}`,
    `> ${jobTitle}. ${profile.headline}`,
    profile.subheadline,
    `${profile.availability}. Every claim on this site is first-hand or documented in the project's own repository. Most project source code is private; the case studies describe the work.`,
    section(
      "Pages",
      list([
        `[Home](${site}${markdownPath("/")}): profile, experience, skills, credentials and contact`,
        `[Résumé](${site}${markdownPath("/resume")}): printable résumé`,
        `[Full site in one file](${site}/llms-full.txt): every page below, concatenated`,
      ]),
    ),
    section("Case studies", projectIndex()),
    section("Contact", contact()),
    section("Credentials", credentials()),
    section("Optional", list([`[Sitemap](${site}/sitemap.xml)`, `[GitHub profile](${profile.github})`])),
  );
}

/** Every page in one file, for agents that want the whole site in a single request. */
export function llmsFullTxt() {
  return [homeMarkdown(), resumeMarkdown(), ...sorted.map(projectMarkdown)].join("\n---\n\n");
}

/** Response for a Markdown route: canonical points back at the HTML page. */
export function markdownResponse(body: string, htmlPath: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${site}${htmlPath === "/" ? "" : htmlPath}>; rel="canonical"`,
    },
  });
}
