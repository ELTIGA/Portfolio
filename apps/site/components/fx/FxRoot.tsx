"use client";

import { useEffect } from "react";
import { loadGsap, prefersReducedMotion } from "./gsap";
import { setLenis } from "./lenis";
import { introIsOpen, isFramed, onIntro } from "./runtime";
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
    // Content is fully visible without this, so a framed copy of the page (inside the 3D
    // shell's monitor) skips it and leaves the GPU to the shell.
    if (prefersReducedMotion() || isFramed()) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    // Looping photo sweeps only run while their photo is on screen.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
    });
    for (const el of document.querySelectorAll(".duotone")) io.observe(el);
    cleanups.push(() => io.disconnect());

    void (async () => {
      const [{ gsap, ScrollTrigger }, { default: Lenis }] = await Promise.all([loadGsap(), import("lenis")]);
      if (disposed) return;
      const root = document.documentElement;

      const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -64 }, autoRaf: false });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      // Lenis only rides the GSAP ticker while something is scrolling; an idle page then
      // has no per-frame callback at all, so the main thread can actually sleep.
      let ticking = false;
      let quietSince = 0;
      let introOpen = introIsOpen();
      const raf = (time: number) => {
        lenis.raf(time * 1000);
        if (lenis.isScrolling) quietSince = 0;
        else if (!quietSince) quietSince = time;
        else if (time - quietSince > 0.5) sleep();
      };
      const sleep = () => {
        if (!ticking) return;
        ticking = false;
        gsap.ticker.remove(raf);
      };
      const wake = () => {
        if (ticking || introOpen) return;
        ticking = true;
        quietSince = 0;
        gsap.ticker.add(raf);
      };
      const inputs = ["wheel", "touchstart", "touchmove", "keydown", "pointerdown", "scroll"] as const;
      for (const type of inputs) window.addEventListener(type, wake, { capture: true, passive: true });
      gsap.ticker.lagSmoothing(0);
      // The 3D intro overlay hides the page: stop Lenis and its ticking, then re-measure
      // triggers when the page comes back.
      const sync = (open: boolean) => {
        introOpen = open;
        if (open) {
          lenis.stop();
          sleep();
        } else {
          lenis.start();
          wake();
          ScrollTrigger.refresh();
        }
      };
      if (introOpen) lenis.stop();
      else wake();
      const offIntro = onIntro(sync);
      cleanups.push(() => {
        offIntro();
        for (const type of inputs) window.removeEventListener(type, wake, { capture: true });
        sleep();
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
