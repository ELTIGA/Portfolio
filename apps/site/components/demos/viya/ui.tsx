"use client";

import { useId, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

export type Tone = "neutral" | "primary" | "ok" | "warn" | "bad";

const TONES: Record<Tone, string> = {
  neutral: "bg-(--v-soft) text-(--v-fg)",
  primary: "bg-(--v-primary-soft) text-(--v-primary-ink)",
  ok: "bg-(--v-ok-soft) text-(--v-ok)",
  warn: "bg-(--v-warn-soft) text-(--v-warn)",
  bad: "bg-(--v-bad-soft) text-(--v-bad)",
};

export function Chip({ tone = "neutral", mono, children, title, className }: { tone?: Tone; mono?: boolean; children: ReactNode; title?: string; className?: string }) {
  return (
    <span
      title={title}
      className={cx("inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-4 font-semibold whitespace-nowrap", mono && "font-mono font-medium", TONES[tone], className)}
    >
      {children}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "neutral" | "primary" | "ghost"; size?: "sm" | "md" };

export function Btn({ variant = "neutral", size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-[transform,box-shadow,background-color] duration-150 select-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
        size === "sm" ? "min-h-8 px-2.5 text-xs" : "min-h-9 px-3.5 text-sm",
        variant === "primary" && "bg-(--v-primary) text-white shadow-[0_1px_0_rgba(7,60,85,.5),0_2px_4px_rgba(10,124,165,.25)] hover:bg-(--v-primary-hover) active:shadow-none",
        variant === "neutral" && "border border-(--v-line) bg-white text-(--v-fg) shadow-[0_1px_0_rgba(34,51,74,.1)] hover:bg-(--v-soft) active:shadow-none",
        variant === "ghost" && "text-(--v-fg) hover:bg-(--v-soft)",
        className,
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-xl border border-(--v-line) bg-(--v-card) shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_1px_3px_rgba(34,51,74,.07),0_8px_20px_-12px_rgba(34,51,74,.18)]", className)}>{children}</div>;
}

/** Click, hover or focus tooltip. Escape closes it. */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="grid h-5 w-5 place-items-center rounded-full text-(--v-muted) hover:bg-(--v-soft) hover:text-(--v-fg)"
      >
        <Icon name="info" size={14} />
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute top-full right-0 z-30 mt-1 w-60 rounded-lg bg-(--v-fg) p-2.5 text-xs leading-snug font-normal text-white shadow-lg">
          {children}
        </span>
      )}
    </span>
  );
}

const PATHS: Record<string, ReactNode> = {
  file: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </>
  ),
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
  alert: (
    <>
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5" />,
  wand: <path d="m4 20 11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.7 1.3L21 14l-1.3.7L19 16l-.7-1.3L17 14l1.3-.7z" />,
  building: <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M3 21h18M8 8h2M8 12h2M8 16h2" />,
};

export function Icon({ name, size = 16 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="9" fill="#0A7CA5" />
      <path d="M8 9l8 15 8-15" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="24" r="2.2" fill="#F59E42" />
    </svg>
  );
}

export const labelCls = "text-[11px] font-semibold tracking-wide text-(--v-muted) uppercase";
