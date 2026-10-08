"use client";

import { HEADPHONES, inputBase, outputBase, type GuardState, type Kind } from "./state";

function DeviceList({
  kind,
  title,
  devices,
  state,
  onSelect,
}: {
  kind: Kind;
  title: string;
  devices: string[];
  state: GuardState;
  onSelect: (kind: Kind, device: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{title}</legend>
      <ul className="mt-1.5 space-y-1">
        {devices.map((d) => {
          const chosen = state.selected[kind] === d;
          const inUse = state.current[kind] === d;
          return (
            <li key={d}>
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky-300 ${
                  chosen ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name={`cag-${kind}`}
                  className="sr-only"
                  checked={chosen}
                  onChange={() => onSelect(kind, d)}
                />
                <span
                  aria-hidden="true"
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${chosen ? "border-sky-300 bg-sky-400" : "border-slate-400"}`}
                >
                  {chosen && <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{d}</span>
                {inUse && <span className="shrink-0 rounded-full bg-emerald-400/20 px-1.5 py-px text-[10px] font-semibold text-emerald-200">In use</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function Popover({ state, onSelect, onToggle }: { state: GuardState; onSelect: (kind: Kind, device: string) => void; onToggle: () => void }) {
  const outputs: string[] = state.headphones ? [HEADPHONES, ...outputBase] : [...outputBase];
  const inputs: string[] = state.headphones ? [...inputBase, HEADPHONES] : [...inputBase];

  return (
    <div
      id="cag-popover"
      role="region"
      aria-label="CallAudioGuard"
      className="w-full rounded-xl border border-white/15 bg-slate-900/95 p-3 text-slate-50 shadow-2xl backdrop-blur"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">CallAudioGuard</h2>
        <p
          aria-live="polite"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            state.callActive ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-slate-200"
          }`}
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${state.callActive ? "animate-pulse bg-emerald-400" : "bg-slate-400"}`} />
          {state.callActive ? "Call detected" : "Idle"}
        </p>
      </div>

      <div className="mt-3 grid gap-3">
        <DeviceList kind="output" title="Output" devices={outputs} state={state} onSelect={onSelect} />
        <DeviceList kind="input" title="Input" devices={inputs} state={state} onSelect={onSelect} />
      </div>

      <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-white/15 px-2.5 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky-300">
        <span>
          Keep on selected device
          <span className="block text-xs text-slate-300">Restores your choice whenever a call is active.</span>
        </span>
        <input type="checkbox" role="switch" className="peer sr-only" checked={state.guard} onChange={onToggle} />
        <span
          aria-hidden="true"
          className="relative h-5 w-9 shrink-0 rounded-full bg-slate-600 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4"
        />
      </label>
    </div>
  );
}
