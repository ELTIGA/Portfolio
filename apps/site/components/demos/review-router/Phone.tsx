"use client";

import { channels, type Channel } from "./channels";

function Wave() {
  return (
    <svg viewBox="0 0 120 24" className="h-5 w-24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M2 14c10-10 18 10 28 0s18 10 28 0 18 10 28 0 18 10 28 0" />
    </svg>
  );
}

/** The customer-facing page, rendered inside a phone-shaped viewport. */
export function Phone({ onPick, toast }: { onPick: (c: Channel) => void; toast: string | null }) {
  return (
    <div className="relative mx-auto w-full max-w-[320px] rounded-[2.4rem] border-[7px] border-slate-800 bg-slate-800 shadow-2xl">
      <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-800" aria-hidden="true" />
      <div className="relative flex h-[520px] flex-col overflow-hidden rounded-[1.9rem] bg-[#f4fafa] text-slate-900">
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-9">
          <div className="text-teal-800">
            <Wave />
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest">Riverside Rafting Co.</p>
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900">Thanks for paddling with us!</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Did you enjoy the river? A quick review helps other travellers find us. Pick where you booked, it takes one tap.
          </p>

          <ul className="mt-5 space-y-3">
            {channels.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-300 bg-white p-3 text-left shadow-sm transition hover:border-teal-700 hover:shadow focus-visible:outline-teal-700"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${c.badge}`} aria-hidden="true">
                    {c.initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      Review on {c.name}
                      {c.live && <span className="rounded-full bg-teal-100 px-1.5 py-px text-[10px] font-semibold uppercase text-teal-900">Live</span>}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-700">{c.hint ?? c.blurb}</span>
                  </span>
                  <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-teal-800" aria-hidden="true">
                    &rarr;
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center text-xs text-slate-600">Thank you. No account needed, and we never ask for personal details here.</p>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-3 bottom-3 min-h-0"
        >
          {toast && (
            <p className="rounded-xl bg-slate-900 px-3 py-2.5 text-center text-sm font-medium text-white shadow-lg">{toast}</p>
          )}
        </div>
      </div>
    </div>
  );
}
