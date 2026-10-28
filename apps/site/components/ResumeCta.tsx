import Link from "next/link";

/** Outlined companion to <EmailCta>, so the résumé is one click away from every page header. */
export function ResumeCta({ className = "", surface = "page" }: { className?: string; surface?: string }) {
  return (
    <Link
      href="/resume"
      data-cta="resume"
      data-surface={surface}
      className={`inline-flex items-center justify-center border border-accent/60 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:border-accent hover:bg-accent/10 ${className}`}
    >
      CV
    </Link>
  );
}
