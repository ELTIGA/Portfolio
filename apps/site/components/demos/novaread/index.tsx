"use client";

import { useRef, useState } from "react";
import { books, seedQuotes, type Book, type SavedQuote } from "./data";
import { Library } from "./Library";
import { Memory } from "./Memory";
import { Reader } from "./Reader";

type Screen = "library" | "reader" | "memory";

/** NovaRead replica: library, reading screen with canned AI help, and a Memory screen. No network, no microphone. */
export default function Demo() {
  const [screen, setScreen] = useState<Screen>("library");
  const [book, setBook] = useState<Book>(books[0]);
  const [quotes, setQuotes] = useState<SavedQuote[]>(seedQuotes);
  const nextId = useRef(0);

  const open = (b: Book) => {
    setBook(b);
    setScreen("reader");
  };

  const save = (q: Omit<SavedQuote, "id" | "when">) => {
    if (quotes.some((x) => x.text === q.text)) return false;
    setQuotes((prev) => [{ ...q, id: `q-${++nextId.current}`, when: "Saved just now" }, ...prev]);
    return true;
  };

  const tab = (id: Screen, label: string, extra?: string) => (
    <button
      type="button"
      aria-current={screen === id ? "page" : undefined}
      onClick={() => setScreen(id)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        screen === id ? "bg-violet-400/20 text-violet-100" : "text-muted hover:text-fg"
      }`}
    >
      {label}
      {extra && <span className="ml-1.5 rounded-full bg-violet-300 px-1.5 py-px text-[10px] font-semibold text-violet-950">{extra}</span>}
    </button>
  );

  return (
    <div className="@container h-full overflow-y-auto bg-bg text-fg">
      <div className="mx-auto max-w-5xl p-3 @lg:p-5">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-300 text-violet-950" aria-hidden="true">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M10 2.5 11.8 8l5.7 1.8-5.7 1.8L10 17.5l-1.8-5.9L2.5 9.8 8.2 8 10 2.5Z" />
              </svg>
            </span>
            NovaRead
          </span>
          <nav aria-label="NovaRead sections" className="ml-auto flex gap-1">
            {tab("library", "Library")}
            {tab("reader", "Reading")}
            {tab("memory", "Memory", String(quotes.length))}
          </nav>
        </header>

        <main className="mt-4">
          {screen === "library" && <Library onOpen={open} />}
          {screen === "reader" && <Reader key={book.id} book={book} quotes={quotes} onSave={save} />}
          {screen === "memory" && <Memory quotes={quotes} onRemove={(id) => setQuotes((prev) => prev.filter((q) => q.id !== id))} onLibrary={() => setScreen("library")} />}
        </main>
      </div>
    </div>
  );
}
