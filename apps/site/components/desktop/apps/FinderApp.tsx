"use client";

import { projects } from "@portfolio/content";
import { track } from "@/lib/track";
import { projectWindowId } from "../apps";
import { useWindows } from "../store";

export function FinderApp() {
  const { open } = useWindows();
  const list = [...projects].sort((a, b) => a.order - b.order);
  return (
    <div className="p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{list.length} projects · click to open</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => {
                track("window_open", { app: p.slug });
                open(projectWindowId(p.slug), p.name, { w: 940, h: 620 });
              }}
              className="flex h-full w-full flex-col items-start rounded-lg border border-line bg-surface p-3 text-left transition hover:border-accent/60"
            >
              <span aria-hidden="true" className="text-2xl">{p.preview === "terminal" ? "⌨️" : p.preview === "menubar" ? "🖥️" : "🌐"}</span>
              <span className="mt-2 text-sm font-semibold">{p.name}</span>
              <span className="mt-1 line-clamp-3 text-xs text-muted">{p.tagline}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
