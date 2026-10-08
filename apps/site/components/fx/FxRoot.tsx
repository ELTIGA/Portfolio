"use client";

import { useEffect } from "react";
import { loadGsap, prefersReducedMotion } from "./gsap";
import { setLenis } from "./lenis";
import { primeStrokes } from "./draw";
import { scramble } from "./scramble";

/**
 * Page-wide motion, driven by data attributes so sections can stay server components:
 *  - [data-reveal="up" | "wipe" | "fade"]   enters when scrolled into view (batched)
 *  - [data-scramble]                         text decodes on first view
 *  - [data-draw]                             SVG strokes inside draw themselves on first view
 *  - [data-spine]                            scales from 0 to full height as its parent scrolls by
 * Also runs Lenis smooth scrolling in sync with ScrollTrigger. Nothing here runs under
 * reduced motion, and content is fully visible without JS.
 */
export function FxRoot() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    void (async () => {
      const [{ gsap, ScrollTrigger }, { default: Lenis }] = await Promise.all([loadGsap(), import("lenis")]);
      if (disposed) return;
      const root = document.documentElement;

      const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -64 }, autoRaf: false });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      // The 3D intro overlay locks the page; Lenis would otherwise keep scrolling it.
      const pause = () => lenis.stop();
      const resume = () => lenis.start();
      window.addEventListener("intro3d:open", pause);
      window.addEventListener("intro3d:close", resume);
      cleanups.push(() => {
        window.removeEventListener("intro3d:open", pause);
        window.removeEventListener("intro3d:close", resume);
        gsap.ticker.remove(raf);
        lenis.destroy();
        setLenis(null);
      });

      const ctx = gsap.context(() => {
        const from: Record<string, gsap.TweenVars> = {
          up: { y: 48, opacity: 0 },
          fade: { opacity: 0 },
          wipe: { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        };
        const to: Record<string, gsap.TweenVars> = {
          up: { y: 0, opacity: 1 },
          fade: { opacity: 1 },
          wipe: { clipPath: "inset(0 0% 0 0)", opacity: 1 },
        };
        for (const kind of Object.keys(from)) {
          const els = gsap.utils.toArray<HTMLElement>(`[data-reveal="${kind}"]`);
          if (!els.length) continue;
          gsap.set(els, from[kind]);
          ScrollTrigger.batch(els, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { ...to[kind], duration: kind === "wipe" ? 1.1 : 0.9, ease: "expo.out", stagger: 0.08, overwrite: true }),
          });
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-scramble]")) {
          ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            once: true,
            onEnter: () => cleanups.push(scramble(el, { duration: Number(el.dataset.scramble) || 800 })),
          });
        }

        for (const spine of gsap.utils.toArray<HTMLElement>("[data-spine]")) {
          gsap.fromTo(
            spine,
            { scaleY: 0 },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: spine.parentElement, start: "top 70%", end: "bottom 55%", scrub: true } },
          );
        }

        for (const box of gsap.utils.toArray<HTMLElement>("[data-draw]")) {
          const strokes = primeStrokes(box);
          const fills = Array.from(box.querySelectorAll<SVGElement>("text, polygon"));
          gsap.set(fills, { opacity: 0 });
          ScrollTrigger.create({
            trigger: box,
            start: "top 80%",
            once: true,
            onEnter: () => {
              gsap.to(strokes, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: { amount: 1.2 } });
              gsap.to(fills, { opacity: 1, duration: 0.5, delay: 0.5, stagger: { amount: 1.4 } });
            },
          });
        }
      });
      root.classList.add("fx");
      // Fonts and images shift layout after load; recompute trigger positions once settled.
      void document.fonts?.ready.then(() => !disposed && ScrollTrigger.refresh());
      cleanups.push(() => {
        ctx.revert();
        root.classList.remove("fx");
      });
    })();

    return () => {
      disposed = true;
      for (const c of cleanups.reverse()) c();
    };
  }, []);

  return null;
}
