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

const SKIP_KEY = "intro3d:skipped";

/** Same flag the site's overlay reads, so the plain page doesn't reopen the intro. */
export function rememberSkip() {
  try {
    sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* storage can be unavailable */
  }
}

/** Leave the 3D intro for the plain portfolio page. */
export function requestSkip() {
  if (window.parent !== window) {
    notifyParent("skip");
    return;
  }
  rememberSkip();
  window.location.assign("/");
}
