/** Stroke length for draw-on animations. Hidden (display: none) shapes throw, so they get 0. */
export function strokeLength(el: SVGGeometryElement): number {
  try {
    return Math.ceil(el.getTotalLength());
  } catch {
    return 0;
  }
}

/** Primes every visible stroke in `root` to be fully undrawn; returns the primed strokes. */
export function primeStrokes(root: Element): SVGGeometryElement[] {
  const strokes: SVGGeometryElement[] = [];
  for (const s of root.querySelectorAll<SVGGeometryElement>("line, rect, path, polyline, circle")) {
    const len = strokeLength(s);
    if (!len) continue;
    s.style.strokeDasharray = `${len}`;
    s.style.strokeDashoffset = `${len}`;
    strokes.push(s);
  }
  return strokes;
}
