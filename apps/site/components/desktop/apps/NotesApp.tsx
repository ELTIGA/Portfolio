import Image from "next/image";
import { profile } from "@portfolio/content";

export function NotesApp() {
  return (
    <article className="p-5 text-sm leading-relaxed">
      <div className="flex items-start gap-4">
        <Image src={profile.portrait.src} alt={profile.portrait.alt} width={96} height={120} className="h-[120px] w-24 rounded-lg border border-line object-cover object-top" />
        <div>
          <h3 className="text-lg font-semibold">{profile.name}</h3>
          <p className="text-muted">{profile.education.degree}, {profile.education.school} · {profile.education.year}</p>
          <p className="mt-1 font-mono text-xs text-muted">{profile.languages.join(" · ")}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-muted">
        {profile.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <h4 className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">Experience</h4>
      <ul className="mt-2 space-y-2">
        {profile.experience.map((e) => (
          <li key={e.org}>
            <span className="font-semibold">{e.role}, {e.org}</span>
            <span className="text-muted"> · {e.period}</span>
          </li>
        ))}
      </ul>
      <h4 className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">Credentials</h4>
      <ul className="mt-2 space-y-1 text-muted">
        {profile.credentials.map((c) => (
          <li key={c.name}>{c.name}: {c.status}</li>
        ))}
      </ul>
    </article>
  );
}
