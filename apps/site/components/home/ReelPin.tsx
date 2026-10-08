"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { primeStrokes } from "@/components/fx/draw";
import { loadGsap, prefersReducedMotion } from "@/components/fx/gsap";
import { scrollToY } from "@/components/fx/lenis";

/**
 * Pins the work section and scrolls its track sideways as the page scrolls down (lg+).
 * Diagrams inside draw themselves as their panel slides in. Keyboard focus moving into
 * a panel scrolls the page to the point where that panel is on screen. Unpinned (no JS,
 * reduced motion) the row is a native snap-scrolling strip; below lg the panels stack.
 */
export function ReelPin({ children }: { children: ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let disposed = false;
    let revert = () => {};

    void loadGsap().then(({ gsap }) => {
      if (disposed || !section.current || !track.current) return;
      const sec = section.current;
      const tr = track.current;
      const mm = gsap.matchMedia();

      const drawIn = (fig: Element, trigger: ScrollTrigger.Vars) => {
        const strokes = primeStrokes(fig);
        const fills = Array.from(fig.querySelectorAll<SVGElement>("text, polygon"));
        gsap.set(fills, { opacity: 0 });
        const tl = gsap.timeline({ scrollTrigger: { ...trigger, toggleActions: "play none none none" } });
        tl.to(strokes, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: { amount: 1 } });
        tl.to(fills, { opacity: 1, duration: 0.4, stagger: { amount: 0.9 } }, 0.4);
      };

      mm.add("(min-width: 1024px)", () => {
        setPinned(true);
        const distance = () => tr.scrollWidth - window.innerWidth;
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              if (bar.current) bar.current.style.transform = `scaleX(${st.progress})`;
            },
          },
        });
        const st = tween.scrollTrigger!;
        for (const panel of gsap.utils.toArray<HTMLElement>("[data-panel]", tr)) {
          const fig = panel.querySelector("[data-draw-reel]");
          if (fig) drawIn(fig, { trigger: panel, containerAnimation: tween, start: "left 70%" });
          // Parallax: the big numeral lags behind its panel.
          const num = panel.querySelector("[data-numeral]");
          if (num)
            gsap.fromTo(num, { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        }
        const onFocus = (e: FocusEvent) => {
          const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel]");
          if (!panel) return;
          // Focus makes the browser scroll the clipped section sideways; undo that and
          // move the page instead so the pin's own translation brings the panel into view.
          sec.scrollLeft = 0;
          const x = panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2;
          const p = Math.min(Math.max(x / Math.max(distance(), 1), 0), 1);
          scrollToY(st.start + p * (st.end - st.start), true);
        };
        tr.addEventListener("focusin", onFocus);
        return () => {
          tr.removeEventListener("focusin", onFocus);
          setPinned(false);
        };
      });

      mm.add("(max-width: 1023px)", () => {
        for (const fig of gsap.utils.toArray<HTMLElement>("[data-draw-reel]", tr)) drawIn(fig, { trigger: fig, start: "top 80%" });
      });

      revert = () => mm.revert();
    });

    return () => {
      disposed = true;
      revert();
    };
  }, []);

  return (
    <div
      ref={section}
      className={`relative lg:flex lg:h-dvh lg:flex-col lg:justify-center ${pinned ? "lg:overflow-hidden" : "lg:snap-x lg:snap-mandatory lg:overflow-x-auto"}`}
    >
      <div ref={track} className="flex flex-col gap-6 px-5 sm:px-8 lg:w-max lg:flex-row lg:gap-10 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))] lg:pr-[12vw]">
        {children}
      </div>
      <div aria-hidden="true" className="absolute bottom-10 left-1/2 hidden h-px w-48 -translate-x-1/2 bg-line lg:block">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
