"use client";

import { useState } from "react";
import { capacityOf, flaggedCount } from "./calc";
import { ProviderPanel } from "./ProviderPanel";
import type { Store } from "./store";
import type { Manifest, Passenger } from "./types";
import { Btn, Card, Chip, Icon, cx, labelCls } from "./ui";

const GRID = "grid grid-cols-6 gap-x-2 gap-y-1.5 @2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_4.5rem_3.25rem_3.25rem_3.25rem_8.5rem] @2xl:items-center";
const input =
  "h-8 w-full min-w-0 rounded-md border border-(--v-line) bg-white px-2 text-sm text-(--v-fg) @2xl:border-transparent @2xl:bg-transparent @2xl:hover:border-(--v-line) @2xl:focus:bg-white";

function Field({ label, span, children }: { label: string; span: string; children: React.ReactNode }) {
  return (
    <div className={cx("min-w-0", span)}>
      <span className={cx(labelCls, "mb-0.5 block @2xl:hidden")} aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

function PassengerRow({ p, n, onEdit, onConfirm }: { p: Passenger; n: number; onEdit: (c: Partial<Passenger>) => void; onConfirm: () => void }) {
  const [blank, setBlank] = useState<"adults" | "children" | "infants" | null>(null);
  const num = (key: "adults" | "children" | "infants", label: string) => (
    <input
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      aria-label={`${p.guest} ${label}`}
      // An emptied field shows blank while editing instead of snapping back to 0 (and "05").
      value={p[key] === 0 && blank === key ? "" : p[key]}
      onChange={(e) => {
        setBlank(e.target.value === "" ? key : null);
        onEdit({ [key]: Math.max(0, Math.min(99, Number(e.target.value) || 0)) });
      }}
      onBlur={() => setBlank(null)}
      className={cx(input, "text-center tabular-nums")}
    />
  );
  return (
    <div className={cx(GRID, "border-t border-(--v-line) px-3 py-2.5", p.review && "bg-(--v-warn-soft)/50")}>
      <Field label="Guest" span="col-span-6 @2xl:col-span-1">
        <input aria-label={`Guest name, row ${n}`} value={p.guest} onChange={(e) => onEdit({ guest: e.target.value })} className={cx(input, "font-semibold")} />
      </Field>
      <Field label="Pickup hotel" span="col-span-4 @2xl:col-span-1">
        <input aria-label={`${p.guest} pickup hotel`} value={p.hotel} onChange={(e) => onEdit({ hotel: e.target.value })} className={input} />
      </Field>
      <Field label="Time" span="col-span-2 @2xl:col-span-1">
        <input aria-label={`${p.guest} pickup time`} value={p.time} onChange={(e) => onEdit({ time: e.target.value })} className={cx(input, "tabular-nums")} />
      </Field>
      <Field label="Adults" span="col-span-2 @2xl:col-span-1">
        {num("adults", "adults")}
      </Field>
      <Field label="Children" span="col-span-2 @2xl:col-span-1">
        {num("children", "children")}
      </Field>
      <Field label="Infants" span="col-span-2 @2xl:col-span-1">
        {num("infants", "infants")}
      </Field>
      <div className="col-span-6 flex min-w-0 items-center gap-1.5 @2xl:col-span-1">
        {p.review ? (
          <>
            <Chip tone="warn" title={p.review}>
              <Icon name="alert" size={12} />
              <span className="truncate">{p.review}</span>
            </Chip>
            <Btn size="sm" variant="neutral" onClick={onConfirm} aria-label={`OK, mark ${p.guest} row as reviewed`} className="shrink-0">
              OK
            </Btn>
          </>
        ) : (
          <Chip tone={p.edited ? "primary" : "ok"}>
            <Icon name="check" size={12} />
            {p.edited ? "Edited" : "Clean"}
          </Chip>
        )}
      </div>
    </div>
  );
}

function ManifestItem({ m, active, onSelect }: { m: Manifest; active: boolean; onSelect: () => void }) {
  const flagged = flaggedCount(m.passengers);
  const cap = capacityOf(m.passengers);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cx(
        "w-full rounded-xl border p-3 text-left transition-colors duration-150",
        active ? "border-(--v-primary) bg-white shadow-[0_0_0_1px_var(--v-primary)]" : "border-(--v-line) bg-white hover:bg-(--v-bg)",
      )}
    >
      <span className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--v-soft) font-mono text-[10px] font-bold uppercase">{m.kind}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{m.filename}</span>
          <span className="block truncate text-xs text-(--v-muted)">
            {m.tour} · {m.date}
          </span>
        </span>
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip mono>{m.parseProvider}</Chip>
        {m.status === "approved" ? <Chip tone="ok">Approved</Chip> : flagged > 0 ? <Chip tone="warn">{flagged} to review</Chip> : <Chip tone="primary">Ready to approve</Chip>}
        <span className="text-xs text-(--v-muted)">{cap.effective + cap.infants} pax</span>
      </span>
    </button>
  );
}

export function ManifestsScreen({ store }: { store: Store }) {
  const { state } = store;
  const [selected, setSelected] = useState(state.manifests[0].id);
  const m = state.manifests.find((x) => x.id === selected) ?? state.manifests[0];
  const flagged = flaggedCount(m.passengers);
  const cap = capacityOf(m.passengers);

  return (
    <div className="@container h-full overflow-auto">
      <div className="flex min-h-full flex-col gap-3 p-3 @2xl:p-4 @4xl:flex-row @4xl:gap-4">
        <aside className="shrink-0 @4xl:w-64" aria-label="Uploaded manifests">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold">Manifests</h2>
            <span className="text-xs text-(--v-muted)">{state.manifests.length} uploaded</span>
          </div>
          <ul className="flex snap-x gap-2 overflow-x-auto pb-1 @4xl:flex-col @4xl:overflow-visible">
            {state.manifests.map((x) => (
              <li key={x.id} className="w-64 shrink-0 snap-start @4xl:w-auto">
                <ManifestItem m={x} active={x.id === m.id} onSelect={() => setSelected(x.id)} />
              </li>
            ))}
          </ul>
        </aside>

        <section key={m.id} className="@container flex min-w-0 flex-1 flex-col gap-3" aria-label={`Manifest ${m.filename}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold">{m.tour}</h2>
              <p className="text-xs text-(--v-muted)">
                {m.filename} · {m.date} · uploaded {m.uploaded}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {m.status === "approved" ? (
                <Chip tone="ok">
                  <Icon name="check" size={12} /> Approved
                </Chip>
              ) : (
                <Btn variant="primary" size="sm" disabled={flagged > 0} onClick={() => store.approveManifest(m.id)}>
                  Approve manifest
                </Btn>
              )}
            </div>
          </div>
          {m.status !== "approved" && flagged > 0 && (
            <p className="text-xs text-(--v-warn)">
              {flagged} flagged {flagged === 1 ? "row" : "rows"} must be corrected or marked OK before approval.
            </p>
          )}

          <ProviderPanel manifest={m} onResult={(passengers, extraction) => store.applyExtraction(m.id, passengers, extraction)} />

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
              <h3 className="text-sm font-bold">Extracted passengers</h3>
              <p className="text-xs text-(--v-muted) tabular-nums">
                {cap.effective} seats needed · {cap.infants} {cap.infants === 1 ? "infant" : "infants"} not counted · cells are editable
              </p>
            </div>
            <div aria-label="Extracted passengers">
              <div className="hidden @2xl:block">
                <div className={cx(GRID, "border-t border-(--v-line) bg-(--v-bg) px-3 py-1.5")}>
                  {["Guest", "Pickup hotel", "Time", "Adults", "Children", "Infants", "Review"].map((h, i) => (
                    <div key={h} className={cx(labelCls, i >= 3 && i <= 5 && "text-center")}>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {m.passengers.map((p, i) => (
                  <PassengerRow key={p.id} p={p} n={i + 1} onEdit={(c) => store.editPassenger(m.id, p.id, c)} onConfirm={() => store.confirmPassenger(m.id, p.id)} />
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
