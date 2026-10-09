"use client";

import { useEffect, useRef, useState } from "react";
import { introIsOpen, onIntro } from "./runtime";

/**
 * Decorative heads-up display framing the viewport: corner brackets, a UTC clock,
 * session uptime, the current sector and a scroll-progress rail. aria-hidden, and
 * only from md up, so it never competes with content on small screens.
 */
export function Hud({ sectors }: { sectors: { id: string; label: string }[] }) {
  const [clock, setClock] = useState("--:--:--");
  const [uptime, setUptime] = useState("00:00");
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = Date.now();
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      setClock(`${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`);
      const s = Math.floor((Date.now() - start) / 1000);
      setUptime(`${pad(Math.floor(s / 60))}:${pad(s % 60)}`);
    };
    // The clock only ticks while someone can see it.
    let id = 0;
    const syncClock = () => {
      window.clearInterval(id);
      id = 0;
      if (document.hidden || introIsOpen()) return;
      tick();
      id = window.setInterval(tick, 1000);
    };
    syncClock();
    document.addEventListener("visibilitychange", syncClock);
    const offIntro = onIntro(syncClock);

    // Scroll rail: page height is cached and only re-read when the layout resizes.
    let max = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        if (rail.current) rail.current.style.transform = `scaleY(${p})`;
      });
    };
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active sector: the last section crossing a line 40% down the viewport.
    const els = sectors.map((s) => document.getElementById(s.id));
    const crossing = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = els.indexOf(e.target as HTMLElement);
          if (e.isIntersecting) crossing.add(i);
          else crossing.delete(i);
        }
        if (crossing.size) setActive(Math.max(...crossing));
      },
      { rootMargin: "-40% 0px -60% 0px" },
    );
    for (const el of els) if (el) io.observe(el);

    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", syncClock);
      offIntro();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectors]);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-3 z-40 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted md:block">
      <div className="brackets absolute inset-0 opacity-60 [--s:22px]" />
      <div className="absolute bottom-3 left-4 flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="blink h-1.5 w-1.5 bg-accent" />
          <span className="text-fg">{pad2(active + 1)}</span>
          <span>/ {pad2(sectors.length)}</span>
        </span>
        <span className="text-accent">{sectors[active]?.label}</span>
      </div>
      <div className="absolute bottom-3 right-4 flex items-center gap-5">
        <span>utc {clock}</span>
        <span>session {uptime}</span>
      </div>
      <div className="absolute right-0 top-1/2 h-40 w-px -translate-y-1/2 bg-line">
        <div ref={rail} className="h-full w-full origin-top scale-y-0 bg-accent" />
      </div>
    </div>
  );
}
