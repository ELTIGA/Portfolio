"use client";

import { useRef, useState } from "react";
import { pokerRounds, type PokerCard } from "./data";
import type { Progress } from "./progress";

const PICKS = 4;
const points = { strong: 2, supportive: 1, misleading: -1 } as const;
const label = { strong: "High-yield", supportive: "Supportive", misleading: "Misleading" } as const;
const tone = {
  strong: "border-emerald-400 bg-emerald-400/10 text-emerald-200",
  supportive: "border-sky-300 bg-sky-400/10 text-sky-100",
  misleading: "border-rose-400 bg-rose-400/10 text-rose-200",
} as const;

export function Poker({ progress, onProgress, onExit }: { progress: Progress; onProgress: (p: Progress) => void; onExit: () => void }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [earned, setEarned] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const round = pokerRounds[roundIdx % pokerRounds.length];
  const hand = round.cards.filter((c) => picked.includes(c.id));

  const toggle = (id: string) => {
    if (revealed) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < PICKS ? [...p, id] : p));
  };

  const play = () => {
    const score = hand.reduce((s, c) => s + points[c.kind], 0);
    const xp = Math.max(0, score) * 10;
    setEarned(xp);
    setRevealed(true);
    onProgress({ ...progress, pokerLeft: Math.max(0, progress.pokerLeft - 1), patternXp: progress.patternXp + xp });
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const again = () => {
    setRoundIdx(roundIdx + 1);
    setPicked([]);
    setRevealed(false);
  };

  const best = [...round.cards].sort((a, b) => points[b.kind] - points[a.kind]).slice(0, PICKS);
  const bestScore = best.reduce((s, c) => s + points[c.kind], 0);
  const score = hand.reduce((s, c) => s + points[c.kind], 0);

  return (
    <section className="space-y-3" aria-labelledby="poker-title">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg">
          Back to home
        </button>
        <span className="font-mono text-xs text-muted">
          {progress.pokerLeft} rounds left today · {progress.patternXp} pattern XP
        </span>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 @lg:p-5">
        <p className="font-mono text-[11px] uppercase tracking-widest text-sky-300">Clinical Poker: symptom rounds</p>
        <h2 id="poker-title" className="mt-1 text-lg font-semibold">
          Central diagnosis: {round.diagnosis}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {round.prompt} <span className="font-mono text-fg">{picked.length}/{PICKS}</span> selected. No base points; this round earns pattern XP.
        </p>

        <ul className="mt-3 grid grid-cols-1 gap-2 @lg:grid-cols-2">
          {round.cards.map((c: PokerCard) => {
            const on = picked.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c.id)}
                  disabled={revealed || (!on && picked.length >= PICKS)}
                  className={`flex h-full w-full flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    revealed ? tone[c.kind] : on ? "border-sky-300 bg-sky-400/15" : "border-line bg-bg hover:border-sky-300/60"
                  } ${!on && !revealed && picked.length >= PICKS ? "opacity-50" : ""}`}
                >
                  <span>{c.text}</span>
                  {revealed && (
                    <span className="text-xs">
                      <span className="font-semibold">{label[c.kind]}{on ? " (your pick)" : ""}.</span> {c.note}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {!revealed ? (
          <button
            type="button"
            onClick={play}
            disabled={picked.length !== PICKS}
            className="mt-4 rounded-lg bg-sky-400 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Play hand
          </button>
        ) : null}
      </div>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {revealed && (
          <div className="rounded-xl border border-line bg-surface p-4 @lg:p-5">
            <p className="text-sm font-semibold">
              Hand score {score} of a possible {bestScore}. +{earned} pattern XP.
            </p>
            <p className="mt-1 text-sm text-muted">
              {score === bestScore
                ? "A textbook hand: specific findings first, with a risk factor or compatible sign to round it out."
                : "Misleading cards pull toward other diagnoses, and non-specific findings add less than specific ones. Replay to see the contrast."}
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={again} disabled={progress.pokerLeft === 0} className="rounded-lg bg-sky-400 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-50">
                {progress.pokerLeft === 0 ? "No rounds left today" : "Next round"}
              </button>
              <button type="button" onClick={onExit} className="rounded-lg border border-line px-3.5 py-2 text-sm hover:border-sky-300/60">
                Back to home
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
