"use client";

import { useRef, useState } from "react";
import type { PreviewKind } from "@portfolio/content";
import { DemoFrame } from "@/components/frames/DemoFrame";
import { TerminalFrame } from "@/components/frames/TerminalFrame";
import { track } from "@/lib/track";
import { demos } from "./registry";

/** Framed, click-to-launch interactive preview. Nothing loads until the visitor asks for it. */
export function DemoSlot({ slug, name, kind, height = 560 }: { slug: string; name: string; kind: PreviewKind; height?: number }) {
  const [launched, setLaunched] = useState(false);
  const Demo = demos[slug];
  const interacted = useRef(false);
  if (!Demo) return null;
  const onInteract = () => {
    if (interacted.current) return;
    interacted.current = true;
    track("demo_interact", { slug });
  };

  const body = (
    <div className="h-full" onPointerDownCapture={onInteract} onKeyDownCapture={onInteract}>
      <Demo />
    </div>
  );

  return (
    <div style={{ height }} className="relative w-full">
      {launched ? (
        kind === "terminal" ? (
          <TerminalFrame title={`${name}: interactive preview`}>{body}</TerminalFrame>
        ) : (
          <DemoFrame title={name}>{body}</DemoFrame>
        )
      ) : (
        <button
          type="button"
          onClick={() => {
            track("demo_launch", { slug });
            setLaunched(true);
          }}
          data-cursor="run"
          className="bg-grid group relative grid h-full w-full place-items-center overflow-hidden border border-line bg-surface/80 px-4 text-center transition-colors hover:border-accent/60"
        >
          <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_181_71/0.12),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative">
            <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-accent">interactive preview · sample data</span>
            <span className="font-display mt-4 block text-[clamp(2rem,9vw,3.75rem)] font-extrabold uppercase leading-none [overflow-wrap:anywhere]">Run {name}</span>
            <span className="mt-3 block text-sm text-muted">Runs in your browser on invented data. Nothing is sent anywhere.</span>
            <span className="mt-7 inline-flex items-center gap-3 bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink transition-shadow group-hover:shadow-[0_0_40px_-4px_rgb(255_181_71/0.7)]">
              Launch preview <span aria-hidden="true">▶</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
