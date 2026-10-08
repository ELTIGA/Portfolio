"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { driversSeed } from "./data";
import { batchOk } from "./logic";
import type { Driver, Role } from "./data";
import { LayoutContext, useElementWidth, useToasts } from "./hooks";
import type { Breakpoint } from "./hooks";
import { css } from "./styles";
import { useManifest } from "./useManifest";
import { Chip, Icon, ToastRegion } from "./ui";
import { ManifestScreen } from "./ManifestScreen";
import { DriversScreen } from "./DriversScreen";
import { DoublesScreen } from "./DoublesScreen";
import { CustomersScreen } from "./CustomersScreen";

type ScreenId = "manifest" | "drivers" | "doubles" | "customers";

const NAV: Array<{ id: ScreenId; label: string; short: string; icon: string; roles: Role[] }> = [
  { id: "manifest", label: "Manifest", short: "Manifest", icon: "manifest", roles: ["operator"] },
  { id: "drivers", label: "Driver's List", short: "Drivers", icon: "drivers", roles: ["operator"] },
  { id: "doubles", label: "Double bookings", short: "Doubles", icon: "doubles", roles: ["operator"] },
  { id: "customers", label: "Customer Lists", short: "Customers", icon: "customers", roles: ["operator", "guide"] },
];

const SIDEBAR_W: Record<Breakpoint, number> = { narrow: 0, mid: 56, wide: 196 };

export default function Demo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const bp: Breakpoint = width < 600 ? "narrow" : width < 860 ? "mid" : "wide";
  const contentW = width - SIDEBAR_W[bp];

  const [role, setRole] = useState<Role>("operator");
  const [active, setActive] = useState<ScreenId>("manifest");
  const [drivers, setDrivers] = useState<Driver[]>(driversSeed);
  // Per-screen progress lives here so it survives switching screens (and toast Undo still works).
  const [resolved, setResolved] = useState<Set<string>>(() => new Set());
  const [openBatches, setOpenBatches] = useState<Set<string>>(
    () => new Set(driversSeed.flatMap((d) => d.batches.filter((b) => !batchOk(b)).map((b) => b.id))),
  );
  const [boarded, setBoarded] = useState<Set<string>>(() => new Set(["c1-1"]));
  const { toasts, push, dismiss } = useToasts();
  const manifest = useManifest(push, dismiss);

  const items = useMemo(() => NAV.filter((n) => n.roles.includes(role)), [role]);
  const screen: ScreenId = items.some((n) => n.id === active) ? active : "customers";
  const current = NAV.find((n) => n.id === screen) ?? NAV[0];

  // Cmd/Ctrl+Z restores the last reprocessed image, unless the user is typing in a field.
  const undoRef = useRef(manifest.undoLatest);
  useEffect(() => {
    undoRef.current = manifest.undoLatest;
  }, [manifest.undoLatest]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, [contenteditable='true']")) return;
      const inside = !!t && !!rootRef.current?.contains(t);
      if (inside && undoRef.current()) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const switchRole = (next: Role) => {
    if (next === role) return;
    setRole(next);
    push(next === "guide" ? "Viewing as Guide. Only Customer Lists is available." : "Viewing as Operator. All sections are available.");
  };

  const touch = role === "guide";

  return (
    <LayoutContext.Provider value={{ bp, contentW }}>
      <div ref={rootRef} className="eo relative flex h-full min-h-0 flex-col overflow-hidden" tabIndex={-1} data-bp={bp} style={{ colorScheme: "dark" }}>
        <style>{css}</style>

        <header className="flex shrink-0 items-center justify-between gap-2 border-b px-3" style={{ borderColor: "var(--line)", background: "var(--side)", minHeight: touch ? 52 : 46 }}>
          {bp === "narrow" ? (
            <Brand />
          ) : (
            <p className="eo-muted min-w-0 truncate text-[12.5px]" aria-label="Breadcrumb">
              Express Ops <span aria-hidden="true">/</span> <span style={{ color: "var(--fg)" }}>{current.label}</span>
            </p>
          )}
          <div className="flex shrink-0 items-center gap-2">
            {bp === "wide" && <Chip tone="brand" dot={false}>Sample data</Chip>}
            <div className="eo-seg" role="group" aria-label="View as role">
              {(["operator", "guide"] as Role[]).map((r) => (
                <button key={r} type="button" aria-pressed={role === r} onClick={() => switchRole(r)}>
                  {r === "operator" ? "Operator" : "Guide"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {bp === "narrow" && (
          <nav aria-label="Sections" className="shrink-0 border-b" style={{ borderColor: "var(--line)", background: "var(--side)" }}>
            <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="eo-navbtn flex-col"
                    style={{ gap: 2, minHeight: 48, justifyContent: "center", borderRadius: 0, fontSize: 11.5, paddingInline: 2, borderWidth: 0, borderBottom: "2px solid " + (n.id === screen ? "var(--brand)" : "transparent") }}
                    aria-current={n.id === screen ? "page" : undefined}
                    onClick={() => setActive(n.id)}
                  >
                    <Icon name={n.icon} size={16} />
                    {n.short}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex min-h-0 flex-1">
          {bp !== "narrow" && (
            <aside className="flex shrink-0 flex-col justify-between border-r" style={{ width: SIDEBAR_W[bp], borderColor: "var(--line)", background: "var(--side)" }}>
              <div className="p-2">
                <div className={bp === "wide" ? "px-1.5 py-2" : "grid place-items-center py-2"}>
                  <Brand label={bp === "wide"} />
                </div>
                <nav aria-label="Sections">
                  <ul className="mt-2 flex flex-col gap-1">
                    {items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className="eo-navbtn"
                          style={bp === "mid" ? { justifyContent: "center", paddingInline: 0 } : undefined}
                          aria-current={n.id === screen ? "page" : undefined}
                          aria-label={bp === "mid" ? n.label : undefined}
                          title={n.label}
                          onClick={() => setActive(n.id)}
                        >
                          <Icon name={n.icon} size={16} />
                          {bp === "wide" && n.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              {bp === "wide" && (
                <div className="border-t p-3 text-[12px]" style={{ borderColor: "var(--line)" }}>
                  <p className="font-medium">{role === "operator" ? "Sample Operator" : "Sample Guide"}</p>
                  <p className="eo-muted">
                    {role === "operator" ? "Operator: all sections" : `Guide: ${NAV.length - items.length} sections hidden`}
                  </p>
                </div>
              )}
            </aside>
          )}

          <div role="region" className="eo-scroll min-w-0 flex-1 overflow-y-auto" aria-label={current.label}>
            {screen === "manifest" && <ManifestScreen m={manifest} contentW={contentW} />}
            {screen === "drivers" && <DriversScreen drivers={drivers} setDrivers={setDrivers} open={openBatches} setOpen={setOpenBatches} push={push} compact={contentW < 560} />}
            {screen === "doubles" && <DoublesScreen resolved={resolved} setResolved={setResolved} push={push} compact={contentW < 600} />}
            {screen === "customers" && <CustomersScreen role={role} boarded={boarded} setBoarded={setBoarded} />}
          </div>
        </div>

        <ToastRegion toasts={toasts} onDismiss={dismiss} />
      </div>
    </LayoutContext.Provider>
  );
}

function Brand({ label = true }: { label?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid place-items-center rounded-md" style={{ width: 24, height: 24, background: "var(--brand)", color: "#17140f" }} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h9M10 6l6 6-6 6M19 5v14" />
        </svg>
      </span>
      {label ? <span className="text-[13.5px] font-semibold tracking-tight">Express Ops</span> : <span className="sr-only">Express Ops</span>}
    </span>
  );
}
