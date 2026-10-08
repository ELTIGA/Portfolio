"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110"
    >
      <span aria-hidden="true" className="font-mono">{">"}</span>
      Print / Save as PDF
    </button>
  );
}
