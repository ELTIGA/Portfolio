import type { Metadata } from "next";
import Link from "next/link";
import { profile, projects } from "@portfolio/content";
import { PrintButton } from "./PrintButton";
import "./resume.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${profile.name}: résumé. Experience, projects, skills, education and credentials.`,
  alternates: { canonical: "/resume" },
  openGraph: { title: `Résumé · ${profile.name}`, url: "/resume" },
};

const sorted = [...projects].sort((a, b) => a.order - b.order);
const isTraining = (status: string) => status.includes("not an AWS certification");
const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function Resume() {
  const certifications = profile.credentials.filter((c) => !isTraining(c.status));
  const training = profile.credentials.filter((c) => isTraining(c.status));

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-10 print:p-0">
      <nav aria-label="Résumé tools" className="mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/" className="font-mono text-xs text-muted hover:text-fg">← Back to portfolio</Link>
        <PrintButton />
      </nav>

      <main>
        <article className="resume-paper" aria-labelledby="resume-name">
          <header>
            <h1 id="resume-name">{profile.name}</h1>
            <p className="resume-title">DevSecOps &amp; AI-enabled full-stack engineer</p>
            <p className="resume-contact">
              <a href={`mailto:${profile.email}`} data-cta="email" data-surface="resume">{profile.email}</a>
              <a href={profile.github} rel="noopener noreferrer">{bare(profile.github)}</a>
              <a href={profile.linkedin} rel="noopener noreferrer">{bare(profile.linkedin)}</a>
              <a href={profile.siteUrl}>{bare(profile.siteUrl)}</a>
            </p>
          </header>

          <section aria-labelledby="r-summary">
            <h2 id="r-summary">Summary</h2>
            <p className="mt-1.5">{profile.resumeSummary ?? profile.subheadline}</p>
          </section>

          <section aria-labelledby="r-experience">
            <h2 id="r-experience">Experience</h2>
            {profile.experience.map((e) => (
              <div key={e.org} className="resume-entry">
                <div className="resume-row">
                  <h3>{e.role}, {e.org}</h3>
                  <span className="resume-meta">{e.period}</span>
                </div>
                <p className="resume-meta">{e.type}</p>
                <ul className="resume-list">
                  {(e.bullets ?? [e.summary]).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section aria-labelledby="r-projects">
            <h2 id="r-projects">Projects</h2>
            {sorted.map((p) => (
              <div key={p.slug} className="resume-entry">
                <div className="resume-row">
                  <h3>{p.name}</h3>
                  <span className="resume-meta">{p.role}</span>
                </div>
                <ul className="resume-list">
                  {(p.resume ?? p.highlights.slice(0, 2)).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="resume-stack">Stack: {p.stack.join(", ")}</p>
              </div>
            ))}
            <p className="resume-meta mt-2">Source code for most projects is private; case studies at {bare(profile.siteUrl)}/work.</p>
          </section>

          <section aria-labelledby="r-skills">
            <h2 id="r-skills">Skills</h2>
            <ul className="mt-1.5 space-y-0.5">
              {profile.skills.map((g) => (
                <li key={g.group}>
                  <strong>{g.group}:</strong> {g.items.join(", ")}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="r-education">
            <h2 id="r-education">Education</h2>
            <div className="resume-entry">
              <div className="resume-row">
                <h3>{profile.education.degree}</h3>
                <span className="resume-meta">{profile.education.year}</span>
              </div>
              <p>{profile.education.school}</p>
            </div>
          </section>

          <section aria-labelledby="r-credentials">
            <h2 id="r-credentials">Certifications &amp; training</h2>
            <ul className="resume-list">
              {certifications.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>, {c.issuer}. {c.status}.
                </li>
              ))}
              {training.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>, {c.issuer}. {c.status}.
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="r-events">
            <h2 id="r-events">Events</h2>
            <p className="mt-1.5">{profile.events.map((e) => `${e.name} ${e.year} (${e.role.toLowerCase()})`).join("; ")}.</p>
          </section>

          <section aria-labelledby="r-languages">
            <h2 id="r-languages">Languages</h2>
            <p className="mt-1.5">{profile.languages.join(", ")}</p>
          </section>
        </article>
      </main>
    </div>
  );
}
