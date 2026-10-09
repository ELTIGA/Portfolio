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
  const holder = document.createElement("div");
  holder.style.width = `${SCREEN.iframePx.w}px`;
  holder.style.height = `${SCREEN.iframePx.h}px`;
  holder.style.background = "#0b0e11";
  const iframe = document.createElement("iframe");
  iframe.title = "Interactive portfolio desktop";
  iframe.src = "/desktop";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("referrerpolicy", "same-origin");
  holder.appendChild(iframe);
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
    // 1.5 keeps large/HiDPI screens with shadows affordable on integrated GPUs.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
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
      setState("desk");
      return;
    }
    pose = introCurve.start();
    setState("intro");
    go(target, 4.4, "desk", introCurve.path(target));
  }

  function zoomIn() {
    if (state !== "desk") return;
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

  iframe.addEventListener("load", () => {
    iframeLoaded = true;
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
          const url = new URL(a.href, window.location.href);
          if (url.origin === window.location.origin && url.pathname === "/" && !url.hash && !url.search) {
            ev.preventDefault();
            ev.stopPropagation();
            requestSkip();
          }
        },
        true,
      );
    } catch {
      /* cross-origin is not expected; ignore */
    }
    maybeReady();
  });

  // ---- Loop ------------------------------------------------------------------------
  let raf = 0;
  let last = 0;
  const scratch = new THREE.Vector3();

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.25);
    last = now;

    // No pointer parallax: the monitor content is a CSS3D layer composited separately
    // from the WebGL bezel, so any idle camera motion makes the two drift apart and
    // the screen visibly swims and flickers. The camera only moves during tweens.
    if (tween) tween.update(dt, pose);
    else if (!dirty) return;
    dirty = false;

    applyPose(camera, pose, scratch);
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
  let iframeLoaded = false;
  let introStarted = false;
  function maybeReady(force = false) {
    if (introStarted || (!iframeLoaded && !force)) return;
    introStarted = true;
    $("loading").classList.add("done");
    notifyParent("ready");
    // Let the fade-out begin, then fly in.
    window.setTimeout(startIntro, reduceMotion ? 0 : 250);
  }
  // Never hold the user on the loader if the desktop is slow.
  window.setTimeout(() => maybeReady(true), 6000);

  resize();
  setState("intro");
  if (!document.hidden) start();
}

boot();
