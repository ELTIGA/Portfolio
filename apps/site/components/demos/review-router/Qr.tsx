const N = 25;

/** Deterministic decorative pattern. It is intentionally not a valid, scannable QR code. */
function cells() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  const out: [number, number][] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.52) out.push([x, y]);
  return out;
}

const dots = cells();

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#0f172a" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#0f172a" />
    </g>
  );
}

export function Qr({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className={className} role="img" aria-label="Decorative QR code placeholder, not scannable" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} fill="#fff" />
      {dots.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={N - 7} y={0} />
      <Finder x={0} y={N - 7} />
    </svg>
  );
}
