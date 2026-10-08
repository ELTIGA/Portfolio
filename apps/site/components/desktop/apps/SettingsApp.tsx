import { profile } from "@portfolio/content";

const HEADERS = ["Content-Security-Policy (frame-ancestors 'self')", "Strict-Transport-Security (2 years, preload)", "X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin", "Permissions-Policy (camera, microphone, geolocation off)"];
const CI = ["npm audit (production dependencies)", "ESLint", "TypeScript typecheck", "Production build"];

export function SettingsApp() {
  return (
    <div className="space-y-5 p-5 text-sm">
      <p className="text-muted">
        This site is built the way I build everything else: typed content, automated checks on every push, and strict browser security headers.
      </p>
      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Security headers</h3>
        <ul className="mt-2 space-y-1">
          {HEADERS.map((h) => (
            <li key={h} className="flex gap-2"><span className="font-mono text-accent">✓</span>{h}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">CI on every push</h3>
        <ul className="mt-2 space-y-1">
          {CI.map((c) => (
            <li key={c} className="flex gap-2"><span className="font-mono text-accent">✓</span>{c}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Credits</h3>
        <p className="mt-2 text-muted">
          Built with Next.js, React and Tailwind CSS. Previews use invented sample data. No customer information appears anywhere on this site.
        </p>
      </section>
      <p className="font-mono text-xs text-muted">© {new Date().getFullYear()} {profile.name}</p>
    </div>
  );
}
