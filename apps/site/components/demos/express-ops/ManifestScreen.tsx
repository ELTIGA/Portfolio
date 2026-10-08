"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { SERVICES, SESSION } from "./data";
import type { ManifestImage, Row } from "./data";
import { groupByService, reconcileMessage, statusOf, sumPax } from "./logic";
import type { ManifestApi } from "./useManifest";
import { Chip, Icon, NumField, PaperThumb, StatusChip, Switch } from "./ui";

const SPLIT_AT = 700;
const COMPACT_ROWS_BELOW = 560;

export function ManifestScreen({ m, contentW }: { m: ManifestApi; contentW: number }) {
  const [onlyReview, setOnlyReview] = useState(false);
  const split = contentW >= SPLIT_AT;
  const detailW = split ? contentW - 232 - 48 : contentW - 24;
  const compact = detailW < COMPACT_ROWS_BELOW;

  const statuses = m.images.map((i) => statusOf(i));
  const needReview = statuses.filter((s) => s !== "ready").length;
  const visible = onlyReview ? m.images.filter((i) => statusOf(i) !== "ready") : m.images;
  const selected = m.images.find((i) => i.id === m.selectedId) ?? m.images[0];

  return (
    <div className="p-3 sm:p-4">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="eo-eyebrow">Manifest extractor</p>
          <h1 className="text-[17px] font-semibold leading-tight">{SESSION.name}</h1>
          <p className="eo-muted mt-0.5 text-[12.5px]">
            {m.images.length} images. {needReview === 0 ? "Every image reconciles with its footer." : `${needReview} ${needReview === 1 ? "needs" : "need"} review before export.`}
          </p>
        </div>
        <button type="button" className="eo-btn" aria-pressed={onlyReview} onClick={() => setOnlyReview((v) => !v)} style={onlyReview ? { borderColor: "var(--warn-line)", color: "var(--warn)" } : undefined}>
          <Icon name="alert" size={14} />
          Review queue ({needReview})
        </button>
      </header>

      <div className={split ? "grid items-start gap-4" : "flex flex-col gap-3"} style={split ? { gridTemplateColumns: "232px minmax(0,1fr)" } : undefined}>
        <nav aria-label="Images in this session">
          <ul
            className={split ? "flex flex-col gap-2" : "eo-scroll -m-1 flex gap-2 overflow-x-auto p-1"}
            style={split ? undefined : { scrollSnapType: "x proximity" }}
          >
            {visible.map((img) => (
              <li key={img.id} className={split ? "" : "w-[206px] shrink-0"} style={split ? undefined : { scrollSnapAlign: "start" }}>
                <ThumbButton img={img} current={img.id === selected.id} onSelect={() => m.setSelectedId(img.id)} />
              </li>
            ))}
            {visible.length === 0 && <li className="eo-muted p-2 text-[12.5px]">Review queue is empty.</li>}
          </ul>
        </nav>

        <Detail m={m} img={selected} compact={compact} />
      </div>
    </div>
  );
}

function ThumbButton({ img, current, onSelect }: { img: ManifestImage; current: boolean; onSelect: () => void }) {
  const status = statusOf(img);
  return (
    <button type="button" className="eo-thumb" aria-current={current ? "true" : undefined} onClick={onSelect}>
      <PaperThumb image={img} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="mono truncate text-[12px] font-medium">{img.file}</span>
        <span className="eo-muted truncate text-[12px]">
          {img.time}, {img.title.split(", ")[1]}
        </span>
        <StatusChip status={status} />
      </span>
    </button>
  );
}

function Detail({ m, img, compact }: { m: ManifestApi; img: ManifestImage; compact: boolean }) {
  const status = statusOf(img);
  const sum = sumPax(img.rows);
  const diff = img.printedTotal === null ? null : sum - img.printedTotal;
  const busy = m.busyId === img.id;
  const [focusRow, setFocusRow] = useState<string | null>(null);
  const tone = status === "ready" ? "ok" : status === "failed" ? "bad" : "warn";
  const canUndo = m.history.length > 0;

  const add = () => {
    const id = m.addRow(img.id);
    setFocusRow(id);
  };

  const rows = (list: Row[], offset: number, showService: boolean) =>
    list.map((row, i) => (
      <RowEditor
        key={row.id}
        row={row}
        n={offset + i + 1}
        compact={compact}
        showService={showService}
        autoFocus={focusRow === row.id}
        onFocused={() => setFocusRow(null)}
        onChange={(patch) => m.updateRow(img.id, row.id, patch)}
        onRemove={() => m.removeRow(img.id, row.id)}
      />
    ));

  const groups = m.grouped ? groupByService(img.rows) : null;
  let offset = 0;

  return (
    <section aria-label={`Extraction for ${img.file}`} className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
            <span className="mono">{img.file}</span>
            <StatusChip status={status} />
          </h2>
          <p className="eo-muted text-[12px]">{img.title}, departs {img.time}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="eo-btn quiet" disabled={!canUndo} onClick={() => m.undoLatest()} aria-keyshortcuts="Control+Z Meta+Z" title="Restore the last reprocessed image (Cmd/Ctrl+Z)">
            <Icon name="undo" size={14} />
            Undo
          </button>
          <button type="button" className="eo-btn primary" aria-disabled={m.busyId !== null} onClick={() => m.reprocess(img.id)}>
            {busy ? <span className="eo-spin" aria-hidden="true" /> : <Icon name="refresh" size={14} />}
            {busy ? "Reprocessing" : "Reprocess"}
          </button>
        </div>
      </div>

      {status === "failed" && (
        <div className="eo-card bad flex items-start gap-2 p-3 text-[12.5px]">
          <span style={{ color: "var(--bad)" }} className="mt-0.5">
            <Icon name="alert" size={15} />
          </span>
          <p>{img.failure ?? "No rows are left on this image. Reprocess, or add rows by hand."}</p>
        </div>
      )}

      <div className={`eo-card ${tone} p-3`} aria-label="Footer reconciliation">
        <p className="eo-eyebrow mb-2" style={{ color: status === "ready" ? "var(--ok)" : status === "failed" ? "var(--bad)" : "var(--warn)" }}>
          Footer reconciliation
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Stat label="Extracted sum">
            <span className="mono text-[22px] font-semibold leading-none" data-testid="eo-extracted">{sum}</span>
          </Stat>
          <Stat label="Printed total" htmlFor={`pt-${img.id}`}>
            <NumField id={`pt-${img.id}`} nullable value={img.printedTotal} onChange={(v) => m.setPrinted(img.id, v)} label="Printed footer total" invalid={status !== "ready"} className="!min-h-[34px] !text-[16px] font-semibold" />
          </Stat>
          <Stat label="Difference">
            <span className="mono text-[22px] font-semibold leading-none" style={{ color: diff === 0 ? "var(--ok)" : "var(--warn)" }}>
              {diff === null ? "n/a" : diff > 0 ? `+${diff}` : diff}
            </span>
          </Stat>
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 text-[12.5px]" role="status" style={{ color: status === "ready" ? "var(--ok)" : "var(--warn)" }}>
          <Icon name={status === "ready" ? "check" : "alert"} size={14} />
          <span>{reconcileMessage(sum, img.printedTotal)}</span>
        </p>
      </div>

      <div className="eo-card p-2 sm:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold">
            Extracted rows <span className="eo-muted font-normal">({img.rows.length})</span>
          </h3>
          <div className="flex flex-wrap items-center gap-1">
            <Switch checked={m.grouped} onChange={m.setGrouped}>
              Group by service
            </Switch>
            <button type="button" className="eo-btn" onClick={add}>
              <Icon name="plus" size={14} />
              Add row
            </button>
          </div>
        </div>

        {!compact && img.rows.length > 0 && (
          <div className="eo-th grid items-center gap-2 border-b px-0 pb-1.5" style={{ gridTemplateColumns: rowCols(!!groups), borderColor: "var(--line)" }} aria-hidden="true">
            <span>Guest</span>
            <span className="text-right">Pax</span>
            <span>Hotel</span>
            {!groups && <span>Service</span>}
            <span />
          </div>
        )}

        {img.rows.length === 0 && <p className="eo-muted px-1 py-4 text-center text-[12.5px]">No rows yet. Reprocess the image or add a row.</p>}

        {groups
          ? groups.map((g) => {
              const start = offset;
              offset += g.rows.length;
              return (
                <div key={g.service} role="group" aria-label={g.service}>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-md px-2 py-1" style={{ background: "var(--raised)" }}>
                    <span className="text-[12px] font-semibold">{g.service}</span>
                    <Chip tone="neutral" dot={false}>
                      Subtotal {g.subtotal} pax
                    </Chip>
                  </div>
                  {rows(g.rows, start, false)}
                </div>
              );
            })
          : rows(img.rows, 0, true)}

        <div className="mt-2 flex items-center justify-between border-t px-1 pt-2 text-[12.5px]" style={{ borderColor: "var(--line)" }}>
          <span className="eo-muted">Total passengers</span>
          <span className="mono font-semibold">{sum}</span>
        </div>
      </div>
      <p className="eo-muted text-[11.5px]">
        Edits recompute the reconciliation live. Reprocessing replaces the rows; undo with the toast action or <span className="eo-kbd">Cmd</span>/<span className="eo-kbd">Ctrl</span>+<span className="eo-kbd">Z</span> when focus is outside a field.
      </p>
    </section>
  );
}

const rowCols = (grouped: boolean) =>
  grouped ? "minmax(0,1.4fr) 64px minmax(0,1.2fr) 32px" : "minmax(0,1.3fr) 64px minmax(0,1.2fr) minmax(0,1fr) 32px";

function Stat({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="eo-th">
          {label}
        </label>
      ) : (
        <span className="eo-th">{label}</span>
      )}
      <div className="flex min-h-[34px] items-center">{children}</div>
    </div>
  );
}

function RowEditor({
  row,
  n,
  compact,
  showService,
  autoFocus,
  onFocused,
  onChange,
  onRemove,
}: {
  row: Row;
  n: number;
  compact: boolean;
  showService: boolean;
  autoFocus: boolean;
  onFocused: () => void;
  onChange: (patch: Partial<Row>) => void;
  onRemove: () => void;
}) {
  const guest = (
    <input className="eo-input" aria-label={`Guest, row ${n}`} placeholder="Guest" value={row.guest} autoFocus={autoFocus} onFocus={() => autoFocus && onFocused()} onChange={(e) => onChange({ guest: e.target.value })} />
  );
  const pax = <NumField value={row.pax} onChange={(v) => onChange({ pax: v ?? 0 })} label={`Passengers, row ${n}`} />;
  const hotel = <input className="eo-input" aria-label={`Hotel, row ${n}`} placeholder="Hotel" value={row.hotel} onChange={(e) => onChange({ hotel: e.target.value })} />;
  const service = (
    <select className="eo-input" aria-label={`Service, row ${n}`} value={row.service} onChange={(e) => onChange({ service: e.target.value })}>
      {SERVICES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
  const remove = (
    <button type="button" className="eo-btn quiet icon" style={{ minHeight: 30, minWidth: 30 }} aria-label={`Remove row ${n}${row.guest ? `, ${row.guest}` : ""}`} onClick={onRemove}>
      <Icon name="x" size={14} />
    </button>
  );

  if (compact) {
    return (
      <div className="grid gap-1.5 border-b py-2" style={{ gridTemplateColumns: "minmax(0,1fr) 64px 32px", borderColor: "var(--line)" }}>
        {guest}
        {pax}
        {remove}
        <div className="grid gap-1.5" style={{ gridColumn: "1 / -1", gridTemplateColumns: showService ? "1fr 1fr" : "1fr" }}>
          {hotel}
          {showService && service}
        </div>
      </div>
    );
  }
  return (
    <div className="grid items-center gap-2 border-b py-1.5" style={{ gridTemplateColumns: rowCols(!showService), borderColor: "var(--line)" }}>
      {guest}
      {pax}
      {hotel}
      {showService && service}
      {remove}
    </div>
  );
}
