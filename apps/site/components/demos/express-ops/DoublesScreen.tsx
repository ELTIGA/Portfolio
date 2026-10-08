"use client";

import { useState } from "react";
import type { Booking, DoubleBooking, Severity } from "./data";
import { doublesSeed } from "./data";
import type { PushToast } from "./hooks";
import { Chip, Icon } from "./ui";

const SEV_TONE: Record<Severity, "bad" | "warn" | "info"> = { high: "bad", medium: "warn", low: "info" };
const SEV_LABEL: Record<Severity, string> = { high: "High", medium: "Medium", low: "Low" };
const FILTERS: Array<Severity | "all"> = ["all", "high", "medium", "low"];

export function DoublesScreen({ push, compact }: { push: PushToast; compact: boolean }) {
  const [openId, setOpenId] = useState<string | null>("db1");
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Severity | "all">("all");

  const items = [...doublesSeed]
    .filter((d) => filter === "all" || d.severity === filter)
    .sort((a, b) => Number(resolved.has(a.id)) - Number(resolved.has(b.id)) || b.score - a.score);
  const openCount = doublesSeed.filter((d) => !resolved.has(d.id)).length;

  const setDone = (d: DoubleBooking, done: boolean, label = d.resolveLabel) => {
    setResolved((prev) => {
      const next = new Set(prev);
      if (done) next.add(d.id);
      else next.delete(d.id);
      return next;
    });
    if (done) {
      push(`${d.title}: ${label.toLowerCase()} recorded.`, { tone: "ok", action: { label: "Undo", run: () => setDone(d, false) } });
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <header className="mb-3">
        <p className="eo-eyebrow">Double bookings</p>
        <h1 className="text-[17px] font-semibold leading-tight">Conflicts ranked by severity</h1>
        <p className="eo-muted mt-0.5 text-[12.5px]">
          {openCount} open of {doublesSeed.length}. Same guest booked more than once, plus data-quality anomalies.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by severity">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="eo-btn" aria-pressed={filter === f} onClick={() => setFilter(f)} style={filter === f ? { background: "var(--fg)", color: "#17140f", borderColor: "var(--fg)" } : undefined}>
            {f === "all" ? "All" : SEV_LABEL[f]}
          </button>
        ))}
      </div>

      <ol className="flex flex-col gap-2">
        {items.map((d, idx) => {
          const isOpen = openId === d.id;
          const done = resolved.has(d.id);
          return (
            <li key={d.id} className="eo-card overflow-hidden" style={done ? { opacity: 0.7 } : undefined}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`db-${d.id}`}
                onClick={() => setOpenId(isOpen ? null : d.id)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left"
                style={{ background: "transparent", border: 0, cursor: "pointer", minHeight: 44 }}
              >
                <span className="mono eo-muted mt-0.5 w-5 shrink-0 text-right text-[12px]" aria-hidden="true">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[13.5px] font-semibold">{d.title}</span>
                    {done ? <Chip tone="ok">Resolved</Chip> : <Chip tone={SEV_TONE[d.severity]}>{SEV_LABEL[d.severity]}</Chip>}
                    <span className="eo-muted text-[12px]">{d.kind}</span>
                  </span>
                  <span className="eo-muted mt-1 block text-[12.5px]">{d.summary}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="mono text-[12px]" title="Severity score">
                    {d.score}
                  </span>
                  <span className="inline-flex transition-transform" style={{ transform: isOpen ? "rotate(90deg)" : undefined, color: "var(--muted)" }}>
                    <Icon name="chevron" size={14} />
                  </span>
                </span>
              </button>

              {isOpen && (
                <div id={`db-${d.id}`} className="border-t px-3 pb-3 pt-3" style={{ borderColor: "var(--line)" }}>
                  <div className="grid gap-2" style={{ gridTemplateColumns: compact || d.bookings.length === 1 ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))" }}>
                    {d.bookings.map((b, i) => (
                      <BookingCard key={`${b.ref}-${i}`} b={b} label={d.bookings.length > 1 ? `Booking ${String.fromCharCode(65 + i)}` : "Booking"} others={d.bookings.filter((_, j) => j !== i)} />
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "#6d531c", background: "var(--brand-soft)" }}>
                    <p className="eo-eyebrow mb-1">Suggested action</p>
                    <p className="text-[12.5px]">{d.action}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {done ? (
                        <button type="button" className="eo-btn" onClick={() => setDone(d, false)}>
                          <Icon name="undo" size={14} />
                          Reopen
                        </button>
                      ) : (
                        <>
                          <button type="button" className="eo-btn primary" onClick={() => setDone(d, true)}>
                            <Icon name="check" size={14} />
                            {d.resolveLabel}
                          </button>
                          {d.resolveLabel !== "Dismiss" && (
                            <button
                              type="button"
                              className="eo-btn quiet"
                              onClick={() => setDone(d, true, "Dismiss")}
                            >
                              Dismiss
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {items.length === 0 && <li className="eo-muted p-3 text-[12.5px]">No conflicts at this severity.</li>}
      </ol>
    </div>
  );
}

function BookingCard({ b, label, others }: { b: Booking; label: string; others: Booking[] }) {
  // Highlight fields that differ from the other booking so the conflict is visible at a glance.
  const diff = (key: keyof Booking) => others.some((o) => o[key] !== b[key]);
  const fields: Array<[string, string, keyof Booking]> = [
    ["Agency", b.agency, "agency"],
    ["Reference", b.ref, "ref"],
    ["Date", `${b.date}, ${b.time}`, "date"],
    ["Service", b.service, "service"],
    ["Hotel", b.hotel || "Missing", "hotel"],
    ["Passengers", String(b.pax), "pax"],
  ];
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--line2)", background: "var(--bg)" }}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="eo-th">{label}</p>
        {b.flag && <Chip tone="warn">{b.flag}</Chip>}
      </div>
      <p className="mb-2 text-[13px] font-semibold">{b.guest}</p>
      <dl className="grid gap-y-1" style={{ gridTemplateColumns: "88px minmax(0,1fr)" }}>
        {fields.map(([k, v, key]) => {
          const differs = (diff(key) && !(key === "ref" && !b.flag)) || (key === "hotel" && !b.hotel) || (key === "pax" && b.pax === 0);
          return (
            <div key={k} className="contents">
              <dt className="eo-muted text-[12px]">{k}</dt>
              <dd className="mono min-w-0 break-words text-[12.5px]" style={differs ? { color: "var(--warn)", fontWeight: 600 } : undefined}>
                {v}
                {differs && <span className="sr-only"> (differs)</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
