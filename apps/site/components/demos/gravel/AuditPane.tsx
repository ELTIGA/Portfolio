"use client";

import { useEffect, useRef } from "react";
import type { AuditEntry, Decision } from "./engine";
import { AMBER, Badge, Pane, RED } from "./ui";

const COLOR: Record<Decision, string> = {
  SESSION: "#93a1ae",
  SCOPE: "#6cb6ff",
  BLOCK: RED,
  HOLD: AMBER,
  APPROVE: "#3ddc97",
  AUTO: "#3ddc97",
  DENY: "#ff9f6b",
  EXEC: "#d2a8ff",
  REJECT: RED,
  ESTOP: RED,
  RESUME: "#3ddc97",
  GRANT: AMBER,
};

export function AuditPane({ audit, wide }: { audit: AuditEntry[]; wide: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = audit.length;
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [n]);
  const last = audit[n - 1];
  return (
    <Pane id="gravel-audit" title="Audit log" right={<span className="text-[11px] text-muted">append-only · {n} entries · chain {last?.hash.slice(0, 6)}</span>}>
      <div ref={ref} role="log" aria-label="Audit log" className="max-h-60 min-h-32 flex-1 overflow-auto text-[12px]">
        {audit.map((e) =>
          wide ? (
            <div key={e.seq} className="grid grid-cols-[3rem_4.25rem_5.5rem_8rem_10rem_minmax(0,1fr)_3.5rem] items-baseline gap-x-2 border-b border-line/40 px-3 py-1">
              <span className="text-muted">#{String(e.seq).padStart(4, "0")}</span>
              <span className="text-muted">{e.time}</span>
              <Badge color={COLOR[e.decision]}>{e.decision}</Badge>
              <span className="truncate text-fg">{e.actor}</span>
              <span className="truncate text-muted">{e.rule}</span>
              <span className="break-words text-fg/90">{e.detail}</span>
              <span className="text-right text-muted/70">{e.hash.slice(0, 6)}</span>
            </div>
          ) : (
            <div key={e.seq} className="border-b border-line/40 px-3 py-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-muted">#{String(e.seq).padStart(4, "0")}</span>
                <span className="text-muted">{e.time}</span>
                <Badge color={COLOR[e.decision]}>{e.decision}</Badge>
                <span className="text-fg">{e.actor}</span>
              </div>
              <div className="text-muted">
                {e.rule} <span className="text-fg/90">· {e.detail}</span>
              </div>
            </div>
          ),
        )}
      </div>
    </Pane>
  );
}
