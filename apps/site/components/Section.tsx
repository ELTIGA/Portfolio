export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
