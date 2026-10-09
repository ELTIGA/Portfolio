"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "./gsap";
import { introIsOpen, isFramed, onIntro } from "./runtime";
import type { SceneData, SignalScene } from "./signal-field/scene";

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;
type NavigatorExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

function canRun() {
  // ?gl=1 forces the scene on (screenshots, software renderers); ?gl=0 forces it off.
  const force = new URLSearchParams(window.location.search).get("gl");
  if (force === "0") return false;
  // A framed copy of the page (inside the 3D shell's monitor) never gets a second scene.
  if (isFramed()) return false;
  if (prefersReducedMotion()) return false;
  const nav = navigator as NavigatorExtras;
  if (force !== "1" && (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory < 4))) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: force !== "1" });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return force === "1" || !SOFTWARE_GL.test(renderer);
  } catch {
    return false;
  }
}

/**
 * Fixed full-page particle field behind the homepage. Particles stream in and assemble
 * the handle, become a rotating globe once you scroll past the hero, and fold into a
 * radar sweep at the contact section. Behind the glassy work panels the field defocuses.
 * Falls back to a static CSS backdrop whenever WebGL2 is missing, slow, software-rendered,
 * or motion is reduced.
 *
 * Budget: quality adapts to the device (signal-field/quality.ts), the field idles at a
 * low frame rate while dimmed behind content, and it releases its GPU context entirely
 * while the 3D intro covers the page, then re-assembles when the visitor comes back.
 */
export function SignalField({ word, heroId, radarId, frostIds = [] }: { word: string; heroId: string; radarId: string; frostIds?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  // A context-lost canvas cannot be reused: a fresh element per scene.
  const [generation, setGeneration] = useState(0);
  const frostKey = frostIds.join(" ");

  useEffect(() => {
    const dim = dimRef.current;
    if (!dim || !canRun()) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const start = async () => {
      await document.fonts?.ready;
      const [{ buildSceneData, createSignalScene }, { createGovernor, initialTier, qualityFor }, { gsap, ScrollTrigger }] = await Promise.all([
        import("./signal-field/scene"),
        import("./signal-field/quality"),
        loadGsap(),
      ]);
      if (disposed) return;
      const mobile = window.innerWidth < 768;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-shoulders").trim() || "Impact, sans-serif";
      const tier0 = initialTier(mobile);
      let data: SceneData | null = null;

      // Morph targets live here so a rebuilt scene picks up where the page is.
      const morph = { globe: 0, radar: 0 };
      let frost = 0;
      let dimmed = false;
      let scene: SignalScene | null = null;

      const governor = createGovernor(tier0, mobile ? 2 : 0, (tier) => scene?.setQuality(qualityFor(tier, mobile)));

      const mount = () => {
        const canvas = canvasRef.current;
        if (scene || disposed || !canvas) return;
        data ??= buildSceneData(word, family, mobile ? 20000 : 52000);
        try {
          scene = createSignalScene({
            canvas,
            data,
            quality: qualityFor(governor.tier, mobile),
            initial: morph,
            onSample: governor.sample,
          });
        } catch {
          return; // no context after all: the CSS backdrop stays
        }
        scene.setFrost(frost);
        scene.setZone({ dimmed });
        scene.setRunning(!document.hidden);
        setLive(true);
        document.documentElement.classList.add("gl-live");
      };
      const unmount = () => {
        if (!scene) return;
        scene.dispose();
        scene = null;
        setLive(false);
        document.documentElement.classList.remove("gl-live");
        setGeneration((g) => g + 1);
      };
      cleanups.push(unmount);

      // Only one WebGL scene at a time: while the 3D intro covers the page, give the GPU
      // memory back. Coming back, the name assembles again from the particle cloud.
      const offIntro = onIntro((open) => (open ? unmount() : window.requestAnimationFrame(() => window.requestAnimationFrame(mount))));
      const onVisibility = () => scene?.setRunning(!document.hidden);
      const onScroll = () => scene?.poke();
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => {
        offIntro();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("scroll", onScroll);
      });
      if (!introIsOpen()) mount();

      const hero = document.getElementById(heroId);
      const radar = document.getElementById(radarId);
      let inHero = true;
      let inRadar = false;
      const syncZone = () => {
        dimmed = !inHero && !inRadar;
        scene?.setZone({ dimmed });
      };
      const ctx = gsap.context(() => {
        if (hero) {
          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom 30%",
            onUpdate: (st) => {
              morph.globe = st.progress > 0.25 ? 1 : 0;
              scene?.setMorph({ globe: morph.globe });
            },
          });
          // Zone: the hero counts as "in front" from the moment any of it is on screen.
          ScrollTrigger.create({
            trigger: hero,
            start: "top bottom",
            end: "bottom 30%",
            onToggle: (st) => {
              inHero = st.isActive;
              syncZone();
            },
          });
          // Same test as the trigger's end, read once now: a page opened mid-way (a #hash
          // link) starts dimmed instead of waiting for a toggle that never comes.
          inHero = hero.getBoundingClientRect().bottom > window.innerHeight * 0.3;
        } else inHero = false;
        syncZone();
        if (radar)
          ScrollTrigger.create({
            trigger: radar,
            start: "top 70%",
            onToggle: (st) => {
              morph.radar = st.isActive ? 1 : 0;
              inRadar = st.isActive;
              scene?.setMorph({ radar: morph.radar });
              syncZone();
            },
          });
        // Glass panels: the field defocuses behind them instead of a live backdrop blur.
        for (const id of frostKey ? frostKey.split(" ") : []) {
          const el = document.getElementById(id);
          if (!el) continue;
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (st) => {
              frost = st.isActive ? 1 : 0;
              scene?.setFrost(frost);
            },
          });
        }
        // Dim the field behind dense content, bring it back for hero and contact.
        gsap.fromTo(
          dim,
          { opacity: 1 },
          { opacity: 0.22, ease: "none", scrollTrigger: { trigger: hero ?? document.body, start: "bottom 80%", end: "bottom top", scrub: true } },
        );
        if (radar)
          gsap.to(dim, { opacity: 0.85, ease: "none", immediateRender: false, scrollTrigger: { trigger: radar, start: "top bottom", end: "top 30%", scrub: true } });
      });
      cleanups.push(() => ctx.revert());
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = idle(() => void start());

    return () => {
      disposed = true;
      cancelIdle(idleId);
      for (const c of cleanups.reverse()) c();
    };
  }, [word, heroId, radarId, frostKey]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Static backdrop: visible until (or instead of) the live scene. */}
      <div className={`absolute inset-0 transition-[opacity,visibility] duration-1000 ${live ? "invisible opacity-0" : "visible opacity-100"}`}>
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_25%,rgb(255_181_71/0.16),transparent_70%),radial-gradient(ellipse_40%_35%_at_80%_80%,rgb(94_225_255/0.08),transparent_70%)]" />
      </div>
      <div ref={dimRef} className="absolute inset-0">
        <canvas key={generation} ref={canvasRef} className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? "opacity-100" : "opacity-0"}`} />
      </div>
    </div>
  );
}
