import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

/** Scrolls with Lenis when it is running, natively otherwise. */
export function scrollToY(y: number, immediate = false) {
  if (instance) instance.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}
