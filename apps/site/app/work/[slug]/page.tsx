import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, profile, projects } from "@portfolio/content";
import { DemoSlot } from "@/components/demos/DemoSlot";
import { diagrams } from "@/components/diagrams/registry";
import { EmailCta } from "@/components/EmailCta";
import { TrackView } from "@/components/TrackView";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.name} · ${profile.name}`;
  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    // Child openGraph/twitter objects replace the root ones, so set every field.
    openGraph: { title, description: project.tagline, url: `/work/${project.slug}`, type: "article", siteName: profile.name },
    twitter: { card: "summary_large_image", title, description: project.tagline },
  };
}

export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const Diagram = diagrams[project.slug];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <TrackView slug={project.slug} />
      <Link href="/#work" className="font-mono text-xs text-muted hover:text-fg">← All work</Link>
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-accent">{project.role}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{project.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{project.tagline}</p>
      <p className="mt-3 font-mono text-xs text-muted">Status: {project.status}</p>

      {project.problem && (
        <section className="mt-12" aria-labelledby="problem">
          <h2 id="problem" className="text-xl font-semibold">The problem</h2>
          <p className="mt-3 leading-relaxed text-muted">{project.problem}</p>
        </section>
      )}

      <section className="mt-12" aria-labelledby="overview">
        <h2 id="overview" className="text-xl font-semibold">{project.problem ? "What I built" : "Overview"}</h2>
        <p className="mt-3 leading-relaxed text-muted">{project.summary}</p>
        {project.outcome && (
          <p className="mt-4 rounded-lg border border-line bg-surface p-4 text-sm leading-relaxed">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">Outcome</span>
            <span className="mt-1 block text-muted">{project.outcome}</span>
          </p>
        )}
      </section>

      <section className="mt-12" aria-labelledby="highlights">
        <h2 id="highlights" className="text-xl font-semibold">What it does</h2>
        <ul className="mt-3 space-y-2 text-muted">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2 leading-relaxed">
              <span aria-hidden="true" className="font-mono text-accent">›</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="preview">
        <h2 id="preview" className="text-xl font-semibold">Try it</h2>
        <p className="mt-2 text-sm text-muted">A working replica of the real interface, running on made-up sample data.</p>
        <div className="mt-4">
          <DemoSlot slug={project.slug} name={project.name} kind={project.preview} />
        </div>
      </section>

      {Diagram && (
        <section className="mt-12" aria-labelledby="architecture">
          <h2 id="architecture" className="text-xl font-semibold">Architecture</h2>
          <p className="mt-2 text-sm text-muted">How the pieces connect, drawn from the project&apos;s own documentation.</p>
          <div className="mt-4">
            <Diagram />
          </div>
        </section>
      )}

      {project.decisions && project.decisions.length > 0 && (
        <section className="mt-12" aria-labelledby="decisions">
          <h2 id="decisions" className="text-xl font-semibold">Engineering decisions</h2>
          <ul className="mt-3 space-y-3 text-muted">
            {project.decisions.map((d) => (
              <li key={d} className="flex gap-2 leading-relaxed">
                <span aria-hidden="true" className="font-mono text-accent">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.security.length > 0 && (
        <section className="mt-12" aria-labelledby="security">
          <h2 id="security" className="text-xl font-semibold">How it&apos;s secured and shipped</h2>
          <ul className="mt-3 space-y-2 text-muted">
            {project.security.map((s) => (
              <li key={s} className="flex gap-2 leading-relaxed">
                <span aria-hidden="true" className="font-mono text-accent">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.nextSteps && project.nextSteps.length > 0 && (
        <section className="mt-12" aria-labelledby="next">
          <h2 id="next" className="text-xl font-semibold">What&apos;s next</h2>
          <p className="mt-2 text-sm text-muted">From the project&apos;s own roadmap.</p>
          <ul className="mt-3 space-y-2 text-muted">
            {project.nextSteps.map((n) => (
              <li key={n} className="flex gap-2 leading-relaxed">
                <span aria-hidden="true" className="font-mono text-accent">›</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12" aria-labelledby="stack">
        <h2 id="stack" className="text-xl font-semibold">Stack</h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li key={s} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">{s}</li>
          ))}
        </ul>
      </section>

      <div className="mt-16 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Want this kind of work on your team?</h2>
        <div className="mt-4"><EmailCta surface="case-study" /></div>
      </div>
    </main>
  );
}
