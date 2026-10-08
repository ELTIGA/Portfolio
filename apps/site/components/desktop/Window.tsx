"use client";

import { useRef, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { MIN_H, MIN_W, useWindows, type WinState } from "./store";

const MENU = 28;

export function Window({ win, active, children }: { win: WinState; active: boolean; children: ReactNode }) {
  const { focus, close, minimize, toggleMax, move, resize } = useWindows();
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const size = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);

  const onTitleDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    focus(win.id);
    if (win.maximized) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onTitleMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const x = Math.min(Math.max(e.clientX - drag.current.dx, 80 - win.w), window.innerWidth - 80);
    const y = Math.min(Math.max(e.clientY - drag.current.dy, MENU), window.innerHeight - 60);
    move(win.id, x, y);
  };
  const endDrag = () => {
    drag.current = null;
  };

  const onResizeDown = (e: RPointerEvent<HTMLDivElement>) => {
    focus(win.id);
    size.current = { sx: e.clientX, sy: e.clientY, w: win.w, h: win.h };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };
  const onResizeMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!size.current) return;
    resize(win.id, size.current.w + e.clientX - size.current.sx, size.current.h + e.clientY - size.current.sy);
  };
  const endResize = () => {
    size.current = null;
  };

  return (
    <section
      role="dialog"
      aria-label={win.title}
      onPointerDown={() => !active && focus(win.id)}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z, display: win.minimized ? "none" : undefined, minWidth: MIN_W, minHeight: MIN_H }}
      className={`absolute flex flex-col overflow-hidden rounded-xl border bg-bg shadow-2xl ${active ? "border-white/20 shadow-black/60" : "border-line shadow-black/30"}`}
    >
      <div
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => toggleMax(win.id)}
        className={`flex touch-none select-none items-center gap-3 border-b border-line px-3 py-2 ${win.maximized ? "" : "cursor-grab active:cursor-grabbing"} ${active ? "bg-surface" : "bg-bg"}`}
      >
        <span className="flex gap-2">
          <button type="button" aria-label={`Close ${win.title}`} onClick={() => close(win.id)} className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-125" />
          <button type="button" aria-label={`Minimize ${win.title}`} onClick={() => minimize(win.id)} className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-125" />
          <button type="button" aria-label={win.maximized ? `Restore ${win.title}` : `Maximize ${win.title}`} onClick={() => toggleMax(win.id)} className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-125" />
        </span>
        <h2 className={`flex-1 truncate text-center text-xs font-medium ${active ? "text-fg" : "text-muted"}`}>{win.title}</h2>
        <span className="w-12" aria-hidden="true" />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      {!win.maximized && (
        <div
          onPointerDown={onResizeDown}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize touch-none"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-muted/60"><path d="M14 6L6 14M14 10l-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </div>
      )}
    </section>
  );
}
