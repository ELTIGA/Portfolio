"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@/lib/track";

const noSubscribe = () => () => {};
const isTopLevel = () => window.self === window.top;

/**
 * Mounts Vercel Analytics and reports email CTA clicks via one delegated listener.
 * Pageviews are skipped when framed (the 3D intro iframes /desktop), so each intro
 * doesn't log a phantom /desktop visit.
 */
export function AnalyticsEvents({ analytics }: { analytics: boolean }) {
  const topLevel = useSyncExternalStore(noSubscribe, isTopLevel, () => false);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta='email']");
      if (el) track("email_click", { surface: el.dataset.surface ?? "page" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return analytics && topLevel ? <Analytics /> : null;
}
