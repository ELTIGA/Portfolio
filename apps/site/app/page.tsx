import { profile, projects } from "@portfolio/content";
import { EmailCta } from "@/components/EmailCta";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";

const sorted = [...projects].sort((a, b) => a.order - b.order);
const featured = sorted.filter((p) => p.featured);
const more = sorted.filter((p) => !p.featured);

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  email: `mailto:${profile.email}`,
  jobTitle: "DevSecOps & AI-enabled full-stack engineer",
  sameAs: [profile.github, profile.linkedin],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="font-mono text-sm font-semibold">
            <span className="text-accent">~/</span>
            {profile.handle.toLowerCase()}
          </a>
          <nav aria-label="Primary" className="flex items-center gap-5 text-sm text-muted">
            <a className="hidden hover:text-fg sm:inline" href="#work">Work</a>
            <a className="hidden hover:text-fg sm:inline" href="#security">Security</a>
            <a className="hidden hover:text-fg sm:inline" href="#about">About</a>
            <EmailCta className="!px-3 !py-1.5" label="Email" />
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {profile.availability}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">{profile.headline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{profile.subheadline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <EmailCta />
            <a className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline" href="#work">See the work</a>
            {profile.languages && <span className="font-mono text-xs text-muted">{profile.languages.join(" · ")}</span>}
          </div>
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

        <Section id="security" eyebrow="02 / how it's shipped" title="Security and delivery are part of the build">
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

        <Section id="stack" eyebrow="03 / toolbox" title="What I work with">
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

        <Section id="about" eyebrow="04 / about" title="Who's behind the code">
          <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
            {profile.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="05 / contact" title="Let's talk about your team">
          <p className="max-w-xl text-lg text-muted">
            The fastest way to reach me is email. I reply to every message about a role, a contract or a project.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <EmailCta label={`Email ${profile.email}`} />
            <a className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline" href={profile.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>
            <a className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline" href={profile.github} rel="noopener noreferrer" target="_blank">GitHub</a>
          </div>
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-8 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </footer>
    </>
  );
}
