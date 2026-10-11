"use client";

import Image from "next/image";
import type { Project } from "@portfolio/content";
import { DemoFrame } from "@/components/frames/DemoFrame";
import { track } from "@/lib/track";

/**
 * A screenshot of a project's production site that opens it in a new tab. The live sites send
 * X-Frame-Options: DENY, so they can't be embedded; the poster is a self-hosted image.
 */
export function LivePreview({
  slug,
  name,
  live,
  height,
}: {
  slug: string;
  name: string;
  live: NonNullable<Project["live"]>;
  height?: number;
}) {
  const host = new URL(live.url).host;
  const portrait = live.poster.height > live.poster.width;

  return (
    <div style={height ? { height } : undefined} className="h-full w-full">
      <DemoFrame title={name} host={host} badge="live">
        <a
          href={live.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("live_open", { slug })}
          aria-label={`Open ${name} at ${host} (opens in a new tab)`}
          data-cursor="open"
          className={`group grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-6 p-4 sm:p-6 md:grid-rows-1 md:items-center ${
            portrait ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
          }`}
        >
          <span className="relative block h-full min-h-40 overflow-hidden border border-line bg-bg">
            <Image
              src={live.poster.src}
              alt={live.poster.alt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/80 to-transparent"
            />
          </span>
          <span className="block">
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              <span aria-hidden="true" className="blink h-1.5 w-1.5 shrink-0 bg-signal" />
              live in production
            </span>
            <span className="font-display mt-4 block text-[clamp(1.75rem,5vw,3.25rem)] font-extrabold uppercase leading-none [overflow-wrap:anywhere]">
              Open {name}
            </span>
            <span className="mt-3 block max-w-sm text-sm leading-relaxed text-muted">
              The real site, not a replica. Opens {host} in a new tab.
            </span>
            <span className="mt-6 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink transition-shadow group-hover:shadow-[0_0_40px_-4px_rgb(255_181_71/0.7)]">
              Visit site <span aria-hidden="true">↗</span>
            </span>
          </span>
        </a>
      </DemoFrame>
    </div>
  );
}
