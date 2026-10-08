import type { ReactNode } from "react";

/** Browser-style chrome for interactive previews. The content slot fills the remaining height. */
export function DemoFrame({ title, host = "demo.local", children }: { title: string; host?: string; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-[#0f1318]">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-bg px-3 py-1 font-mono text-[11px] text-muted">
          <span aria-hidden="true">🔒</span>
          <span className="truncate">{host}</span>
          <span className="truncate text-fg/70">· {title}</span>
        </div>
        <span className="hidden rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent sm:inline">
          sample data
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
