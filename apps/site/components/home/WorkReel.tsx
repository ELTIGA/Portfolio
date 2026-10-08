import Link from "next/link";
import type { Project } from "@portfolio/content";
import { diagrams } from "@/components/diagrams/registry";

/** Featured projects as full-height case-file panels inside the pinned reel. */
export function WorkPanel({ project, index }: { project: Project; index: number }) {
  const Diagram = diagrams[project.slug];
  const num = String(index + 1).padStart(2, "0");
  return (
    <article
      data-panel=""
      aria-labelledby={`panel-${project.slug}`}
      className="brackets relative grid shrink-0 snap-center gap-8 overflow-hidden border border-line/60 bg-surface/70 p-6 backdrop-blur-md sm:p-10 lg:h-[min(78dvh,720px)] lg:w-[min(84vw,1180px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <span
        data-numeral=""
        aria-hidden="true"
        className="font-display text-outline pointer-events-none absolute -bottom-10 -left-4 select-none text-[14rem] font-black leading-none sm:text-[20rem]"
      >
        {num}
      </span>
      <div className="relative flex min-h-0 flex-col">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">file {num}</span>
          <span className="h-px flex-1 bg-line" />
          <span>{project.role}</span>
        </p>
        <h3 id={`panel-${project.slug}`} className="font-display mt-6 text-6xl font-extrabold uppercase leading-[0.85] sm:text-8xl">
          {project.name}
        </h3>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-fg/85">{project.tagline}</p>
        <p className="mt-6 flex items-start gap-2 font-mono text-xs leading-relaxed text-muted">
          <span className="blink mt-1 h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden="true" />
          <span>{project.status}</span>
        </p>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">{project.stack.slice(0, 6).join("  /  ")}</p>
        <Link
          href={`/work/${project.slug}`}
          data-cursor="open"
          className="group relative mt-8 inline-flex w-fit items-center gap-3 border border-accent/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-accent-ink lg:mt-auto"
        >
          Open case file
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          <span className="sr-only">: {project.name}</span>
        </Link>
      </div>
      {Diagram && (
        <div className="relative min-h-0 border-t border-line/60 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">architecture · from the repo docs</p>
          <div className="h-[calc(100%-1.75rem)] min-h-0">
            <Diagram variant="panel" />
          </div>
        </div>
      )}
    </article>
  );
}
