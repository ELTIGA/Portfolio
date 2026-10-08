"use client";

import type { Dispatch, SetStateAction } from "react";
import { customerListsSeed } from "./data";
import type { Role } from "./data";
import { Chip, Icon } from "./ui";

type Props = { role: Role; boarded: Set<string>; setBoarded: Dispatch<SetStateAction<Set<string>>> };

export function CustomersScreen({ role, boarded, setBoarded }: Props) {
  const toggle = (id: string) =>
    setBoarded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const guide = role === "guide";

  return (
    <div className="p-3 sm:p-4">
      <header className="mb-3">
        <p className="eo-eyebrow">Customer Lists</p>
        <h1 className="text-[17px] font-semibold leading-tight">{guide ? "Your lists for today" : "Lists shared with guides"}</h1>
        <p className="eo-muted mt-0.5 text-[12.5px]">Who is on each vehicle and where to collect them. Tap a guest to mark them on board.</p>
      </header>

      {guide && (
        <div className="eo-card mb-3 flex items-start gap-2 p-3 text-[12.5px]" style={{ borderColor: "var(--info-line)", background: "var(--info-soft)" }}>
          <span style={{ color: "var(--info)" }} className="mt-0.5">
            <Icon name="customers" size={15} />
          </span>
          <p>
            Signed in as a <strong>Guide</strong>. Manifest, Driver&apos;s List and Double bookings are hidden for this role; Customer Lists is the only section available.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {customerListsSeed.map((l) => {
          const total = l.guests.reduce((n, g) => n + g.pax, 0);
          const count = l.guests.filter((g) => boarded.has(g.id)).reduce((n, g) => n + g.pax, 0);
          return (
            <section key={l.id} className="eo-card overflow-hidden" aria-label={`${l.vehicle} at ${l.departure}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
                <div>
                  <h2 className="text-[13.5px] font-semibold">
                    {l.vehicle}, {l.departure}
                  </h2>
                  <p className="eo-muted text-[12px]">{l.service}</p>
                </div>
                <Chip tone={count === total ? "ok" : "neutral"}>
                  {count} of {total} on board
                </Chip>
              </div>
              <ul>
                {l.guests.map((g) => {
                  const on = boarded.has(g.id);
                  return (
                    <li key={g.id} className="border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggle(g.id)}
                        className="flex w-full items-center gap-3 px-3 text-left"
                        style={{ background: on ? "var(--ok-soft)" : "transparent", border: 0, cursor: "pointer", minHeight: guide ? 56 : 48, paddingBlock: 8 }}
                      >
                        <span
                          className="grid shrink-0 place-items-center rounded-md border"
                          style={{ width: 22, height: 22, borderColor: on ? "var(--ok)" : "var(--line2)", color: "var(--ok)" }}
                          aria-hidden="true"
                        >
                          {on && <Icon name="check" size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-medium">{g.name}</span>
                          <span className="eo-muted block text-[12.5px]">
                            {g.hotel}
                            {g.note ? `. ${g.note}` : ""}
                          </span>
                        </span>
                        <span className="mono text-[13px]">{g.pax} pax</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
