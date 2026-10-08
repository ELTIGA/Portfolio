import { profile } from "@portfolio/content";

/** Skill groups as three columns of tools, numbered like a loaded-modules readout. */
export function Loadout() {
  return (
    <div className="grid gap-12 md:grid-cols-3 md:gap-8">
      {profile.skills.map((g) => (
        <div key={g.group}>
          <p className="flex items-baseline justify-between border-b border-line pb-3">
            <span className="font-display text-2xl font-bold uppercase">{g.group}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{String(g.items.length).padStart(2, "0")} loaded</span>
          </p>
          <ul className="mt-2">
            {g.items.map((item, i) => (
              <li key={item} data-reveal="up" className="group flex items-baseline gap-4 border-b border-line/50 py-2.5">
                <span aria-hidden="true" className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
