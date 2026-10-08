/** Deterministic helpers shared by the getit simulations (no randomness, no network). */

export function hash32(s: string, seed = 2166136261): number {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** 64 hex chars that look like a SHA-256 digest. Purely cosmetic. */
export function fakeSha(s: string): string {
  return Array.from({ length: 8 }, (_, i) => hash32(s, 2166136261 + i * 7919).toString(16).padStart(8, "0")).join("");
}

export interface HostInfo {
  key: string;
  label: string;
}

export const HOSTS: HostInfo[] = [
  { key: "gofile", label: "GoFile" },
  { key: "pixeldrain", label: "PixelDrain" },
  { key: "mediafire", label: "MediaFire" },
  { key: "1fichier", label: "1Fichier" },
  { key: "uploadflix", label: "UploadFlix" },
  { key: "mega", label: "Mega.nz" },
  { key: "anonfile", label: "Anonfile.de" },
];

export type UrlCheck = { ok: true; host: HostInfo | null; url: URL } | { ok: false; error: string };

/**
 * The demo only resolves *.example.test links (a reserved TLD), so pasting a real URL can never
 * trigger anything. Known host keywords map to a supported host, otherwise a generic demo resolver.
 */
export function checkUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "not a valid URL (try https://gofile.example.test/d/AbC123)" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, error: "only http(s) links are supported" };
  const host = url.hostname.toLowerCase();
  if (!(host === "example.test" || host.endsWith(".example.test"))) {
    return { ok: false, error: "demo only resolves *.example.test links; nothing real is downloaded here" };
  }
  const found = HOSTS.find((h) => host.includes(h.key)) ?? null;
  return { ok: true, host: found, url };
}

const EXTS = ["zip", "pdf", "tar.gz", "mp4", "7z"];

export function nameFromUrl(url: URL): string {
  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "download";
  if (/\.[a-z0-9]{2,4}$/i.test(last)) return last;
  return `${last}.${EXTS[hash32(url.href) % EXTS.length]}`;
}

export function sizeFromUrl(url: URL): number {
  return 24 + (hash32(url.href) % 380);
}

export function fmtSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 10) return `${mb.toFixed(0)} MB`;
  return `${mb.toFixed(1)} MB`;
}

export function fmtEta(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "--:--";
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}
