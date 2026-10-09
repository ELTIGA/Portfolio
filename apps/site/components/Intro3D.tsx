"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/track";

/**
 * Optional 3D intro. The plain page is always rendered underneath; this only adds a
 * full-screen overlay (an iframe to the static 3D app in /experience) for capable
 * desktop clients, after idle, with a persistent "Skip to portfolio" button.
 */

const SKIP_KEY = "intro3d:skipped";
const SHELL_URL = "/experience/index.html";
const READY_TIMEOUT_MS = 12000;
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|pagespeed|prerender|gtmetrix/i;
const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;
/** Dispatched by <OfficeButton> to reopen the 3D desk after it was skipped. */
const OPEN_REQUEST = "intro3d:request";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };
type NavigatorExtras = Navigator & { connection?: NetworkInfo; deviceMemory?: number };

function alreadySkipped() {
  try {
    return window.sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSkip() {
  try {
    window.sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* private mode: the overlay simply may show again on reload */
  }
}

let webgl2: boolean | undefined;

function hasWebGL2() {
  webgl2 ??= probeWebGL2();
  return webgl2;
}

function probeWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    // Software renderers (SwiftShader, llvmpipe) don't always report a performance
    // caveat; they would run the scene badly, so check the renderer name too.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !SOFTWARE_GL.test(renderer);
  } catch {
    return false;
  }
}

/**
 * Every condition must hold; anything else gets the plain page only. An explicit
 * request (the "Back to the office" button) ignores an earlier skip.
 */
function isCapable({ requested = false } = {}) {
  if (typeof window === "undefined") return false;
  // Never nest the intro (e.g. when the monitor iframe navigates to "/").
  if (window.self !== window.top) return false;
  if (BOT_UA.test(navigator.userAgent)) return false;
  if (!requested && alreadySkipped()) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  if (window.innerWidth < 1024 || window.innerHeight < 600) return false;
  const nav = navigator as NavigatorExtras;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  const conn = nav.connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return false;
  return hasWebGL2();
}

/** The shell is a separate build; if it is missing, never show an overlay over a 404. */
async function shellAvailable() {
  try {
    const res = await fetch(SHELL_URL, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export function Intro3D() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const entered = useRef(false);

  // Decide after the page is idle so the 3D never competes with the first paint.
  // Never interrupt a visitor who has already started reading or clicking.
  useEffect(() => {
    let cancelled = false;
    let engaged = false;
    let idleId: number | undefined;
    let timerId: number | undefined;

    const engage = () => {
      engaged = true;
    };
    const engageEvents = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    for (const type of engageEvents) window.addEventListener(type, engage, { once: true, passive: true });

    const schedule = () => {
      const show = async () => {
        if (cancelled || engaged || !isCapable()) return;
        if (!(await shellAvailable()) || cancelled || engaged) return;
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setOpen(true);
      };
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => void show(), { timeout: 4000 });
      } else {
        timerId = window.setTimeout(() => void show(), 2000);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      for (const type of engageEvents) window.removeEventListener(type, engage);
      window.removeEventListener("load", schedule);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  // "Back to the office": reopen on request, even after a skip or once the visitor is reading.
  useEffect(() => {
    const onRequest = () => {
      if (!isCapable({ requested: true })) return;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(OPEN_REQUEST, onRequest);
    return () => window.removeEventListener(OPEN_REQUEST, onRequest);
  }, []);

  const close = useCallback((reason: "skip" | "failed") => {
    rememberSkip();
    if (reason === "skip") track("skip_3d");
    setVisible(false);
    setOpen(false);
  }, []);

  // While open: modal behaviour, scroll lock, Esc, messages from the shell, load guard.
  useEffect(() => {
    if (!open) return;

    const overlay = overlayRef.current;
    const inerted: HTMLElement[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el instanceof HTMLElement && el !== overlay && !el.inert) {
        el.inert = true;
        inerted.push(el);
      }
    }
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    skipRef.current?.focus();
    // Lets the homepage particle field pause while the intro owns the GPU.
    window.dispatchEvent(new Event("intro3d:open"));
    const fade = window.requestAnimationFrame(() => setVisible(true));

    // If the 3D app never reports ready (missing build, blocked), fall back quietly.
    const guard = window.setTimeout(() => close("failed"), READY_TIMEOUT_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close("skip");
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data as { source?: string; type?: string } | null;
      if (!data || data.source !== "portfolio-shell") return;
      if (data.type === "skip") close("skip");
      else if (data.type === "failed") close("failed");
      else if (data.type === "ready") {
        window.clearTimeout(guard);
        if (!entered.current) {
          entered.current = true;
          track("enter_3d");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);

    return () => {
      window.cancelAnimationFrame(fade);
      window.clearTimeout(guard);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("message", onMessage);
      for (const el of inerted) el.inert = false;
      document.documentElement.style.overflow = prevOverflow;
      window.dispatchEvent(new Event("intro3d:close"));
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive 3D desk. Use Skip to portfolio to return to the page."
      className={`fixed inset-0 z-[100] bg-bg transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <iframe
        ref={iframeRef}
        src={SHELL_URL}
        // aria-label, not title: browsers show an iframe's title as a hover tooltip over the scene.
        aria-label="Interactive 3D desk with the portfolio desktop on the monitor"
        className="absolute inset-0 h-full w-full border-0"
        allow=""
      />
      <button
        ref={skipRef}
        type="button"
        onClick={() => close("skip")}
        className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-lg transition hover:brightness-110"
      >
        Skip to portfolio
        <kbd aria-hidden="true" className="rounded border border-accent-ink/30 px-1.5 py-0.5 font-mono text-[10px] leading-none">
          Esc
        </kbd>
      </button>
    </div>,
    document.body,
  );
}

/** Header control that reopens the 3D desk. Renders only where the desk can run. */
export function OfficeButton({ className = "" }: { className?: string }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (isCapable({ requested: true })) {
      void shellAvailable().then((ok) => {
        if (!cancelled) setAvailable(ok);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_REQUEST))}>
      Back to the office
    </button>
  );
}
