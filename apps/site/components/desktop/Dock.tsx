"use client";

import { track } from "@/lib/track";
import { APPS } from "./apps";
import { useWindows } from "./store";

export function Dock() {
  const { wins, open, focus } = useWindows();
  return (
    <nav aria-label="Dock" className="pointer-events-none fixed inset-x-0 bottom-3 z-[1000] flex justify-center px-2">
      <ul className="pointer-events-auto flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
        {APPS.map((app) => {
          const win = wins.find((w) => w.id === app.id);
          return (
            <li key={app.id} className="relative">
              <button
                type="button"
                aria-label={`${app.label}${win ? " (open)" : ""}`}
                title={app.label}
                onClick={() => {
                  track("window_open", { app: app.id });
                  if (win) focus(win.id);
                  open(app.id, app.title, app.size);
                }}
                className="grid h-12 w-12 place-items-center rounded-xl text-2xl transition hover:-translate-y-1 hover:brightness-125"
                style={{ background: app.color }}
              >
                <span aria-hidden="true">{app.glyph}</span>
              </button>
              {win && <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-fg" />}
            </li>
          );
        })}
        {wins.filter((w) => w.id.startsWith("project:")).length > 0 && <li aria-hidden="true" className="mx-1 h-10 w-px self-center bg-white/15" />}
        {wins
          .filter((w) => w.id.startsWith("project:"))
          .map((w) => (
            <li key={w.id} className="relative">
              <button
                type="button"
                title={w.title}
                onClick={() => open(w.id, w.title)}
                className={`grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-surface font-mono text-sm font-semibold transition hover:-translate-y-1 hover:brightness-125 ${w.minimized ? "opacity-60" : ""}`}
              >
                <span aria-hidden="true">{w.title.slice(0, 2)}</span>
                <span className="sr-only">{w.title}{w.minimized ? " (minimized)" : ""}</span>
              </button>
              <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-fg" />
            </li>
          ))}
      </ul>
    </nav>
  );
}
