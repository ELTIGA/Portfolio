import Image from "next/image";
import { profile } from "@portfolio/content";
import { EmailCta } from "@/components/EmailCta";
import { Counter } from "@/components/fx/Counter";
import { Magnetic } from "@/components/fx/Magnetic";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-dvh flex-col pt-20">
      {/* The handle in outline type. When WebGL runs, particles assemble the same word and this fades out. */}
      <div aria-hidden="true" className="gl-hide pointer-events-none absolute inset-x-0 top-[13vh] select-none overflow-hidden text-center">
        <span className="hero-in font-display text-outline inline-block text-[30vw] font-black uppercase leading-[0.8] md:text-[22vw]" style={delay(100)}>
          {profile.handle}
        </span>
      </div>

      {/* Scrim so the copy stays readable over the brightest part of the particle word. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-bg via-bg/75 to-transparent" />
      <div className="relative mx-auto mt-auto grid w-full max-w-6xl items-end gap-10 px-5 pb-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:pb-20">
        <div>
          <p className="hero-in flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted" style={delay(300)}>
            <span aria-hidden="true" className="blink h-1.5 w-1.5 bg-accent" />
            {profile.availability}
          </p>
          <h1 id="hero-title" className="hero-in font-display mt-5 text-6xl font-extrabold uppercase leading-[0.85] tracking-tight sm:text-8xl" style={delay(420)}>
            {profile.name}
          </h1>
          <p className="hero-in mt-6 max-w-2xl text-xl leading-snug text-fg sm:text-[1.7rem]" style={delay(560)}>
            {profile.headline}
          </p>
          <p className="hero-in mt-4 max-w-xl leading-relaxed text-muted" style={delay(680)}>
            {profile.subheadline}
          </p>
          <div className="hero-in mt-9 flex flex-wrap items-center gap-6" style={delay(800)}>
            <Magnetic>
              <EmailCta surface="hero" />
            </Magnetic>
            <a href="#work" className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg">
              <span className="relative h-8 w-px overflow-hidden bg-line" aria-hidden="true">
                <span className="scroll-cue absolute inset-0 bg-accent" />
              </span>
              See the work
            </a>
          </div>
        </div>

        <figure className="hero-in hidden w-56 md:block" style={delay(700)}>
          <div className="duotone brackets p-2">
            <span aria-hidden="true" className="duotone-sweep" />
            <Image
              src={profile.portrait.src}
              alt={profile.portrait.alt}
              width={profile.portrait.width}
              height={profile.portrait.height}
              priority
              sizes="224px"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 grid grid-cols-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <span>speaks</span>
            <span className="text-right text-fg">{profile.languages.length} languages</span>
            <span>degree</span>
            <span className="text-right text-fg">{profile.education.year.replace(/\D+/g, "")}</span>
            <span>certified</span>
            <span className="text-right text-fg">CEH</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function Telemetry() {
  return (
    <section aria-label="Results in numbers" className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
      <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {profile.metrics.map((m, i) => (
          <div
            key={m.label}
            data-reveal="up"
            className={`flex flex-col border-line py-8 pr-4 sm:py-10 ${i % 2 ? "border-l pl-4 sm:pl-6" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-6" : ""}`}
          >
            <dt className="order-2 mt-3 block text-sm leading-snug text-muted">{m.label}</dt>
            <dd className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Counter value={m.value.match(/^[\d–-]+/)?.[0] ?? m.value} className="font-display text-6xl font-extrabold leading-none text-accent sm:text-7xl" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg">{m.value.replace(/^[\d–-]+\s*/, "")}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
