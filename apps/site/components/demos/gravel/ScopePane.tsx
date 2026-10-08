"use client";

import { useState, type Dispatch } from "react";
import type { Action, State } from "./engine";
import { RED, Pane } from "./ui";

function Entry({ value, onRemove, label }: { value: string; onRemove: () => void; label: string }) {
  return (
    <li className="flex items-center gap-2 border-b border-line/50 px-3 py-1 text-[12px]">
      <span className="text-accent" aria-hidden="true">✔</span>
      <code className="min-w-0 flex-1 break-all text-fg">{value}</code>
      <button type="button" aria-label={`Remove ${label} ${value}`} onClick={onRemove} className="flex h-6 w-6 items-center justify-center rounded border border-line text-muted hover:border-[#ff6b6b]/60 hover:text-[#ff6b6b]">
        ×
      </button>
    </li>
  );
}

export function ScopePane({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const [value, setValue] = useState("");
  const msg = state.scopeMsg;
  return (
    <Pane id="gravel-scope" title="Scope">
      <div className="overflow-auto">
        <p className="px-3 pt-2 text-[11px] uppercase tracking-wider text-muted">allowed hosts</p>
        <ul aria-label="Allowed hosts">
          {state.scope.hosts.map((h) => (
            <Entry key={h} value={h} label="host" onRemove={() => dispatch({ type: "removeHost", value: h })} />
          ))}
          {state.scope.hosts.length === 0 && <li className="px-3 py-1 text-[12px] text-muted">none: every http_get is blocked</li>}
        </ul>
        <p className="px-3 pt-2 text-[11px] uppercase tracking-wider text-muted">allowed paths</p>
        <ul aria-label="Allowed paths">
          {state.scope.paths.map((p) => (
            <Entry key={p} value={p} label="path" onRemove={() => dispatch({ type: "removePath", value: p })} />
          ))}
          {state.scope.paths.length === 0 && <li className="px-3 py-1 text-[12px] text-muted">none: every file call is blocked</li>}
        </ul>

        <form
          className="flex flex-col gap-1.5 px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            // Enter adds whichever kind the value looks like.
            const v = value.trim();
            const isPath = v.startsWith(".") || v.startsWith("/") || v.startsWith("~");
            dispatch({ type: isPath ? "addPath" : "addHost", value });
          }}
        >
          <label htmlFor="gravel-scope-input" className="text-[11px] uppercase tracking-wider text-muted">
            edit scope
          </label>
          <input
            id="gravel-scope-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="prod.example.test  or  ./data/"
            className="min-w-0 rounded border border-line bg-bg px-2 py-1.5 text-[13px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            <button type="submit" className="min-h-8 rounded border border-accent/50 bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent hover:bg-accent/20">
              Add host
            </button>
            <button type="button" onClick={() => dispatch({ type: "addPath", value })} className="min-h-8 rounded border border-line px-2.5 py-1 text-[12px] hover:border-accent/60">
              Add path
            </button>
            <button type="button" onClick={() => setValue("prod.example.test")} className="min-h-8 rounded border border-dashed border-line px-2.5 py-1 text-[12px] text-muted hover:text-fg">
              try prod.example.test
            </button>
          </div>
          <p role="status" className="min-h-4 text-[12px]" style={{ color: msg?.tone === "err" ? RED : "var(--color-accent)" }}>
            {msg?.text}
          </p>
        </form>

        <p className="px-3 pt-1 text-[11px] uppercase tracking-wider text-muted">standing grants</p>
        <ul aria-label="Standing grants" className="pb-2">
          {state.grants.map((g) => (
            <li key={g.id} className="flex items-center gap-2 px-3 py-1 text-[12px]">
              <span className="text-[#f5c542]">{g.id}</span>
              <code className="min-w-0 flex-1 break-all text-fg">{g.label}</code>
              <button type="button" aria-label={`Revoke grant ${g.id}`} onClick={() => dispatch({ type: "revokeGrant", id: g.id })} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:text-[#ff6b6b]">
                revoke
              </button>
            </li>
          ))}
          {state.grants.length === 0 && <li className="px-3 py-1 text-[12px] text-muted">none. Use &ldquo;Always for this scope&rdquo; on a read.</li>}
        </ul>
      </div>
    </Pane>
  );
}
