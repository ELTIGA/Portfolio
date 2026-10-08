import type { ExtractProvider, ParseProvider, Passenger, RawRow, Attempt, Extraction, Stop, VehicleSeed } from "./types";

/* ---------------- routing math ---------------- */

const MIN_PER_PX = 0.075;
const KM_PER_PX = 0.04;
const DWELL_MIN = 3;

export function fmtTime(min: number): string {
  const m = Math.round(min);
  const h = Math.floor(m / 60) % 24;
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export interface RoutePlan {
  points: Pt[];
  etas: number[];
  arrive: number;
  km: number;
  minutes: number;
}

export function planRoute(depot: Pt, stops: Stop[], dest: Pt, startMin: number): RoutePlan {
  const points: Pt[] = [depot, ...stops, dest];
  const etas: number[] = [];
  let t = startMin;
  let px = 0;
  for (let i = 1; i < points.length; i++) {
    const d = dist(points[i - 1], points[i]);
    px += d;
    t += d * MIN_PER_PX;
    if (i <= stops.length) {
      etas.push(t);
      t += DWELL_MIN;
    }
  }
  return { points, etas, arrive: t, km: px * KM_PER_PX, minutes: t - startMin };
}

/** Nearest-neighbour ordering from the depot. */
export function optimizeOrder(depot: Pt, stops: Stop[]): Stop[] {
  const left = [...stops];
  const out: Stop[] = [];
  let cur: Pt = depot;
  while (left.length) {
    let best = 0;
    for (let i = 1; i < left.length; i++) if (dist(cur, left[i]) < dist(cur, left[best])) best = i;
    const [next] = left.splice(best, 1);
    out.push(next);
    cur = next;
  }
  return out;
}

export interface Capacity {
  /** Seats actually used: adults + children. Infants travel on laps and are excluded. */
  effective: number;
  infants: number;
  total: number;
}

export function capacityOf(stops: { adults: number; children: number; infants: number }[]): Capacity {
  const effective = stops.reduce((s, x) => s + x.adults + x.children, 0);
  const infants = stops.reduce((s, x) => s + x.infants, 0);
  return { effective, infants, total: effective + infants };
}

export const vehicleStops = (v: VehicleSeed, order: string[], all: Stop[]): Stop[] =>
  order.map((id) => all.find((s) => s.id === id)).filter((s): s is Stop => Boolean(s));

/* ---------------- extraction providers ---------------- */

export interface ProviderMeta {
  label: string;
  blurb: string;
  confidence: number;
  ms: number;
  /** Every Nth row is flagged for review (offset differs per provider). */
  flagEvery: number;
  flaky?: boolean;
}

export const PROVIDERS: Record<ExtractProvider, ProviderMeta> = {
  deepseek_chat: { label: "DeepSeek Chat", blurb: "Default route, lowest cost", confidence: 96, ms: 1840, flagEvery: 6 },
  openai_gpt_4_1_mini: { label: "GPT-4.1 mini", blurb: "Strong on messy PDFs", confidence: 98, ms: 2210, flagEvery: 9 },
  gemini_2_5_flash_lite: { label: "Gemini 2.5 Flash-Lite", blurb: "Fastest, lighter checks", confidence: 93, ms: 1190, flagEvery: 5 },
  minimax_m2_5_highspeed: { label: "MiniMax M2.5 HS", blurb: "High speed, rate-limited", confidence: 95, ms: 1420, flagEvery: 7, flaky: true },
  zai_glm: { label: "Z.ai GLM", blurb: "Alternate route for multilingual sheets", confidence: 91, ms: 1650, flagEvery: 4 },
};

export const PROVIDER_ORDER = Object.keys(PROVIDERS) as ExtractProvider[];
export const DEFAULT_CHAIN: ExtractProvider[] = ["deepseek_chat", "openai_gpt_4_1_mini", "gemini_2_5_flash_lite"];

export const PARSE_LABEL: Record<ParseProvider, string> = {
  docling: "docling",
  native_sheet: "native_sheet",
  mistral_ocr: "mistral_ocr",
  llamaparse: "llamaparse",
};

const REASONS = ["Hotel name low confidence", "Pickup time ambiguous", "Pax total differs from sheet"] as const;

/** Chain used for a run that starts with `provider`. */
export function chainFor(provider: ExtractProvider): ExtractProvider[] {
  return [provider, ...DEFAULT_CHAIN.filter((p) => p !== provider)].slice(0, 3);
}

/** Deterministic canned extraction: same input and provider always give the same result. */
export function runExtraction(manifestId: string, raw: RawRow[], requested: ExtractProvider): { passengers: Passenger[]; extraction: Extraction } {
  const chain = chainFor(requested);
  const meta0 = PROVIDERS[requested];
  const winner = meta0.flaky ? chain[1] : chain[0];
  const meta = PROVIDERS[winner];
  const offset = PROVIDER_ORDER.indexOf(winner) % meta.flagEvery;

  const passengers: Passenger[] = raw.map((r, i) => {
    const flagged = i % meta.flagEvery === offset;
    if (!flagged) return { ...r, id: `${manifestId}-${i}`, review: null, edited: false };
    const reason = REASONS[(i + offset) % REASONS.length];
    const next = { ...r };
    if (reason === REASONS[0]) next.hotel = r.hotel.toLowerCase().slice(0, Math.max(6, r.hotel.length - 4));
    if (reason === REASONS[1]) next.time = `${r.time.slice(0, 4)}?`;
    return { ...next, id: `${manifestId}-${i}`, review: reason, edited: false };
  });

  const attempts: Attempt[] = chain.map((p, idx) => {
    if (meta0.flaky) {
      if (idx === 0) return { provider: p, outcome: "failed", detail: "Timed out after 8s, rate limited (429)" };
      if (idx === 1) return { provider: p, outcome: "succeeded", detail: `Fallback hit in ${PROVIDERS[p].ms} ms` };
      return { provider: p, outcome: "standby", detail: "Not needed" };
    }
    if (idx === 0) return { provider: p, outcome: "succeeded", detail: `Schema valid in ${meta.ms} ms` };
    return { provider: p, outcome: "standby", detail: "Fallback if primary fails" };
  });

  return { passengers, extraction: { provider: winner, attempts, confidence: meta.confidence, ms: meta.ms } };
}

export const flaggedCount = (p: Passenger[]) => p.filter((x) => x.review).length;
