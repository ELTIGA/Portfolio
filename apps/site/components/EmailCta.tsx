import { profile } from "@portfolio/content";

const subject = encodeURIComponent("Hello Ahmed");

export function EmailCta({ className = "", label = "Email me", surface = "page" }: { className?: string; label?: string; surface?: string }) {
  return (
    <a
      href={`mailto:${profile.email}?subject=${subject}`}
      data-cta="email"
      data-cursor="mail"
      data-surface={surface}
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-accent px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink transition-shadow hover:shadow-[0_0_40px_-4px_rgb(255_181_71/0.7)] ${className}`}
    >
      <span className="relative">{label}</span>
      <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
    </a>
  );
}
