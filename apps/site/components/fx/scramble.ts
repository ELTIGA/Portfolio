const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\|_";

/**
 * Decodes the text of `el` from random glyphs into its real text. Only the existing
 * text node's value changes (React keeps its node), and the final text is always the
 * original, so assistive tech and copy/paste see the real words once it settles
 * (under a second).
 */
export function scramble(el: HTMLElement, { duration = 900, delay = 0 } = {}): () => void {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return () => {};
  const text = el.dataset.scrambleText ?? node.nodeValue ?? "";
  el.dataset.scrambleText = text;
  let raf = 0;
  let start = 0;
  const tick = (now: number) => {
    if (!start) start = now;
    const p = Math.min((now - start - delay) / duration, 1);
    if (p < 0) {
      raf = requestAnimationFrame(tick);
      return;
    }
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      // Each character locks in at its own moment, left to right with a little jitter.
      const lockAt = (i / text.length) * 0.75 + ((i * 7919) % 13) / 100;
      if (ch === " " || p >= lockAt) out += ch;
      else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    node.nodeValue = out;
    if (p < 1) raf = requestAnimationFrame(tick);
    else node.nodeValue = text;
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    node.nodeValue = text;
  };
}
