"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Driver, DriverBatch } from "./data";
import { batchOk, batchSum, sumPax } from "./logic";
import type { PushToast } from "./hooks";
import { Chip, Icon, NumField } from "./ui";

type Props = {
  drivers: Driver[];
  setDrivers: Dispatch<SetStateAction<Driver[]>>;
  open: Set<string>;
  setOpen: Dispatch<SetStateAction<Set<string>>>;
  push: PushToast;
  compact: boolean;
};

export function DriversScreen({ drivers, setDrivers, open, setOpen, push, compact }: Props) {

  const allBatches = drivers.flatMap((d) => d.batches);
  const mismatches = allBatches.filter((b) => !batchOk(b)).length;
  const grand = sumPax(allBatches.flatMap((b) => b.entries));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patchBatch = (driverId: string, batchId: string, fn: (b: DriverBatch) => DriverBatch) =>
    setDrivers((list) => list.map((d) => (d.id === driverId ? { ...d, batches: d.batches.map((b) => (b.id === batchId ? fn(b) : b)) } : d)));

  const exportXlsx = () => {
    if (mismatches > 0) {
      push(`Export preview: drivers-list.xlsx would be written with ${mismatches} unresolved ${mismatches === 1 ? "mismatch" : "mismatches"} flagged. No file is generated in this demo.`, { tone: "warn", ttl: 7000 });
    } else {
      push("Export preview: drivers-list.xlsx with per-driver subtotals and a grand total. No file is generated in this demo.", { tone: "ok", ttl: 7000 });
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="eo-eyebrow">Driver&apos;s List</p>
          <h1 className="text-[17px] font-semibold leading-tight">Shift screenshots by driver</h1>
          <p className="eo-muted mt-0.5 text-[12.5px]">Each batch is cross-checked against the total printed in its footer.</p>
        </div>
        <button type="button" className="eo-btn primary" onClick={exportXlsx}>
          <Icon name="download" size={14} />
          Export XLSX
        </button>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip tone="neutral" dot={false}>
          {drivers.length} drivers
        </Chip>
        <Chip tone="neutral" dot={false}>
          {allBatches.length} batches
        </Chip>
        {mismatches > 0 ? (
          <Chip tone="warn">
            {mismatches} {mismatches === 1 ? "batch needs" : "batches need"} review
          </Chip>
        ) : (
          <Chip tone="ok">All batches reconcile</Chip>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {drivers.map((d) => {
          const subtotal = sumPax(d.batches.flatMap((b) => b.entries));
          return (
            <section key={d.id} className="eo-card overflow-hidden" aria-label={`${d.name}, driver`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0">
                  <h2 className="text-[13.5px] font-semibold">{d.name}</h2>
                  <p className="eo-muted text-[12px]">
                    {d.vehicle}, {d.batches.length} {d.batches.length === 1 ? "batch" : "batches"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="eo-th">Subtotal</p>
                  <p className="mono text-[18px] font-semibold leading-tight">{subtotal}</p>
                </div>
              </div>

              <ul>
                {d.batches.map((b) => {
                  const ok = batchOk(b);
                  const isOpen = open.has(b.id);
                  const sum = batchSum(b);
                  return (
                    <li key={b.id} className="border-b last:border-b-0" style={{ borderColor: "var(--line)", background: ok ? undefined : "var(--warn-soft)" }}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`panel-${b.id}`}
                        onClick={() => toggle(b.id)}
                        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left"
                        style={{ background: "transparent", border: 0, cursor: "pointer", minHeight: 44 }}
                      >
                        <span className="inline-flex transition-transform" style={{ transform: isOpen ? "rotate(90deg)" : undefined, color: "var(--muted)" }}>
                          <Icon name="chevron" size={14} />
                        </span>
                        <span className="min-w-0 flex-1 basis-40">
                          <span className="block text-[13px] font-medium">{b.shift}</span>
                          <span className="eo-muted block text-[12px]">
                            {b.screenshots} {b.screenshots === 1 ? "screenshot" : "screenshots"}, {b.entries.length} entries
                          </span>
                        </span>
                        <span className="mono text-[12.5px]">
                          <span className="eo-muted">extracted </span>
                          {sum}
                          <span className="eo-muted"> / footer </span>
                          {b.footerTotal}
                        </span>
                        {ok ? <Chip tone="ok">Matches footer</Chip> : <Chip tone="warn">Off by {Math.abs(sum - b.footerTotal)}</Chip>}
                      </button>

                      {isOpen && (
                        <div id={`panel-${b.id}`} className="px-3 pb-3">
                          <div className="flex flex-col">
                            {b.entries.map((en, i) => (
                              <div
                                key={en.id}
                                className="grid items-center gap-2 border-t py-1.5"
                                style={{ borderColor: "var(--line)", gridTemplateColumns: compact ? "minmax(0,1fr) 64px" : "minmax(0,1.2fr) minmax(0,1.2fr) 64px" }}
                              >
                                <span className="min-w-0 truncate text-[13px]">
                                  {en.guest}
                                  {compact && <span className="eo-muted block truncate text-[12px]">{en.pickup}</span>}
                                </span>
                                {!compact && <span className="eo-muted min-w-0 truncate text-[12.5px]">{en.pickup}</span>}
                                <NumField
                                  value={en.pax}
                                  label={`Passengers for ${en.guest}`}
                                  onChange={(v) =>
                                    patchBatch(d.id, b.id, (batch) => ({ ...batch, entries: batch.entries.map((x, j) => (j === i ? { ...x, pax: v ?? 0 } : x)) }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
                            <label className="flex items-center gap-2 text-[12.5px]">
                              <span className="eo-muted">Footer total</span>
                              <span style={{ width: 64 }}>
                                <NumField
                                  value={b.footerTotal}
                                  label={`Footer total for ${d.name}, ${b.shift}`}
                                  invalid={!ok}
                                  onChange={(v) => patchBatch(d.id, b.id, (batch) => ({ ...batch, footerTotal: v ?? 0 }))}
                                />
                              </span>
                            </label>
                            <p role="status" className="flex items-center gap-1.5 text-[12.5px]" style={{ color: ok ? "var(--ok)" : "var(--warn)" }}>
                              <Icon name={ok ? "check" : "alert"} size={14} />
                              {ok ? "Batch matches its footer." : `Entries sum to ${sum}, footer prints ${b.footerTotal}.`}
                            </p>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <div className="eo-card flex items-center justify-between gap-3 px-3 py-3" style={{ borderColor: "var(--line2)" }}>
          <div>
            <p className="eo-th">Grand total</p>
            <p className="eo-muted text-[12px]">All drivers, all shifts</p>
          </div>
          <p className="mono text-[24px] font-semibold leading-none" aria-label={`Grand total ${grand} passengers`}>
            {grand}
          </p>
        </div>
      </div>
    </div>
  );
}
