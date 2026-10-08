"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Window } from "./Window";
import { WindowProvider, useWindows } from "./store";
import { APPS, projectWindowId } from "./apps";
import { FinderApp } from "./apps/FinderApp";
import { MailApp } from "./apps/MailApp";
import { NotesApp } from "./apps/NotesApp";
import { ProjectApp } from "./apps/ProjectApp";
import { SettingsApp } from "./apps/SettingsApp";
import { TerminalApp } from "./apps/TerminalApp";
import { getProject } from "@portfolio/content";

function Surface({ initial }: { initial?: string }) {
  const { wins, topId, open } = useWindows();

  useEffect(() => {
    const finder = APPS.find((a) => a.id === "finder")!;
    open(finder.id, finder.title, finder.size);
    const p = initial ? getProject(initial) : undefined;
    if (p) open(projectWindowId(p.slug), p.name, { w: 940, h: 620 });
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,#16202b,#0b0e11_70%)]">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
      <MenuBar />
      <main aria-label="Desktop">
        {wins.map((w) => (
          <Window key={w.id} win={w} active={w.id === topId}>
            {w.id === "finder" && <FinderApp />}
            {w.id === "terminal" && <TerminalApp />}
            {w.id === "notes" && <NotesApp />}
            {w.id === "mail" && <MailApp />}
            {w.id === "settings" && <SettingsApp />}
            {w.id.startsWith("project:") && <ProjectApp slug={w.id.slice("project:".length)} />}
          </Window>
        ))}
      </main>
      <Dock />
    </div>
  );
}

/** Desktop experience. Narrow screens get a pointer to the plain page instead of cramped windows. */
export function Desktop({ initial }: { initial?: string }) {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (wide === null) return <div className="fixed inset-0 bg-bg" />;
  if (!wide) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">desktop experience</p>
          <h1 className="mt-2 text-2xl font-semibold">Best on a larger screen</h1>
          <p className="mt-2 max-w-sm text-sm text-muted">The windowed desktop needs room. The full portfolio works on any device.</p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">Go to the portfolio</Link>
        </div>
      </main>
    );
  }
  return (
    <WindowProvider>
      <Surface initial={initial} />
    </WindowProvider>
  );
}
