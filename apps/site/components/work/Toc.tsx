"use client";

import { useEffect, useState } from "react";

/** Sticky file index for a case study; highlights the section currently being read. */
export function Toc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Case study sections" className="sticky top-28 hidden lg:block">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">file index</p>
      <ol className="mt-5 space-y-1 border-l border-line">
        {items.map((it, i) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px flex gap-3 border-l py-1.5 pl-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${on ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"}`}
              >
                <span className={on ? "text-accent" : ""}>{String(i + 1).padStart(2, "0")}</span>
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
