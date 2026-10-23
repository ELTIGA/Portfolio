"use client";

import Link from "next/link";
import { profile } from "@portfolio/content";
import { useWindows } from "./store";

export function MenuBar() {
  const { wins, topId } = useWindows();
  const active = wins.find((w) => w.id === topId);

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] flex h-7 items-center justify-between border-b border-white/10 bg-black/40 px-4 text-xs backdrop-blur-md">
      <div className="flex items-center gap-4">
        <span className="font-mono font-semibold text-accent" aria-hidden="true">
          ~/
        </span>
        <span className="font-semibold">{profile.name}&rsquo;s portfolio</span>
        {active && <span className="hidden text-muted sm:inline">{active.title}</span>}
      </div>
      <div className="flex items-center gap-4 text-muted">
        <Link href="/" className="hover:text-fg">
          Skip to portfolio
        </Link>
      </div>
    </header>
  );
}
