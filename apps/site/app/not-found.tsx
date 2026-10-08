import Link from "next/link";
import { EmailCta } from "@/components/EmailCta";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="mt-3 text-muted">The link may be old. Everything else is one click away.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="inline-flex rounded-lg border border-line px-5 py-3 text-sm font-semibold hover:border-accent/60">
            Go to the portfolio
          </Link>
          <EmailCta surface="404" />
        </div>
      </div>
    </main>
  );
}
