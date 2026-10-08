"use client";

import { useRef } from "react";
import Link from "next/link";
import { getProject } from "@portfolio/content";
import { DemoFrame } from "@/components/frames/DemoFrame";
import { TerminalFrame } from "@/components/frames/TerminalFrame";
import { demos } from "@/components/demos/registry";
import { track } from "@/lib/track";

export function ProjectApp({ slug }: { slug: string }) {
  const project = getProject(slug);
  const Demo = demos[slug];
  const interacted = useRef(false);
  if (!project || !Demo) return <p className="p-4 text-sm text-muted">Project not found.</p>;
  const body = (
    <div
      className="h-full"
      onPointerDownCapture={() => {
        if (interacted.current) return;
        interacted.current = true;
        track("demo_interact", { slug });
      }}
    >
      <Demo />
    </div>
  );
  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted">
        <span className="truncate">{project.tagline}</span>
        <Link href={`/work/${project.slug}`} className="shrink-0 text-accent hover:underline">Case study →</Link>
      </div>
      <div className="min-h-0 flex-1">
        {project.preview === "terminal" ? <TerminalFrame title={`${project.name}: interactive preview`}>{body}</TerminalFrame> : <DemoFrame title={project.name}>{body}</DemoFrame>}
      </div>
    </div>
  );
}
