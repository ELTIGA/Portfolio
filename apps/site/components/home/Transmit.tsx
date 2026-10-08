import { profile } from "@portfolio/content";
import { Magnetic } from "@/components/fx/Magnetic";

const subject = encodeURIComponent("Hello Ahmed");

/** Contact: the address itself is the button. The particle field turns into a radar behind it. */
export function Transmit() {
  const [user, domain] = profile.email.split("@");
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative flex min-h-dvh flex-col justify-center px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <p data-reveal="wipe" className="flex items-center gap-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">open channel</span>
          <span className="ml-auto">replies by email</span>
        </p>
        <h2 id="contact-title" data-scramble className="font-display mt-8 text-5xl font-extrabold uppercase leading-[0.88] sm:text-7xl">
          Hiring? Building something?
        </h2>
        <p data-reveal="up" className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Email is the fastest way to reach me. Send the role, the contract or the project and what you need built.
        </p>
        <div className="mt-14">
          <Magnetic strength={0.12} className="max-w-full">
            <a
              href={`mailto:${profile.email}?subject=${subject}`}
              data-cta="email"
              data-surface="contact"
              data-cursor="send"
              className="group font-display block break-all text-[11vw] font-black uppercase leading-[0.85] transition-colors sm:text-[8.4vw] lg:text-[6.5rem]"
            >
              <span className="text-fg transition-colors group-hover:text-accent">{user}</span>
              <span className="text-outline">@{domain}</span>
            </a>
          </Magnetic>
        </div>
        <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs uppercase tracking-[0.2em]">
          {[
            { label: "LinkedIn", href: profile.linkedin, external: true },
            { label: "GitHub", href: profile.github, external: true },
            { label: "Résumé", href: "/resume", external: false },
            { label: "Desktop edition", href: "/desktop", external: false },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                className="group inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
              >
                <span aria-hidden="true" className="h-px w-5 bg-line transition-all group-hover:w-9 group-hover:bg-accent" />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
