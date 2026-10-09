"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "./gsap";

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;
type NavigatorExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

function canRun() {
  // ?gl=1 forces the scene on (screenshots, software renderers); ?gl=0 forces it off.
  const force = new URLSearchParams(window.location.search).get("gl");
  if (force === "0") return false;
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
 * radar sweep at the contact section. Falls back to a static CSS backdrop whenever
 * WebGL2 is missing, slow, software-rendered, or motion is reduced.
 */
export function SignalField({ word, heroId, radarId }: { word: string; heroId: string; radarId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dim = dimRef.current;
    if (!canvas || !dim || !canRun()) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const start = async () => {
      await document.fonts?.ready;
      const [{ createSignalScene }, { gsap, ScrollTrigger }] = await Promise.all([import("./signal-field/scene"), loadGsap()]);
      if (disposed) return;
      const mobile = window.innerWidth < 768;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-shoulders").trim() || "Impact, sans-serif";
      let scene: ReturnType<typeof createSignalScene>;
      try {
        scene = createSignalScene({ canvas, word, fontFamily: family, count: mobile ? 20000 : 52000, bloom: !mobile });
      } catch {
        return; // no context after all: the CSS backdrop stays
      }
      cleanups.push(() => {
        scene.dispose();
        document.documentElement.classList.remove("gl-live");
      });
      setLive(true);
      document.documentElement.classList.add("gl-live");

      // Run only while visible, the tab is focused, and the 3D intro overlay is closed.
      let introOpen = false;
      const sync = () => scene.setRunning(!document.hidden && !introOpen);
      const onIntro = (e: Event) => {
        introOpen = e.type === "intro3d:open";
        sync();
      };
      document.addEventListener("visibilitychange", sync);
      window.addEventListener("intro3d:open", onIntro);
      window.addEventListener("intro3d:close", onIntro);
      cleanups.push(() => {
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("intro3d:open", onIntro);
        window.removeEventListener("intro3d:close", onIntro);
      });
      sync();
      scene.setMorph({ intro: 1 });

      const hero = document.getElementById(heroId);
      const radar = document.getElementById(radarId);
      const ctx = gsap.context(() => {
        if (hero)
          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom 30%",
            onUpdate: (st) => scene.setMorph({ globe: st.progress > 0.25 ? 1 : 0 }),
          });
        if (radar)
          ScrollTrigger.create({
            trigger: radar,
            start: "top 70%",
            onToggle: (st) => scene.setMorph({ radar: st.isActive ? 1 : 0 }),
          });
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
    idle(() => void start());

    return () => {
      disposed = true;
      for (const c of cleanups.reverse()) c();
    };
  }, [word, heroId, radarId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Static backdrop: visible until (or instead of) the live scene. */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}>
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_25%,rgb(255_181_71/0.16),transparent_70%),radial-gradient(ellipse_40%_35%_at_80%_80%,rgb(94_225_255/0.08),transparent_70%)]" />
      </div>
      <div ref={dimRef} className="absolute inset-0">
        <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? "opacity-100" : "opacity-0"}`} />
      </div>
    </div>
  );
}
