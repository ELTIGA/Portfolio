import Link from "next/link";
import { EmailCta } from "@/components/EmailCta";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 text-center">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />
      <div aria-hidden="true" className="atmosphere" />
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-alert">
          <span className="blink mr-2 inline-block h-1.5 w-1.5 bg-alert align-middle" />
          error 404 · signal lost
        </p>
        <h1 data-text="No signal here" className="glitch font-display mt-6 text-7xl font-black uppercase leading-[0.85] sm:text-9xl">
          No signal here
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted">This address doesn&apos;t point anywhere. The link may be old; the work is one click away.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-line px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Go to the portfolio
          </Link>
          <EmailCta surface="404" />
        </div>
      </div>
    </main>
  );
}
