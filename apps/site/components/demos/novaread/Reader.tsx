"use client";

import { useEffect, useRef, useState } from "react";
import type { Book, SavedQuote } from "./data";
import { useReducedMotion } from "./useReducedMotion";

type Kind = "explain" | "simplify" | "note";

interface Msg {
  id: number;
  kind: Kind;
  quote: string;
  text: string;
  voice: boolean;
}

const btn =
  "rounded-lg border px-2.5 py-1 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-45";

/**
 * Bring `el` into view inside its nearest scrolling ancestor only. scrollIntoView would
 * also scroll the page around the demo when the preview is partly off-screen.
 */
function revealInDemo(el: HTMLElement | null, reduced: boolean) {
  let box = el?.parentElement ?? null;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
  if (!el || !box || box === document.scrollingElement || box === document.body) return;
  const r = el.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const delta = r.bottom > b.bottom ? Math.min(r.bottom - b.bottom, r.top - b.top) : r.top < b.top ? r.top - b.top : 0;
  if (delta) box.scrollBy({ top: delta, behavior: reduced ? "auto" : "smooth" });
}

export function Reader({ book, quotes, onSave }: { book: Book; quotes: SavedQuote[]; onSave: (q: Omit<SavedQuote, "id" | "when">) => boolean }) {
  const reduced = useReducedMotion();
  const articleRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(0);

  const [active, setActive] = useState<number | null>(null);
  const [dragText, setDragText] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [typing, setTyping] = useState<{ id: number; len: number } | null>(null);
  const [typed, setTyped] = useState(0);
  const [voice, setVoice] = useState(false);

  const count = book.sentences.length;
  const quote = active === null ? null : (dragText ?? book.sentences[active].text);

  // Free text selection with the mouse or touch handles; the buttons below are the keyboard path.
  useEffect(() => {
    const onSelection = () => {
      const sel = window.getSelection();
      const root = articleRef.current;
      if (!sel || sel.isCollapsed || !root || !sel.anchorNode || !sel.focusNode) return;
      if (!root.contains(sel.anchorNode) || !root.contains(sel.focusNode)) return;
      const el = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode.parentElement;
      const sid = el?.closest("[data-sid]")?.getAttribute("data-sid");
      const text = sel.toString().replace(/\s+/g, " ").trim();
      if (sid === null || sid === undefined || !text) return;
      setActive(Number(sid));
      setDragText(text);
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  // Typing animation, advanced on an interval that is always cleaned up.
  useEffect(() => {
    if (!typing) return;
    if (reduced) {
      return;
    }
    let n = 0;
    const iv = setInterval(() => {
      n += 3;
      setTyped(n);
      if (n >= typing.len) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [typing, reduced]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typed, pending]);

  const choose = (i: number) => {
    setActive(i);
    setDragText(null);
    window.getSelection()?.removeAllRanges();
  };

  const step = (delta: number) => choose(active === null ? (delta > 0 ? 0 : count - 1) : (active + delta + count) % count);

  const push = (m: Omit<Msg, "id">) => {
    seq.current += 1;
    const msg = { ...m, id: seq.current };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const ask = (kind: "explain" | "simplify") => {
    if (active === null || !quote || pending) return;
    const sentence = book.sentences[active];
    const asked = quote;
    push({ kind, quote: asked, text: kind === "explain" ? "Explain this" : "Simplify this", voice });
    setPending(true);
    revealInDemo(panelRef.current, reduced);
    const t = setTimeout(
      () => {
        const reply = sentence[kind];
        const msg = push({ kind, quote: "", text: reply, voice });
        setPending(false);
        setTyped(reduced ? reply.length : 0);
        setTyping({ id: msg.id, len: reply.length });
      },
      reduced ? 0 : 600,
    );
    timers.current.push(t);
  };

  const save = () => {
    if (!quote) return;
    const added = onSave({ book: book.title, text: quote });
    push({ kind: "note", quote: "", text: added ? "Saved to your Memory." : "That quote is already in your Memory.", voice: false });
    setTyping(null);
    revealInDemo(panelRef.current, reduced);
  };

  const typingNow = (m: Msg) => typing?.id === m.id && !reduced && typed < typing.len;
  const lastDone = [...messages].reverse().find((m) => m.quote === "" && !typingNow(m));

  return (
    <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-violet-300">{book.chapter}</p>
        <h2 className="mt-1 text-xl font-semibold">{book.title}</h2>
        <p className="text-sm text-muted">{book.author}</p>

        <div role="toolbar" aria-label="Reading tools" className="sticky top-0 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/95 p-2 backdrop-blur">
          <button type="button" onClick={() => step(-1)} className={`${btn} border-line hover:border-violet-300/60`} aria-label="Previous sentence">
            &larr;
          </button>
          <button type="button" onClick={() => step(1)} className={`${btn} border-line hover:border-violet-300/60`} aria-label="Next sentence">
            &rarr;
          </button>
          <span className="mx-1 hidden h-5 w-px bg-line @sm:block" aria-hidden="true" />
          <button type="button" disabled={active === null || pending} onClick={() => ask("explain")} className={`${btn} border-violet-300/60 bg-violet-400/15 text-violet-100 hover:bg-violet-400/25`}>
            Explain
          </button>
          <button type="button" disabled={active === null || pending} onClick={() => ask("simplify")} className={`${btn} border-violet-300/60 bg-violet-400/15 text-violet-100 hover:bg-violet-400/25`}>
            Simplify
          </button>
          <button type="button" disabled={active === null} onClick={save} className={`${btn} border-amber-300/60 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20`}>
            Save quote
          </button>
          <p className="basis-full truncate text-xs text-muted" aria-live="polite">
            {active === null
              ? "Select text, click a sentence, or use the arrow buttons."
              : `Sentence ${active + 1} of ${count}${dragText ? ", custom selection" : ""} selected.`}
          </p>
        </div>

        <article ref={articleRef} aria-label={`${book.title}, sample passage`} className="mt-3 rounded-xl border border-line bg-[#14110f] p-5 font-serif text-[17px] leading-8 text-stone-100 @lg:p-7">
          <p>
            {book.sentences.map((s, i) => {
              const saved = quotes.some((q) => q.text === s.text);
              return (
                <span key={s.text}>
                  <span
                    data-sid={i}
                    onClick={() => {
                      if (window.getSelection()?.isCollapsed ?? true) choose(i);
                    }}
                    className={`cursor-pointer rounded px-0.5 transition-colors ${
                      active === i ? "bg-violet-400/30 outline outline-1 outline-violet-300/70" : "hover:bg-white/5"
                    } ${saved ? "underline decoration-amber-300 decoration-2 underline-offset-4" : ""}`}
                  >
                    {s.text}
                  </span>{" "}
                </span>
              );
            })}
          </p>
        </article>
        <p className="mt-2 text-xs text-muted">Original sample text written for this demo. Underlined sentences are saved to Memory.</p>
      </div>

      <div ref={panelRef} className="@3xl:sticky @3xl:top-3 @3xl:self-start">
        <section className="flex flex-col rounded-xl border border-line bg-surface" aria-labelledby="nr-ai">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <h3 id="nr-ai" className="text-sm font-semibold">
              NovaRead assistant
            </h3>
            <button
              type="button"
              aria-pressed={voice}
              onClick={() => setVoice(!voice)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                voice ? "border-rose-300 bg-rose-400/15 text-rose-100" : "border-line text-muted hover:text-fg"
              }`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <rect x="7" y="2.5" width="6" height="10" rx="3" />
                <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" />
              </svg>
              {voice ? "Voice on" : "Voice"}
            </button>
          </div>
          {voice && (
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs text-rose-100">
              <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((b) => (
                  <span key={b} className="w-0.5 rounded bg-rose-300 motion-safe:animate-pulse" style={{ height: `${6 + ((b * 5) % 9)}px`, animationDelay: `${b * 120}ms` }} />
                ))}
              </span>
              Visual state only: no microphone is used.
            </div>
          )}
          <ol ref={listRef} className="max-h-72 min-h-40 space-y-3 overflow-y-auto p-3" aria-label="Conversation">
            {messages.length === 0 && !pending && (
              <li className="text-sm text-muted">Pick a sentence, then choose Explain or Simplify. Replies in this demo are pre-written, not live model calls.</li>
            )}
            {messages.map((m) => (
              <li key={m.id} className={m.quote ? "ml-6" : ""}>
                {m.quote ? (
                  <div className="rounded-lg bg-bg p-2.5 text-sm">
                    <p className="text-xs font-semibold text-muted">{m.text}{m.voice ? " (voice)" : ""}</p>
                    <p className="mt-1 line-clamp-3 border-l-2 border-violet-300/60 pl-2 font-serif text-[13px] italic text-fg/85">{m.quote}</p>
                  </div>
                ) : (
                  <div className={`rounded-lg p-2.5 text-sm leading-relaxed ${m.kind === "note" ? "bg-amber-400/10 text-amber-100" : "bg-violet-400/10"}`}>
                    {m.kind !== "note" && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                        {m.kind === "explain" ? "Explanation" : "Simpler version"}
                        {m.voice ? " (voice style)" : ""}
                      </p>
                    )}
                    <span aria-hidden={typingNow(m)}>{typingNow(m) ? m.text.slice(0, typed) : m.text}</span>
                    {typingNow(m) && <span className="ml-0.5 inline-block h-3.5 w-1 translate-y-0.5 bg-violet-300 motion-safe:animate-pulse" aria-hidden="true" />}
                  </div>
                )}
              </li>
            ))}
            {pending && <li className="text-xs text-muted">NovaRead is thinking…</li>}
          </ol>
          <p className="sr-only" role="status" aria-live="polite">
            {lastDone?.text}
          </p>
        </section>
      </div>
    </div>
  );
}
