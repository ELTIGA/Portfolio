"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/track";

/** Mounts Vercel Analytics and reports email CTA clicks via one delegated listener. */
export function AnalyticsEvents({ analytics }: { analytics: boolean }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta='email']");
      if (el) track("email_click", { surface: el.dataset.surface ?? "page" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return analytics ? <Analytics /> : null;
}
