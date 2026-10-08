import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@portfolio/content";
import { EmailCta } from "@/components/EmailCta";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.name, description: project.tagline, url: `/work/${project.slug}` },
  };
}

export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/#work" className="font-mono text-xs text-muted hover:text-fg">← All work</Link>
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-accent">{project.role}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{project.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{project.tagline}</p>
      <p className="mt-3 font-mono text-xs text-muted">Status: {project.status}</p>

      <section className="mt-12" aria-labelledby="overview">
        <h2 id="overview" className="text-xl font-semibold">The problem and what I built</h2>
        <p className="mt-3 leading-relaxed text-muted">{project.summary}</p>
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

      {/* TODO: interactive preview (DemoFrame) goes here, kind: {project.preview} */}

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
        <div className="mt-4"><EmailCta /></div>
      </div>
    </main>
  );
}
