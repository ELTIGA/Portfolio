"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { capacityOf, fmtTime, planRoute, vehicleStops } from "./calc";
import { RouteMap, type MapVehicle } from "./RouteMap";
import type { Store } from "./store";
import type { Stop } from "./types";
import { Btn, Card, Chip, Icon, InfoTip, cx, labelCls } from "./ui";

const paxText = (s: { adults: number; children: number; infants: number }) =>
  `${s.adults + s.children} pax${s.infants ? ` + ${s.infants} infant${s.infants > 1 ? "s" : ""}` : ""}`;

function CapacityBar({ label, seats, effective, infants, color }: { label: string; seats: number; effective: number; infants: number; color: string }) {
  const over = effective > seats;
  const fill = Math.min(1, effective / seats) * 100;
  const ghost = over ? 0 : Math.min((infants / seats) * 100, 100 - fill);
  const text = `${effective} of ${seats} seats used${infants ? `, ${infants} infant${infants > 1 ? "s" : ""} not counted` : ""}${over ? `, over by ${effective - seats}` : ""}`;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums">
          <span className={cx(over && "text-(--v-bad)")}>{effective}</span> / {seats} seats
        </span>
        <span className="flex items-center gap-1 text-(--v-muted)">
          {infants > 0 ? `+${infants} infant${infants > 1 ? "s" : ""} (not counted)` : "No infants"}
          <InfoTip label="Why are infants not counted?">
            Infants travel on a lap and do not take a seat, so they are shown but excluded from effective capacity. Effective capacity = adults + children.
          </InfoTip>
        </span>
      </div>
      <div
        role="meter"
        aria-label={`${label} effective capacity`}
        aria-valuemin={0}
        aria-valuemax={seats}
        aria-valuenow={Math.min(effective, seats)}
        aria-valuetext={text}
        className="mt-1 flex h-3 overflow-hidden rounded-full border border-(--v-line) bg-(--v-soft)"
      >
        <div className="h-full motion-safe:transition-[width] motion-safe:duration-200" style={{ width: `${fill}%`, background: over ? "#A61B1B" : color }} />
        {ghost > 0 && <div className="viya-hatch h-full border-l border-white motion-safe:transition-[width] motion-safe:duration-200" style={{ width: `${ghost}%` }} />}
      </div>
      {over && (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-(--v-bad)">
          <Icon name="alert" size={13} /> Over capacity by {effective - seats}. Move a stop to another vehicle.
        </p>
      )}
    </div>
  );
}

export function RoutesScreen({ store }: { store: Store }) {
  const { seed, state } = store;
  const [selected, setSelected] = useState(seed.vehicles[0].id);
  const [dragging, setDragging] = useState<{ id: string; vid: string } | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const pendingFocus = useRef<{ id: string; dir: "up" | "down" } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();

  const vehicles: MapVehicle[] = useMemo(
    () =>
      seed.vehicles.map((v, index) => {
        const stops = vehicleStops(v, state.routes[v.id], seed.stops);
        return { v, index, stops, plan: planRoute(v.depot, stops, seed.destination, seed.startMin) };
      }),
    [seed, state.routes],
  );

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || !root.current) return;
    pendingFocus.current = null;
    const q = (dir: string) => root.current?.querySelector<HTMLButtonElement>(`[data-move="${target.id}:${dir}"]`);
    const first = q(target.dir);
    const el = first && !first.disabled ? first : q(target.dir === "up" ? "down" : "up");
    el?.focus();
  });

  const summary = `Stylized route map. ${vehicles.map((x) => `${x.v.label}: ${x.stops.length} stops, arrives ${fmtTime(x.plan.arrive)}`).join(". ")}.`;
  const selVehicle = vehicles.find((x) => x.v.id === selected) ?? vehicles[0];
  const totalPax = vehicles.reduce((s, x) => s + capacityOf(x.stops).total, 0);

  const move = (vid: string, stop: Stop, from: number, delta: -1 | 1) => {
    pendingFocus.current = { id: stop.id, dir: delta < 0 ? "up" : "down" };
    store.moveStop(vid, from, from + delta);
  };

  return (
    <div ref={root} className="@container h-full overflow-auto">
      <div className="flex min-h-full flex-col gap-3 p-3 @2xl:p-4 @4xl:flex-row @4xl:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="text-base font-bold">Routes</h2>
            <p className="text-xs text-(--v-muted)">
              {seed.tour} · {seed.date} · {vehicles.length} vehicles · {totalPax} pax · departs {fmtTime(seed.startMin)}
            </p>
          </div>
          <RouteMap decor={seed.map} vehicles={vehicles} selected={selVehicle.v.id} dest={seed.destination} onSelect={setSelected} summary={summary} />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--v-muted)" aria-label="Map legend">
            {vehicles.map(({ v }) => (
              <li key={v.id} className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded-full" style={{ background: v.color }} aria-hidden="true" />
                {v.label}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded bg-(--v-fg) text-[9px] font-bold text-white" aria-hidden="true">
                D
              </span>
              Depot
            </li>
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 @4xl:w-[22rem] @4xl:shrink-0">
          {vehicles.map(({ v, stops, plan }) => {
            const open = v.id === selVehicle.v.id;
            const cap = capacityOf(stops);
            const panelId = `${uid}-${v.id}`;
            return (
              <Card key={v.id} className="overflow-hidden">
                <div style={open ? { boxShadow: `inset 3px 0 0 ${v.color}` } : undefined}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setSelected(v.id)}
                    className="flex w-full items-center gap-2.5 p-3 text-left"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: v.color }} aria-hidden="true">
                      {v.label.split(" ")[0][0]}
                      {v.label.split(" ")[1]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {v.label} <span className="font-normal text-(--v-muted)">· {v.model}</span>
                      </span>
                      <span className="block truncate text-xs text-(--v-muted)">
                        {v.driver.name} · {stops.length} stops · {Math.round(plan.minutes)} min · {plan.km.toFixed(1)} km
                      </span>
                    </span>
                    <span className="text-right text-xs">
                      <span className={labelCls}>Arrive</span>
                      <span className="block text-sm font-bold tabular-nums">{fmtTime(plan.arrive)}</span>
                    </span>
                  </button>
                  <div className="px-3 pb-3">
                    <CapacityBar label={v.label} seats={v.seats} effective={cap.effective} infants={cap.infants} color={v.color} />
                  </div>

                  {open && (
                    <div id={panelId} className="border-t border-(--v-line) bg-(--v-bg)/60 p-2.5">
                      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                        <p className={labelCls}>Stop order</p>
                        <Btn size="sm" onClick={() => store.optimize(v.id)}>
                          <Icon name="wand" size={13} /> Optimize order
                        </Btn>
                      </div>
                      <ol className="flex flex-col gap-1.5" aria-label={`${v.label} stops`}>
                        {stops.map((s, i) => (
                          <li
                            key={s.id}
                            draggable
                            onDragStart={(e) => {
                              setDragging({ id: s.id, vid: v.id });
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", s.id);
                            }}
                            onDragOver={(e) => {
                              if (dragging?.vid !== v.id) return;
                              e.preventDefault();
                              setOverIdx(i);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragging?.vid === v.id) {
                                const from = stops.findIndex((x) => x.id === dragging.id);
                                if (from >= 0) store.moveStop(v.id, from, i);
                              }
                              setDragging(null);
                              setOverIdx(null);
                            }}
                            onDragEnd={() => {
                              setDragging(null);
                              setOverIdx(null);
                            }}
                            className={cx(
                              "rounded-lg border bg-white p-2 motion-safe:transition-shadow",
                              dragging?.id === s.id ? "opacity-50" : "",
                              dragging?.vid === v.id && overIdx === i && dragging.id !== s.id ? "border-(--v-primary) shadow-[0_-3px_0_var(--v-primary)]" : "border-(--v-line)",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="cursor-grab text-(--v-muted)" title="Drag to reorder" aria-hidden="true">
                                <Icon name="grip" size={16} />
                              </span>
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: v.color }}>
                                {i + 1}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">{s.hotel}</span>
                                <span className="block truncate text-xs text-(--v-muted)">
                                  {s.lead} · {paxText(s)}
                                </span>
                              </span>
                              <span className="text-right">
                                <span className="block text-sm font-bold tabular-nums">{fmtTime(plan.etas[i])}</span>
                                <span className="block text-[10px] text-(--v-muted) uppercase">ETA</span>
                              </span>
                              <span className="flex flex-col gap-0.5">
                                <Btn
                                  size="sm"
                                  className="min-h-6! px-1.5!"
                                  data-move={`${s.id}:up`}
                                  disabled={i === 0}
                                  onClick={() => move(v.id, s, i, -1)}
                                  aria-label={`Move ${s.hotel} up, currently stop ${i + 1} of ${stops.length}`}
                                >
                                  <Icon name="up" size={14} />
                                </Btn>
                                <Btn
                                  size="sm"
                                  className="min-h-6! px-1.5!"
                                  data-move={`${s.id}:down`}
                                  disabled={i === stops.length - 1}
                                  onClick={() => move(v.id, s, i, 1)}
                                  aria-label={`Move ${s.hotel} down, currently stop ${i + 1} of ${stops.length}`}
                                >
                                  <Icon name="down" size={14} />
                                </Btn>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-(--v-muted)">
                              <label htmlFor={`${uid}-asg-${s.id}`}>Vehicle</label>
                              <select
                                id={`${uid}-asg-${s.id}`}
                                value={v.id}
                                onChange={(e) => store.assignStop(s.id, e.target.value)}
                                aria-label={`Assign ${s.hotel} to vehicle`}
                                className="h-7 rounded-md border border-(--v-line) bg-white px-1.5 text-xs text-(--v-fg)"
                              >
                                {seed.vehicles.map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </li>
                        ))}
                        {stops.length === 0 && <li className="rounded-lg border border-dashed border-(--v-line) p-3 text-center text-xs text-(--v-muted)">No stops assigned.</li>}
                      </ol>
                      <p className="mt-2 flex items-center gap-1.5 px-0.5 text-xs text-(--v-muted)">
                        <Chip tone="neutral">Drop-off</Chip> {seed.destination.name} at <strong className="tabular-nums text-(--v-fg)">{fmtTime(plan.arrive)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
