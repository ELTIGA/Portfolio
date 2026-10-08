"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PARSE_LABEL, PROVIDERS, PROVIDER_ORDER, chainFor, flaggedCount, runExtraction } from "./calc";
import type { ExtractProvider, Extraction, Manifest, Passenger } from "./types";
import { Btn, Card, Chip, Icon, cx, labelCls } from "./ui";

const DURATION = 1900;
const TICK = 80;

function phases(requested: ExtractProvider): string[] {
  const chain = chainFor(requested);
  if (PROVIDERS[requested].flaky) {
    return ["Queueing extraction job", `Calling ${requested}`, `${requested} timed out (8s), falling back`, `Calling ${chain[1]}`, "Validating against passenger schema", "Normalizing hotels and pickup times"];
  }
  return ["Queueing extraction job", `Calling ${requested}`, "Validating against passenger schema", "Normalizing hotels and pickup times", "Scoring row confidence"];
}

export function ProviderPanel({ manifest, onResult }: { manifest: Manifest; onResult: (passengers: Passenger[], extraction: Extraction) => void }) {
  const selectId = useId();
  const { extraction } = manifest;
  const [choice, setChoice] = useState<ExtractProvider>(() => PROVIDER_ORDER.find((p) => p !== extraction.provider) ?? "deepseek_chat");
  const [progress, setProgress] = useState<number | null>(null);
  const [requested, setRequested] = useState<ExtractProvider>(choice);
  const timer = useRef<number | null>(null);
  const flagged = flaggedCount(manifest.passengers);
  const running = progress !== null;

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  const start = () => {
    if (running) return;
    const target = choice;
    setRequested(target);
    setProgress(0);
    let elapsed = 0;
    timer.current = window.setInterval(() => {
      elapsed += TICK;
      if (elapsed >= DURATION) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        const result = runExtraction(manifest.id, manifest.rows, target);
        setProgress(null);
        onResult(result.passengers, result.extraction);
        return;
      }
      setProgress(elapsed / DURATION);
    }, TICK);
  };

  const steps = phases(requested);
  const stepLabel = progress === null ? "" : steps[Math.min(steps.length - 1, Math.floor(progress * steps.length))];

  return (
    <Card className="p-3 @md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Provider routing</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-(--v-muted)">
          Parsed by <Chip mono>{PARSE_LABEL[manifest.parseProvider]}</Chip>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 @lg:grid-cols-4">
        <div className="col-span-2 min-w-0 @lg:col-span-1">
          <dt className={labelCls}>Handled by</dt>
          <dd className="mt-0.5 truncate font-mono text-[13px] font-semibold" title={extraction.provider}>
            {extraction.provider}
          </dd>
        </div>
        <div>
          <dt className={labelCls}>Latency</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{(extraction.ms / 1000).toFixed(2)}s</dd>
        </div>
        <div>
          <dt className={labelCls}>Confidence</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{extraction.confidence}%</dd>
        </div>
        <div>
          <dt className={labelCls}>Flagged rows</dt>
          <dd className={cx("mt-0.5 text-sm font-semibold tabular-nums", flagged > 0 && "text-(--v-warn)")}>{flagged}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <p className={labelCls}>Fallback chain</p>
        <ol className="mt-1.5 grid gap-1.5 @lg:grid-cols-3">
          {extraction.attempts.map((a, i) => (
            <li key={a.provider} className="flex min-w-0 items-start gap-2 rounded-lg border border-(--v-line) bg-(--v-bg) p-2">
              <span
                className={cx(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white",
                  a.outcome === "succeeded" && "bg-(--v-ok)",
                  a.outcome === "failed" && "bg-(--v-bad)",
                  a.outcome === "standby" && "bg-(--v-muted)",
                )}
                aria-hidden="true"
              >
                {a.outcome === "succeeded" ? <Icon name="check" size={12} /> : a.outcome === "failed" ? "!" : i + 1}
              </span>
              <span className="min-w-0 text-xs">
                <span className="block truncate font-mono font-semibold" title={a.provider}>
                  {a.provider}
                </span>
                <span className="block text-(--v-muted)">
                  <span className="sr-only">{a.outcome}: </span>
                  {a.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-(--v-line) pt-3">
        <div className="min-w-44 flex-1">
          <label htmlFor={selectId} className={labelCls}>
            Re-run with…
          </label>
          <select
            id={selectId}
            value={choice}
            disabled={running}
            onChange={(e) => setChoice(e.target.value as ExtractProvider)}
            className="mt-1 h-9 w-full rounded-lg border border-(--v-line) bg-white px-2 font-mono text-xs disabled:opacity-60"
          >
            {PROVIDER_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
                {p === extraction.provider ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <Btn variant="primary" onClick={start} disabled={running} aria-describedby={`${selectId}-hint`}>
          <Icon name="refresh" size={14} />
          {running ? "Running…" : "Re-run"}
        </Btn>
      </div>
      <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-(--v-muted)">
        {PROVIDERS[choice].label}: {PROVIDERS[choice].blurb}.{PROVIDERS[choice].flaky ? " Simulates a timeout so the fallback chain kicks in." : ""} Re-running replaces edits with fresh output.
      </p>

      {running && (
        <div className="mt-2">
          <div
            role="progressbar"
            aria-label="Extraction progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((progress ?? 0) * 100)}
            className="h-1.5 overflow-hidden rounded-full bg-(--v-soft)"
          >
            <div className="h-full rounded-full bg-(--v-primary)" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
          </div>
          <p className="mt-1 font-mono text-xs text-(--v-muted)">{stepLabel}…</p>
        </div>
      )}
    </Card>
  );
}
