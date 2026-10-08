import { checkUrl, fakeSha, fmtSize, hash32, nameFromUrl, sizeFromUrl } from "./lib";

export type Status = "queued" | "downloading" | "paused" | "locked" | "verifying" | "done" | "cancelled";

export interface Item {
  id: number;
  name: string;
  host: string;
  url: string;
  sizeMb: number;
  doneMb: number;
  speed: number;
  base: number;
  status: Status;
  files: number;
  hash?: string;
  verifyLeft: number;
  /** Mega links are decrypted client-side (AES-CTR) before the checksum step. */
  encrypted: boolean;
}

export type Tone = "info" | "ok" | "warn" | "err";
export interface LogLine {
  id: number;
  at: number;
  text: string;
  tone: Tone;
}

export type Prompt = null | { kind: "add"; error?: string } | { kind: "password"; id: number; error?: string };

export interface State {
  items: Item[];
  selectedId: number;
  concurrency: number;
  /** Total speed cap in MB/s. 0 = unlimited. */
  limit: number;
  prompt: Prompt;
  settingsOpen: boolean;
  quit: boolean;
  clock: number;
  pwPrompted: boolean;
  batchIdx: number;
  nextId: number;
  log: LogLine[];
}

export const DEMO_PASSWORD = "demo";

function mk(id: number, url: string, name: string, host: string, sizeMb: number, base: number, extra: Partial<Item> = {}): Item {
  return { id, url, name, host, sizeMb, doneMb: 0, speed: 0, base, status: "queued", files: 1, verifyLeft: 0, encrypted: false, ...extra };
}

const SEED: Item[] = [
  mk(1, "https://gofile.example.test/d/Xk29aP", "dataset-2024/", "GoFile", 412, 19, { files: 4 }),
  mk(2, "https://pixeldrain.example.test/u/q81Zt", "release-notes.pdf", "PixelDrain", 48, 11),
  mk(3, "https://mediafire.example.test/file/zr5k/assets-pack.zip", "assets-pack.zip", "MediaFire", 310, 24),
  mk(4, "https://mega.example.test/file/Qm7#key", "backup.tar.gz", "Mega.nz", 520, 30, { encrypted: true }),
  mk(5, "https://1fichier.example.test/?h7w3kd", "private-archive.7z", "1Fichier", 96, 16, { status: "locked" }),
  mk(6, "https://uploadflix.example.test/v/88ac", "demo-reel.mp4", "UploadFlix", 180, 21),
];

const BATCH_POOL = [
  "https://anonfile.example.test/x9/logs-march.zip",
  "https://pixeldrain.example.test/u/AbC123",
  "https://gofile.example.test/d/Lm40Qq",
  "https://mediafire.example.test/file/ty7/fonts.zip",
  "https://uploadflix.example.test/v/31de",
  "https://mega.example.test/file/Zz1#key",
];

export function initialState(): State {
  return {
    items: SEED.map((i) => ({ ...i })),
    selectedId: 1,
    concurrency: 4,
    limit: 0,
    prompt: null,
    settingsOpen: false,
    quit: false,
    clock: 0,
    pwPrompted: false,
    batchIdx: 0,
    nextId: 100,
    log: [{ id: 0, at: 0, text: "getit ready: 6 links queued, 4 concurrent", tone: "info" }],
  };
}

export type Action =
  | { type: "tick"; dt: number }
  | { type: "select"; id: number }
  | { type: "move"; delta: number }
  | { type: "pause" }
  | { type: "cancel" }
  | { type: "openAdd" }
  | { type: "openPassword" }
  | { type: "closePrompt" }
  | { type: "submitAdd"; url: string }
  | { type: "submitPassword"; value: string }
  | { type: "batch" }
  | { type: "toggleSettings" }
  | { type: "concurrency"; delta: number }
  | { type: "cycleLimit" }
  | { type: "quit" }
  | { type: "restart" };

function say(s: State, text: string, tone: Tone = "info"): LogLine[] {
  return [...s.log, { id: s.nextId + s.log.length + 1000, at: s.clock, text, tone }].slice(-40);
}

function withItem(s: State, id: number, patch: Partial<Item>): Item[] {
  return s.items.map((i) => (i.id === id ? { ...i, ...patch } : i));
}

function fillSlots(items: Item[], concurrency: number): Item[] {
  let active = items.filter((i) => i.status === "downloading").length;
  return items.map((i) => {
    if (i.status === "queued" && active < concurrency) {
      active += 1;
      return { ...i, status: "downloading" as const };
    }
    return i;
  });
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tick": {
      if (s.quit) return s;
      const clock = s.clock + a.dt;
      let log = s.log;
      const push = (text: string, tone: Tone = "info") => {
        log = [...log, { id: s.nextId + log.length + Math.floor(clock * 100), at: clock, text, tone }].slice(-40);
      };
      const raw = s.items.map((i) => (i.status === "downloading" ? i.base * (0.82 + 0.28 * Math.sin(clock * 1.3 + i.id * 1.7)) : 0));
      const sum = raw.reduce((x, y) => x + y, 0);
      const scale = s.limit > 0 && sum > s.limit ? s.limit / sum : 1;
      let items = s.items.map((i, idx) => {
        if (i.status === "downloading") {
          const speed = raw[idx] * scale;
          const doneMb = Math.min(i.sizeMb, i.doneMb + speed * a.dt);
          if (doneMb >= i.sizeMb) {
            push(i.encrypted ? `${i.name}: downloaded, decrypting (AES-CTR) and checking sha256` : `${i.name}: downloaded, checking sha256`);
            return { ...i, doneMb, speed: 0, status: "verifying" as const, verifyLeft: i.encrypted ? 2.4 : 1.4 };
          }
          return { ...i, doneMb, speed };
        }
        if (i.status === "verifying") {
          const verifyLeft = i.verifyLeft - a.dt;
          if (verifyLeft <= 0) {
            const hash = fakeSha(i.url);
            push(`${i.name}: sha256 ${hash.slice(0, 12)}… verified`, "ok");
            return { ...i, status: "done" as const, hash, verifyLeft: 0 };
          }
          return { ...i, verifyLeft };
        }
        return { ...i, speed: 0 };
      });
      items = fillSlots(items, s.concurrency);
      if (items.every((i) => i.status === "done" || i.status === "cancelled") && s.items.some((i) => i.status !== "done" && i.status !== "cancelled")) {
        push("queue finished: all downloads verified", "ok");
      }
      let prompt = s.prompt;
      let pwPrompted = s.pwPrompted;
      const locked = items.find((i) => i.status === "locked");
      if (!pwPrompted && locked && clock > 2 && !prompt && !s.settingsOpen) {
        prompt = { kind: "password", id: locked.id };
        pwPrompted = true;
        push(`${locked.host}: link is password protected`, "warn");
      }
      return { ...s, clock, items, log, prompt, pwPrompted };
    }
    case "select":
      return { ...s, selectedId: a.id };
    case "move": {
      const idx = s.items.findIndex((i) => i.id === s.selectedId);
      const next = Math.min(s.items.length - 1, Math.max(0, idx + a.delta));
      return { ...s, selectedId: s.items[next]?.id ?? s.selectedId };
    }
    case "pause": {
      const it = s.items.find((i) => i.id === s.selectedId);
      if (!it) return s;
      if (it.status === "downloading") {
        return { ...s, items: withItem(s, it.id, { status: "paused", speed: 0 }), log: say(s, `${it.name}: paused at ${fmtSize(it.doneMb)} (partial file kept)`, "warn") };
      }
      if (it.status === "paused") {
        const items = fillSlots(withItem(s, it.id, { status: "queued" }), s.concurrency);
        return { ...s, items, log: say(s, `${it.name}: resuming from ${fmtSize(it.doneMb)}`, "info") };
      }
      return s;
    }
    case "cancel": {
      const it = s.items.find((i) => i.id === s.selectedId);
      if (!it || it.status === "done" || it.status === "cancelled" || it.status === "verifying") return s;
      const items = fillSlots(withItem(s, it.id, { status: "cancelled", speed: 0 }), s.concurrency);
      const prompt = s.prompt && s.prompt.kind === "password" && s.prompt.id === it.id ? null : s.prompt;
      return { ...s, items, prompt, log: say(s, `${it.name}: cancelled, partial file removed`, "err") };
    }
    case "openAdd":
      return { ...s, prompt: { kind: "add" }, settingsOpen: false };
    case "openPassword": {
      const it = s.items.find((i) => i.id === s.selectedId);
      if (!it || it.status !== "locked") return s;
      return { ...s, prompt: { kind: "password", id: it.id }, settingsOpen: false };
    }
    case "closePrompt":
      return { ...s, prompt: null, settingsOpen: false };
    case "submitAdd": {
      const url = a.url.trim();
      if (!url) return { ...s, prompt: { kind: "add", error: "paste a URL first" } };
      const chk = checkUrl(url);
      if (!chk.ok) return { ...s, prompt: { kind: "add", error: chk.error } };
      if (s.items.some((i) => i.url === url)) return { ...s, prompt: { kind: "add", error: "already in the queue" } };
      const host = chk.host?.label ?? "Direct";
      const locked = chk.host?.key === "1fichier";
      const item = mk(s.nextId, url, nameFromUrl(chk.url), host, sizeFromUrl(chk.url), 8 + (hash32(url) % 22), {
        status: locked ? "locked" : "queued",
        encrypted: chk.host?.key === "mega",
      });
      const items = fillSlots([...s.items, item], s.concurrency);
      return { ...s, items, selectedId: item.id, nextId: s.nextId + 1, prompt: null, log: say(s, `added ${item.name} (${host})`, "info") };
    }
    case "submitPassword": {
      if (!s.prompt || s.prompt.kind !== "password") return s;
      const id = s.prompt.id;
      const it = s.items.find((i) => i.id === id);
      if (!it) return { ...s, prompt: null };
      if (a.value !== DEMO_PASSWORD) {
        return { ...s, prompt: { kind: "password", id, error: "wrong password, try again" }, log: say(s, `${it.host}: wrong password`, "err") };
      }
      const items = fillSlots(withItem(s, id, { status: "queued" }), s.concurrency);
      return { ...s, items, prompt: null, log: say(s, `${it.host}: password accepted, queued ${it.name}`, "ok") };
    }
    case "batch": {
      const urls = BATCH_POOL.slice(s.batchIdx, s.batchIdx + 3);
      if (urls.length === 0) return { ...s, log: say(s, "batch import: urls.txt already imported", "warn") };
      let nextId = s.nextId;
      const added: Item[] = [];
      for (const url of urls) {
        const chk = checkUrl(url);
        if (!chk.ok) continue;
        added.push(mk(nextId++, url, nameFromUrl(chk.url), chk.host?.label ?? "Direct", sizeFromUrl(chk.url), 8 + (hash32(url) % 22), { encrypted: chk.host?.key === "mega" }));
      }
      const items = fillSlots([...s.items, ...added], s.concurrency);
      return { ...s, items, nextId, batchIdx: s.batchIdx + 3, selectedId: added[0]?.id ?? s.selectedId, log: say(s, `batch import: ${added.length} links from urls.txt`, "info") };
    }
    case "toggleSettings":
      return { ...s, settingsOpen: !s.settingsOpen, prompt: null };
    case "concurrency": {
      const concurrency = Math.min(6, Math.max(1, s.concurrency + a.delta));
      return { ...s, concurrency, items: fillSlots(s.items, concurrency) };
    }
    case "cycleLimit": {
      const order = [0, 10, 25];
      const limit = order[(order.indexOf(s.limit) + 1) % order.length];
      return { ...s, limit, log: say(s, limit ? `speed limit set to ${limit} MB/s` : "speed limit removed", "info") };
    }
    case "quit":
      return { ...s, quit: true, prompt: null, settingsOpen: false };
    case "restart":
      return initialState();
    default:
      return s;
  }
}
