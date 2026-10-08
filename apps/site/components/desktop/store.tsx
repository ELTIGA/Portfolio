"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WinState extends Rect {
  id: string;
  title: string;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: Rect;
}

interface State {
  wins: WinState[];
  zTop: number;
  cascade: number;
}

type Action =
  | { type: "open"; id: string; title: string; size: { w: number; h: number }; viewport: { w: number; h: number } }
  | { type: "close"; id: string }
  | { type: "focus"; id: string }
  | { type: "minimize"; id: string }
  | { type: "toggleMax"; id: string; viewport: { w: number; h: number } }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "resize"; id: string; w: number; h: number }
  | { type: "clampAll"; viewport: { w: number; h: number } };

const MENU = 28;
export const DOCK = 84;
export const MIN_W = 320;
export const MIN_H = 200;

const Z_BASE = 10;

/** Keep a window reachable inside the viewport: title bar clear of the menu bar and dock. */
function fit(w: WinState, vp: { w: number; h: number }): WinState {
  if (w.maximized) {
    const restore = w.restore && fitRect(w.restore, vp);
    return { ...w, restore, x: 0, y: MENU, w: vp.w, h: vp.h - MENU - DOCK };
  }
  return { ...w, ...fitRect(w, vp) };
}

function fitRect(r: Rect, vp: { w: number; h: number }): Rect {
  const w = Math.max(MIN_W, Math.min(r.w, vp.w - 16));
  const h = Math.max(MIN_H, Math.min(r.h, vp.h - MENU - DOCK - 12));
  const x = Math.max(0, Math.min(r.x, vp.w - Math.min(w, 140)));
  const y = Math.max(MENU, Math.min(r.y, vp.h - DOCK - 36));
  return { x, y, w, h };
}

function reducer(state: State, a: Action): State {
  // Raise a window by renumbering the stack, so z stays within Z_BASE + window count
  // and can never climb above the menu bar and dock (z-[1000]).
  const bump = (id: string, patch: (w: WinState) => WinState = (w) => w): State => {
    const order = [...state.wins].sort((p, q) => p.z - q.z).map((w) => w.id);
    const ranked = [...order.filter((x) => x !== id), id];
    const wins = state.wins.map((w) => {
      const z = Z_BASE + 1 + ranked.indexOf(w.id);
      return w.id === id ? { ...patch(w), z } : w.z === z ? w : { ...w, z };
    });
    return { ...state, zTop: Z_BASE + wins.length, wins };
  };
  switch (a.type) {
    case "open": {
      if (state.wins.some((w) => w.id === a.id)) return bump(a.id, (w) => fit({ ...w, minimized: false }, a.viewport));
      const w = Math.min(a.size.w, a.viewport.w - 24);
      const h = Math.min(a.size.h, a.viewport.h - MENU - DOCK - 12);
      const off = (state.cascade % 6) * 28;
      const x = Math.max(8, Math.min((a.viewport.w - w) / 2 + off - 70, a.viewport.w - w - 8));
      const y = Math.max(MENU + 4, Math.min(MENU + 16 + off, a.viewport.h - DOCK - 12 - h));
      const z = state.zTop + 1;
      return {
        zTop: z,
        cascade: state.cascade + 1,
        wins: [...state.wins, { id: a.id, title: a.title, x, y, w, h, z, minimized: false, maximized: false }],
      };
    }
    case "close":
      return { ...state, wins: state.wins.filter((w) => w.id !== a.id) };
    case "focus": {
      const top = state.wins.reduce<WinState | null>((t, w) => (!t || w.z > t.z ? w : t), null);
      return top?.id === a.id && !top.minimized ? state : bump(a.id);
    }
    case "minimize":
      return { ...state, wins: state.wins.map((w) => (w.id === a.id ? { ...w, minimized: true } : w)) };
    case "toggleMax":
      return {
        ...state,
        wins: state.wins.map((w) => {
          if (w.id !== a.id) return w;
          if (w.maximized && w.restore) return { ...w, ...w.restore, maximized: false, restore: undefined };
          return { ...w, restore: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: MENU, w: a.viewport.w, h: a.viewport.h - MENU - DOCK, maximized: true };
        }),
      };
    case "move":
      return { ...state, wins: state.wins.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) };
    case "resize":
      return {
        ...state,
        wins: state.wins.map((w) => (w.id === a.id ? { ...w, w: Math.max(MIN_W, a.w), h: Math.max(MIN_H, a.h) } : w)),
      };
    case "clampAll":
      return { ...state, wins: state.wins.map((w) => fit(w, a.viewport)) };
  }
}

interface Api {
  wins: WinState[];
  topId: string | null;
  open: (id: string, title: string, size?: { w: number; h: number }) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  toggleMax: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
}

const Ctx = createContext<Api | null>(null);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { wins: [], zTop: Z_BASE, cascade: 0 });
  const vp = () => ({ w: window.innerWidth, h: window.innerHeight });

  // Windows (and maximized sizes) follow the browser window, so none ends up off-screen.
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => dispatch({ type: "clampAll", viewport: vp() }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const open = useCallback<Api["open"]>((id, title, size = { w: 720, h: 480 }) => dispatch({ type: "open", id, title, size, viewport: vp() }), []);
  const close = useCallback((id: string) => dispatch({ type: "close", id }), []);
  const focus = useCallback((id: string) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: "minimize", id }), []);
  const toggleMax = useCallback((id: string) => dispatch({ type: "toggleMax", id, viewport: vp() }), []);
  const move = useCallback((id: string, x: number, y: number) => dispatch({ type: "move", id, x, y }), []);
  const resize = useCallback((id: string, w: number, h: number) => dispatch({ type: "resize", id, w, h }), []);

  const topId = useMemo(() => {
    const visible = state.wins.filter((w) => !w.minimized);
    return visible.length ? visible.reduce((a, b) => (b.z > a.z ? b : a)).id : null;
  }, [state.wins]);

  const api = useMemo<Api>(
    () => ({ wins: state.wins, topId, open, close, focus, minimize, toggleMax, move, resize }),
    [state.wins, topId, open, close, focus, minimize, toggleMax, move, resize],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useWindows(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWindows must be used inside <WindowProvider>");
  return v;
}
