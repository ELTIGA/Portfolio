import type { ReactNode } from "react";

/**
 * Homepage section. The header is a ruled readout: a short code on the left and a
 * plain fact about the section on the right, then the title, which decodes on view.
 */
export function Section({
  id,
  code,
  readout,
  title,
  children,
  className = "",
}: {
  id: string;
  code: string;
  readout?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32 ${className}`}>
      <div data-reveal="wipe" className="flex items-center gap-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{code}</span>
        {readout && <span className="ml-auto text-right">{readout}</span>}
      </div>
      <h2 id={`${id}-title`} data-scramble className="font-display mt-6 text-5xl font-extrabold uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl">
        {title}
      </h2>
      <div className="mt-12 sm:mt-16">{children}</div>
    </section>
  );
}
