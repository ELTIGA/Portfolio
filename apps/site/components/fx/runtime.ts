/**
 * Shared runtime gates for the homepage effects, so every loop agrees on when to sleep.
 *  - framed: the page is inside another document (the 3D shell's monitor iframe). The
 *    shell owns the GPU there; heavy effects stay off.
 *  - intro: the opaque 3D intro overlay covers the page. Everything under it can stop.
 */

export function isFramed() {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin parent: treat as framed
  }
}

export function introIsOpen() {
  return typeof document !== "undefined" && document.documentElement.dataset.intro === "open";
}

/** Calls `cb(open)` whenever the 3D intro overlay opens or closes. Returns an unsubscribe. */
export function onIntro(cb: (open: boolean) => void) {
  const handler = (e: Event) => cb(e.type === "intro3d:open");
  window.addEventListener("intro3d:open", handler);
  window.addEventListener("intro3d:close", handler);
  return () => {
    window.removeEventListener("intro3d:open", handler);
    window.removeEventListener("intro3d:close", handler);
  };
}
