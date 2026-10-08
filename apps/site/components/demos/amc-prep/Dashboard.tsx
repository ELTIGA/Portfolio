"use client";

import { DAILY_TARGET, STREAK_MILESTONE, accuracy, levelFor, levelProgress, titleFor, weakest, type Mode, type Progress } from "./progress";

const tile = "rounded-xl border border-line bg-surface p-4";
const eyebrow = "font-mono text-[11px] uppercase tracking-widest text-sky-300";
const primaryBtn =
  "rounded-lg bg-sky-400 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-offset-2";
const ghostBtn = "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-fg transition hover:border-sky-300/60";

function Bar({ pct, label, tone = "bg-sky-400" }: { pct: number; label: string; tone?: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 overflow-hidden rounded-full bg-bg">
      <div className={`h-full rounded-full transition-[width] duration-500 ${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export function Dashboard({
  progress,
  onStart,
  onPoker,
}: {
  progress: Progress;
  onStart: (mode: Mode) => void;
  onPoker: () => void;
}) {
  const level = levelFor(progress.points);
  const lp = levelProgress(progress.points);
  const weak = weakest(progress.topics, 3);
  const remaining = Math.max(0, DAILY_TARGET - progress.answeredToday);
  const toMilestone = Math.max(0, STREAK_MILESTONE - progress.streak);
  const worst = weak[0];

  const insight =
    progress.confidentMisses > 2
      ? `You have ${progress.confidentMisses} confident misses logged. Those are the highest-priority gaps, so review them before adding new volume.`
      : `${worst.name} is your weakest area at ${worst.pct}%. A short Challenge Mode set targets it directly.`;

  return (
    <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-6">
      <section aria-labelledby="amc-shift" className={`${tile} @2xl:col-span-4`}>
        <p className={eyebrow}>Today&apos;s shift</p>
        <h2 id="amc-shift" className="mt-1 text-lg font-semibold">
          Welcome back, Dr. Sample
        </h2>
        {remaining > 0 ? (
          <p className="mt-1 text-sm text-muted">
            {remaining} more {remaining === 1 ? "question" : "questions"} to unlock today&apos;s x1.5 bonus. Estimated time about {remaining * 2} minutes.
          </p>
        ) : (
          <p className="mt-1 text-sm text-emerald-300">Shift target complete and today&apos;s x1.5 bonus is active. Keep going for extra points.</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <Bar pct={Math.round((Math.min(progress.answeredToday, DAILY_TARGET) / DAILY_TARGET) * 100)} label="Questions toward today's bonus" />
          </div>
          <span className="font-mono text-xs text-muted">
            {progress.answeredToday}/{DAILY_TARGET}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">Focus today:</span>
          {weak.slice(0, 2).map((w) => (
            <span key={w.name} className="rounded-full border border-line px-2.5 py-1">
              {w.name}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onStart("topic")} className={primaryBtn}>
            Start shift
          </button>
          <span className="self-center text-xs text-muted">Topic Mode, 5 cases, 5 points per correct answer</span>
        </div>
      </section>

      <section aria-labelledby="amc-rank" className={`${tile} @2xl:col-span-2`}>
        <p className={eyebrow}>Progress and rank</p>
        <h2 id="amc-rank" className="mt-1 text-lg font-semibold">
          Level {level} <span className="text-sky-300">{titleFor(level)}</span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          <span className="font-mono text-fg">{progress.points}</span> points, {lp.size - lp.into} to level {level + 1}
        </p>
        <div className="mt-2">
          <Bar pct={lp.pct} label={`Progress to level ${level + 1}`} />
        </div>
        <p className="mt-3 text-sm">
          <span aria-hidden="true">🔥</span> <span className="font-semibold">{progress.streak}-day streak</span>
        </p>
        <p className="text-xs text-muted">
          {progress.streakSecured ? "Today is secured. " : "Answer 10 today to count this day. "}
          {toMilestone > 0 ? `${toMilestone} day${toMilestone === 1 ? "" : "s"} to the 7-day badge.` : "7-day badge earned."}
        </p>
      </section>

      <section aria-labelledby="amc-weak" className={`${tile} @2xl:col-span-3`}>
        <p className={eyebrow}>Weakest topics</p>
        <h2 id="amc-weak" className="sr-only">
          Weakest topics
        </h2>
        <ul className="mt-2 space-y-3">
          {weak.map((w) => (
            <li key={w.name}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{w.name}</span>
                <span className="font-mono text-xs text-muted">
                  {accuracy(w.stat)}% of {w.stat.attempted}
                </span>
              </div>
              <div className="mt-1">
                <Bar pct={w.pct} label={`${w.name} accuracy`} tone={w.pct < 55 ? "bg-amber-400" : "bg-sky-400"} />
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => onStart("challenge")} className={`${ghostBtn} mt-4`}>
          Train in Challenge Mode
        </button>
        <span className="ml-2 text-xs text-muted">7 points per correct answer</span>
      </section>

      <section aria-labelledby="amc-coach" className={`${tile} @2xl:col-span-3`}>
        <p className={eyebrow}>AI coach snapshot</p>
        <h2 id="amc-coach" className="sr-only">
          AI coach snapshot
        </h2>
        <p className="mt-2 text-sm leading-relaxed">{insight}</p>
        <p className="mt-2 text-xs text-muted">Senior-registrar tone: this is a tricky area, and most candidates need a few passes.</p>
        <p className="mt-3 text-xs text-muted">
          Revision deck: <span className="font-mono text-fg">{progress.deck.length}</span> flagged
        </p>
      </section>

      <section aria-labelledby="amc-poker" className={`${tile} @2xl:col-span-3`}>
        <p className={eyebrow}>Clinical Poker: symptom rounds</p>
        <h2 id="amc-poker" className="sr-only">
          Clinical Poker
        </h2>
        <p className="mt-2 text-sm text-muted">Pattern recognition with diagnosis and symptom cards. Earns pattern XP, not base points.</p>
        <p className="mt-2 text-xs">
          <span className="font-mono">{progress.pokerLeft}</span> rounds remaining today, <span className="font-mono">{progress.patternXp}</span> pattern XP
        </p>
        <button type="button" onClick={onPoker} disabled={progress.pokerLeft === 0} className={`${ghostBtn} mt-3 disabled:opacity-50`}>
          Play Clinical Poker
        </button>
      </section>

      <section aria-labelledby="amc-news" className={`${tile} @2xl:col-span-3`}>
        <p className={eyebrow}>Announcements</p>
        <h2 id="amc-news" className="sr-only">
          Announcements
        </h2>
        <p className="mt-2 text-sm">Cardiology Week starts Monday: themed banners, a bonus quest and focused tips.</p>
        <p className="mt-1 text-xs text-muted">Daily quest: complete 1 Challenge Mode session.</p>
      </section>
    </div>
  );
}
