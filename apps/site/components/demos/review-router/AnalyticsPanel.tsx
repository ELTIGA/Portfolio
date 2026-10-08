"use client";

import { channels, type ClickEvent, type Source } from "./channels";
import { Qr } from "./Qr";

export function AnalyticsPanel({
  events,
  source,
  onSource,
  onReset,
}: {
  events: ClickEvent[];
  source: Source;
  onSource: (s: Source) => void;
  onReset: () => void;
}) {
  const total = events.length;
  const max = Math.max(1, ...channels.map((c) => events.filter((e) => e.channel === c.id).length));
  const recent = [...events].reverse().slice(0, 5);

  return (
    <aside className="w-full max-w-md space-y-3 text-fg" aria-label="Analytics panel">
      <section className="rounded-xl border border-line bg-surface p-4" aria-labelledby="rr-counter">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">analytics event</p>
        <h2 id="rr-counter" className="mt-1 font-mono text-sm">
          review_channel_click
        </h2>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums">
            {total}
          </span>
          <span className="text-sm text-muted">{total === 1 ? "click" : "clicks"} this session</span>
        </p>
        <ul className="mt-3 space-y-2">
          {channels.map((c) => {
            const n = events.filter((e) => e.channel === c.id).length;
            return (
              <li key={c.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{c.name}</span>
                  <span className="font-mono text-xs text-muted">{n}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3">
          <p className="text-xs text-muted">Latest events</p>
          {recent.length === 0 ? (
            <p className="mt-1 text-xs text-muted">Tap a channel on the phone to fire an event.</p>
          ) : (
            <ol className="mt-1 space-y-1 font-mono text-[11px] text-fg/90">
              {recent.map((e) => (
                <li key={e.n} className="truncate">
                  <span className="text-muted">{e.at}</span> {`{ channel: "${e.channel}", source: "${e.source}" }`}
                </li>
              ))}
            </ol>
          )}
        </div>
        <button type="button" onClick={onReset} disabled={total === 0} className="mt-3 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg disabled:opacity-40">
          Reset counter
        </button>
      </section>

      <section className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4" aria-labelledby="rr-qr">
        <Qr className="h-24 w-24 shrink-0 rounded-md" />
        <div className="min-w-0">
          <h2 id="rr-qr" className="text-sm font-semibold">
            Printed at the end of the tour
          </h2>
          <p className="mt-1 text-xs text-muted">Decorative placeholder, not scannable. Guests arrive via QR code or a WhatsApp message.</p>
          <fieldset className="mt-2">
            <legend className="sr-only">Simulate entry channel</legend>
            <div className="inline-flex overflow-hidden rounded-md border border-line text-xs">
              {(["qr", "whatsapp"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={source === s}
                  onClick={() => onSource(s)}
                  className={`px-2.5 py-1 ${source === s ? "bg-accent font-semibold text-accent-ink" : "text-muted hover:text-fg"}`}
                >
                  {s === "qr" ? "Via QR" : "Via WhatsApp"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>
      <p className="text-xs text-muted">Clicks stay on this page. In production each tap records the event, then opens the channel.</p>
    </aside>
  );
}
