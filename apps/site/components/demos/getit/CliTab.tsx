"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DEMO_PASSWORD } from "./engine";
import { checkUrl, fakeSha, fmtEta, fmtSize, hash32, nameFromUrl, sizeFromUrl } from "./lib";
import { Chip } from "./ui";

type Kind = "cmd" | "out" | "ok" | "err" | "dim";
interface Line {
  id: number;
  kind: Kind;
  text: string;
}

interface Live {
  name: string;
  pct: number;
  speed: number;
  eta: number;
  conns: number;
  parts: number[];
}

const HELP = `Usage: getit [OPTIONS] COMMAND [ARGS]...

  Universal file-host downloader: GoFile, PixelDrain, MediaFire,
  1Fichier, UploadFlix, Mega.nz and Anonfile.de.

Commands:
  download   Download a URL

Run \`getit download --help\` for options.`;

const DL_HELP = `Usage: getit download [OPTIONS] URL

Options:
  -o, --output DIR        Destination directory   [default: ./downloads]
  -c, --concurrency N     Parallel downloads      [default: 4]
  -p, --password TEXT     Password for protected links
  -l, --limit SPEED       Speed limit, e.g. 5M or 500K
  --no-resume             Ignore partial files and start over
  -h, --help              Show this message`;

const SUGGESTIONS = [
  { label: "--help", cmd: "getit --help" },
  { label: "download -c 2", cmd: "getit download https://example.test/f/abc123 -c 2" },
  { label: "protected + password, 5M limit", cmd: "getit download https://1fichier.example.test/?k9x -p demo -l 5M" },
  { label: "protected, no password", cmd: "getit download https://1fichier.example.test/?k9x" },
];

function tokenize(input: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function parseLimit(v: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*(k|kb|m|mb)?(?:\/s)?$/i.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "m").toLowerCase();
  return unit.startsWith("k") ? n / 1024 : n;
}

interface Opts {
  url: string;
  out: string;
  conns: number;
  password?: string;
  limit: number;
  resume: boolean;
}

function parseDownload(args: string[]): { opts: Opts } | { error: string } | { help: true } {
  const opts: Opts = { url: "", out: "./downloads", conns: 4, limit: 0, resume: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const val = () => args[++i];
    if (a === "-h" || a === "--help") return { help: true };
    else if (a === "-o" || a === "--output") {
      const v = val();
      if (!v) return { error: `Option '${a}' requires a value.` };
      opts.out = v;
    } else if (a === "-c" || a === "--concurrency") {
      const n = parseInt(val() ?? "", 10);
      if (!Number.isInteger(n) || n < 1 || n > 8) return { error: `Invalid value for '${a}': must be an integer between 1 and 8.` };
      opts.conns = n;
    } else if (a === "-p" || a === "--password") {
      const v = val();
      if (!v) return { error: `Option '${a}' requires a value.` };
      opts.password = v;
    } else if (a === "-l" || a === "--limit") {
      const l = parseLimit(val() ?? "");
      if (l === null || l <= 0) return { error: `Invalid value for '${a}': use a speed like 5M or 500K.` };
      opts.limit = l;
    } else if (a === "--no-resume") opts.resume = false;
    else if (a.startsWith("-")) return { error: `No such option: ${a}` };
    else if (!opts.url) opts.url = a;
    else return { error: `Unexpected extra argument: ${a}` };
  }
  if (!opts.url) return { error: "Missing argument 'URL'." };
  return { opts };
}

interface Job {
  opts: Opts;
  name: string;
  sizeMb: number;
  base: number;
  phase: "resolve" | "download" | "verify";
  t: number;
  pct: number;
  startPct: number;
  elapsed: number;
}

export function CliTab({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [lines, setLines] = useState<Line[]>([
    { id: 0, kind: "dim", text: "getit demo shell. Nothing is downloaded: all output is simulated in your browser." },
    { id: 1, kind: "dim", text: "Try a suggestion below, or type `getit --help`." },
  ]);
  const [live, setLive] = useState<Live | null>(null);
  const [value, setValue] = useState("");
  const [running, setRunning] = useState(false);
  const idRef = useRef(2);
  const jobRef = useRef<Job | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const partials = useRef<Map<string, number>>(new Map());
  const history = useRef<string[]>([]);
  const histPos = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloaded = useRef<string[]>([]);

  const print = useCallback((kind: Kind, text: string) => {
    setLines((prev) => [...prev, { id: idRef.current++, kind, text }].slice(-200));
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const hasLive = live !== null;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length, hasLive]);

  const finish = useCallback(() => {
    stopTimer();
    jobRef.current = null;
    setLive(null);
    setRunning(false);
  }, [stopTimer]);

  const tick = useCallback(
    (dt: number) => {
      const job = jobRef.current;
      if (!job) return;
      job.t += dt;
      job.elapsed += dt;
      const { opts } = job;
      if (job.phase === "resolve") {
        if (job.t < 0.7) return;
        job.phase = "download";
        job.t = 0;
        const resumed = opts.resume ? partials.current.get(opts.url) ?? 0 : 0;
        job.pct = resumed;
        job.startPct = resumed;
        print("ok", `✓ resolved · 1 file · ${fmtSize(job.sizeMb)} · ${job.name}`);
        if (resumed > 0) print("out", `↻ resume: found partial file at ${resumed.toFixed(0)}%, continuing`);
        else print("dim", opts.resume ? "resume: no partial file found" : "resume disabled (--no-resume), starting from 0%");
        print("out", `→ saving to ${opts.out.replace(/\/$/, "")}/${job.name} · ${opts.conns} connection${opts.conns > 1 ? "s" : ""}${opts.limit ? ` · limit ${opts.limit} MB/s` : ""}`);
        return;
      }
      if (job.phase === "download") {
        const wobble = 0.85 + 0.25 * Math.sin(job.elapsed * 2.1);
        let speed = job.base * wobble * (0.6 + 0.1 * Math.min(opts.conns, 4));
        if (opts.limit) speed = Math.min(speed, opts.limit);
        job.pct = Math.min(100, job.pct + ((speed * dt) / job.sizeMb) * 100 * 9);
        partials.current.set(opts.url, job.pct);
        const eta = ((100 - job.pct) / 100) * job.sizeMb / (speed * 9);
        const parts = Array.from({ length: Math.min(opts.conns, 4) }, (_, i) => Math.max(0, Math.min(100, job.pct + (i % 2 ? -2.5 : 2) * Math.sin(job.elapsed + i))));
        setLive({ name: job.name, pct: job.pct, speed, eta, conns: opts.conns, parts });
        if (job.pct >= 100) {
          job.phase = "verify";
          job.t = 0;
          setLive(null);
          print("out", "… verifying sha256");
        }
        return;
      }
      if (job.t < 0.8) return;
      const sha = fakeSha(opts.url);
      partials.current.delete(opts.url);
      downloaded.current.push(`${opts.out.replace(/\/$/, "")}/${job.name}`);
      print("ok", `✓ sha256 verified  ${sha.slice(0, 16)}…`);
      print("ok", `✓ saved ${opts.out.replace(/\/$/, "")}/${job.name} (${fmtSize(job.sizeMb)}) in ${job.elapsed.toFixed(1)}s`);
      finish();
    },
    [finish, print],
  );

  const interrupt = useCallback(() => {
    const job = jobRef.current;
    if (!job) return;
    print("err", "^C interrupted");
    print("dim", `partial file kept at ${job.pct.toFixed(0)}%. Run the same command again to resume.`);
    finish();
  }, [finish, print]);

  const start = useCallback(
    (opts: Opts) => {
      const chk = checkUrl(opts.url);
      if (!chk.ok) return print("err", `Error: ${chk.error}`);
      if (chk.host?.key === "1fichier") {
        if (!opts.password) return print("err", "Error: this link is password protected. Pass the password with -p PASSWORD.");
        if (opts.password !== DEMO_PASSWORD) return print("err", `Error: wrong password (the demo password is "${DEMO_PASSWORD}").`);
        print("ok", "✓ password accepted");
      }
      print("dim", `→ resolving ${opts.url}${chk.host ? ` (${chk.host.label})` : ""}`);
      const dt = reduced ? 0.4 : 0.12;
      jobRef.current = {
        opts,
        name: nameFromUrl(chk.url),
        sizeMb: Math.min(sizeFromUrl(chk.url), 160),
        base: 8 + (hash32(opts.url) % 10),
        phase: "resolve",
        t: 0,
        pct: 0,
        startPct: 0,
        elapsed: 0,
      };
      setRunning(true);
      stopTimer();
      timerRef.current = setInterval(() => tick(dt), dt * 1000);
    },
    [print, reduced, stopTimer, tick],
  );

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input || running) return;
      history.current.push(input);
      histPos.current = -1;
      print("cmd", input);
      setValue("");
      const [bin, ...rest] = tokenize(input);
      if (bin === "clear") return setLines([]);
      if (bin === "help") return print("out", "Available: getit --help · getit download URL [options] · ls · clear");
      if (bin === "ls") {
        return print("out", downloaded.current.length ? downloaded.current.join("\n") : "(nothing downloaded yet)");
      }
      if (bin !== "getit") return print("err", `${bin}: command not found (this demo shell only knows \`getit\`, ls, clear)`);
      const [sub, ...args] = rest;
      if (!sub || sub === "--help" || sub === "-h") return print("out", HELP);
      if (sub !== "download") return print("err", `Error: No such command '${sub}'.`);
      const parsed = parseDownload(args);
      if ("help" in parsed) return print("out", DL_HELP);
      if ("error" in parsed) return print("err", `Error: ${parsed.error}`);
      start(parsed.opts);
    },
    [print, running, start],
  );

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const h = history.current;
      if (!h.length) return;
      e.preventDefault();
      histPos.current = e.key === "ArrowUp" ? (histPos.current < 0 ? h.length - 1 : Math.max(0, histPos.current - 1)) : Math.min(h.length, histPos.current + 1);
      setValue(h[histPos.current] ?? "");
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      if (running) interrupt();
      else setValue("");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap gap-1.5 border-b border-line px-3 py-2" aria-label="Suggested commands" role="group">
        {SUGGESTIONS.map((s) => (
          <Chip
            key={s.cmd}
            disabled={running}
            title={s.cmd}
            aria-label={`Run: ${s.cmd}`}
            onClick={() => {
              run(s.cmd);
              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            <span className="text-accent">$ </span>
            {s.label}
          </Chip>
        ))}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-3 py-2 text-[13px]" onClick={() => active && inputRef.current?.focus({ preventScroll: true })}>
        <div role="log" aria-label="getit shell output">
          {lines.map((l) => (
            <div
              key={l.id}
              className={`whitespace-pre-wrap break-words ${
                l.kind === "cmd" ? "text-fg" : l.kind === "ok" ? "text-accent" : l.kind === "err" ? "text-[#ff6b6b]" : l.kind === "dim" ? "text-muted" : "text-fg/90"
              }`}
            >
              {l.kind === "cmd" && <span className="text-accent">$ </span>}
              {l.text}
            </div>
          ))}
        </div>
        {live && (
          <div className="mt-1 text-[12px] text-fg" aria-hidden="true">
            {live.conns > 1 &&
              live.parts.map((p, i) => (
                <div key={i} className="text-muted">
                  {"  "}part {i + 1}/{live.conns} {textBar(p, 12)} {p.toFixed(0).padStart(3)}%
                </div>
              ))}
            <div className="break-words">
              {live.name} {textBar(live.pct, 20)} {live.pct.toFixed(0).padStart(3)}% · {live.speed.toFixed(1)} MB/s · eta {fmtEta(live.eta)}
            </div>
          </div>
        )}
        <form
          className="mt-1 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
        >
          <label htmlFor="getit-cli-input" className="text-accent">
            $
            <span className="sr-only"> command</span>
          </label>
          <input
            id="getit-cli-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            disabled={running}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={running ? "downloading… (Ctrl+C to interrupt)" : "getit download https://example.test/f/abc123 -c 2"}
            className="min-w-0 flex-1 bg-transparent py-1 text-[13px] text-fg placeholder:text-muted/60 focus:outline-none disabled:opacity-60"
          />
          {running ? (
            <button type="button" onClick={interrupt} className="rounded border border-line px-2 py-1 text-[12px] text-[#ff6b6b] hover:border-[#ff6b6b]/60">
              ^C Stop
            </button>
          ) : (
            <button type="submit" className="rounded border border-line px-2 py-1 text-[12px] text-muted hover:border-accent/60 hover:text-fg">
              Run
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function textBar(pct: number, width: number) {
  const full = Math.round((Math.max(0, Math.min(100, pct)) / 100) * width);
  return `[${"█".repeat(full)}${"░".repeat(width - full)}]`;
}
