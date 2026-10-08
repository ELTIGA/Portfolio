import { profile } from "@portfolio/content";

const subject = encodeURIComponent("Opportunity: saw your portfolio");

export function EmailCta({ className = "", label = "Email me", surface = "page" }: { className?: string; label?: string; surface?: string }) {
  return (
    <a
      href={`mailto:${profile.email}?subject=${subject}`}
      data-cta="email"
      data-surface={surface}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110 ${className}`}
    >
      <span aria-hidden="true" className="font-mono">{">"}</span>
      {label}
    </a>
  );
}
