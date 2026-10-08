"use client";

import { memo, type Dispatch } from "react";
import type { Action, Call, CallStatus, State } from "./engine";
import { useStickToBottom } from "./hooks";
import { AMBER, Badge, KeyButton, Pane, RED } from "./ui";

const STATUS: Record<CallStatus, { label: string; color: string }> = {
  blocked: { label: "blocked", color: RED },
  awaiting: { label: "awaiting operator", color: AMBER },
  executed: { label: "executed", color: "#3ddc97" },
  denied: { label: "denied", color: "#ff9f6b" },
  rejected: { label: "rejected", color: RED },
};

const CallRow = memo(function CallRow({ c }: { c: Call }) {
  const st = STATUS[c.status];
  return (
    <li className={`border-b border-line/60 px-3 py-2 ${c.status === "blocked" || c.status === "rejected" ? "bg-[#ff6b6b]/5" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] text-muted">#{String(c.id).padStart(3, "0")}</span>
        <code className="min-w-0 break-all text-[13px] text-fg">
          <span className="text-[#6cb6ff]">{c.tool}</span> {c.arg}
        </code>
        <span className="ml-auto">
          <Badge color={st.color}>{st.label}</Badge>
        </span>
      </div>
      <p className="mt-0.5 text-[11px] italic text-muted">agent: {c.note}</p>
      {c.status === "blocked" && (
        <p className="mt-0.5 text-[12px]" style={{ color: RED }}>
          ✖ {c.reason} <span className="text-muted">· rule {c.rule}</span>
        </p>
      )}
      {c.status === "executed" && (
        <p className="mt-0.5 text-[12px] text-muted">
          ✔ approved via {c.via} · <span className="text-fg/80">{c.result}</span>
        </p>
      )}
      {(c.status === "denied" || c.status === "rejected") && (
        <p className="mt-0.5 text-[12px] text-muted">
          {c.status === "denied" ? "✖ denied by" : "✖ rejected by"} {c.via} · rule {c.rule}
        </p>
      )}
    </li>
  );
});

export function TimelinePane({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const count = state.calls.length;
  const lastStatus = state.calls[count - 1]?.status;
  const ref = useStickToBottom<HTMLDivElement>(`${count}:${lastStatus}`);

  const blockedByStop = state.estop;
  const stateLabel = blockedByStop ? "frozen" : state.pendingId !== null ? "waiting for operator" : state.agentRunning ? "running" : "paused";
  return (
    <Pane
      id="gravel-timeline"
      title="Agent timeline"
      right={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted">
            agent: <span className={blockedByStop ? "text-[#ff6b6b]" : state.agentRunning ? "text-accent" : "text-[#f5c542]"}>{stateLabel}</span>
          </span>
          <KeyButton k="g" disabled={blockedByStop} onClick={() => dispatch({ type: "toggleAgent" })} aria-pressed={!state.agentRunning}>
            {state.agentRunning ? "Pause agent" : "Run agent"}
          </KeyButton>
          <KeyButton k="n" disabled={blockedByStop || state.pendingId !== null} onClick={() => dispatch({ type: "step" })}>
            Next call
          </KeyButton>
        </div>
      }
    >
      <div ref={ref} className="max-h-80 min-h-40 flex-1 overflow-auto">
        {count === 0 ? (
          <p className="p-3 text-[12px] text-muted">The agent is about to propose its first tool call…</p>
        ) : (
          <ol aria-label="Tool calls proposed by the agent">
            {state.calls.map((c) => (
              <CallRow key={c.id} c={c} />
            ))}
          </ol>
        )}
      </div>
    </Pane>
  );
}
