import { profile } from "@portfolio/content";
import { HoloCard } from "@/components/fx/HoloCard";

/** Experience, education and credentials as one log whose spine lights up on scroll. */
export function Record() {
  const entries = [
    ...profile.experience.map((e) => ({ when: e.period, title: `${e.role}`, org: e.org, meta: e.type, body: e.summary })),
    { when: profile.education.year, title: profile.education.degree, org: profile.education.school, meta: "Education", body: "" },
  ];
  const [ceh, ...otherCreds] = profile.credentials;

  return (
    <div className="grid gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <ol className="relative pl-8">
        <span aria-hidden="true" className="absolute bottom-2 left-[3px] top-2 w-px bg-line">
          <span data-spine="" className="block h-full w-full origin-top bg-gradient-to-b from-accent via-accent to-signal" />
        </span>
        {entries.map((e) => (
          <li key={e.title + e.org} data-reveal="up" className="relative pb-14 last:pb-0">
            <span aria-hidden="true" className="absolute -left-8 top-1.5 h-[7px] w-[7px] bg-accent shadow-[0_0_14px_2px_rgb(255_181_71/0.6)]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{e.when}</p>
            <h3 className="font-display mt-3 text-4xl font-bold uppercase leading-[0.9] sm:text-5xl">{e.org}</h3>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              {e.title} · {e.meta}
            </p>
            {e.body && <p className="mt-4 max-w-xl leading-relaxed text-muted">{e.body}</p>}
          </li>
        ))}
      </ol>

      <div className="space-y-6">
        {ceh && (
          <div data-reveal="up">
            <HoloCard className="brackets border border-line bg-surface p-7">
              <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                <span>credential</span>
                <span className="text-accent">{ceh.year}</span>
              </p>
              <p className="font-display mt-10 text-7xl font-black uppercase leading-none text-accent">CEH</p>
              <h3 className="mt-3 text-lg font-semibold">{ceh.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {ceh.issuer} · {ceh.status}
              </p>
              <div aria-hidden="true" className="mt-8 flex h-8 items-end gap-[3px] opacity-60">
                {Array.from({ length: 42 }, (_, i) => (
                  <span key={i} className="w-[2px] bg-fg" style={{ height: `${30 + ((i * 37) % 70)}%` }} />
                ))}
              </div>
            </HoloCard>
          </div>
        )}
        {otherCreds.map((c) => (
          <div key={c.name} data-reveal="up" className="border border-line bg-surface/60 p-6 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{c.year}</p>
            <h3 className="mt-3 font-semibold">{c.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {c.issuer} · {c.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
