"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { questions, type Confidence, type OptionId, type Question } from "./data";
import { accuracy, applyAnswer, weakest, type AnswerResult, type Mode, type Progress } from "./progress";

const SESSION_LENGTH = 5;

const confidenceOptions: { id: Confidence; label: string }[] = [
  { id: "guessing", label: "Guessing" },
  { id: "unsure", label: "Unsure" },
  { id: "confident", label: "Confident" },
];

interface Answered {
  question: Question;
  picked: OptionId;
  correct: boolean;
  confidence: Confidence | null;
  result: AnswerResult;
}

function buildSession(mode: Mode, progress: Progress): Question[] {
  if (mode === "topic") return questions.slice(0, SESSION_LENGTH);
  const order = weakest(progress.topics, 10).map((w) => w.name);
  return [...questions].sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic)).slice(0, SESSION_LENGTH);
}

export function Quiz({
  mode,
  progress,
  onProgress,
  onExit,
}: {
  mode: Mode;
  progress: Progress;
  onProgress: (next: Progress) => void;
  onExit: () => void;
}) {
  // The session order is fixed when the session starts, so live weakness updates do not reshuffle it.
  const [session] = useState(() => buildSession(mode, progress));
  const [index, setIndex] = useState(0);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [history, setHistory] = useState<Answered[]>([]);
  const [deepOpen, setDeepOpen] = useState(false);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLHeadingElement>(null);

  const q = session[index];

  useEffect(() => {
    if (answered) feedbackRef.current?.focus();
  }, [answered]);

  useEffect(() => {
    topRef.current?.focus();
  }, [index, done]);

  const submit = (picked: OptionId) => {
    if (answered) return;
    const correct = picked === q.correct;
    const result = applyAnswer(progress, q, correct, confidence, mode);
    const record: Answered = { question: q, picked, correct, confidence, result };
    onProgress(result.next);
    setAnswered(record);
    setHistory((h) => [...h, record]);
  };

  const next = () => {
    if (index + 1 >= session.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setAnswered(null);
    setConfidence(null);
    setDeepOpen(false);
  };

  const inDeck = progress.deck.includes(q.id);
  const toggleDeck = () => onProgress({ ...progress, deck: inDeck ? progress.deck.filter((id) => id !== q.id) : [...progress.deck, q.id] });

  const summary = useMemo(() => {
    const right = history.filter((h) => h.correct).length;
    const gained = history.reduce((s, h) => s + h.result.gained + h.result.bonus, 0);
    const missed = history.filter((h) => !h.correct).map((h) => h.question.topic);
    return { right, gained, missed: missed[0] ?? null };
  }, [history]);

  if (done) {
    return (
      <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="amc-summary">
        <h2 id="amc-summary" ref={topRef} tabIndex={-1} className="text-lg font-semibold outline-none">
          Shift complete
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-bg p-3">
            <dt className="text-xs text-muted">Accuracy</dt>
            <dd className="text-xl font-semibold">{Math.round((summary.right / session.length) * 100)}%</dd>
          </div>
          <div className="rounded-lg bg-bg p-3">
            <dt className="text-xs text-muted">Points</dt>
            <dd className="text-xl font-semibold">+{summary.gained}</dd>
          </div>
          <div className="rounded-lg bg-bg p-3">
            <dt className="text-xs text-muted">Streak</dt>
            <dd className="text-xl font-semibold">{progress.streak} d</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted">
          {summary.missed
            ? `Weakest topic this session: ${summary.missed}. It stays in your focus list for the next shift.`
            : "A clean session. The coach will raise the difficulty next time."}
        </p>
        <p className="mt-1 text-sm text-muted">Takeaway: re-read the memory hooks for anything you missed, then flag them for revision.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onExit} className="rounded-lg bg-sky-400 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300">
            Return to home
          </button>
        </div>
      </section>
    );
  }

  const chosen = answered ? q.options.find((o) => o.id === answered.picked) : null;
  const distractors = q.options.filter((o) => o.id !== q.correct);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={onExit} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg">
          Exit session
        </button>
        <span className="font-mono text-xs text-muted">
          {mode === "challenge" ? "Challenge Mode" : "Topic Mode"} · Q {index + 1} of {session.length}
        </span>
        <div
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={session.length}
          aria-valuenow={index + (answered ? 1 : 0)}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"
        >
          <div className="h-full bg-sky-400 transition-[width] duration-300" style={{ width: `${((index + (answered ? 1 : 0)) / session.length) * 100}%` }} />
        </div>
      </div>

      <section className="rounded-xl border border-line bg-surface p-4 @lg:p-5" aria-labelledby="amc-q-title">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-sky-200">{q.topic}</span>
          <span className="rounded-full border border-line px-2.5 py-1 text-muted">{q.difficulty}</span>
        </div>
        <h2 id="amc-q-title" ref={topRef} tabIndex={-1} className="sr-only outline-none">
          Question {index + 1}
        </h2>
        <p className="mt-3 text-sm leading-relaxed">{q.stem}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {q.facts.map((f) => (
            <li key={f} className="rounded-md bg-bg px-2 py-1 font-mono text-[11px] text-muted">
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold">{q.prompt}</p>

        <fieldset className="mt-3" disabled={!!answered}>
          <legend className="text-xs text-muted">How confident are you? (optional)</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {confidenceOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={confidence === c.id}
                onClick={() => setConfidence(confidence === c.id ? null : c.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  confidence === c.id ? "border-sky-300 bg-sky-400/20 text-sky-100" : "border-line text-muted hover:text-fg"
                } disabled:opacity-60`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <ul className="mt-4 space-y-2" aria-label="Answer options">
          {q.options.map((o) => {
            const isCorrect = answered && o.id === q.correct;
            const isWrongPick = answered && o.id === answered.picked && !answered.correct;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => submit(o.id)}
                  aria-disabled={!!answered}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    isCorrect
                      ? "border-emerald-400 bg-emerald-400/10"
                      : isWrongPick
                        ? "border-rose-400 bg-rose-400/10"
                        : "border-line bg-bg hover:border-sky-300/60"
                  } ${answered ? "cursor-default" : ""}`}
                >
                  <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current font-mono text-[11px] text-muted">
                    {o.id}
                  </span>
                  <span className="flex-1">{o.text}</span>
                  {isCorrect && <span className="shrink-0 text-xs font-semibold text-emerald-300">Correct</span>}
                  {isWrongPick && <span className="shrink-0 text-xs font-semibold text-rose-300">Your answer</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {answered && (
          <section className="space-y-3 rounded-xl border border-line bg-surface p-4 @lg:p-5" aria-label="Explanation">
            <div>
              <p className={`text-sm font-semibold ${answered.correct ? "text-emerald-300" : "text-amber-300"}`}>
                {answered.correct
                  ? answered.confidence === "guessing"
                    ? "Correct. You marked Guessing, so it is worth locking in the reasoning below."
                    : "Correct. Good clinical reasoning."
                  : answered.confidence === "confident"
                    ? "Not quite. This is a common pitfall, and a confident miss is the most valuable one to learn from."
                    : "Not quite. This is a common pitfall, and most candidates need a few passes."}
              </p>
              <p className="mt-1 text-xs text-muted">
                {answered.result.gained > 0 ? `+${answered.result.gained} points. ` : "No points this time. "}
                {q.topic} accuracy {answered.result.before}% to {answered.result.after}%.
                {answered.result.events.length > 0 && ` ${answered.result.events.join(". ")}.`}
              </p>
            </div>

            {chosen && !answered.correct && (
              <p className="rounded-lg bg-bg p-3 text-sm">
                <span className="font-semibold">Why {chosen.id} is less appropriate:</span> {chosen.why}
              </p>
            )}

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">Quick rationale</h3>
              <p className="mt-1 text-sm leading-relaxed">{q.quick}</p>
            </div>

            <div>
              <button
                type="button"
                aria-expanded={deepOpen}
                aria-controls="amc-deep"
                onClick={() => setDeepOpen(!deepOpen)}
                className="text-sm font-semibold text-sky-300 underline-offset-4 hover:underline"
              >
                {deepOpen ? "Hide deep dive" : "Show deep dive"}
              </button>
              {deepOpen && (
                <div id="amc-deep" className="mt-2 space-y-2 border-l-2 border-sky-400/40 pl-3 text-sm leading-relaxed text-fg/90">
                  {q.deep.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">Why the other options are weaker</h3>
              <ul className="mt-1 space-y-1.5 text-sm">
                {distractors.map((o) => (
                  <li key={o.id} className="flex gap-2">
                    <span className="font-mono text-xs text-muted">{o.id}</span>
                    <span>
                      <span className="text-muted">{o.text}.</span> {o.why}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="rounded-lg border border-sky-400/40 bg-sky-400/10 p-3 text-sm">
              <span className="font-semibold text-sky-200">Memory hook:</span> {q.hook}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={next} className="rounded-lg bg-sky-400 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300">
                {index + 1 >= session.length ? "See session summary" : "Next question"}
              </button>
              <button
                type="button"
                aria-pressed={inDeck}
                onClick={toggleDeck}
                className="rounded-lg border border-line px-3.5 py-2 text-sm text-fg hover:border-sky-300/60"
              >
                {inDeck ? "In revision deck" : "Add to revision deck"}
              </button>
              <span className="font-mono text-xs text-muted">
                {topicLine(progress, q)}
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function topicLine(progress: Progress, q: Question) {
  const stat = progress.topics[q.topic];
  return stat ? `${q.topic}: ${accuracy(stat)}% over ${stat.attempted}` : "";
}
