/**
 * Adaptive quality for the particle field. Strong machines keep the full look; weaker
 * ones step down quietly (bloom resolution, then pixels, then bloom, then particles,
 * then frame rate) until frames land on time. The chosen tier is remembered for the
 * session so the next page view starts where this one settled.
 */

export interface Quality {
  /** Particles drawn (a prefix of the shuffled buffer). */
  count: number;
  /** Canvas pixel budget in device megapixels. */
  megapixels: number;
  /** Bloom resolution as a fraction of the canvas (0 = off). */
  bloom: number;
  /** Frame-rate cap while the field is in front (hero, contact). */
  fps: number;
}

export const TIERS: Quality[] = [
  { count: 52000, megapixels: 3.2, bloom: 0.5, fps: 60 },
  { count: 52000, megapixels: 2.2, bloom: 0.35, fps: 60 },
  { count: 36000, megapixels: 1.6, bloom: 0, fps: 60 },
  { count: 26000, megapixels: 1.1, bloom: 0, fps: 30 },
  { count: 20000, megapixels: 0.8, bloom: 0, fps: 24 },
];

const KEY = "signal:tier";
const WARMUP_MS = 3000;
const WINDOW_MS = 2000;
const UPGRADE_AFTER_MS = 10000;

type NavigatorExtras = Navigator & { deviceMemory?: number };

function stored(): number | null {
  try {
    const v = window.sessionStorage.getItem(KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

function store(tier: number) {
  try {
    window.sessionStorage.setItem(KEY, String(tier));
  } catch {
    /* private mode: the governor simply re-learns next time */
  }
}

/** Starting tier from what the device says about itself; phones start without bloom. */
export function initialTier(mobile: boolean): number {
  const remembered = stored();
  const floor = mobile ? 2 : 0;
  if (remembered !== null && Number.isInteger(remembered)) return Math.min(Math.max(remembered, floor), TIERS.length - 1);
  const nav = navigator as NavigatorExtras;
  let tier = floor;
  if ((nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || (navigator.hardwareConcurrency || 8) <= 4) tier++;
  return Math.min(tier, TIERS.length - 1);
}

/** Quality for a tier, with the particle count capped for small screens. */
export function qualityFor(tier: number, mobile: boolean): Quality {
  const q = TIERS[tier];
  return mobile ? { ...q, count: Math.min(q.count, 20000) } : q;
}

/**
 * Watches rendered-frame intervals and moves one tier at a time: down when frames run
 * 25% over budget for a 2s window, up (once per session) after 10s comfortably under.
 * The gap between the two thresholds keeps it from flapping.
 */
export function createGovernor(start: number, floor: number, apply: (tier: number) => void) {
  let tier = start;
  let upgraded = false;
  let since = performance.now();
  let sum = 0;
  let n = 0;
  let windowStart = 0;
  let goodSince = 0;
  document.documentElement.dataset.glTier = String(tier);

  const set = (next: number) => {
    tier = next;
    store(tier);
    document.documentElement.dataset.glTier = String(tier);
    since = performance.now();
    goodSince = 0;
    apply(tier);
  };

  return {
    get tier() {
      return tier;
    },
    /** One rendered frame: `ms` since the previous one, `budget` the tier's frame time. */
    sample(ms: number, budget: number) {
      const now = performance.now();
      // Shader compiles and resizes spike; long gaps are the tab or loop sleeping.
      if (now - since < WARMUP_MS || ms > 250) return;
      if (!windowStart) windowStart = now;
      sum += ms;
      n++;
      if (now - windowStart < WINDOW_MS) return;
      const avg = sum / n;
      sum = n = 0;
      windowStart = now;
      if (avg > budget * 1.25 && tier < TIERS.length - 1) {
        set(tier + 1);
      } else if (avg < budget * 1.08 && tier > floor && !upgraded) {
        goodSince ||= now;
        if (now - goodSince > UPGRADE_AFTER_MS) {
          upgraded = true;
          set(tier - 1);
        }
      } else goodSince = 0;
    },
  };
}
