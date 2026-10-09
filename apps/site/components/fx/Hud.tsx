"use client";

import { useEffect, useRef, useState } from "react";

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
    tick();
    const id = window.setInterval(tick, 1000);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (rail.current) rail.current.style.transform = `scaleY(${p})`;
        // Active sector: the last one whose top has passed 40% of the viewport.
        let idx = 0;
        sectors.forEach((s, i) => {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i;
        });
        setActive(idx);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
