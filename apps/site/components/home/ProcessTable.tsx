"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { finePointer } from "@/components/fx/gsap";
import { scramble } from "@/components/fx/scramble";

export interface ProcessRow {
  slug: string;
  name: string;
  role: string;
  status: string;
  tagline: string;
  stack: string[];
}

/**
 * Smaller projects as a process listing. On mouse devices a preview card trails the
 * cursor over the table and each name re-decodes on hover; every row is a plain link.
 */
export function ProcessTable({ rows }: { rows: ProcessRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  useEffect(() => {
    if (!finePointer()) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = pos.current;
      p.cx += (p.x - p.cx) * 0.14;
      p.cy += (p.y - p.cy) * 0.14;
      if (card.current) card.current.style.transform = `translate3d(${p.cx + 28}px, ${p.cy - 60}px, 0) rotate(${(p.x - p.cx) * 0.04}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const row = active === null ? null : rows[active];
  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        pos.current.x = e.clientX - r.left;
        pos.current.y = e.clientY - r.top;
      }}
      onPointerLeave={() => setActive(null)}
    >
      <div aria-hidden="true" className="grid grid-cols-[3.5rem_1fr_auto] gap-4 border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:grid-cols-[4rem_1.2fr_1fr_1.4fr]">
        <span>pid</span>
        <span>process</span>
        <span className="hidden sm:block">role</span>
        <span className="text-right sm:text-left">state</span>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li key={r.slug} data-reveal="up">
            <Link
              href={`/work/${r.slug}`}
              data-cursor="open"
              onPointerEnter={(e) => {
                setActive(i);
                const name = e.currentTarget.querySelector<HTMLElement>("[data-name]");
                if (name) scramble(name, { duration: 450 });
              }}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 border-b border-line py-5 transition-colors hover:bg-accent/[0.04] sm:grid-cols-[4rem_1.2fr_1fr_1.4fr] sm:py-7"
            >
              <span className="font-mono text-xs text-muted">{String(1024 + i * 97)}</span>
              <span data-name className="font-display text-3xl font-bold uppercase leading-none transition-colors group-hover:text-accent sm:text-5xl">
                {r.name}
              </span>
              <span className="hidden font-mono text-xs leading-relaxed text-muted sm:block">{r.role}</span>
              <span className="text-right font-mono text-xs leading-relaxed text-muted sm:text-left">
                <span className="text-signal" aria-hidden="true">● </span>
                <span className="hidden sm:inline">{r.status}</span>
              </span>
              <span className="col-span-full max-w-2xl text-sm leading-relaxed text-muted sm:col-start-2 [@media(pointer:fine)]:sr-only">{r.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div
        ref={card}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 hidden w-80 border border-accent/40 bg-bg/90 p-5 backdrop-blur-md transition-[opacity,scale] duration-300 [@media(pointer:fine)]:block ${row ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        {row && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{row.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-fg">{row.tagline}</p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">{row.stack.join(" / ")}</p>
          </>
        )}
      </div>
    </div>
  );
}
