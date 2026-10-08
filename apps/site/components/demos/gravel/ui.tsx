"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export const RED = "#ff6b6b";
export const AMBER = "#f5c542";

export function Pane({ id, title, right, children, className = "" }: { id: string; title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-line bg-surface/40 ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-3 py-1.5">
        <h3 id={id} className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          {title}
        </h3>
        {right}
      </header>
      {children}
    </section>
  );
}

/** Button that shows its hotkey. Always a real <button>, so every action works without the keyboard. */
export function KeyButton({
  k,
  children,
  tone = "default",
  className = "",
  ...rest
}: { k?: string; children: ReactNode; tone?: "default" | "accent" | "danger" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const toneCls =
    tone === "accent"
      ? "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
      : tone === "danger"
        ? "border-[#ff6b6b]/50 bg-[#ff6b6b]/10 text-[#ff6b6b] hover:bg-[#ff6b6b]/20"
        : "border-line bg-surface text-fg hover:border-accent/60";
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded border px-2.5 py-1 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${toneCls} ${className}`}
    >
      {k && <kbd className="rounded bg-bg px-1 font-mono text-[11px]">{k}</kbd>}
      <span>{children}</span>
    </button>
  );
}

export function Badge({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="inline-block shrink-0 rounded-sm border px-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color, borderColor: `${color}66`, background: `${color}14` }}>
      {children}
    </span>
  );
}
