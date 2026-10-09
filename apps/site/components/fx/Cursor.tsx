"use client";

import { useEffect, useRef } from "react";
import { finePointer, prefersReducedMotion } from "./gsap";
import { isFramed } from "./runtime";

/**
 * Targeting reticle that replaces the pointer on mouse/trackpad devices. The ring lags
 * behind the dot; over [data-cursor="LABEL"] it expands and shows the label. Keyboard
 * focus styles are untouched, and touch or reduced-motion visitors never get it.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const coords = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Never inside another document (the 3D shell's monitor), where it would draw off-scale.
    if (!finePointer() || prefersReducedMotion() || isFramed()) return;
    const root = document.documentElement;
    const d = dot.current!;
    const r = ring.current!;
    root.classList.add("has-cursor");
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let scale = 1;
    let targetScale = 1;
    let shown = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        d.style.opacity = r.style.opacity = "1";
      }
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button");
      const text = t?.dataset.cursor ?? (t ? "" : null);
      targetScale = text === null ? 1 : text ? 3.2 : 1.8;
      r.dataset.active = String(text !== null);
      if (label.current) label.current.textContent = text ?? "";
      if (coords.current) coords.current.textContent = `${String(Math.round(x)).padStart(4, "0")}·${String(Math.round(y)).padStart(4, "0")}`;
    };
    const onLeave = () => {
      shown = false;
      d.style.opacity = r.style.opacity = "0";
    };
    const onDown = () => (targetScale *= 0.8);
    const onUp = () => (targetScale /= 0.8);

    // Runs only until the ring catches up with the dot, then sleeps until the next input.
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += (targetScale - scale) * 0.15;
      const settled = Math.abs(x - rx) + Math.abs(y - ry) < 0.1 && Math.abs(targetScale - scale) < 0.001;
      if (settled) {
        rx = x;
        ry = y;
        scale = targetScale;
      }
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onInput = (e: PointerEvent) => {
      if (e.type === "pointermove") onMove(e);
      else if (e.type === "pointerdown") onDown();
      else onUp();
      wake();
    };
    window.addEventListener("pointermove", onInput, { passive: true });
    window.addEventListener("pointerdown", onInput);
    window.addEventListener("pointerup", onInput);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onInput);
      window.removeEventListener("pointerdown", onInput);
      window.removeEventListener("pointerup", onInput);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 bg-accent opacity-0 transition-opacity" />
      <div
        ref={ring}
        className="group absolute -left-5 -top-5 grid h-10 w-10 place-items-center opacity-0 transition-opacity"
      >
        <span className="absolute inset-0 rounded-full border border-accent/70 transition-colors group-data-[active=true]:border-accent group-data-[active=true]:bg-accent/10" />
        <span className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-accent" />
        <span className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-accent" />
        <span className="absolute left-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-accent" />
        <span className="absolute right-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-accent" />
        <span ref={label} className="relative font-mono text-[4px] font-semibold uppercase tracking-[0.2em] text-accent" />
        <span ref={coords} className="absolute left-full top-full ml-1 mt-1 whitespace-nowrap font-mono text-[9px] text-muted group-data-[active=true]:hidden" />
      </div>
    </div>
  );
}
