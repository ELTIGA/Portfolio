"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { finePointer, prefersReducedMotion } from "./gsap";

/** Card that tilts toward the pointer with a holographic foil sheen that follows it. */
export function HoloCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--px", `${px * 100}%`);
      el.style.setProperty("--py", `${py * 100}%`);
      el.style.setProperty("--holo", "1");
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 18}deg) translateZ(0)`;
    };
    const onLeave = () => {
      el.style.setProperty("--holo", "0");
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
      style={{ ["--px" as string]: "50%", ["--py" as string]: "50%", ["--holo" as string]: "0" }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-color-dodge transition-opacity duration-300"
        style={{
          opacity: "calc(var(--holo) * 0.55)",
          background:
            "radial-gradient(circle at var(--px) var(--py), rgb(255 255 255 / 0.35), transparent 40%), linear-gradient(115deg, transparent 20%, #ff5a4e 35%, #ffb547 45%, #5ee1ff 55%, #b48cff 65%, transparent 80%)",
          backgroundSize: "100% 100%, 300% 300%",
          backgroundPosition: "center, var(--px) var(--py)",
        }}
      />
    </div>
  );
}
