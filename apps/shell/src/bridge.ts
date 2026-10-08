/**
 * Messages to the site's overlay (apps/site/components/Intro3D.tsx) when this page
 * is framed by it. Same-origin only: the target origin is our own origin.
 */
export type ShellMessage = "ready" | "skip" | "failed";

export function notifyParent(type: ShellMessage) {
  if (window.parent === window) return;
  try {
    window.parent.postMessage({ source: "portfolio-shell", type }, window.location.origin);
  } catch {
    /* nothing to notify */
  }
}

/** Leave the 3D intro for the plain portfolio page. */
export function requestSkip() {
  if (window.parent !== window) {
    notifyParent("skip");
    return;
  }
  window.location.assign("/");
}
