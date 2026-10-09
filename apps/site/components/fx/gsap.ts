import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export type Gsap = typeof GsapType;
export type ScrollTriggerStatic = typeof ScrollTriggerType;

let loading: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerStatic }> | null = null;

/**
 * ScrollTrigger starts an empty requestAnimationFrame loop when it registers (a Firefox
 * repaint workaround, `_rafBugFix`). In Chromium it makes the page render a full frame on
 * every vsync, forever: 120 style/layerize/commit passes a second on an idle page. Its
 * only call happens synchronously inside registerPlugin, so swallowing that one call
 * leaves the loop unstarted; ScrollTrigger's real updates schedule their own frames.
 */
function registerWithoutKeepAlive(register: () => void) {
  // Only where it was measured (Chromium); other engines keep GSAP's default.
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands ?? [];
  if (!brands.some((b) => b.brand === "Chromium")) return register();
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = () => 0;
  try {
    register();
  } finally {
    window.requestAnimationFrame = raf;
  }
}

/** GSAP + ScrollTrigger, loaded once and only on the client, after first paint. */
export function loadGsap() {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    registerWithoutKeepAlive(() => g.gsap.registerPlugin(st.ScrollTrigger));
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return loading;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function finePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}
