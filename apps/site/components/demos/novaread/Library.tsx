"use client";

import { books, type Book } from "./data";

export function Library({ onOpen }: { onOpen: (b: Book) => void }) {
  const current = books[0];
  return (
    <div>
      <h2 className="text-lg font-semibold">Your library</h2>
      <p className="text-sm text-muted">Pick up where you left off, or start something new. Sample books and passages are invented for this demo.</p>

      <button
        type="button"
        onClick={() => onOpen(current)}
        className="mt-4 flex w-full items-center gap-4 rounded-xl border border-violet-300/40 bg-violet-400/10 p-3 text-left transition hover:border-violet-300"
      >
        <span className={`h-20 w-14 shrink-0 rounded-md bg-gradient-to-br ${current.cover} shadow`} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-violet-300">Continue reading</span>
          <span className="block truncate text-base font-semibold">{current.title}</span>
          <span className="block text-xs text-muted">{current.chapter}</span>
        </span>
        <span className="hidden rounded-lg bg-violet-300 px-3 py-1.5 text-sm font-semibold text-violet-950 @sm:block">Resume</span>
      </button>

      <ul className="mt-4 grid grid-cols-1 gap-3 @lg:grid-cols-2 @3xl:grid-cols-4">
        {books.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onOpen(b)}
              className="group flex h-full w-full gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-violet-300/60 @3xl:flex-col"
            >
              <span className={`flex h-28 w-20 shrink-0 items-end rounded-md bg-gradient-to-br p-2 shadow @3xl:h-36 @3xl:w-full ${b.cover}`} aria-hidden="true">
                <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-white/90">{b.title}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold leading-snug">{b.title}</span>
                <span className="text-xs text-muted">{b.author}</span>
                <span className="mt-auto pt-3">
                  <span
                    role="progressbar"
                    aria-label={`${b.title} progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={b.progress}
                    className="block h-1.5 overflow-hidden rounded-full bg-bg"
                  >
                    <span className="block h-full rounded-full bg-violet-300" style={{ width: `${b.progress}%` }} />
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {b.progress === 0 ? "Not started" : b.progress === 100 ? "Finished" : `${b.progress}% read`}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
