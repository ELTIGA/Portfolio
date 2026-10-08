import Image from "next/image";
import { profile, projects } from "@portfolio/content";
import { EmailCta } from "@/components/EmailCta";
import { Intro3D } from "@/components/Intro3D";
import { ProjectCard } from "@/components/ProjectCard";
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

const linkClass = "text-sm text-muted underline-offset-4 hover:text-fg hover:underline";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <Intro3D />
      <a href="#top" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink">Skip to content</a>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="font-mono text-sm font-semibold">
            <span className="text-accent">~/</span>
            {profile.handle.toLowerCase()}
          </a>
          <nav aria-label="Primary" className="flex items-center gap-5 text-sm text-muted">
            <a className="hidden hover:text-fg sm:inline" href="#work">Work</a>
            <a className="hidden hover:text-fg sm:inline" href="#experience">Experience</a>
            <a className="hidden hover:text-fg sm:inline" href="#about">About</a>
            <EmailCta className="!px-3 !py-1.5" label="Email" surface="header" />
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-20 md:grid-cols-[1fr_300px]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              {profile.availability}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{profile.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{profile.subheadline}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <EmailCta surface="hero" />
              <a className={linkClass} href="#work">See the work</a>
            </div>
            <p className="mt-4 font-mono text-xs text-muted">Languages: {profile.languages.join(" · ")}</p>
          </div>
          <figure className="order-first mx-auto w-40 md:order-none md:w-full">
            <Image
              src={profile.portrait.src}
              alt={profile.portrait.alt}
              width={profile.portrait.width}
              height={profile.portrait.height}
              priority
              sizes="(min-width: 768px) 300px, 160px"
              className="h-auto w-full rounded-2xl border border-line object-cover"
            />
          </figure>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
            {profile.metrics.map((m) => (
              <div key={m.label} className="bg-surface p-4 sm:p-5">
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-mono text-xl font-semibold text-accent sm:text-2xl">{m.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-muted">{m.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Section id="work" eyebrow="01 / selected work" title="Products I designed, built and shipped">
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} large />
            ))}
          </div>
          <h3 className="mt-12 font-mono text-xs uppercase tracking-widest text-muted">More projects</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>

        <Section id="experience" eyebrow="02 / experience & credentials" title="Where I've worked and what I've earned">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Experience</h3>
              <ol className="mt-4 space-y-4">
                {profile.experience.map((e) => (
                  <li key={e.org} className="rounded-xl border border-line bg-surface p-5">
                    <p className="font-mono text-xs text-accent">{e.period}</p>
                    <h4 className="mt-1 font-semibold">{e.role}, {e.org}</h4>
                    <p className="text-xs text-muted">{e.type}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{e.summary}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Education & credentials</h3>
              <ul className="mt-4 space-y-4">
                <li className="rounded-xl border border-line bg-surface p-5">
                  <p className="font-mono text-xs text-accent">{profile.education.year}</p>
                  <h4 className="mt-1 font-semibold">{profile.education.degree}</h4>
                  <p className="text-sm text-muted">{profile.education.school}</p>
                </li>
                {profile.credentials.map((c) => (
                  <li key={c.name} className="rounded-xl border border-line bg-surface p-5">
                    <p className="font-mono text-xs text-accent">{c.year}</p>
                    <h4 className="mt-1 font-semibold">{c.name}</h4>
                    <p className="text-sm text-muted">{c.issuer} · {c.status}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="security" eyebrow="03 / how it's shipped" title="Security and delivery are part of the build">
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <div key={p.slug} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-semibold">{p.name}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  {p.security.slice(0, 3).map((s) => (
                    <li key={s} className="flex gap-2">
                      <span aria-hidden="true" className="font-mono text-accent">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="stack" eyebrow="04 / toolbox" title="What I work with">
          <div className="grid gap-4 md:grid-cols-3">
            {profile.skills.map((g) => (
              <div key={g.group} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{g.group}</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <li key={i} className="rounded-md border border-line px-2 py-0.5 text-sm">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="about" eyebrow="05 / about" title="Who's behind the code">
          <div className="grid items-start gap-8 md:grid-cols-[1fr_260px]">
            <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
              {profile.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Image
              src={profile.casual.src}
              alt={profile.casual.alt}
              width={profile.casual.width}
              height={profile.casual.height}
              sizes="(min-width: 768px) 260px, 70vw"
              className="mx-auto h-auto w-3/4 rounded-2xl border border-line md:w-full"
            />
          </div>
          <h3 className="mt-14 font-mono text-xs uppercase tracking-widest text-muted">Events I&apos;ve been to</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {profile.events.map((e) => (
              <li key={e.name} className="overflow-hidden rounded-xl border border-line bg-surface">
                <Image src={e.image} alt={e.alt} width={900} height={e.name === "TEKNOFEST" ? 576 : 816} sizes="(min-width: 640px) 480px, 100vw" className="h-56 w-full object-cover object-top" />
                <p className="p-4 text-sm">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-muted"> · {e.role}, {e.year}</span>
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contact" eyebrow="06 / contact" title="Let's talk about your team">
          <p className="max-w-xl text-lg text-muted">
            Email is the fastest way to reach me. Tell me about the role, the contract or the project.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <EmailCta label={`Email ${profile.email}`} surface="contact" />
            <a className={linkClass} href={profile.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>
            <a className={linkClass} href={profile.github} rel="noopener noreferrer" target="_blank">GitHub</a>
          </div>
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted sm:px-6">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <a href="/resume" className="underline-offset-4 hover:text-fg hover:underline">Résumé</a>
        </div>
      </footer>
    </>
  );
}
