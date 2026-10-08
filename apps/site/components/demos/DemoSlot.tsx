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
          className="grid h-full w-full place-items-center rounded-xl border border-dashed border-line bg-surface text-center transition hover:border-accent/60"
        >
          <span>
            <span className="block font-mono text-xs uppercase tracking-widest text-accent">interactive preview</span>
            <span className="mt-2 block text-lg font-semibold">Try {name} with sample data</span>
            <span className="mt-1 block text-sm text-muted">Runs in your browser. No real customer data.</span>
            <span className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">Launch preview</span>
          </span>
        </button>
      )}
    </div>
  );
}
