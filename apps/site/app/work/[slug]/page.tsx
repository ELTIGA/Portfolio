import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getProject, profile, projects } from "@portfolio/content";
import { DemoSlot } from "@/components/demos/DemoSlot";
import { diagrams } from "@/components/diagrams/registry";
import { EmailCta } from "@/components/EmailCta";
import { Cursor } from "@/components/fx/Cursor";
import { FxRoot } from "@/components/fx/FxRoot";
import { Magnetic } from "@/components/fx/Magnetic";
import { TrackView } from "@/components/TrackView";
import { Toc } from "@/components/work/Toc";

type Params = { slug: string };

const ordered = [...projects].sort((a, b) => a.order - b.order);

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

function Block({ id, n, title, note, children }: { id: string; n: number; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 border-t border-line pt-6">
      <p data-reveal="wipe" className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        § {String(n).padStart(2, "0")}
      </p>
      <h2 id={`${id}-h`} data-scramble className="font-display mt-3 text-4xl font-extrabold uppercase leading-[0.9] sm:text-5xl">
        {title}
      </h2>
      {note && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const Diagram = diagrams[project.slug];
  const index = ordered.findIndex((p) => p.slug === project.slug);
  const prev = ordered[(index - 1 + ordered.length) % ordered.length];
  const next = ordered[(index + 1) % ordered.length];

  const toc = [
    project.problem && { id: "problem", label: "Problem" },
    { id: "build", label: project.problem ? "The build" : "Overview" },
    { id: "capabilities", label: "What it does" },
    { id: "preview", label: "Run it" },
    Diagram && { id: "architecture", label: "Architecture" },
    project.decisions?.length && { id: "decisions", label: "Decisions" },
    project.security.length && { id: "security", label: "Secured & shipped" },
    project.nextSteps?.length && { id: "next", label: "Next" },
  ].filter(Boolean) as { id: string; label: string }[];
  const num = (id: string) => toc.findIndex((t) => t.id === id) + 1;

  return (
    <>
      <FxRoot />
      <Cursor />
      <div aria-hidden="true" className="atmosphere" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_0%,rgb(255_181_71/0.12),transparent_70%)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-bg via-bg/80 to-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="font-display text-2xl font-black uppercase leading-none tracking-wide">
            {profile.handle}
            <span className="text-accent">.</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-7">
            <Link href="/#work" className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg">
              ← All work
            </Link>
            <Magnetic>
              <EmailCta className="!px-4 !py-2.5" label="Email" surface="case-study-header" />
            </Magnetic>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <TrackView slug={project.slug} />
        <p className="hero-in flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">case file {String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-line" aria-hidden="true" />
          <span>{project.role}</span>
        </p>
        <h1 className="hero-in font-display mt-6 text-7xl font-black uppercase leading-[0.82] tracking-tight sm:text-9xl lg:text-[11rem]" style={{ animationDelay: "120ms" }}>
          {project.name}
        </h1>
        <p className="hero-in mt-8 max-w-3xl text-xl leading-snug text-fg/90 sm:text-2xl" style={{ animationDelay: "240ms" }}>
          {project.tagline}
        </p>
        <dl className="hero-in mt-12 grid gap-px border border-line bg-line sm:grid-cols-[1fr_1fr_2fr]" style={{ animationDelay: "360ms" }}>
          {[
            { k: "Role", v: project.role },
            { k: "Stack", v: `${project.stack.length} components` },
            { k: "Status", v: project.status },
          ].map((r) => (
            <div key={r.k} className="bg-bg/90 p-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{r.k}</dt>
              <dd className="mt-2 flex items-start gap-2 text-sm leading-relaxed">
                {r.k === "Status" && <span aria-hidden="true" className="blink mt-1.5 h-1.5 w-1.5 shrink-0 bg-signal" />}
                {r.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-24 grid gap-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
          <aside>
            <Toc items={toc} />
          </aside>

          <div className="min-w-0 space-y-24">
            {project.problem && (
              <Block id="problem" n={num("problem")} title="The problem">
                <p data-reveal="up" className="max-w-3xl text-xl leading-relaxed text-fg/85">
                  {project.problem}
                </p>
              </Block>
            )}

            <Block id="build" n={num("build")} title={project.problem ? "The build" : "Overview"}>
              <p data-reveal="up" className="max-w-3xl text-xl leading-relaxed text-fg/85">
                {project.summary}
              </p>
              {project.outcome && (
                <div data-reveal="wipe" className="brackets relative mt-10 bg-accent/[0.06] p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">result</p>
                  <p className="mt-3 text-lg leading-relaxed text-fg">{project.outcome}</p>
                </div>
              )}
            </Block>

            <Block id="capabilities" n={num("capabilities")} title="What it does">
              <ol className="grid gap-px border border-line bg-line md:grid-cols-2">
                {project.highlights.map((h, i) => (
                  <li key={h} data-reveal="up" className="bg-bg p-6">
                    <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-3 leading-relaxed text-fg/85">{h}</p>
                  </li>
                ))}
              </ol>
            </Block>

            <Block id="preview" n={num("preview")} title={`Run ${project.name}`} note="A working replica of the real interface, on made-up sample data">
              <div className="brackets p-2 sm:p-3 lg:-mr-8">
                <DemoSlot slug={project.slug} name={project.name} kind={project.preview} />
              </div>
            </Block>

            {Diagram && (
              <Block id="architecture" n={num("architecture")} title="Architecture" note="Drawn from the project's own documentation">
                <Diagram />
              </Block>
            )}

            {project.decisions && project.decisions.length > 0 && (
              <Block id="decisions" n={num("decisions")} title="Engineering decisions">
                <ol className="space-y-0">
                  {project.decisions.map((d, i) => (
                    <li key={d} data-reveal="up" className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-line py-6 first:pt-0">
                      <span className="font-mono text-xs text-accent">D-{String(i + 1).padStart(2, "0")}</span>
                      <p className="leading-relaxed text-fg/85">{d}</p>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {project.security.length > 0 && (
              <Block id="security" n={num("security")} title="Secured and shipped">
                <ul className="space-y-4 font-mono text-[13px] leading-relaxed text-muted">
                  {project.security.map((s) => (
                    <li key={s} data-reveal="up" className="grid grid-cols-[3.6rem_1fr] gap-3">
                      <span className="text-accent">[pass]</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.nextSteps && project.nextSteps.length > 0 && (
              <Block id="next" n={num("next")} title="What's next" note="From the project's own roadmap">
                <ul className="space-y-4 font-mono text-[13px] leading-relaxed text-muted">
                  {project.nextSteps.map((n) => (
                    <li key={n} data-reveal="up" className="grid grid-cols-[3.6rem_1fr] gap-3">
                      <span className="text-signal">[todo]</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <div data-reveal="up">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">stack</p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-fg/85">{project.stack.join("  /  ")}</p>
            </div>
          </div>
        </div>

        <section aria-labelledby="cta" className="brackets relative mt-32 overflow-hidden p-8 sm:p-14">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgb(255_181_71/0.14),transparent_60%)]" />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-accent">open channel</p>
          <h2 id="cta" className="font-display relative mt-4 max-w-3xl text-5xl font-extrabold uppercase leading-[0.88] sm:text-7xl">
            Have a problem shaped like this one?
          </h2>
          <p className="relative mt-5 max-w-xl text-muted">Tell me what your team is stuck on and what you need built.</p>
          <div className="relative mt-8">
            <Magnetic>
              <EmailCta surface="case-study" />
            </Magnetic>
          </div>
        </section>

        <nav aria-label="More case studies" className="mt-24 grid gap-px border border-line bg-line sm:grid-cols-2">
          {[
            { p: prev, dir: "previous" },
            { p: next, dir: "next" },
          ].map(({ p, dir }) => (
            <Link
              key={dir}
              href={`/work/${p.slug}`}
              data-cursor="open"
              className={`group bg-bg p-6 transition-colors hover:bg-surface sm:p-10 ${dir === "next" ? "sm:text-right" : ""}`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                {dir === "previous" ? "← previous file" : "next file →"}
              </span>
              <span className="font-display mt-3 block text-4xl font-extrabold uppercase leading-none transition-colors group-hover:text-accent sm:text-6xl">
                {p.name}
              </span>
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
