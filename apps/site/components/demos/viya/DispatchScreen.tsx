"use client";

import { useId, useMemo, useState } from "react";
import { capacityOf, fmtTime, planRoute, vehicleStops } from "./calc";
import type { Store } from "./store";
import type { Channel, DispatchStatus, DriverRun, TenantSeed, VehicleSeed } from "./types";
import { Btn, Card, Chip, Icon, cx, labelCls, type Tone } from "./ui";

const CHANNELS: { id: Channel; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: "Production dispatch with inbound status parsing" },
  { id: "telegram", label: "Telegram", hint: "Bot message with the same reply codes" },
  { id: "slack", label: "Slack", hint: "Driver DM with interactive buttons" },
];

const STEPS: DispatchStatus[] = ["queued", "sent", "delivered"];
const STATUS_TONE: Record<DispatchStatus, Tone> = { idle: "neutral", queued: "neutral", sent: "primary", delivered: "ok" };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

interface Built {
  greeting: string;
  meta: string;
  rows: { n: number; time: string; hotel: string; pax: string }[];
  dropoff: string;
}

function build(seed: TenantSeed, v: VehicleSeed, order: string[]): Built {
  const stops = vehicleStops(v, order, seed.stops);
  const plan = planRoute(v.depot, stops, seed.destination, seed.startMin);
  return {
    greeting: `Hi ${v.driver.name.split(" ")[0]}, your route for ${seed.tour} (${seed.date}).`,
    meta: `${v.label} · ${v.model} · leave ${v.depot.name} at ${fmtTime(seed.startMin)}`,
    rows: stops.map((s, i) => ({
      n: i + 1,
      time: fmtTime(plan.etas[i]),
      hotel: s.hotel,
      pax: `${s.adults + s.children} pax${s.infants ? ` +${s.infants} inf` : ""} (${s.lead})`,
    })),
    dropoff: `Drop-off: ${seed.destination.name} by ${fmtTime(plan.arrive)}`,
  };
}

function Preview({ channel, msg, vehicle, canReply, onQuick }: { channel: Channel; msg: Built; vehicle: VehicleSeed; canReply: boolean; onQuick: (text: string) => void }) {
  const handle = channel === "whatsapp" ? vehicle.driver.whatsapp : channel === "telegram" ? vehicle.driver.telegram : vehicle.driver.slack;
  const body = (
    <>
      <p className="font-semibold">{msg.greeting}</p>
      <p className="text-(--v-muted)">{msg.meta}</p>
      <ol className="mt-2 space-y-1">
        {msg.rows.map((r) => (
          <li key={r.n} className="flex gap-2">
            <span className="w-4 shrink-0 text-right font-semibold tabular-nums">{r.n}</span>
            <span className="min-w-0">
              <span className="font-semibold tabular-nums">{r.time}</span> {r.hotel}
              <span className="block text-xs text-(--v-muted)">{r.pax}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 font-semibold">{msg.dropoff}</p>
    </>
  );
  const reply = (
    <p className="mt-2 border-t border-black/10 pt-2 text-xs">
      Reply <code className="rounded bg-black/5 px-1 font-mono">1</code> confirm · <code className="rounded bg-black/5 px-1 font-mono">2</code> issue · <code className="rounded bg-black/5 px-1 font-mono">3 N</code> no-show of N pax
    </p>
  );

  if (channel === "slack") {
    return (
      <div className="rounded-xl border border-(--v-line) bg-white p-3 text-[13px] leading-snug">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-(--v-primary) text-xs font-bold text-white" aria-hidden="true">
            V
          </span>
          <span className="text-xs">
            <strong>Viya</strong> <span className="rounded bg-(--v-soft) px-1 text-[10px] font-semibold">APP</span>
            <span className="block text-(--v-muted)">DM to {handle}</span>
          </span>
        </div>
        <div className="border-l-4 border-(--v-primary) pl-3">{body}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn size="sm" variant="primary" disabled={!canReply} onClick={() => onQuick("1")}>
            Confirm
          </Btn>
          <Btn size="sm" disabled={!canReply} onClick={() => onQuick("2")}>
            Issue
          </Btn>
          <Btn size="sm" disabled={!canReply} onClick={() => onQuick("3 1")}>
            No-show (1)
          </Btn>
        </div>
        <p className="mt-1.5 text-xs text-(--v-muted)">Buttons activate once the message is delivered. Typed replies like 1, 2 or 3 N also work.</p>
      </div>
    );
  }
  const wa = channel === "whatsapp";
  return (
    <div className="rounded-xl p-3" style={{ background: wa ? "#EFE9DF" : "#D6E3EE" }}>
      <p className="mb-2 text-center text-[11px] font-semibold text-(--v-muted)">
        {wa ? "WhatsApp" : "Telegram"} · {handle}
      </p>
      <div className="max-w-[92%] rounded-xl rounded-tl-sm p-3 text-[13px] leading-snug text-(--v-fg) shadow-sm" style={{ background: wa ? "#DDF3CF" : "#FFFFFF" }}>
        {body}
        {reply}
      </div>
    </div>
  );
}

function Stepper({ run }: { run: DriverRun }) {
  const reached = STEPS.indexOf(run.status);
  return (
    <ol className="flex items-center gap-1.5" aria-label="Delivery progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5">
          <span
            className={cx(
              "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
              i <= reached ? (s === "delivered" ? "bg-(--v-ok) text-white" : "bg-(--v-primary) text-white") : "bg-(--v-soft) text-(--v-muted)",
            )}
          >
            {cap(s)}
          </span>
          {i < STEPS.length - 1 && <span className={cx("h-0.5 w-3 rounded", i < reached ? "bg-(--v-primary)" : "bg-(--v-line)")} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export function DispatchScreen({ store }: { store: Store }) {
  const { seed, state } = store;
  const d = state.dispatch;
  const uid = useId();
  const [previewId, setPreviewId] = useState(seed.vehicles[0].id);
  const [replyVid, setReplyVid] = useState(seed.vehicles[0].id);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const vehicle = seed.vehicles.find((v) => v.id === previewId) ?? seed.vehicles[0];
  const msg = useMemo(() => build(seed, vehicle, state.routes[vehicle.id]), [seed, vehicle, state.routes]);
  const busy = Object.values(d.runs).some((r) => r.status === "queued" || r.status === "sent");
  const started = Object.values(d.runs).some((r) => r.status !== "idle");
  const delivered = Object.values(d.runs).filter((r) => r.status === "delivered").length;
  const replyRun = d.runs[replyVid];

  const send = (vid: string, raw: string) => {
    setFeedback(store.sendReply(vid, raw));
    setText("");
  };

  return (
    <div className="@container h-full overflow-auto">
      <div className="flex min-h-full flex-col gap-3 p-3 @2xl:p-4 @4xl:flex-row @4xl:gap-4">
        <div className="flex min-w-0 flex-col gap-3 @4xl:w-[24rem] @4xl:shrink-0">
          <div>
            <h2 className="text-base font-bold">Dispatch</h2>
            <p className="text-xs text-(--v-muted)">
              {seed.tour} · {seed.date} · {seed.vehicles.length} drivers
            </p>
          </div>

          <Card className="p-3">
            <fieldset>
              <legend className={labelCls}>Channel</legend>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-xl bg-(--v-soft) p-1">
                {CHANNELS.map((c) => (
                  <label key={c.id} className="relative">
                    <input
                      type="radio"
                      name={`${uid}-channel`}
                      value={c.id}
                      checked={d.channel === c.id}
                      disabled={busy}
                      onChange={() => store.setChannel(c.id)}
                      className="peer sr-only"
                    />
                    <span className="block cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-(--v-muted) peer-checked:bg-white peer-checked:text-(--v-fg) peer-checked:shadow-[0_1px_2px_rgba(34,51,74,.18)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--v-primary) peer-disabled:cursor-not-allowed peer-disabled:opacity-60">
                      {c.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-(--v-muted)">{CHANNELS.find((c) => c.id === d.channel)?.hint}.</p>
            </fieldset>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Btn variant="primary" onClick={store.dispatchAll} disabled={busy}>
                <Icon name="send" size={14} />
                {busy ? "Dispatching…" : started ? "Dispatch again" : "Dispatch"}
              </Btn>
              {started && !busy && (
                <Btn variant="ghost" onClick={store.resetDispatch}>
                  Reset
                </Btn>
              )}
              <span className="text-xs text-(--v-muted) tabular-nums">{delivered}/{seed.vehicles.length} delivered</span>
            </div>
          </Card>

          <Card className="divide-y divide-(--v-line)">
            {seed.vehicles.map((v) => {
              const run = d.runs[v.id];
              const pax = capacityOf(vehicleStops(v, state.routes[v.id], seed.stops)).total;
              const r = run.reply;
              return (
                <div key={v.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-baseline" style={{ background: v.color }} aria-hidden="true" />
                        {v.driver.name}
                      </p>
                      <p className="truncate text-xs text-(--v-muted)">
                        {v.label} · {pax - (r?.kind === "no_show" ? (r.n ?? 0) : 0)} pax{r?.kind === "no_show" ? ` (was ${pax})` : ""}
                      </p>
                    </div>
                    <span aria-live="off">
                      <Chip tone={STATUS_TONE[run.status]}>{run.status === "idle" ? "Not dispatched" : cap(run.status)}</Chip>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {run.status !== "idle" && <Stepper run={run} />}
                    {r && (
                      <Chip tone={r.kind === "confirm" ? "ok" : r.kind === "issue" ? "bad" : "warn"}>
                        {r.kind === "confirm" ? "Confirmed" : r.kind === "issue" ? "Issue reported" : `No-show × ${r.n}`}
                      </Chip>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Card className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">Driver message preview</h3>
              <div className="flex items-center gap-1.5">
                <label htmlFor={`${uid}-pv`} className="text-xs text-(--v-muted)">
                  Driver
                </label>
                <select id={`${uid}-pv`} value={previewId} onChange={(e) => setPreviewId(e.target.value)} className="h-8 rounded-lg border border-(--v-line) bg-white px-2 text-sm">
                  {seed.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.driver.name} ({v.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <Preview channel={d.channel} msg={msg} vehicle={vehicle} canReply={d.runs[vehicle.id].status === "delivered"} onQuick={(t) => send(vehicle.id, t)} />
            </div>
          </Card>

          <Card className="p-3">
            <h3 className="text-sm font-bold">Simulate a driver reply</h3>
            <p className="mt-0.5 text-xs text-(--v-muted)">
              Type <code className="rounded bg-(--v-soft) px-1 font-mono">1</code> to confirm, <code className="rounded bg-(--v-soft) px-1 font-mono">2</code> for an issue, or{" "}
              <code className="rounded bg-(--v-soft) px-1 font-mono">3 N</code> for N no-shows. Replies work after delivery.
            </p>
            <form
              className="mt-2 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(replyVid, text);
              }}
            >
              <div>
                <label htmlFor={`${uid}-rd`} className={labelCls}>
                  From
                </label>
                <select id={`${uid}-rd`} value={replyVid} onChange={(e) => {
                    setReplyVid(e.target.value);
                    setFeedback(null);
                  }} className="mt-1 block h-9 rounded-lg border border-(--v-line) bg-white px-2 text-sm">
                  {seed.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-28 flex-1">
                <label htmlFor={`${uid}-rt`} className={labelCls}>
                  Reply text
                </label>
                <input
                  id={`${uid}-rt`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="1, 2 or 3 N"
                  autoComplete="off"
                  className="mt-1 block h-9 w-full rounded-lg border border-(--v-line) bg-white px-2.5 font-mono text-sm"
                />
              </div>
              <Btn type="submit" variant="primary">
                Send reply
              </Btn>
            </form>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                ["1", "confirm"],
                ["2", "issue"],
                ["3 2", "no-show"],
              ].map(([t, l]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setText(t)}
                  className="rounded-full border border-(--v-line) bg-white px-2.5 py-1 text-xs hover:bg-(--v-soft)"
                >
                  <code className="font-mono font-bold">{t}</code> <span className="text-(--v-muted)">{l}</span>
                </button>
              ))}
            </div>
            <p role="status" className={cx("mt-2 min-h-5 text-xs font-semibold", feedback ? (feedback.ok ? "text-(--v-ok)" : "text-(--v-bad)") : "text-(--v-muted)")}>
              {feedback ? feedback.message : replyRun.status === "delivered" ? "Ready for a reply." : "Dispatch first, then reply once the message is delivered."}
            </p>
          </Card>

          <Card className="p-3">
            <h3 className="text-sm font-bold">Event log</h3>
            {d.log.length === 0 ? (
              <p className="mt-1 text-xs text-(--v-muted)">Nothing yet. Press Dispatch to queue messages.</p>
            ) : (
              <ul className="mt-2 max-h-56 space-y-1 overflow-auto font-mono text-xs" aria-label="Dispatch event log, newest first">
                {[...d.log].reverse().map((l) => (
                  <li key={l.id} className="flex gap-2">
                    <span className="shrink-0 text-(--v-muted) tabular-nums">{l.at}</span>
                    <span role="img" className={cx("w-4 shrink-0 text-center font-bold", l.dir === "in" ? "text-(--v-primary-ink)" : "text-(--v-muted)")} aria-label={l.dir === "in" ? "inbound" : l.dir === "out" ? "outbound" : "system"}>
                      {l.dir === "in" ? "←" : l.dir === "out" ? "→" : "·"}
                    </span>
                    <span className={cx("min-w-0 break-words", l.ok === false && "text-(--v-bad)", l.ok === true && "text-(--v-ok)")}>
                      {l.dir === "in" ? `"${l.text}"` : l.text}
                      {l.note && l.dir === "in" ? <span className="text-(--v-muted)"> from {l.note}</span> : null}
                      {l.note && l.dir === "sys" && l.ok === false ? <span> ({l.note})</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
