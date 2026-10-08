"use client";

import { useEffect, useReducer, useState } from "react";
import { CliTab } from "./CliTab";
import { hasWork, initialState, reducer } from "./engine";
import { usePageVisible, useReducedMotion, useWidth } from "./hooks";
import { McpTab } from "./McpTab";
import { handleTuiKey, TuiTab } from "./TuiTab";
import { Tabs, type TabDef } from "./ui";

type TabId = "tui" | "cli" | "mcp";

const TABS: TabDef<TabId>[] = [
  { id: "tui", label: "TUI", hint: "queue" },
  { id: "cli", label: "CLI", hint: "getit download" },
  { id: "mcp", label: "MCP", hint: "agent tools" },
];

const ID_BASE = "getit-demo";

export default function Demo() {
  const [tab, setTab] = useState<TabId>("tui");
  const [visited, setVisited] = useState<Record<TabId, boolean>>({ tui: true, cli: false, mcp: false });
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [focused, setFocused] = useState(false);
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const reduced = useReducedMotion();
  const compact = width > 0 && width < 700;

  // Simulation clock. Reduced motion: fewer, larger steps instead of a smooth 4 fps.
  // It only runs while the TUI is on screen and has something to advance.
  const visible = usePageVisible();
  const ticking = hasWork(state) && tab === "tui" && visible;
  useEffect(() => {
    if (!ticking) return;
    const ms = reduced ? 1000 : 250;
    const id = setInterval(() => dispatch({ type: "tick", dt: ms / 1000 }), ms);
    return () => clearInterval(id);
  }, [ticking, reduced]);

  const select = (id: TabId) => {
    setTab(id);
    setVisited((v) => (v[id] ? v : { ...v, [id]: true }));
  };

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (tab === "tui") handleTuiKey(e, state, dispatch);
      }}
      className="flex h-full min-h-0 flex-col bg-[#07090c] text-fg outline-none"
    >
      <Tabs tabs={TABS} value={tab} onChange={select} idBase={ID_BASE} />

      <div className="relative min-h-0 flex-1 overflow-auto">
        <div id={`${ID_BASE}-panel-tui`} role="tabpanel" aria-labelledby={`${ID_BASE}-tab-tui`} hidden={tab !== "tui"} className="min-h-full">
          <TuiTab state={state} dispatch={dispatch} compact={compact} rootRef={rootRef} />
        </div>
        {visited.cli && (
          <div id={`${ID_BASE}-panel-cli`} role="tabpanel" aria-labelledby={`${ID_BASE}-tab-cli`} hidden={tab !== "cli"} className="h-full min-h-[22rem]">
            <CliTab active={tab === "cli"} reduced={reduced} />
          </div>
        )}
        {visited.mcp && (
          <div id={`${ID_BASE}-panel-mcp`} role="tabpanel" aria-labelledby={`${ID_BASE}-tab-mcp`} hidden={tab !== "mcp"} className="h-full min-h-[22rem]">
            <McpTab reduced={reduced} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-line bg-surface px-3 py-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${focused ? "bg-accent" : "bg-muted/50"}`} />
          {focused ? "hotkeys active" : "click inside to enable hotkeys"}
        </span>
        {tab === "tui" && <span>↑/↓ select · p pause · c cancel · a add · b batch · s settings · q quit</span>}
        {tab === "cli" && <span>↑ history · Ctrl+C interrupt · Ctrl+L clear</span>}
        {tab === "mcp" && <span>simulated agent session · no network</span>}
      </div>
    </div>
  );
}
