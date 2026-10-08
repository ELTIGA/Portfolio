"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import type { ImageStatus } from "./logic";
import { STATUS_LABEL } from "./logic";
import type { Toast } from "./hooks";
import type { ManifestImage } from "./data";

const ICONS: Record<string, ReactNode> = {
  manifest: (
    <>
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </>
  ),
  drivers: (
    <>
      <path d="M3 16V8a1 1 0 0 1 1-1h10v9M14 10h4l3 3v3h-7" />
      <circle cx="7.5" cy="17" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
    </>
  ),
  doubles: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  customers: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3.2 3.2 0 0 1 0 6M18 14.8c1.8.7 3 2.4 3 5.2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 4 3 19.5h18L12 4Z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.5-4M4 5v4h4" />
      <path d="M4 13a8 8 0 0 0 14.5 4M20 19v-4h-4" />
    </>
  ),
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  undo: <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />,
};

export function Icon({ name, size = 16 }: { name: keyof typeof ICONS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {ICONS[name]}
    </svg>
  );
}

export function Chip({ tone = "neutral", children, dot = true }: { tone?: "ok" | "warn" | "bad" | "info" | "brand" | "neutral"; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`eo-chip ${tone === "neutral" ? "" : tone}`}>
      {dot && <span className="eo-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<ImageStatus, "ok" | "warn" | "bad"> = { ready: "ok", mismatch: "warn", failed: "bad" };

export function StatusChip({ status }: { status: ImageStatus }) {
  return <Chip tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Chip>;
}

export function Switch({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="eo-switch">
      <span className="track" aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}

/**
 * Numeric input that lets the user clear the field while typing.
 * Holds the raw text locally and falls back to the value prop whenever the two disagree
 * (for example after a reprocess or an undo replaces the value).
 */
export function NumField({
  value,
  onChange,
  label,
  nullable = false,
  className = "",
  invalid = false,
  id,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  nullable?: boolean;
  className?: string;
  invalid?: boolean;
  id?: string;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const parse = (t: string) => (t === "" ? (nullable ? null : 0) : Number(t));
  const shown = parse(text) === value ? text : value === null ? "" : String(value);
  return (
    <input
      id={id}
      className={`eo-input num ${className}`}
      inputMode="numeric"
      autoComplete="off"
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={shown}
      onChange={(ev) => {
        const t = ev.target.value.replace(/\D/g, "").slice(0, 3);
        setText(t);
        onChange(parse(t));
      }}
    />
  );
}

/** Mock paper manifest. Drawn, not a photo: header, ruled rows, a footer total. */
export function PaperThumb({ image, width = 44 }: { image: ManifestImage; width?: number }) {
  const failed = image.rows.length === 0 && image.failure;
  const lines = Array.from({ length: image.paperLines }, (_, i) => i);
  const rot = (image.id.charCodeAt(1) % 3) - 1;
  const uid = useId();
  return (
    <svg
      viewBox="0 0 60 76"
      width={width}
      height={(width * 76) / 60}
      role="img"
      aria-label={`Thumbnail of ${image.file}`}
      className="shrink-0 rounded-[3px]"
      style={{ transform: `rotate(${rot}deg)`, filter: failed ? "blur(0.9px)" : undefined, boxShadow: "0 1px 4px rgba(0,0,0,.5)" }}
    >
      <rect width="60" height="76" fill="#f3efe4" />
      <rect x="6" y="6" width="26" height="3" rx="1" fill="#2d2a24" />
      <rect x="6" y="11" width="16" height="2" rx="1" fill="#8d877a" />
      <rect x="6" y="17" width="48" height="0.8" fill="#8d877a" />
      {lines.map((i) => (
        <g key={`${uid}-${i}`}>
          <rect x="6" y={21 + i * 6} width={14 + ((i * 7) % 9)} height="2" rx="1" fill="#5d584d" />
          <rect x="30" y={21 + i * 6} width={12 + ((i * 5) % 8)} height="2" rx="1" fill="#9a9487" />
          <rect x="48" y={21 + i * 6} width="5" height="2" rx="1" fill="#3a362f" />
        </g>
      ))}
      <rect x="6" y="62" width="48" height="0.8" fill="#8d877a" />
      <rect x="6" y="66" width="12" height="2.4" rx="1" fill="#2d2a24" />
      <text x="54" y="69" textAnchor="end" fontSize="8" fontWeight="700" fill="#17140f" fontFamily="ui-monospace, Menlo, monospace">
        {image.paperTotal}
      </text>
      {failed && <path d="M4 4 56 72M56 4 4 72" stroke="#b3423c" strokeWidth="1.2" opacity="0.55" />}
    </svg>
  );
}

export function ToastRegion({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="false" className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="eo-toast pointer-events-auto flex max-w-full items-center gap-3 rounded-lg border px-3 py-2 text-[12.5px] shadow-xl"
          style={{
            background: t.tone === "ok" ? "var(--ok-soft)" : t.tone === "warn" ? "var(--warn-soft)" : "var(--raised)",
            borderColor: t.tone === "ok" ? "var(--ok-line)" : t.tone === "warn" ? "var(--warn-line)" : "var(--line2)",
          }}
        >
          <span className="min-w-0 break-words">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="eo-btn"
              style={{ minHeight: 26, padding: "0 10px" }}
              onClick={() => {
                t.action?.run();
                onDismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" className="eo-btn quiet icon" style={{ minHeight: 26, minWidth: 26 }} aria-label="Dismiss notification" onClick={() => onDismiss(t.id)}>
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
