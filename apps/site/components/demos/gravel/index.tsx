"use client";

import { useEffect, useReducer, useState, type KeyboardEvent } from "react";
import { ApprovalPane } from "./ApprovalPane";
import { AuditPane } from "./AuditPane";
import { initialState, reducer, type Action, type State } from "./engine";
import { useReducedMotion, useWidth } from "./hooks";
import { ScopePane } from "./ScopePane";
import { TimelinePane } from "./TimelinePane";
import { KeyButton } from "./ui";

function handleKey(e: KeyboardEvent, state: State, dispatch: (a: Action) => void) {
  // Emergency stop wins everywhere in the demo, even from a text field.
  if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "x") {
    e.preventDefault();
    dispatch({ type: "estop" });
    return;
  }
  const t = e.target as HTMLElement;
  if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
  const pending = state.pendingId !== null ? state.calls.find((c) => c.id === state.pendingId) : undefined;
  const act = (a: Action) => {
    e.preventDefault();
    dispatch(a);
  };
  switch (e.key.toLowerCase()) {
    case "a":
      return act({ type: "approve" });
    case "d":
      return act({ type: "deny" });
    case "e":
      if (pending && pending.tool !== "write_file") act({ type: "approve", always: true });
      return;
    case "g":
      return act({ type: "toggleAgent" });
    case "n":
      return act({ type: "step" });
    case "r":
      return act({ type: "resume" });
  }
}

export default function Demo() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [focused, setFocused] = useState(false);
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const reduced = useReducedMotion();
  const wide = width === 0 || width >= 720;
  const auditWide = width === 0 || width >= 880;

  useEffect(() => {
    const ms = reduced ? 1000 : 250;
    const id = setInterval(() => dispatch({ type: "tick", dt: ms / 1000 }), ms);
    return () => clearInterval(id);
  }, [reduced]);

  const estop = state.estop;
  const pendingCount = state.pendingId !== null ? 1 : 0;

  const stopButton = estop ? (
    <KeyButton k="r" tone="accent" className="min-h-11 px-4 text-[13px] font-semibold" onClick={() => dispatch({ type: "resume" })}>
      Resume agent
    </KeyButton>
  ) : (
    <button
      type="button"
      onClick={() => dispatch({ type: "estop" })}
      aria-keyshortcuts="Control+X" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded border-2 border-[#ff6b6b] bg-[#ff6b6b] px-4 text-[13px] font-bold uppercase tracking-wider text-[#1a0505] transition hover:bg-[#ff8585]"
    >
      <span aria-hidden="true">■</span> Emergency stop
      <kbd className="hidden rounded bg-[#1a0505]/20 px-1 font-mono text-[11px] normal-case sm:inline">Ctrl+X</kbd>
    </button>
  );

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => handleKey(e, state, dispatch)}
      className="flex h-full min-h-0 flex-col bg-[#07090c] text-fg outline-none"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-3 py-2">
          <div className="min-w-[13rem] flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-semibold text-accent">gravel</span>
              <span className="text-[12px] text-muted">session s-7f3a · scope enforced · {pendingCount} pending</span>
            </div>
            <div className="text-[11px] text-muted">
              gravel-core · gravel-security · gravel-mcp · gravel-agent · gravel-tui
            </div>
          </div>
          <div className={`flex items-center gap-2 ${wide ? "" : "w-full [&>*:last-child]:flex-1"}`}>
            <button type="button" onClick={() => dispatch({ type: "reset" })} className="min-h-9 rounded border border-line px-2.5 text-[12px] text-muted hover:border-accent/60 hover:text-fg">
              Reset demo
            </button>
            {stopButton}
          </div>
        </header>

        {estop && (
          <div role="alert" className="border-b border-[#ff6b6b]/50 bg-[#ff6b6b]/15 px-3 py-2 text-[13px] font-semibold text-[#ff6b6b]">
            EMERGENCY STOP ENGAGED: agent frozen, tool dispatch disabled, pending requests rejected. Everything was logged.
          </div>
        )}

        <div className={`grid gap-2 p-2 ${wide ? "grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : "grid-cols-1"}`}>
          <div className={wide ? "col-start-2 row-start-1" : ""}>
            <ApprovalPane state={state} dispatch={dispatch} />
          </div>
          <div className={wide ? "col-start-1 row-span-2 row-start-1" : ""}>
            <TimelinePane state={state} dispatch={dispatch} />
          </div>
          <div className={wide ? "col-start-2 row-start-2" : ""}>
            <ScopePane state={state} dispatch={dispatch} />
          </div>
          <div className={wide ? "col-span-2" : ""}>
            <AuditPane audit={state.audit} wide={auditWide} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-line bg-surface px-3 py-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${focused ? "bg-accent" : "bg-muted/50"}`} />
          {focused ? "hotkeys active" : "click inside to enable hotkeys"}
        </span>
        <span>a approve · d deny · e always · g pause agent · n next call · Ctrl+X stop · r resume</span>
      </div>
    </div>
  );
}
