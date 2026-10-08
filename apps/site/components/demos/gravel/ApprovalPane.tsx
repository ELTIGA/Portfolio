"use client";

import type { Dispatch } from "react";
import { APPROVAL_SECONDS, validate, type Action, type State } from "./engine";
import { AMBER, KeyButton, Pane, RED } from "./ui";

export function ApprovalPane({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const call = state.pendingId !== null ? state.calls.find((c) => c.id === state.pendingId) : undefined;
  const check = call ? validate(state.scope, call.tool, call.arg) : null;
  const isWrite = call?.tool === "write_file";

  return (
    <Pane id="gravel-approval" title="Approval prompt" right={call ? <span className="text-[11px]" style={{ color: AMBER }}>decision required</span> : undefined}>
      {state.estop ? (
        <p className="p-3 text-[12px]" style={{ color: RED }}>
          Emergency stop is engaged. No requests can be approved until the operator resumes.
        </p>
      ) : !call || !check ? (
        <p className="p-3 text-[12px] text-muted">
          {state.agentRunning ? "No request is waiting. In-scope calls will appear here for your decision; out-of-scope calls are blocked before they reach you." : "Agent is paused."}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 p-3">
          <div>
            <code className="break-all text-[13px] text-fg">
              <span className="text-[#6cb6ff]">{call.tool}</span> {call.arg}
            </code>
            <p className="mt-0.5 text-[11px] italic text-muted">agent: {call.note}</p>
          </div>
          <ul className="space-y-0.5 text-[12px]">
            <li className="text-accent">✔ {check.reason}</li>
            <li className="text-muted">
              rule <span className="text-fg">{call.rule}</span>
              {isWrite ? ": writes always need a human, so no standing grant is allowed" : ""}
            </li>
          </ul>
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>auto-deny if no decision (fail closed)</span>
              <span>{Math.ceil(state.pendingLeft)}s</span>
            </div>
            <div
              role="progressbar"
              aria-label="Time left to decide"
              aria-valuemin={0}
              aria-valuemax={APPROVAL_SECONDS}
              aria-valuenow={Math.ceil(state.pendingLeft)}
              className="h-1.5 overflow-hidden rounded-sm bg-line"
            >
              <div className="h-full bg-[#f5c542] transition-[width] duration-300 ease-linear" style={{ width: `${(state.pendingLeft / APPROVAL_SECONDS) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <KeyButton k="a" tone="accent" onClick={() => dispatch({ type: "approve" })}>
              Approve
            </KeyButton>
            <KeyButton k="d" tone="danger" onClick={() => dispatch({ type: "deny" })}>
              Deny
            </KeyButton>
            <KeyButton k="e" disabled={isWrite} title={isWrite ? "write_file cannot be approved for the whole scope" : "Approve this and future matching calls"} onClick={() => dispatch({ type: "approve", always: true })}>
              Always for this scope
            </KeyButton>
          </div>
        </div>
      )}
    </Pane>
  );
}
