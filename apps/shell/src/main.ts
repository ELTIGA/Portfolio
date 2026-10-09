import "./style.css";
import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { SCREEN, addGlobalLights, buildRoom } from "./room";
import { Pose, Tween, applyPose, clonePose, deskPose, introCurve, zoomPose } from "./rig";
import { notifyParent, rememberSkip, requestSkip } from "./bridge";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const embedded = window.parent !== window;
document.documentElement.dataset.embedded = String(embedded);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type State = "intro" | "desk" | "zoomIn" | "zoomed" | "zoomOut";

/**
 * Device pixel ratio capped by a pixel budget: crisp on laptops, but a 1440p+ display at
 * 2x no longer renders 8+ megapixels with MSAA and shadows every frame.
 */
function budgetDpr(w: number, h: number, megapixels = 3.5) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  return Math.max(1, Math.min(dpr, Math.sqrt((megapixels * 1e6) / Math.max(w * h, 1))));
}

function fail(reason: unknown) {
  console.warn("[shell] 3D unavailable:", reason);
  $("fail").hidden = false;
  $("loading").classList.add("done");
  notifyParent("failed");
  if (!embedded) {
    // Standalone: nothing to show without WebGL, go to the plain portfolio.
    rememberSkip();
    window.location.replace("/");
  }
}

function boot() {
  // ---- Renderers ----------------------------------------------------------------
  const canvas = $<HTMLCanvasElement>("gl");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    fail(err);
    return;
  }
  if (!renderer.getContext()) {
    fail("no webgl context");
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Nothing that casts a shadow ever moves, so shadow maps render once (and after resizes),
  // not every frame the camera moves.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const cssLayer = $<HTMLDivElement>("css-layer");
  const cssRenderer = new CSS3DRenderer({ element: cssLayer });

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0e11, 6000, 14000);
  const cssScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 40, 30000);

  addGlobalLights(scene);
  const room = buildRoom();
  scene.add(room.group);

  // ---- Monitor content: same-origin iframe on the CSS3D layer --------------------
  // The monitor boots: a static boot screen during the fly-in, then the real /desktop
  // app loads once the camera settles (or the visitor heads for it sooner). That keeps a
  // whole second Next.js app from hydrating while the intro flight is running.
  const holder = document.createElement("div");
  holder.className = "monitor";
  holder.style.width = `${SCREEN.iframePx.w}px`;
  holder.style.height = `${SCREEN.iframePx.h}px`;
  const boot = document.createElement("div");
  boot.className = "monitor-boot";
  boot.setAttribute("aria-hidden", "true");
  boot.innerHTML = '<span class="monitor-mark">~/</span><span>desktop<i class="monitor-caret"></i></span>';
  holder.appendChild(boot);
  const iframe = document.createElement("iframe");
  iframe.title = "Interactive portfolio desktop";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("referrerpolicy", "same-origin");
  let iframeRequested = false;
  function loadDesktop() {
    if (iframeRequested) return;
    iframeRequested = true;
    iframe.src = "/desktop";
    holder.appendChild(iframe);
  }
  const cssObject = new CSS3DObject(holder);
  cssObject.position.copy(SCREEN.center);
  cssObject.position.z += 1.5;
  cssObject.scale.setScalar(SCREEN.width / SCREEN.iframePx.w);
  cssScene.add(cssObject);

  // ---- Sizing --------------------------------------------------------------------
  let width = 0;
  let height = 0;
  let dirty = true;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setPixelRatio(budgetDpr(width, height));
    renderer.setSize(width, height);
    renderer.shadowMap.needsUpdate = true;
    cssRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    refit();
  }

  /** Re-derive the resting pose for the current aspect (after a resize, or a move that spanned one). */
  function refit() {
    if (state === "desk") pose = deskPose(camera.aspect);
    if (state === "zoomed") pose = zoomPose(camera.aspect, camera.fov, height);
    dirty = true;
  }

  // ---- State machine ---------------------------------------------------------------
  let state: State = "intro";
  let pose: Pose = introCurve.start();
  let tween: Tween | null = null;
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

  const actionBtn = $<HTMLButtonElement>("action");

  function setState(next: State) {
    state = next;
    document.documentElement.dataset.state = next;
    const zoomed = next === "zoomed";
    canvas.style.pointerEvents = zoomed || next === "zoomIn" ? "none" : "auto";
    cssLayer.inert = !zoomed;
    actionBtn.hidden = !(next === "desk" || zoomed);
    actionBtn.textContent = zoomed ? "Back to room" : "Open the desktop";
    dirty = true;
  }

  function go(to: Pose, seconds: number, next: State, path?: THREE.CatmullRomCurve3) {
    const arrive = () => {
      tween = null;
      if (next === "desk") loadDesktop();
      setState(next);
      refit();
      if (next === "zoomed") iframe.focus({ preventScroll: true });
      else if (next === "desk" && refocusAction) actionBtn.focus({ preventScroll: true });
      refocusAction = false;
    };
    if (reduceMotion || seconds === 0) {
      pose = clonePose(to);
      arrive();
      return;
    }
    tween = new Tween(pose, to, seconds, path, arrive);
  }

  function startIntro() {
    const target = deskPose(camera.aspect);
    if (reduceMotion) {
      pose = target;
      loadDesktop();
      setState("desk");
      return;
    }
    pose = introCurve.start();
    setState("intro");
    go(target, 4.4, "desk", introCurve.path(target));
  }

  function zoomIn() {
    if (state !== "desk") return;
    loadDesktop();
    setState("zoomIn");
    go(zoomPose(camera.aspect, camera.fov, height), 1.15, "zoomed");
  }

  // Zooming out makes the monitor inert, which drops focus to <body>; return it to the control.
  let refocusAction = false;

  function zoomOut() {
    if (state !== "zoomed") return;
    refocusAction = true;
    setState("zoomOut");
    go(deskPose(camera.aspect), 1.0, "desk");
  }

  actionBtn.addEventListener("click", () => (state === "zoomed" ? zoomOut() : zoomIn()));

  // ---- Input -----------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovering = false;

  function hitMonitor(ev: PointerEvent | MouseEvent) {
    ndc.set((ev.clientX / width) * 2 - 1, -(ev.clientY / height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(room.monitorHit, false).length > 0;
  }

  canvas.addEventListener("pointermove", (ev) => {
    parallax.tx = (ev.clientX / width) * 2 - 1;
    parallax.ty = (ev.clientY / height) * 2 - 1;
    if (state !== "desk") return;
    const hit = hitMonitor(ev);
    if (hit !== hovering) {
      hovering = hit;
      canvas.dataset.hover = String(hit);
      room.bezelMaterial.emissiveIntensity = hit ? 0.1 : 0;
      dirty = true;
    }
  });
  canvas.addEventListener("pointerleave", () => {
    parallax.tx = 0;
    parallax.ty = 0;
    if (hovering) {
      hovering = false;
      canvas.dataset.hover = "false";
      room.bezelMaterial.emissiveIntensity = 0;
      dirty = true;
    }
  });
  canvas.addEventListener("click", (ev) => {
    if (state === "intro") {
      tween?.finish(pose);
      return;
    }
    if (state === "desk" && hitMonitor(ev)) zoomIn();
  });

  function onKey(ev: KeyboardEvent) {
    if (ev.key !== "Escape") return;
    // Two-step: leave the monitor first, then leave the 3D scene.
    if (state === "zoomed") {
      ev.preventDefault();
      zoomOut();
    } else if (state !== "zoomIn" && state !== "zoomOut") {
      requestSkip();
    }
  }
  window.addEventListener("keydown", onKey);

  // Standalone "Skip" link: remember the choice so "/" doesn't reopen the intro.
  $("skip").addEventListener("click", rememberSkip);

  // Warm the desktop up as soon as the visitor reaches for it.
  actionBtn.addEventListener("pointerenter", loadDesktop, { once: true });

  iframe.addEventListener("load", () => {
    holder.classList.add("booted");
    try {
      // Same-origin: let Esc inside the desktop step back out of the monitor.
      iframe.contentWindow?.addEventListener("keydown", onKey);
      // The desktop's own "Skip to portfolio" link should leave the 3D scene, not
      // load the plain page inside the monitor.
      iframe.contentDocument?.addEventListener(
        "click",
        (ev) => {
          const a = (ev.target as Element | null)?.closest?.("a");
          if (!a || a.target || ev.defaultPrevented || ev.button !== 0) return;
          // Any link back to the homepage (also "/#work") leaves the 3D scene for the real
          // page, at that section, instead of loading a second homepage inside the monitor.
          const url = new URL(a.href, window.location.href);
          if (url.origin === window.location.origin && url.pathname === "/" && !url.search) {
            ev.preventDefault();
            ev.stopPropagation();
            requestSkip(url.hash);
          }
        },
        true,
      );
    } catch {
      /* cross-origin is not expected; ignore */
    }
  });

  // ---- Loop ------------------------------------------------------------------------
  let raf = 0;
  let last = 0;
  const lookTarget = new THREE.Vector3();

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.25);
    last = now;

    let moving = false;
    if (tween) {
      tween.update(dt, pose);
      moving = true;
    }
    if (!reduceMotion && (state === "desk" || state === "intro")) {
      const k = 1 - Math.exp(-dt * 3.5);
      const nx = parallax.x + (parallax.tx - parallax.x) * k;
      const ny = parallax.y + (parallax.ty - parallax.y) * k;
      if (Math.abs(nx - parallax.x) > 1e-4 || Math.abs(ny - parallax.y) > 1e-4) moving = true;
      parallax.x = nx;
      parallax.y = ny;
    }
    if (!moving && !dirty) return;
    dirty = false;

    const par = state === "desk" || state === "intro" ? 1 : 0;
    applyPose(camera, pose, -parallax.x * 0.05 * par, -parallax.y * 0.022 * par, lookTarget);
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
  }

  function start() {
    if (raf) return;
    last = performance.now();
    dirty = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  window.addEventListener("resize", resize);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    stop();
    fail("context lost");
  });

  // ---- Loading / ready ---------------------------------------------------------------
  // The room is ready once WebGL has drawn it; the monitor boots on its own afterwards.
  let introStarted = false;
  function ready() {
    if (introStarted) return;
    introStarted = true;
    $("loading").classList.add("done");
    notifyParent("ready");
    // Let the fade-out begin, then fly in.
    window.setTimeout(startIntro, reduceMotion ? 0 : 250);
  }

  resize();
  setState("intro");
  if (!document.hidden) start();
  // Two frames: the first compiles shaders and draws shadows, the second is on screen.
  requestAnimationFrame(() => requestAnimationFrame(ready));
  // Hidden or throttled frames must not hold the loader.
  window.setTimeout(ready, 3000);
}

boot();
