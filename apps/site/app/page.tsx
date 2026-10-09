import { profile, projects } from "@portfolio/content";
import { EmailCta } from "@/components/EmailCta";
import { Cursor } from "@/components/fx/Cursor";
import { FxRoot } from "@/components/fx/FxRoot";
import { Hud } from "@/components/fx/Hud";
import { Magnetic } from "@/components/fx/Magnetic";
import { SignalField } from "@/components/fx/SignalField";
import { Hero, Telemetry } from "@/components/home/Hero";
import { Loadout } from "@/components/home/Loadout";
import { Pipeline } from "@/components/home/Pipeline";
import { ProcessTable } from "@/components/home/ProcessTable";
import { ProfileBlock } from "@/components/home/Profile";
import { Record } from "@/components/home/Record";
import { ReelPin } from "@/components/home/ReelPin";
import { Transmit } from "@/components/home/Transmit";
import { WorkPanel } from "@/components/home/WorkReel";
import { Intro3D, OfficeButton } from "@/components/Intro3D";
import { Section } from "@/components/Section";

const sorted = [...projects].sort((a, b) => a.order - b.order);
const featured = sorted.filter((p) => p.featured);
const more = sorted.filter((p) => !p.featured);

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  image: `${profile.siteUrl}${profile.portrait.src}`,
  email: `mailto:${profile.email}`,
  jobTitle: "DevSecOps & AI-enabled full-stack engineer",
  knowsLanguage: profile.languages,
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
  hasCredential: profile.credentials
    .filter((c) => !c.status.includes("not an AWS certification"))
    .map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.name, recognizedBy: { "@type": "Organization", name: c.issuer } })),
  sameAs: [profile.github, profile.linkedin],
};

// Express Ops' release path, as its README describes it.
const stages = [
  { name: "Audit", detail: "dependency audit" },
  { name: "Lint", detail: "eslint" },
  { name: "Test", detail: "unit tests" },
  { name: "Typecheck", detail: "tsc" },
  { name: "Build", detail: "production build" },
  { name: "Deploy", detail: "ssh + sign-in check" },
];

const sectors = [
  { id: "hero", label: "signal" },
  { id: "work", label: "case files" },
  { id: "more", label: "processes" },
  { id: "shipping", label: "release path" },
  { id: "record", label: "service record" },
  { id: "loadout", label: "loadout" },
  { id: "about", label: "operator" },
  { id: "contact", label: "open channel" },
];

const navLink = "relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replace(/</g, "\\u003c") }} />
      <Intro3D />
      <FxRoot />
      <SignalField word={profile.handle} heroId="hero" radarId="contact" frostIds={["work", "record"]} />
      <Hud sectors={sectors} />
      <Cursor />
      <div aria-hidden="true" className="atmosphere" />

      <a href="#top" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[95] focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-bg via-bg/70 to-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#top" className="font-display text-2xl font-black uppercase leading-none tracking-wide">
            {profile.handle}
            <span className="text-accent">.</span>
          </a>
          <nav aria-label="Primary" className="flex items-center gap-7">
            <a className={`${navLink} hidden sm:inline`} href="#work">Work</a>
            <a className={`${navLink} hidden sm:inline`} href="#record">Record</a>
            <a className={`${navLink} hidden sm:inline`} href="#about">About</a>
            <OfficeButton className={navLink} />
            <Magnetic>
              <EmailCta className="!px-4 !py-2.5" label="Email" surface="header" />
            </Magnetic>
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10">
        <Hero />
        <Telemetry />

        <section id="work" aria-labelledby="work-title" className="relative pt-24 sm:pt-32">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div data-reveal="wipe" className="flex items-center gap-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="text-accent">selected work</span>
              <span className="ml-auto">{featured.length} featured · scroll to advance</span>
            </div>
            <h2 id="work-title" data-scramble className="font-display mt-6 text-5xl font-extrabold uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl">
              Case files
            </h2>
          </div>
          <div className="mt-12 lg:mt-0">
            <ReelPin>
              {featured.map((p, i) => (
                <WorkPanel key={p.slug} project={p} index={i} />
              ))}
            </ReelPin>
          </div>
        </section>

        <Section id="more" code="processes" readout={`${more.length} more builds`} title="Also built">
          <ProcessTable rows={more.map(({ slug, name, role, status, tagline, stack }) => ({ slug, name, role, status, tagline, stack }))} />
        </Section>

        <Section id="shipping" code="release path" readout="express ops ci/cd" title="Nothing ships red">
          <p data-reveal="up" className="max-w-2xl text-lg leading-relaxed text-muted">
            Every push to Express Ops runs the same gates. Only the commit that passes all of them reaches the production host.
          </p>
          <div className="mt-16">
            <Pipeline stages={stages} />
          </div>
          <div className="mt-24 grid gap-10 md:grid-cols-3">
            {featured.map((p) => (
              <div key={p.slug} data-reveal="up" className="border-t border-line pt-5">
                <h3 className="font-display text-3xl font-bold uppercase">{p.name}</h3>
                <ul className="mt-4 space-y-3 font-mono text-[12px] leading-relaxed text-muted">
                  {p.security.slice(0, 3).map((s) => (
                    <li key={s} className="grid grid-cols-[3.2rem_1fr] gap-2">
                      <span className="text-accent">[pass]</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="record" code="experience" readout={`${profile.experience.length} roles · ${profile.credentials.length} credentials`} title="Service record">
          <Record />
        </Section>

        <Section id="loadout" code="toolbox" readout={`${profile.skills.reduce((n, g) => n + g.items.length, 0)} tools`} title="Loadout">
          <Loadout />
        </Section>

        <Section id="about" code="about" readout={profile.languages.join(" · ")} title="Operator profile">
          <ProfileBlock />
        </Section>

        <Transmit />
      </main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:px-8">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Built with Next.js, three.js and GSAP</span>
        </div>
      </footer>
    </>
  );
}
