"use client";

import { useId, useState, type CSSProperties } from "react";
import { DispatchScreen } from "./DispatchScreen";
import { ManifestsScreen } from "./ManifestsScreen";
import { RoutesScreen } from "./RoutesScreen";
import { capacityOf, flaggedCount, vehicleStops } from "./calc";
import { TENANTS } from "./data";
import { useStore } from "./store";
import type { Screen } from "./types";
import { Chip, Icon, Logo, cx, labelCls } from "./ui";

/** Light "Operational Calm" palette, scoped to this demo. Text pairs meet WCAG AA. */
const THEME = {
  "--v-bg": "#F2F5FA",
  "--v-card": "#FFFFFF",
  "--v-fg": "#22334A",
  "--v-muted": "#53647A",
  "--v-line": "#DAE2EC",
  "--v-soft": "#E7EEF6",
  "--v-primary": "#0A7CA5",
  "--v-primary-hover": "#096C91",
  "--v-primary-soft": "#DFF2FA",
  "--v-primary-ink": "#075E7D",
  "--v-ok": "#17703A",
  "--v-ok-soft": "#DDF3E4",
  "--v-warn": "#8F4305",
  "--v-warn-soft": "#FDEBD3",
  "--v-bad": "#A61B1B",
  "--v-bad-soft": "#FBE0E0",
} as CSSProperties;

const CSS = `
.viya-root :focus-visible{outline:2px solid #0A7CA5;outline-offset:2px;border-radius:6px}
.viya-root .viya-hatch{background-image:repeating-linear-gradient(45deg,#7F90A5 0 2px,#fff 2px 5px)}
.viya-root select,.viya-root input{color:#22334A}
.viya-root input::placeholder{color:#6B7B90}
`;

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "manifests", label: "Manifests", icon: "file" },
  { id: "routes", label: "Routes", icon: "route" },
  { id: "dispatch", label: "Dispatch", icon: "send" },
];

export default function Demo() {
  const store = useStore();
  const { seed, state } = store;
  const [screen, setScreen] = useState<Screen>("manifests");
  const tenantSelect = useId();

  const review = state.manifests.reduce((n, m) => n + flaggedCount(m.passengers), 0);
  const over = seed.vehicles.filter((v) => {
    const c = capacityOf(vehicleStops(v, state.routes[v.id], seed.stops));
    return c.effective > v.seats;
  }).length;
  const delivered = Object.values(state.dispatch.runs).filter((r) => r.status === "delivered").length;
  const badge: Record<Screen, { n: number; warn: boolean }> = {
    manifests: { n: review, warn: true },
    routes: { n: over, warn: true },
    dispatch: { n: delivered, warn: false },
  };

  return (
    <div className="viya-root @container h-full min-h-0 text-(--v-fg)" style={{ ...THEME, background: "var(--v-bg)", fontSize: 14 }}>
      <style>{CSS}</style>
      <div className="grid h-full min-h-0 [grid-template-areas:'brand_tenant'_'nav_nav'_'main_main'] grid-cols-[auto_1fr] grid-rows-[auto_auto_minmax(0,1fr)] @3xl:[grid-template-areas:'brand_tenant'_'nav_main'] @3xl:grid-cols-[12.5rem_minmax(0,1fr)] @3xl:grid-rows-[auto_minmax(0,1fr)]">
        <div className="flex items-center gap-2.5 border-b border-(--v-line) bg-white px-3 py-2.5 [grid-area:brand] @3xl:border-r">
          <Logo />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight">Viya</p>
            <p className="text-[10px] font-semibold tracking-wider text-(--v-muted) uppercase">Operations</p>
          </div>
        </div>

        <header className="flex min-w-0 items-center justify-end gap-2 border-b border-(--v-line) bg-white px-3 py-2 [grid-area:tenant] @2xl:gap-3">
          <span className="hidden @2xl:inline-flex">
            <Chip mono title="Every query is scoped to this tenant id">
              tenant_id: {seed.id}
            </Chip>
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 @2xl:flex-none">
            <label htmlFor={tenantSelect} className="sr-only @2xl:not-sr-only @2xl:text-xs @2xl:font-semibold @2xl:text-(--v-muted)">
              Tenant
            </label>
            <div className="relative min-w-0 flex-1 @2xl:flex-none">
              <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-(--v-muted)">
                <Icon name="building" size={14} />
              </span>
              <select
                id={tenantSelect}
                value={seed.id}
                onChange={(e) => {
                  store.switchTenant(e.target.value);
                }}
                className="h-9 w-full min-w-0 truncate rounded-lg border border-(--v-line) bg-white py-0 pr-2 pl-7 text-sm font-semibold shadow-[0_1px_0_rgba(34,51,74,.1)]"
              >
                {TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-(--v-primary-soft) text-xs font-bold text-(--v-primary-ink) @2xl:grid" title="Signed in as a demo dispatcher" aria-label="Signed in as demo dispatcher">
            DD
          </span>
        </header>

        <nav aria-label="Viya sections" className="flex gap-1 border-b border-(--v-line) bg-white px-2 pb-2 [grid-area:nav] @3xl:flex-col @3xl:border-r @3xl:px-2.5 @3xl:py-3">
          <p className={cx(labelCls, "mb-1 hidden px-2 @3xl:block")}>Workspace</p>
          {NAV.map((n) => {
            const active = screen === n.id;
            const b = badge[n.id];
            return (
              <button
                key={n.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setScreen(n.id)}
                className={cx(
                  "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-[13px] font-semibold @sm:gap-2 @sm:px-2.5 @sm:text-sm transition-colors duration-150 @3xl:flex-none @3xl:justify-start",
                  active ? "bg-(--v-soft) text-(--v-fg) shadow-[0_1px_2px_rgba(34,51,74,.15)]" : "text-(--v-muted) hover:bg-(--v-bg) hover:text-(--v-fg)",
                )}
              >
                <span className="hidden @sm:inline-flex @3xl:inline-flex">
                  <Icon name={n.icon} />
                </span>
                {n.label}
                {b.n > 0 && (
                  <span
                    className={cx("grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold @3xl:ml-auto", b.warn ? "bg-(--v-warn-soft) text-(--v-warn)" : "bg-(--v-ok-soft) text-(--v-ok)")}
                    aria-label={`${b.n} ${b.warn ? "need attention" : "delivered"}`}
                  >
                    {b.n}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mt-auto hidden rounded-lg bg-(--v-bg) p-2.5 text-xs text-(--v-muted) @3xl:block">
            <p className="font-semibold text-(--v-fg)">{seed.name}</p>
            <p>{seed.city}</p>
            <p className="mt-1.5">Sample data. Nothing leaves your browser.</p>
          </div>
        </nav>

        <main className="min-h-0 [grid-area:main]" aria-label={NAV.find((n) => n.id === screen)?.label}>
          {screen === "manifests" && <ManifestsScreen key={seed.id} store={store} />}
          {screen === "routes" && <RoutesScreen key={seed.id} store={store} />}
          {screen === "dispatch" && <DispatchScreen key={seed.id} store={store} />}
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {store.announcement}
      </div>
    </div>
  );
}
