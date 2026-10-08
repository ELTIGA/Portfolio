"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TENANTS } from "./data";
import { capacityOf, optimizeOrder, runExtraction, vehicleStops, flaggedCount } from "./calc";
import type { Channel, DispatchState, DriverRun, Extraction, LogEntry, Manifest, Passenger, ReplyKind, TenantSeed, TenantState } from "./types";

const clock = () => new Date().toLocaleTimeString([], { hour12: false });

function initManifests(seed: TenantSeed): Manifest[] {
  return seed.manifests.map((m) => {
    const { passengers, extraction } = runExtraction(m.id, m.rows, m.provider);
    const cleared = m.approved ? passengers.map((p) => ({ ...p, review: null })) : passengers;
    const { approved, provider, ...rest } = m;
    void provider;
    return { ...rest, passengers: cleared, extraction, status: approved ? "approved" : "needs_review" };
  });
}

function freshDispatch(seed: TenantSeed, channel: Channel = "whatsapp"): DispatchState {
  return {
    channel,
    runs: Object.fromEntries(seed.vehicles.map((v) => [v.id, { status: "idle", reply: null } satisfies DriverRun])),
    log: [],
  };
}

function initTenant(seed: TenantSeed): TenantState {
  return {
    manifests: initManifests(seed),
    routes: Object.fromEntries(seed.vehicles.map((v) => [v.id, v.stopIds])),
    dispatch: freshDispatch(seed),
  };
}

export type Store = ReturnType<typeof useStore>;

export function useStore() {
  const [tenantId, setTenantId] = useState(TENANTS[0].id);
  const [states, setStates] = useState<Record<string, TenantState>>(() => Object.fromEntries(TENANTS.map((t) => [t.id, initTenant(t)])));
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<Record<string, number[]>>({});
  const seq = useRef(1);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach((list) => list.forEach((id) => window.clearTimeout(id)));
  }, []);

  const seed = TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0];
  const state = states[seed.id];

  const patch = useCallback((tid: string, fn: (s: TenantState) => TenantState) => {
    setStates((prev) => ({ ...prev, [tid]: fn(prev[tid]) }));
  }, []);

  const say = useCallback((msg: string) => setAnnouncement(msg), []);

  const entry = useCallback((dir: LogEntry["dir"], text: string, extra: Partial<LogEntry> = {}): LogEntry => ({ id: seq.current++, dir, text, at: clock(), ...extra }), []);

  /* ---- tenant ---- */
  const switchTenant = (id: string) => {
    const next = TENANTS.find((t) => t.id === id);
    if (!next || id === tenantId) return;
    setTenantId(id);
    say(`Switched to ${next.name}. ${next.manifests.length} manifests and ${next.vehicles.length} vehicles loaded for this tenant only.`);
  };

  /* ---- manifests ---- */
  const editPassenger = (mid: string, pid: string, change: Partial<Passenger>) =>
    patch(seed.id, (s) => ({
      ...s,
      manifests: s.manifests.map((m) =>
        m.id !== mid ? m : { ...m, status: "needs_review", passengers: m.passengers.map((p) => (p.id === pid ? { ...p, ...change, review: null, edited: true } : p)) },
      ),
    }));

  const confirmPassenger = (mid: string, pid: string) =>
    patch(seed.id, (s) => ({
      ...s,
      manifests: s.manifests.map((m) => (m.id !== mid ? m : { ...m, passengers: m.passengers.map((p) => (p.id === pid ? { ...p, review: null } : p)) })),
    }));

  const approveManifest = (mid: string) => {
    patch(seed.id, (s) => ({ ...s, manifests: s.manifests.map((m) => (m.id === mid ? { ...m, status: "approved" } : m)) }));
    say("Manifest approved and ready for route planning.");
  };

  const applyExtraction = (mid: string, passengers: Passenger[], extraction: Extraction, tid: string = seed.id) => {
    patch(tid, (s) => ({ ...s, manifests: s.manifests.map((m) => (m.id === mid ? { ...m, passengers, extraction, status: "needs_review" } : m)) }));
    const n = flaggedCount(passengers);
    say(`Extraction finished with ${extraction.provider}. ${n} ${n === 1 ? "row needs" : "rows need"} review.`);
  };

  /* ---- routes ---- */
  const setOrder = (vid: string, order: string[]) => patch(seed.id, (s) => ({ ...s, routes: { ...s.routes, [vid]: order } }));

  const moveStop = (vid: string, from: number, to: number) => {
    const order = [...state.routes[vid]];
    if (to < 0 || to >= order.length || from === to) return;
    const [id] = order.splice(from, 1);
    order.splice(to, 0, id);
    setOrder(vid, order);
    const stop = seed.stops.find((x) => x.id === id);
    const v = seed.vehicles.find((x) => x.id === vid);
    say(`${stop?.hotel} is now stop ${to + 1} of ${order.length} on ${v?.label}. ETAs updated.`);
  };

  const assignStop = (stopId: string, toVid: string) => {
    patch(seed.id, (s) => {
      const routes: Record<string, string[]> = {};
      for (const [vid, ids] of Object.entries(s.routes)) routes[vid] = ids.filter((id) => id !== stopId);
      routes[toVid] = [...routes[toVid], stopId];
      return { ...s, routes };
    });
    const stop = seed.stops.find((x) => x.id === stopId);
    const v = seed.vehicles.find((x) => x.id === toVid);
    say(`${stop?.hotel} reassigned to ${v?.label}.`);
  };

  const optimize = (vid: string) => {
    const v = seed.vehicles.find((x) => x.id === vid);
    if (!v) return;
    const ordered = optimizeOrder(v.depot, vehicleStops(v, state.routes[vid], seed.stops));
    setOrder(vid, ordered.map((x) => x.id));
    say(`${v.label} stops re-ordered by nearest neighbour.`);
  };

  /* ---- dispatch ---- */
  const clearTimers = (tid: string) => {
    (timers.current[tid] ?? []).forEach((id) => window.clearTimeout(id));
    timers.current[tid] = [];
  };

  const setChannel = (channel: Channel) => patch(seed.id, (s) => ({ ...s, dispatch: { ...s.dispatch, channel } }));

  const resetDispatch = () => {
    clearTimers(seed.id);
    patch(seed.id, (s) => ({ ...s, dispatch: freshDispatch(seed, s.dispatch.channel) }));
    say("Dispatch reset.");
  };

  const dispatchAll = () => {
    const tid = seed.id;
    const channel = state.dispatch.channel;
    const chLabel = channel === "whatsapp" ? "WhatsApp" : channel === "telegram" ? "Telegram" : "Slack";
    clearTimers(tid);
    const queued = seed.vehicles.map((v) => entry("out", `Queued route message for ${v.driver.name} via ${chLabel}`, { note: v.label }));
    patch(tid, (s) => ({
      ...s,
      dispatch: {
        channel,
        runs: Object.fromEntries(seed.vehicles.map((v) => [v.id, { status: "queued", reply: null } satisfies DriverRun])),
        log: [entry("sys", `Dispatch started: ${seed.vehicles.length} drivers via ${chLabel}`), ...queued],
      },
    }));
    say(`Dispatching ${seed.vehicles.length} routes via ${chLabel}. Status: queued.`);

    const stage = (vid: string, status: "sent" | "delivered", delay: number, text: string) => {
      const id = window.setTimeout(() => {
        patch(tid, (s) => ({
          ...s,
          dispatch: {
            ...s.dispatch,
            runs: { ...s.dispatch.runs, [vid]: { ...s.dispatch.runs[vid], status } },
            log: [...s.dispatch.log, entry("out", text, { note: status })],
          },
        }));
        say(text);
      }, delay);
      (timers.current[tid] ??= []).push(id);
    };

    seed.vehicles.forEach((v, i) => {
      stage(v.id, "sent", 650 + i * 400, `${v.label}: sent to ${v.driver.name}`);
      stage(v.id, "delivered", 1700 + i * 520, `${v.label}: delivered to ${v.driver.name}`);
    });
  };

  const sendReply = (vid: string, raw: string): { ok: boolean; message: string } => {
    const tid = seed.id;
    const v = seed.vehicles.find((x) => x.id === vid);
    if (!v) return { ok: false, message: "Unknown driver." };
    const run = state.dispatch.runs[vid];
    const text = raw.trim();
    const add = (entries: LogEntry[]) => patch(tid, (s) => ({ ...s, dispatch: { ...s.dispatch, log: [...s.dispatch.log, ...entries] } }));

    if (run.status !== "delivered") {
      const message = `${v.driver.name} has not received the dispatch yet.`;
      add([entry("sys", message, { ok: false })]);
      return { ok: false, message };
    }
    const m = /^([123])(?:\s+(\d+))?$/.exec(text);
    const inbound = entry("in", text || "(empty)", { note: `${v.driver.name}` });
    if (!m) {
      const message = "Could not parse. Valid replies: 1, 2, or 3 N.";
      add([inbound, entry("sys", `Unparsed reply from ${v.driver.name}. Asked to resend.`, { ok: false, note: message })]);
      return { ok: false, message };
    }
    const code = m[1];
    const pax = capacityOf(vehicleStops(v, state.routes[vid], seed.stops)).total;
    let kind: ReplyKind;
    let n: number | undefined;
    if (code === "1") kind = "confirm";
    else if (code === "2") kind = "issue";
    else {
      kind = "no_show";
      n = m[2] ? Number(m[2]) : undefined;
      if (n === undefined || n < 1 || n > pax) {
        const message = n === undefined ? "No-show needs a count, for example 3 2." : `No-show count must be between 1 and ${pax}.`;
        add([inbound, entry("sys", `Rejected: ${message}`, { ok: false })]);
        return { ok: false, message };
      }
    }
    if (kind !== "no_show" && m[2]) {
      const message = `"${code}" takes no number. Use 3 N for no-shows.`;
      add([inbound, entry("sys", `Rejected: ${message}`, { ok: false })]);
      return { ok: false, message };
    }
    const parsed =
      kind === "confirm" ? "confirm → route accepted" : kind === "issue" ? "issue → flagged for dispatcher" : `no_show(${n}) → ${n} pax removed from manifest count`;
    patch(tid, (s) => ({
      ...s,
      dispatch: {
        ...s.dispatch,
        runs: { ...s.dispatch.runs, [vid]: { ...s.dispatch.runs[vid], reply: { kind, n } } },
        log: [...s.dispatch.log, inbound, entry("sys", `Parsed: ${parsed}`, { ok: true })],
      },
    }));
    const message = kind === "confirm" ? `${v.label} confirmed.` : kind === "issue" ? `${v.label} reported an issue.` : `${v.label}: ${n} no-show.`;
    say(message);
    return { ok: true, message };
  };

  return {
    seed,
    state,
    announcement,
    switchTenant,
    editPassenger,
    confirmPassenger,
    approveManifest,
    applyExtraction,
    moveStop,
    assignStop,
    optimize,
    setChannel,
    dispatchAll,
    resetDispatch,
    sendReply,
    say,
  };
}
