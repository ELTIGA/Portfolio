import Link from "next/link";
import type { Project } from "@portfolio/content";

export function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent/60"
    >
      <p className="font-mono text-xs text-muted">{project.role}</p>
      <h3 className={`mt-2 font-semibold tracking-tight ${large ? "text-xl" : "text-lg"}`}>{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
        {project.stack.slice(0, large ? 6 : 4).map((s) => (
          <li key={s} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted">{s}</li>
        ))}
      </ul>
      <span className="mt-auto pt-5 font-mono text-xs text-accent group-hover:underline">Read the case study →</span>
    </Link>
  );
}
