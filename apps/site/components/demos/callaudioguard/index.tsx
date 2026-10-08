"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Popover } from "./Popover";
import { initialState, reducer, stamp, type Action, type Kind } from "./state";

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5 16 5v4.6c0 3.4-2.4 6-6 7.9-3.6-1.9-6-4.5-6-7.9V5l6-2.5Z" />
      <path d="M7 10h1.2l.9-2.2 1.6 4.4.9-2.2H13" />
      {active && <circle cx="16" cy="4" r="2.4" fill="#34d399" stroke="none" />}
    </svg>
  );
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

const sim =
  "rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-50 transition hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-45";

/** CallAudioGuard replica: mock macOS menu bar, popover, and a simulator for call and headphone events. */
export default function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [open, setOpen] = useState(true);
  const [clock, setClock] = useState("");
  const iconRef = useRef<HTMLButtonElement>(null);

  const send = (a: DistributiveOmit<Action, "at">) => dispatch({ ...a, at: stamp() } as Action);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      iconRef.current?.focus();
    }
  };

  return (
    <div className="@container h-full overflow-y-auto bg-bg" onKeyDown={onKeyDown}>
     <div className="grid min-h-full @2xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="relative min-h-[440px] overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-sky-900">
        {/* Menu bar */}
        <div className="relative z-20 flex h-7 items-center gap-3 bg-black/60 px-3 text-xs text-white backdrop-blur">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-white/90" />
          <span className="font-semibold">Finder</span>
          <span className="hidden @sm:inline">File</span>
          <span className="hidden @sm:inline">Edit</span>
          <span className="hidden @md:inline">View</span>
          <span className="ml-auto flex items-center gap-3">
            <button
              ref={iconRef}
              type="button"
              aria-expanded={open}
              aria-controls="cag-popover"
              aria-label="CallAudioGuard menu"
              onClick={() => setOpen(!open)}
              className={`grid h-5 w-6 place-items-center rounded ${open ? "bg-white/25" : "hover:bg-white/15"}`}
            >
              <ShieldIcon active={state.callActive} />
            </button>
            <span className="tabular-nums" aria-label="Clock">
              {clock}
            </span>
          </span>
        </div>

        {/* Popover */}
        {open && (
          <div className="absolute right-2 top-9 z-10 w-[min(20rem,calc(100%-1rem))]">
            <Popover
              state={state}
              onSelect={(kind: Kind, device: string) => send({ type: "select", kind, device })}
              onToggle={() => send({ type: "toggleGuard" })}
            />
          </div>
        )}

        {/* Simulated desktop content */}
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/20 bg-slate-950/70 p-3 text-white backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-300">Video call (simulated)</p>
          <p className="mt-1 text-sm font-semibold">{state.callActive ? "Team stand-up: in progress" : "No call running"}</p>
          <p className="mt-1 text-xs text-slate-300">
            Audio: {state.current.output} / {state.current.input}
          </p>
        </div>
      </div>

      {/* Simulator */}
      <div className="border-t border-line bg-surface p-3 @2xl:border-l @2xl:border-t-0 @lg:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-widest text-accent">simulate</span>
          <button type="button" className={sim} onClick={() => send({ type: "start" })} disabled={state.callActive}>
            Start a call
          </button>
          <button type="button" className={sim} onClick={() => send({ type: "end" })} disabled={!state.callActive}>
            End call
          </button>
          <button type="button" className={sim} onClick={() => send({ type: state.headphones ? "unplug" : "plug" })}>
            {state.headphones ? "Unplug headphones" : "Plug in headphones"}
          </button>
          <span className="text-xs text-muted">These buttons stand in for real system events.</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Activity</h2>
            <button type="button" onClick={() => send({ type: "clear" })} className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline">
              Clear
            </button>
          </div>
          <ol aria-live="polite" aria-relevant="additions" className="mt-1.5 space-y-1 font-mono text-[12px]">
            {state.log.length === 0 && <li className="text-muted">No activity yet.</li>}
            {state.log.map((e) => (
              <li key={e.id} className={e.tone === "restore" ? "text-emerald-300" : "text-fg/90"}>
                <span className="text-muted">{e.at}</span> {e.tone === "restore" && <span className="font-semibold">[restored] </span>}
                {e.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
     </div>
    </div>
  );
}
