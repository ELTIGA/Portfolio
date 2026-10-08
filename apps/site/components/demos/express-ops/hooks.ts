"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type Breakpoint = "narrow" | "mid" | "wide";
export type LayoutInfo = { bp: Breakpoint; contentW: number };

export const LayoutContext = createContext<LayoutInfo>({ bp: "wide", contentW: 900 });
export const useLayout = () => useContext(LayoutContext);

/** Measures an element's width and keeps it current. Used instead of viewport breakpoints because the demo lives in a resizable container. */
export function useElementWidth(ref: RefObject<HTMLElement | null>, fallback = 900) {
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(Math.round(el.getBoundingClientRect().width) || fallback);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, fallback]);
  return width;
}

export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; message: string; tone: "neutral" | "ok" | "warn"; action?: ToastAction };
export type PushToast = (message: string, opts?: { tone?: Toast["tone"]; action?: ToastAction; ttl?: number }) => number;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const push: PushToast = useCallback(
    (message, opts = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-1), { id, message, tone: opts.tone ?? "neutral", action: opts.action }]);
      timers.current.set(id, setTimeout(() => dismiss(id), opts.ttl ?? (opts.action ? 9000 : 5000)));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}
