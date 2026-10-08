import type { ReactNode } from "react";

/** Terminal-window chrome for CLI/TUI previews. */
export function TerminalFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-[#07090c]">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex-1 truncate text-center font-mono text-[11px] text-muted">{title}</span>
        <span className="w-12" aria-hidden="true" />
      </div>
      <div className="min-h-0 flex-1 overflow-auto font-mono text-[13px] leading-relaxed">{children}</div>
    </div>
  );
}
