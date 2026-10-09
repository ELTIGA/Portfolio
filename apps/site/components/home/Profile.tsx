import Image from "next/image";
import { profile } from "@portfolio/content";

export function ProfileBlock() {
  return (
    <>
      <div className="grid items-start gap-12 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6 text-xl leading-relaxed text-fg/80 sm:text-2xl sm:leading-relaxed">
          {profile.about.map((p) => (
            <p key={p} data-reveal="up">
              {p}
            </p>
          ))}
        </div>
        <figure data-reveal="wipe" className="mx-auto w-3/4 md:w-full">
          <div className="duotone brackets p-2">
            <span aria-hidden="true" className="duotone-sweep" />
            <Image src={profile.casual.src} alt={profile.casual.alt} width={profile.casual.width} height={profile.casual.height} sizes="(min-width: 768px) 300px, 70vw" className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">off duty</figcaption>
        </figure>
      </div>

      <h3 className="mt-24 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">field log</span>
        <span className="h-px flex-1 bg-line" />
        <span>events attended</span>
      </h3>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {profile.events.map((e) => (
          <li key={e.name} data-reveal="wipe">
            <div className="duotone">
              <span aria-hidden="true" className="duotone-sweep" />
              <Image src={e.image} alt={e.alt} width={e.width} height={e.height} sizes="(min-width: 640px) 560px, 100vw" className="h-72 w-full object-cover object-top" />
            </div>
            <p className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-display text-3xl font-bold uppercase leading-none">{e.name}</span>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {e.role} · {e.year}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
