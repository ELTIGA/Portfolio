"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Demo contract (every demo follows it):
 *  - default export, no props, client-only, fills its container (`h-full`)
 *  - self-contained: sample data lives inside the demo directory, never real data
 *  - no network calls; no outer window chrome (frames are added by DemoSlot / the desktop)
 */
const loading = () => <div className="grid h-full min-h-48 place-items-center text-sm text-muted">Loading preview…</div>;

const lazy = (loader: () => Promise<{ default: ComponentType }>) => dynamic(loader, { ssr: false, loading });

export const demos: Record<string, ComponentType> = {
  "express-ops": lazy(() => import("./express-ops")),
  viya: lazy(() => import("./viya")),
  gravel: lazy(() => import("./gravel")),
  getit: lazy(() => import("./getit")),
  "amc-prep": lazy(() => import("./amc-prep")),
  "review-router": lazy(() => import("./review-router")),
  callaudioguard: lazy(() => import("./callaudioguard")),
  novaread: lazy(() => import("./novaread")),
};
