"use client";

import { useEffect, useRef, useState, type Dispatch, type KeyboardEvent, type RefObject } from "react";
import type { Action, Item, State, Status, Tone } from "./engine";
import { DEMO_PASSWORD } from "./engine";
import { fmtEta, fmtSize } from "./lib";
import { Bar, KeyButton } from "./ui";

const STATUS: Record<Status, { label: string; cls: string; tone: "accent" | "amber" | "blue" | "muted" }> = {
  queued: { label: "queued", cls: "text-muted", tone: "muted" },
  downloading: { label: "downloading", cls: "text-accent", tone: "accent" },
  paused: { label: "paused", cls: "text-[#f5c542]", tone: "amber" },
  locked: { label: "needs password", cls: "text-[#f5c542]", tone: "amber" },
  verifying: { label: "verifying…", cls: "text-[#6cb6ff]", tone: "blue" },
  done: { label: "verified ✓", cls: "text-accent", tone: "accent" },
  cancelled: { label: "cancelled", cls: "text-muted line-through", tone: "muted" },
};

const TONE: Record<Tone, string> = { info: "text-muted", ok: "text-accent", warn: "text-[#f5c542]", err: "text-[#ff6b6b]" };

const pctOf = (i: Item) => (i.status === "done" ? 100 : (i.doneMb / i.sizeMb) * 100);
const etaOf = (i: Item) => (i.status === "downloading" && i.speed > 0 ? fmtEta((i.sizeMb - i.doneMb) / i.speed) : "--:--");
const speedOf = (i: Item) => (i.status === "downloading" ? `${i.speed.toFixed(1)} MB/s` : "-");

/** Hotkeys for the TUI view. Called from the demo root, so they only fire while the demo has focus. */
export function handleTuiKey(e: KeyboardEvent, state: State, dispatch: Dispatch<Action>) {
  const t = e.target as HTMLElement;
  if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
  if (state.quit) {
    if (e.key === "r" || e.key === "Enter") {
      if (t.tagName !== "BUTTON") {
        e.preventDefault();
        dispatch({ type: "restart" });
      }
    }
    return;
  }
  const act = (a: Action) => {
    e.preventDefault();
    dispatch(a);
  };
  switch (e.key) {
    case "ArrowDown":
    case "j":
      return act({ type: "move", delta: 1 });
    case "ArrowUp":
    case "k":
      return act({ type: "move", delta: -1 });
    case "p":
      return act({ type: "pause" });
    case "c":
      return act({ type: "cancel" });
    case "a":
      return act({ type: "openAdd" });
    case "b":
      return act({ type: "batch" });
    case "s":
      return act({ type: "toggleSettings" });
    case "q":
      return act({ type: "quit" });
    case "Escape":
      return act({ type: "closePrompt" });
    case "Enter":
      if (t.tagName !== "BUTTON") return act({ type: "openPassword" });
  }
}

function PromptLine({ state, dispatch, rootRef }: { state: State; dispatch: Dispatch<Action>; rootRef: RefObject<HTMLDivElement | null> }) {
  const prompt = state.prompt;
  if (!prompt) return null;
  const key = prompt.kind === "password" ? `pw-${prompt.id}` : "add";
  return <PromptForm key={key} state={state} dispatch={dispatch} rootRef={rootRef} />;
}

function PromptForm({ state, dispatch, rootRef }: { state: State; dispatch: Dispatch<Action>; rootRef: RefObject<HTMLDivElement | null> }) {
  const prompt = state.prompt;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only pull focus when the visitor is already working inside the demo.
    if (rootRef.current?.contains(document.activeElement)) inputRef.current?.focus();
  }, [rootRef]);

  if (!prompt) return null;
  const isPw = prompt.kind === "password";
  const target = isPw ? state.items.find((i) => i.id === prompt.id) : null;
  return (
    <form
      className="border-t border-line bg-surface/70 px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (isPw) dispatch({ type: "submitPassword", value });
        else dispatch({ type: "submitAdd", url: value });
      }}
    >
      <label htmlFor="getit-prompt" className="mb-1 block text-[12px] text-muted">
        {isPw ? (
          <>
            Password for <span className="text-fg">{target?.name}</span> ({target?.host}){" "}
            <span className="text-muted">· demo password is </span>
            <code className="text-accent">{DEMO_PASSWORD}</code>
          </>
        ) : (
          <>Add URL (one per line in the real app) · try a <code className="text-fg">*.example.test</code> link</>
        )}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-accent" aria-hidden="true">{isPw ? "🔒" : "+"}</span>
        <input
          id="getit-prompt"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={isPw ? "password" : "text"}
          autoComplete="off"
          spellCheck={false}
          placeholder={isPw ? "password" : "https://gofile.example.test/d/AbC123"}
          className="min-w-0 flex-1 rounded border border-line bg-bg px-2 py-1 text-[13px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <button type="submit" className="rounded bg-accent px-2.5 py-1 text-[12px] font-semibold text-accent-ink">
          {isPw ? "Unlock" : "Add"}
        </button>
        <button type="button" onClick={() => dispatch({ type: "closePrompt" })} className="rounded border border-line px-2.5 py-1 text-[12px] text-muted hover:text-fg">
          Esc
        </button>
      </div>
      {prompt.error && (
        <p role="alert" className="mt-1 text-[12px] text-[#ff6b6b]">
          {prompt.error}
        </p>
      )}
    </form>
  );
}

function Row({ item, selected, compact, onSelect }: { item: Item; selected: boolean; compact: boolean; onSelect: () => void }) {
  const st = STATUS[item.status];
  const pct = pctOf(item);
  const marker = selected ? "▸" : " ";
  const bg = selected ? "bg-accent/10" : "hover:bg-surface/70";
  if (compact) {
    return (
      <div id={`getit-row-${item.id}`} role="option" aria-selected={selected} onClick={onSelect} className={`cursor-pointer border-b border-line/60 px-3 py-1.5 ${bg}`}>
        <div className="flex items-baseline gap-2">
          <span className="w-3 text-accent" aria-hidden="true">{marker}</span>
          <span className="min-w-0 flex-1 truncate text-fg">{item.name}</span>
          <span className={`shrink-0 text-[12px] ${st.cls}`}>{st.label}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 pl-5 text-[11px] text-muted">
          <Bar pct={pct} label={`${item.name} progress`} tone={st.tone} width="min-w-0 flex-1" />
          <span className="w-9 shrink-0 text-right text-fg">{pct.toFixed(0)}%</span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 pl-5 text-[11px] text-muted">
          <span>{item.host}</span>
          <span>{fmtSize(item.sizeMb)}</span>
          <span>{speedOf(item)}</span>
          <span>eta {etaOf(item)}</span>
        </div>
      </div>
    );
  }
  return (
    <div
      id={`getit-row-${item.id}`}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`grid cursor-pointer grid-cols-[1rem_minmax(0,1.5fr)_5.5rem_minmax(5rem,1.2fr)_2.75rem_5.5rem_3.25rem_7.5rem] items-center gap-x-2 border-b border-line/60 px-3 py-1.5 ${bg}`}
    >
      <span className="text-accent" aria-hidden="true">{marker}</span>
      <span className="truncate text-fg">{item.name}</span>
      <span className="truncate text-muted">{item.host}</span>
      <Bar pct={pct} label={`${item.name} progress`} tone={st.tone} />
      <span className="text-right text-fg">{pct.toFixed(0)}%</span>
      <span className="text-right text-muted">{speedOf(item)}</span>
      <span className="text-right text-muted">{etaOf(item)}</span>
      <span className={`truncate text-right ${st.cls}`}>{st.label}</span>
    </div>
  );
}

export function TuiTab({ state, dispatch, compact, rootRef }: { state: State; dispatch: Dispatch<Action>; compact: boolean; rootRef: RefObject<HTMLDivElement | null> }) {
  const logRef = useRef<HTMLDivElement>(null);
  const sel = state.items.find((i) => i.id === state.selectedId);
  const active = state.items.filter((i) => i.status === "downloading");
  const total = active.reduce((a, i) => a + i.speed, 0);
  const queued = state.items.filter((i) => i.status === "queued" || i.status === "locked").length;
  const done = state.items.filter((i) => i.status === "done").length;

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.log.length]);

  if (state.quit) {
    return (
      <div className="p-4 text-[13px]">
        <p className="text-muted">
          <span className="text-accent">$</span> getit
        </p>
        <p className="mt-1 text-fg">Session closed. {done} of {state.items.length} downloads were verified. Partial files are kept for resume.</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "restart" })}
          className="mt-3 inline-flex items-center gap-2 rounded bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink"
        >
          <kbd className="rounded bg-accent-ink/15 px-1">r</kbd> Restart session
        </button>
      </div>
    );
  }

  const canPause = sel && (sel.status === "downloading" || sel.status === "paused");
  const canCancel = sel && ["queued", "downloading", "paused", "locked"].includes(sel.status);

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface/50 px-3 py-1.5 text-[12px]">
        <span className="font-semibold text-accent">getit</span>
        <span className="text-muted">↓ <span className="text-fg">{total.toFixed(1)} MB/s</span>{state.limit ? ` (cap ${state.limit})` : ""}</span>
        <span className="text-muted">active <span className="text-fg">{active.length}/{state.concurrency}</span></span>
        <span className="text-muted">queued <span className="text-fg">{queued}</span></span>
        <span className="text-muted">verified <span className="text-fg">{done}/{state.items.length}</span></span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-line px-3 py-2" role="toolbar" aria-label="Queue actions">
        <KeyButton k="a" onClick={() => dispatch({ type: "openAdd" })}>Add</KeyButton>
        <KeyButton k="b" onClick={() => dispatch({ type: "batch" })}>Batch</KeyButton>
        <KeyButton k="p" disabled={!canPause} onClick={() => dispatch({ type: "pause" })}>
          {sel?.status === "paused" ? "Resume" : "Pause"}
        </KeyButton>
        <KeyButton k="c" disabled={!canCancel} onClick={() => dispatch({ type: "cancel" })}>Cancel</KeyButton>
        <KeyButton k="s" aria-expanded={state.settingsOpen} onClick={() => dispatch({ type: "toggleSettings" })}>Settings</KeyButton>
        <KeyButton k="q" onClick={() => dispatch({ type: "quit" })}>Quit</KeyButton>
        {sel?.status === "locked" && (
          <KeyButton k="↵" onClick={() => dispatch({ type: "openPassword" })}>Password</KeyButton>
        )}
      </div>

      {state.settingsOpen && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-surface/70 px-3 py-2 text-[12px]">
          <span className="text-muted">Settings</span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted" id="getit-conc-label">Concurrent downloads</span>
            <button type="button" aria-label="Decrease concurrency" onClick={() => dispatch({ type: "concurrency", delta: -1 })} className="h-6 w-6 rounded border border-line hover:border-accent/60">-</button>
            <span aria-labelledby="getit-conc-label" className="w-4 text-center text-fg">{state.concurrency}</span>
            <button type="button" aria-label="Increase concurrency" onClick={() => dispatch({ type: "concurrency", delta: 1 })} className="h-6 w-6 rounded border border-line hover:border-accent/60">+</button>
          </span>
          <button type="button" onClick={() => dispatch({ type: "cycleLimit" })} className="rounded border border-line px-2 py-1 hover:border-accent/60">
            Speed limit: <span className="text-accent">{state.limit ? `${state.limit} MB/s` : "off"}</span>
          </button>
          <span className="text-muted">Resume: <span className="text-fg">on</span> · Verify: <span className="text-fg">sha256</span></span>
        </div>
      )}

      {!compact && (
        <div className="grid grid-cols-[1rem_minmax(0,1.5fr)_5.5rem_minmax(5rem,1.2fr)_2.75rem_5.5rem_3.25rem_7.5rem] gap-x-2 border-b border-line px-3 py-1 text-[11px] uppercase tracking-wider text-muted" aria-hidden="true">
          <span />
          <span>File</span>
          <span>Host</span>
          <span>Progress</span>
          <span className="text-right">%</span>
          <span className="text-right">Speed</span>
          <span className="text-right">ETA</span>
          <span className="text-right">Status</span>
        </div>
      )}
      <div
        role="listbox"
        tabIndex={0}
        aria-label="Download queue. Use arrow keys to select, then p to pause or c to cancel."
        aria-activedescendant={`getit-row-${state.selectedId}`}
        className="focus-visible:outline-offset-[-2px]"
      >
        {state.items.map((it) => (
          <Row key={it.id} item={it} selected={it.id === state.selectedId} compact={compact} onSelect={() => dispatch({ type: "select", id: it.id })} />
        ))}
      </div>

      {sel && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 border-b border-line px-3 py-2 text-[12px]">
          <dt className="text-muted">url</dt>
          <dd className="break-all text-fg">{sel.url}</dd>
          <dt className="text-muted">save</dt>
          <dd className="break-all text-fg">
            ./downloads/{sel.name} · {fmtSize(sel.sizeMb)}
            {sel.files > 1 ? ` · ${sel.files} files (recursive)` : ""}
            {sel.encrypted ? " · AES-CTR decrypt" : ""}
          </dd>
          <dt className="text-muted">sha256</dt>
          <dd className="break-all text-fg">{sel.hash ? <span className="text-accent">{sel.hash} ✓</span> : <span className="text-muted">pending</span>}</dd>
        </dl>
      )}

      <PromptLine state={state} dispatch={dispatch} rootRef={rootRef} />

      <div ref={logRef} role="log" aria-label="getit event log" className="max-h-24 min-h-14 overflow-auto px-3 py-2 text-[12px]">
        {state.log.slice(-6).map((l) => (
          <div key={`${l.at.toFixed(2)}-${l.text}`} className={TONE[l.tone]}>
            <span className="text-muted/70">+{l.at.toFixed(0).padStart(3, "0")}s </span>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
