"use client";

import { useState } from "react";
import { profile } from "@portfolio/content";

/** A mailto: composer. No server, no data leaves the browser until the visitor's own mail app opens. */
export function MailApp() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const subject = `Opportunity${company ? ` at ${company}` : ""}`;
  const body = `${message}\n\n${name}`.trim();
  const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const field = "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <form className="space-y-3 p-4" onSubmit={(e) => e.preventDefault()}>
      <p className="text-sm text-muted">To: <span className="font-mono text-fg">{profile.email}</span></p>
      <label className="block text-xs text-muted">
        Your name
        <input className={`${field} mt-1`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="block text-xs text-muted">
        Company
        <input className={`${field} mt-1`} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
      </label>
      <label className="block text-xs text-muted">
        Message
        <textarea className={`${field} mt-1 h-28 resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <a href={href} data-cta="email" data-surface="desktop-mail" className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:brightness-110">
        Open in my mail app
      </a>
    </form>
  );
}
