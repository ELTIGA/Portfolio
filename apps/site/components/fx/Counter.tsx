"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./gsap";

const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10);

/**
 * Odometer readout: every digit in `value` rolls through two full turns into place when
 * scrolled into view. Server render shows the final value; screen readers get plain text.
 */
export function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<"final" | "reset" | "roll">("final");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setPhase("reset");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        requestAnimationFrame(() => setPhase("roll"));
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let digitIndex = 0;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {Array.from(value).map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i} className="whitespace-pre">{ch}</span>;
          const d = Number(ch);
          const order = digitIndex++;
          const offset = phase === "reset" ? 0 : (d + 10) * 5;
          return (
            <span key={i} className="inline-block h-[1em] overflow-hidden leading-none">
              <span
                className="flex flex-col"
                style={{
                  transform: `translateY(-${offset}%)`,
                  transition: phase === "roll" ? `transform ${1.6 + order * 0.25}s cubic-bezier(0.16, 1, 0.3, 1)` : "none",
                }}
              >
                {DIGITS.map((n, k) => (
                  <span key={k} className="block h-[1em] leading-none">{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
