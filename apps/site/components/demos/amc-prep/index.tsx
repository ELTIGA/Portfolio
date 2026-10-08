"use client";

import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { Poker } from "./Poker";
import { Quiz } from "./Quiz";
import { initialProgress, levelFor, titleFor, type Mode, type Progress } from "./progress";

type View = { name: "home" } | { name: "quiz"; mode: Mode; run: number } | { name: "poker" };

/** AMC Prep replica: bento dashboard, question flow with layered explanations, Clinical Poker. Invented demo content. */
export default function Demo() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [view, setView] = useState<View>({ name: "home" });
  const level = levelFor(progress.points);

  return (
    <div className="@container h-full overflow-y-auto bg-bg text-fg">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-3 p-3 @lg:p-5">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" onClick={() => setView({ name: "home" })} className="flex items-center gap-2 rounded-md">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-400 font-mono text-xs font-bold text-slate-950" aria-hidden="true">
              Rx
            </span>
            <span className="text-sm font-semibold">AMC Prep</span>
          </button>
          <p className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="sr-only">Your progress: </span>
            <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-sky-100">
              L{level} {titleFor(level)}
            </span>
            <span>
              <span className="font-mono">{progress.points}</span> pts
            </span>
            <span>
              <span aria-hidden="true">🔥</span> <span className="font-mono">{progress.streak}</span>-day streak
            </span>
          </p>
        </header>

        <div className="flex-1">
          {view.name === "home" && (
            <Dashboard
              progress={progress}
              onStart={(mode) => setView({ name: "quiz", mode, run: Date.now() })}
              onPoker={() => setView({ name: "poker" })}
            />
          )}
          {view.name === "quiz" && (
            <Quiz key={view.run} mode={view.mode} progress={progress} onProgress={setProgress} onExit={() => setView({ name: "home" })} />
          )}
          {view.name === "poker" && <Poker progress={progress} onProgress={setProgress} onExit={() => setView({ name: "home" })} />}
        </div>

        <footer className="border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
          Demo content on invented sample data: not exam material and not medical advice. Replica of the product&apos;s dashboard and question flow.
        </footer>
      </div>
    </div>
  );
}
