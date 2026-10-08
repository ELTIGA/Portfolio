"use client";

import { useEffect, useRef, useState } from "react";
import { profile, projects } from "@portfolio/content";
import { projectWindowId } from "../apps";
import { useWindows } from "../store";

interface Line {
  kind: "in" | "out";
  text: string;
}

const HELP = ["help       list commands", "about      who I am", "projects   list projects", "open <name>  open a project window", "skills     what I work with", "contact    how to reach me", "clear      clear the screen"];

export function TerminalApp() {
  const { open } = useWindows();
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: `Welcome. Type "help" to see what you can do.` }]);
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();
    const out: string[] = [];
    switch (name?.toLowerCase()) {
      case "":
        break;
      case "help":
        out.push(...HELP);
        break;
      case "about":
      case "whoami":
        out.push(profile.name, `${profile.education.degree}, ${profile.education.school} (${profile.education.year})`, ...profile.about);
        break;
      case "projects":
      case "ls":
        out.push(...[...projects].sort((a, b) => a.order - b.order).map((p) => `${p.slug.padEnd(16)} ${p.tagline}`));
        break;
      case "open": {
        const p = projects.find((x) => x.slug === arg || x.name.toLowerCase() === arg);
        if (p) {
          open(projectWindowId(p.slug), p.name, { w: 940, h: 620 });
          out.push(`opening ${p.name}…`);
        } else out.push(`open: no project "${arg}". Try "projects".`);
        break;
      }
      case "skills":
        profile.skills.forEach((g) => out.push(`${g.group}: ${g.items.join(", ")}`));
        break;
      case "contact":
        out.push(`email    ${profile.email}`, `github   ${profile.github}`, `linkedin ${profile.linkedin}`);
        break;
      case "clear":
        setLines([]);
        return;
      case "sudo":
        out.push("nice try. This portfolio runs with least privilege.");
        break;
      default:
        out.push(`${name}: command not found. Try "help".`);
    }
    setLines((l) => [...l, { kind: "in", text: cmd }, ...out.map((text) => ({ kind: "out" as const, text }))]);
  };

  return (
    <div className="h-full cursor-text bg-[#07090c] p-3 font-mono text-[13px] leading-relaxed" onClick={() => inputRef.current?.focus()}>
      {lines.map((l, i) => (
        <div key={i} className={l.kind === "in" ? "text-fg" : "whitespace-pre-wrap text-muted"}>
          {l.kind === "in" ? <><span className="text-accent">~/eltiga $ </span>{l.text}</> : l.text}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue("");
        }}
        className="flex"
      >
        <label htmlFor="term-input" className="text-accent">~/eltiga $&nbsp;</label>
        <input id="term-input" ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent text-fg outline-none" />
      </form>
      <div ref={endRef} />
    </div>
  );
}
