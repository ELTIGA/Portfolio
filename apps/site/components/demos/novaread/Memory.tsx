"use client";

import type { SavedQuote } from "./data";

export function Memory({ quotes, onRemove, onLibrary }: { quotes: SavedQuote[]; onRemove: (id: string) => void; onLibrary: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Memory</h2>
      <p className="text-sm text-muted">Quotes you saved while reading, kept together so they are easy to revisit.</p>
      {quotes.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Nothing saved yet.{" "}
          <button type="button" onClick={onLibrary} className="text-violet-300 underline underline-offset-4">
            Open a book
          </button>{" "}
          and choose Save quote.
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 @2xl:grid-cols-2">
          {quotes.map((q) => (
            <li key={q.id} className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-4">
              <blockquote className="border-l-2 border-amber-300 pl-3 font-serif text-[15px] leading-relaxed text-stone-100">{q.text}</blockquote>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
                <span className="min-w-0 truncate">
                  {q.book} · {q.when}
                </span>
                <button type="button" onClick={() => onRemove(q.id)} className="shrink-0 rounded-md border border-line px-2 py-1 hover:text-fg" aria-label={`Remove quote from ${q.book}`}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
