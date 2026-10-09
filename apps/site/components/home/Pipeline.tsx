"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/fx/gsap";

/**
 * Express Ops' release path as a live pipeline: as the section scrolls through, a
 * signal packet travels the stages and each one flips from waiting to passed.
 */
export function Pipeline({ stages }: { stages: { name: string; detail: string }[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let disposed = false;
    let revert = () => {};
    void loadGsap().then(({ gsap }) => {
      const el = root.current;
      if (disposed || !el) return;
      const ctx = gsap.context(() => {
        const nodes = gsap.utils.toArray<HTMLElement>("[data-stage]", el);
        const rail = el.querySelector("[data-rail]");
        nodes.forEach((n) => n.setAttribute("data-state", "wait"));
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        });
        tl.fromTo(rail, { "--p": 0 }, { "--p": 1, ease: "none", duration: nodes.length }, 0);
        nodes.forEach((n, i) => {
          tl.call(() => n.setAttribute("data-state", tl.scrollTrigger!.direction < 0 ? "wait" : "pass"), [], i + 0.5);
        });
      }, el);
      revert = () => ctx.revert();
    });
    return () => {
      disposed = true;
      revert();
    };
  }, []);

  return (
    <div ref={root} className="relative">
      {/* Rail: horizontal from md up, vertical on phones. */}
      <div
        data-rail=""
        aria-hidden="true"
        className="absolute bottom-3 left-[11px] top-3 w-px bg-line [--p:1] md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto"
      >
        <div className="h-full w-full origin-top bg-gradient-to-b from-accent to-signal max-md:[transform:scaleY(var(--p))] md:origin-left md:bg-gradient-to-r md:[transform:scaleX(var(--p))]" />
        <div className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_24px_6px_rgb(255_181_71/0.7)] max-md:left-1/2 max-md:top-[calc(var(--p)*100%)] md:left-[calc(var(--p)*100%)] md:top-1/2" />
      </div>
      <ol className="relative grid gap-8 md:grid-cols-6 md:gap-4">
        {stages.map((s, i) => (
          <li key={s.name} data-stage="" data-state="pass" className="group flex gap-5 md:block">
            <span
              aria-hidden="true"
              className="relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-line bg-bg font-mono text-[10px] text-muted transition-colors duration-300 group-data-[state=pass]:border-accent group-data-[state=pass]:bg-accent group-data-[state=pass]:text-accent-ink"
            >
              {i + 1}
            </span>
            <span className="block md:mt-5">
              <span className="block font-display text-3xl font-bold uppercase leading-none transition-colors duration-300 group-data-[state=wait]:text-muted">{s.name}</span>
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                <span className="group-data-[state=wait]:hidden text-accent">[pass] </span>
                <span className="hidden group-data-[state=wait]:inline">[wait] </span>
                {s.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
