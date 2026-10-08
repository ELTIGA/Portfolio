"use client";

import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from "react";

/** Button that shows its hotkey, like a TUI footer. Real <button>, so it works without the keyboard. */
export function KeyButton({
  k,
  children,
  className = "",
  ...rest
}: { k: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-[12px] text-fg transition hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line ${className}`}
    >
      <kbd className="rounded bg-bg px-1 font-mono text-[11px] text-accent">{k}</kbd>
      <span>{children}</span>
    </button>
  );
}

export function Chip({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`max-w-full break-all rounded-full border border-line bg-surface px-2.5 py-1 text-left text-[12px] text-muted transition hover:border-accent/60 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function Bar({ pct, label, tone = "accent", width = "w-full" }: { pct: number; label: string; tone?: "accent" | "amber" | "blue" | "muted"; width?: string }) {
  const color = { accent: "bg-accent", amber: "bg-[#f5c542]", blue: "bg-[#6cb6ff]", muted: "bg-muted/50" }[tone];
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)} className={`h-2.5 overflow-hidden rounded-sm bg-line ${width}`}>
      <div className={`h-full ${color} transition-[width] duration-200 ease-linear`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export interface TabDef<T extends string> {
  id: T;
  label: string;
  hint: string;
}

/** WAI-ARIA tabs with arrow-key navigation. */
export function Tabs<T extends string>({ tabs, value, onChange, idBase }: { tabs: TabDef<T>[]; value: T; onChange: (id: T) => void; idBase: string }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === value);
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange(tabs[n].id);
    document.getElementById(`${idBase}-tab-${tabs[n].id}`)?.focus();
  };
  return (
    <div role="tablist" aria-label="getit interface" onKeyDown={onKey} className="flex gap-1 border-b border-line bg-surface/60 px-2 pt-2">
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            id={`${idBase}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls={`${idBase}-panel-${t.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`flex min-h-9 items-center gap-2 rounded-t-md border border-b-0 px-3 py-1.5 text-[12px] transition ${
              on ? "border-line bg-[#07090c] text-accent" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            <span className="font-semibold">{t.label}</span>
            <span className="hidden text-[11px] text-muted sm:inline">{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
