"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Ev =
  | { t: "system"; text: string }
  | { t: "user"; text: string }
  | { t: "assistant"; text: string }
  | { t: "call"; id: string; kind: "tool" | "resource"; name: string; args?: unknown }
  | { t: "result"; id: string; data: unknown };

const URL_ = "https://gofile.example.test/d/Xk29aP";

const SCRIPT: Ev[] = [
  { t: "system", text: "MCP client connected to `getit` over stdio. Loaded prompt: download_workflow" },
  { t: "user", text: `Download the shared folder at ${URL_} into ./datasets, three at a time, and tell me when it is verified.` },
  { t: "assistant", text: "I'll list the folder first so I know what is in it." },
  { t: "call", id: "c1", kind: "tool", name: "list_files", args: { url: URL_ } },
  {
    t: "result",
    id: "c1",
    data: {
      folder: "dataset-2024",
      files: [
        { name: "train.csv", size: "412 MB" },
        { name: "labels.json", size: "3.1 MB" },
        { name: "README.md", size: "4 KB" },
      ],
      total: "415.1 MB",
    },
  },
  { t: "assistant", text: "Three files, 415 MB in total. Starting the download with 3 connections." },
  { t: "call", id: "c2", kind: "tool", name: "download", args: { url: URL_, output_dir: "./datasets", concurrency: 3 } },
  { t: "result", id: "c2", data: { download_id: "dl_7f3a21", status: "started", files: 3 } },
  { t: "assistant", text: "Started. Let me check what is currently active." },
  { t: "call", id: "c3", kind: "resource", name: "active-downloads://list" },
  { t: "result", id: "c3", data: [{ id: "dl_7f3a21", state: "downloading", progress: 0.18 }] },
  { t: "call", id: "c4", kind: "tool", name: "get_download_status", args: { download_id: "dl_7f3a21" } },
  { t: "result", id: "c4", data: { status: "downloading", progress: 0.63, speed: "24.6 MB/s", eta_seconds: 6 } },
  { t: "assistant", text: "63% at 24.6 MB/s, about six seconds left. Checking once more." },
  { t: "call", id: "c5", kind: "tool", name: "get_download_status", args: { download_id: "dl_7f3a21" } },
  {
    t: "result",
    id: "c5",
    data: { status: "completed", verified: { algorithm: "sha256", ok: 3, failed: 0 }, saved_to: "./datasets/dataset-2024" },
  },
  { t: "assistant", text: "Done. All 3 files were downloaded and their sha256 checksums verified. They are in ./datasets/dataset-2024." },
];

const TOOLS = ["download", "list_files", "get_download_status", "cancel_download"];

function Json({ data }: { data: unknown }) {
  const text = JSON.stringify(data, null, 2);
  const parts: ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|(true|false|null)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] && m[2]) parts.push(<span key={k++} className="text-[#6cb6ff]">{m[1]}</span>, m[2]);
    else if (m[1]) parts.push(<span key={k++} className="text-accent">{m[1]}</span>);
    else if (m[3]) parts.push(<span key={k++} className="text-[#f5c542]">{m[3]}</span>);
    else parts.push(<span key={k++} className="text-[#d2a8ff]">{m[4]}</span>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-fg/90">{parts}</pre>;
}

/** Mounted the first time the tab is opened, so the conversation starts when the visitor arrives. */
export function McpTab({ reduced }: { reduced: boolean }) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step >= SCRIPT.length) return;
    const next = SCRIPT[step];
    // Calls pause longer while "running", results and chat arrive quicker.
    const base = next.t === "result" ? 900 : next.t === "call" ? 700 : next.t === "user" ? 500 : 1000;
    const id = setTimeout(() => setStep((s) => s + 1), reduced ? Math.min(base, 350) : base);
    return () => clearTimeout(id);
  }, [step, run, reduced]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step]);

  const shown = SCRIPT.slice(0, step);
  const results = new Map<string, unknown>();
  for (const e of shown) if (e.t === "result") results.set(e.id, e.data);
  const usedTools = new Set(shown.filter((e): e is Extract<Ev, { t: "call" }> => e.t === "call").map((e) => e.name));
  const finished = step >= SCRIPT.length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-line px-3 py-2 text-[12px]">
        <span className="text-muted">getit MCP server</span>
        {TOOLS.map((t) => (
          <span key={t} className={`rounded border px-1.5 py-0.5 ${usedTools.has(t) ? "border-accent/60 text-accent" : "border-line text-muted"}`}>
            {t}
          </span>
        ))}
        <span className={`rounded border px-1.5 py-0.5 ${usedTools.has("active-downloads://list") ? "border-[#6cb6ff]/60 text-[#6cb6ff]" : "border-line text-muted"}`}>
          resource active-downloads://list
        </span>
        <span className={`rounded border px-1.5 py-0.5 ${step > 0 ? "border-[#d2a8ff]/60 text-[#d2a8ff]" : "border-line text-muted"}`}>prompt download_workflow</span>
        <span className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={() => setStep(SCRIPT.length)}
            disabled={finished}
            className="rounded border border-line px-2 py-1 text-muted hover:border-accent/60 hover:text-fg disabled:opacity-40"
          >
            Skip to end
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setRun((r) => r + 1);
            }}
            className="rounded bg-accent px-2.5 py-1 font-semibold text-accent-ink"
          >
            ↻ Replay
          </button>
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-3 py-3">
        <div role="log" aria-label="Agent conversation" className="flex flex-col gap-3">
          {shown.map((e, i) => {
            if (e.t === "result") return null;
            if (e.t === "system") {
              return (
                <p key={i} className="text-center text-[11px] text-muted">
                  — {e.text} —
                </p>
              );
            }
            if (e.t === "user") {
              return (
                <div key={i} className="ml-auto max-w-[90%] rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-[13px] text-fg">
                  <div className="mb-0.5 text-[11px] uppercase tracking-wider text-accent">you</div>
                  <span className="break-words">{e.text}</span>
                </div>
              );
            }
            if (e.t === "assistant") {
              return (
                <div key={i} className="max-w-[90%] rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-fg">
                  <div className="mb-0.5 text-[11px] uppercase tracking-wider text-muted">assistant</div>
                  {e.text}
                </div>
              );
            }
            const result = results.get(e.id);
            const done = results.has(e.id);
            return (
              <div key={i} className="rounded-lg border border-line bg-bg">
                <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-1.5 text-[12px]">
                  <span className="text-[#f5c542]">{e.kind === "tool" ? "tool call" : "read resource"}</span>
                  <code className="break-all text-fg">{e.name}</code>
                  <span className={`ml-auto ${done ? "text-accent" : "text-muted"}`}>{done ? "✓ ok" : "running…"}</span>
                </div>
                {e.args !== undefined && (
                  <div className="border-b border-line/60 px-3 py-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-muted">arguments</div>
                    <Json data={e.args} />
                  </div>
                )}
                {done && (
                  <div className="px-3 py-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-muted">result</div>
                    <Json data={result} />
                  </div>
                )}
              </div>
            );
          })}
          {!finished && step > 0 && (
            <p className="text-[12px] text-muted" aria-hidden="true">
              <span className="inline-block animate-pulse">▍</span>
            </p>
          )}
          {finished && <p className="text-center text-[11px] text-muted">— end of simulated session. Nothing was downloaded. —</p>}
        </div>
      </div>
    </div>
  );
}
