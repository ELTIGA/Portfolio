import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { finishShader, fragmentShader, vertexShader } from "./shaders";
import type { Quality } from "./quality";

type Morph = { intro: number; globe: number; radar: number };

export interface SignalScene {
  /** 0..1 for each morph stage; values are eased toward on the GPU clock. */
  setMorph(stage: Partial<Morph>): void;
  /** 0..1: defocus the field (soft, larger, dimmer points) behind glassy panels. */
  setFrost(v: number): void;
  /** Particles, resolution, bloom and frame rate; applied live without a rebuild. */
  setQuality(q: Quality): void;
  /**
   * Below the hero the field sits dimmed behind content: once its morphs settle it renders
   * at 30fps, and at 15fps when nobody has scrolled or moved the pointer for a moment.
   */
  setZone(zone: { dimmed: boolean }): void;
  /** Marks user activity (scroll); pointer moves are tracked by the scene itself. */
  poke(): void;
  setRunning(running: boolean): void;
  dispose(): void;
}

/** CPU-side particle data, built once and reused when the scene is rebuilt. */
export interface SceneData {
  count: number;
  cloud: Float32Array;
  text: Float32Array;
  globe: Float32Array;
  radar: Float32Array;
  seed: Float32Array;
}

interface Options {
  canvas: HTMLCanvasElement;
  data: SceneData;
  quality: Quality;
  /** Globe/radar stages to start from (after a rebuild mid-page). */
  initial?: { globe?: number; radar?: number };
  /** Called with the interval (ms) between rendered frames at the full tier rate. */
  onSample?: (ms: number, budgetMs: number) => void;
}

const CAMERA_Z = 10;
const FOV = 35;
const DIM_FPS = 30;
const IDLE_FPS = 15;
const IDLE_AFTER_MS = 1500;
// Fully defocused points are soft discs: half the pixels look the same and cost half.
const FROST_PIXELS = 0.45;

/** Pixel-samples `word` from a 2D canvas into normalized positions (x in -1..1). */
function sampleText(word: string, fontFamily: string, count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const w = 1400;
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return out;
  // Size the word so it spans 94% of the canvas width, whatever font actually loaded.
  probe.font = `800 100px ${fontFamily}`;
  const size = Math.floor((100 * w * 0.94) / Math.max(probe.measureText(word).width, 1));
  const h = Math.ceil(size * 0.9);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return out;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${size}px ${fontFamily}`;
  ctx.fillText(word, w / 2, h / 2 + size * 0.05);
  const data = ctx.getImageData(0, 0, w, h).data;
  const hits: number[] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 140) hits.push(x, y);
    }
  }
  // Release the 2D backing stores now rather than at the next GC.
  c.width = c.height = 0;
  const pairs = hits.length / 2;
  for (let i = 0; i < count; i++) {
    if (pairs === 0) break;
    const k = Math.floor(Math.random() * pairs) * 2;
    const x = hits[k] + Math.random() * 2;
    const y = hits[k + 1] + Math.random() * 2;
    out[i * 3] = (x / w) * 2 - 1;
    out[i * 3 + 1] = -((y / h) * 2 - 1) * (h / w);
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
  }
  return out;
}

/**
 * Builds all four target shapes. Particle order is shuffled at the end so that any
 * prefix is an even sample of every shape: lower quality tiers draw only the first N.
 */
export function buildSceneData(word: string, fontFamily: string, count: number): SceneData {
  const text = sampleText(word, fontFamily, count);
  const cloud = new Float32Array(count * 3);
  const globe = new Float32Array(count * 3);
  const radar = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const s = Math.random();
    seed[i] = s;

    // Cloud: a wide, shallow volume that fills the viewport.
    const r = 4 + Math.random() * 9;
    const th = Math.random() * Math.PI * 2;
    cloud[i * 3] = Math.cos(th) * r * 1.4;
    cloud[i * 3 + 1] = (Math.random() - 0.5) * 9;
    cloud[i * 3 + 2] = Math.sin(th) * r - 6;

    // Globe: 72% on a Fibonacci sphere, the rest on three tilted orbit rings.
    if (i % 25 < 18) {
      const y = 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const phi = i * golden;
      globe[i * 3] = Math.cos(phi) * rad;
      globe[i * 3 + 1] = y;
      globe[i * 3 + 2] = Math.sin(phi) * rad;
    } else {
      const ring = i % 3;
      const a = Math.random() * Math.PI * 2;
      const rr = 1.35 + ring * 0.22 + (Math.random() - 0.5) * 0.015;
      const tilt = [0.35, -0.6, 1.1][ring];
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      globe[i * 3] = x;
      globe[i * 3 + 1] = z * Math.sin(tilt);
      globe[i * 3 + 2] = z * Math.cos(tilt);
    }

    // Radar: concentric rings plus radial spokes, in its own xy plane.
    const band = Math.random();
    let rr: number;
    let a: number;
    if (band < 0.7) {
      rr = (Math.floor(Math.random() * 6) + 1) / 6 + (Math.random() - 0.5) * 0.008;
      a = Math.random() * Math.PI * 2;
    } else if (band < 0.85) {
      rr = Math.random();
      a = (Math.floor(Math.random() * 12) / 12) * Math.PI * 2;
    } else {
      rr = Math.sqrt(Math.random());
      a = Math.random() * Math.PI * 2;
    }
    radar[i * 3] = Math.cos(a) * rr;
    radar[i * 3 + 1] = Math.sin(a) * rr;
    radar[i * 3 + 2] = 0;
  }

  // Fisher-Yates over whole particles (the globe's Fibonacci order is index-based).
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    for (const arr of [cloud, globe, radar]) {
      for (let k = 0; k < 3; k++) {
        const t = arr[i * 3 + k];
        arr[i * 3 + k] = arr[j * 3 + k];
        arr[j * 3 + k] = t;
      }
    }
    const t = seed[i];
    seed[i] = seed[j];
    seed[j] = t;
  }
  return { count, cloud, text, globe, radar, seed };
}

function buildGeometry(d: SceneData) {
  const g = new THREE.BufferGeometry();
  // `position` is required by three for draw counts; the shader never reads it.
  const cloud = new THREE.BufferAttribute(d.cloud, 3);
  g.setAttribute("position", cloud);
  g.setAttribute("aCloud", cloud);
  g.setAttribute("aText", new THREE.BufferAttribute(d.text, 3));
  g.setAttribute("aGlobe", new THREE.BufferAttribute(d.globe, 3));
  g.setAttribute("aRadar", new THREE.BufferAttribute(d.radar, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(d.seed, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
  return g;
}

/** Device pixel ratio that keeps the canvas under `megapixels` (device pixels). */
function budgetDpr(w: number, h: number, megapixels: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  return Math.max(0.75, Math.min(dpr, Math.sqrt((megapixels * 1e6) / Math.max(w * h, 1))));
}

export function createSignalScene({ canvas, data, quality, initial, onSample }: Options): SignalScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x05070a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uToGlobe: { value: initial?.globe ?? 0 },
    uToRadar: { value: initial?.radar ?? 0 },
    // Which noise terms can affect the result this frame (see the vertex shader).
    uNeed: { value: new THREE.Vector4(1, 1, 1, 1) },
    uFrost: { value: 0 },
    uGlow: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseForce: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 2.2 },
    uTextScale: { value: new THREE.Vector2(1, 1) },
    uTextCenter: { value: new THREE.Vector3() },
    uGlobeCenter: { value: new THREE.Vector3() },
    uGlobeRadius: { value: 1.6 },
    uRadarCenter: { value: new THREE.Vector3() },
    uRadarRadius: { value: 3 },
  };

  const geometry = buildGeometry(data);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let bloomPass: UnrealBloomPass | null = null;
  const finish = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAberration: { value: 0.018 },
    },
    vertexShader: finishShader.vertexShader,
    fragmentShader: finishShader.fragmentShader,
  });
  composer.addPass(finish);

  let q = quality;
  let dpr = 1;
  let needsDraw = true;
  let lowRes = false;

  // Layout depends on aspect: the name spans most of the width on wide screens,
  // the globe sits to the right on desktop and centered behind content on phones.
  const layout = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    dpr = budgetDpr(w, h, q.megapixels * (lowRes ? FROST_PIXELS : 1));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    // Bloom is a blur: it runs at a fraction of the canvas resolution (setSize halves it
    // again for its first mip). `resolution` on the pass is only read by its constructor.
    bloomPass?.setSize(Math.round(w * dpr * q.bloom), Math.round(h * dpr * q.bloom));
    uniforms.uPixelRatio.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    finish.uniforms.uResolution.value.set(w * dpr, h * dpr);

    const visH = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * camera.aspect;
    const wide = camera.aspect > 1.1;
    const span = Math.min(visW * (wide ? 0.46 : 0.47), visH * 1.5);
    uniforms.uTextScale.value.set(span, span);
    uniforms.uTextCenter.value.set(0, wide ? visH * 0.13 : visH * 0.2, 0);
    uniforms.uGlobeCenter.value.set(wide ? visW * 0.24 : 0, wide ? 0 : visH * 0.05, -1);
    uniforms.uGlobeRadius.value = wide ? Math.min(visH * 0.27, visW * 0.16) : visW * 0.3;
    uniforms.uRadarCenter.value.set(wide ? visW * 0.12 : 0, -visH * (wide ? 0.22 : 0.46), -1);
    uniforms.uRadarRadius.value = Math.min(visW * 0.42, visH * 0.6);
    // Desktop tiers that lose bloom get bigger, softer sprites in its place; phones never
    // had bloom, so their look stays exactly as designed.
    const standIn = wide && !q.bloom;
    uniforms.uSize.value = wide ? 2.2 * (standIn ? 1.2 : 1) : 3;
    uniforms.uGlow.value = standIn ? 1 : 0;
    needsDraw = true;
  };

  const applyQuality = () => {
    if (q.bloom && !bloomPass) {
      bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.6, 0.12);
      composer.insertPass(bloomPass, 1);
    } else if (!q.bloom && bloomPass) {
      composer.removePass(bloomPass);
      bloomPass.dispose();
      bloomPass = null;
    }
    // Without bloom, points are 1-2px and a strong RGB split turns them into rainbow noise;
    // a softer, brighter sprite stands in for the glow.
    finish.uniforms.uAberration.value = q.bloom ? 0.018 : 0.003;
    geometry.setDrawRange(0, Math.min(q.count, data.count));
    layout();
  };
  applyQuality();
  const ro = new ResizeObserver(() => {
    layout();
    // A resize clears the canvas; draw once even while the loop is asleep.
    if (!raf && !timer && running) composer.render(0);
  });
  ro.observe(canvas);

  // Cursor -> point on the z=0 plane.
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const mouseTarget = new THREE.Vector3(99, 99, 0);
  let lastMove = 0;
  let lastInput = performance.now();
  const onMove = (e: PointerEvent) => {
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) mouseTarget.copy(hit);
    lastMove = lastInput = performance.now();
    wake();
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  // A blurred window keeps the last frame on screen and stops rendering.
  let focused = document.hasFocus();
  const onFocus = () => {
    focused = true;
    lastInput = performance.now();
    wake();
  };
  const onBlur = () => (focused = false);
  window.addEventListener("focus", onFocus);
  window.addEventListener("blur", onBlur);

  // The name always assembles from the cloud; later stages can start already reached.
  const target: Morph = { intro: 1, globe: initial?.globe ?? 0, radar: initial?.radar ?? 0 };
  let frost = 0;
  let dimmed = false;
  let lastFrame = 0;
  let lastRender = 0;
  let elapsed = 0;
  let running = false;
  let raf = 0;
  let timer = 0;

  /** Eases `cur` toward `to`, snapping when close so the shader can skip settled work. */
  const ease = (cur: number, to: number, k: number) => {
    const next = cur + (to - cur) * k;
    return Math.abs(to - next) < 5e-4 ? to : next;
  };

  const settled = () =>
    uniforms.uIntro.value === target.intro &&
    uniforms.uToGlobe.value === target.globe &&
    uniforms.uToRadar.value === target.radar &&
    uniforms.uFrost.value === frost &&
    uniforms.uMouseForce.value < 0.01;

  const currentFps = (now: number) => {
    if (!dimmed || !settled()) return q.fps;
    return Math.min(q.fps, now - lastInput > IDLE_AFTER_MS ? IDLE_FPS : DIM_FPS);
  };

  /**
   * Sleeps on a timer until shortly before the next frame is due, then asks for a vsync.
   * Requesting every vsync and skipping (the obvious frame cap) still wakes the whole
   * page pipeline 120 times a second on a ProMotion display.
   */
  const schedule = (delay: number) => {
    if (delay > 4) timer = window.setTimeout(() => {
      timer = 0;
      raf = requestAnimationFrame(frame);
    }, delay);
    else raf = requestAnimationFrame(frame);
  };

  const frame = () => {
    raf = 0;
    if (!running || !focused) return;
    const now = performance.now();
    const fps = currentFps(now);
    const interval = 1000 / fps;
    if (!needsDraw && now - lastRender < interval - 2) {
      schedule(interval - (now - lastRender) - 6);
      return;
    }
    if (fps === q.fps && lastRender && onSample) onSample(now - lastRender, interval);
    lastRender = now;
    needsDraw = false;

    // Morphs ease on wall-clock time so slow GPUs still finish them; noise time is clamped.
    const real = Math.min((now - lastFrame) / 1000, 0.5);
    const dt = Math.min(real, 0.1);
    lastFrame = now;
    elapsed += dt;
    const t = elapsed;
    uniforms.uTime.value = t;
    finish.uniforms.uTime.value = t;
    const k = 1 - Math.exp(-real * 3.2);
    uniforms.uIntro.value = ease(uniforms.uIntro.value, target.intro, 1 - Math.exp(-real * 1.6));
    uniforms.uToGlobe.value = ease(uniforms.uToGlobe.value, target.globe, k);
    uniforms.uToRadar.value = ease(uniforms.uToRadar.value, target.radar, k);
    uniforms.uFrost.value = ease(uniforms.uFrost.value, frost, 1 - Math.exp(-real * 2.4));
    // Drop resolution only once the defocus is nearly complete, so the switch is invisible.
    if (!lowRes && frost === 1 && uniforms.uFrost.value > 0.9) {
      lowRes = true;
      layout();
    }
    uniforms.uMouse.value.lerp(mouseTarget, 1 - Math.exp(-dt * 10));
    const active = now - lastMove < 1200 ? 1 : 0;
    uniforms.uMouseForce.value += (active - uniforms.uMouseForce.value) * (1 - Math.exp(-dt * 4));

    // Skip noise for shapes that cannot show this frame. Every vertex takes the same
    // branch (the flags are uniforms), so this is cheap on any GPU.
    const intro = uniforms.uIntro.value;
    const globe = uniforms.uToGlobe.value;
    const radar = uniforms.uToRadar.value;
    const moving = [intro, globe, radar].some((v) => v > 0 && v < 1);
    uniforms.uNeed.value.set(
      intro < 1 && globe < 1 && radar < 1 ? 1 : 0, // cloud drift
      globe < 1 && radar < 1 ? 1 : 0, // name shimmer
      radar > 0 ? 1 : 0, // radar ripple
      moving ? 1 : 0, // in-flight turbulence
    );

    // A slow camera drift keeps the scene alive even when nothing moves.
    camera.position.x = Math.sin(t * 0.11) * 0.25 + uniforms.uMouse.value.x * 0.015;
    camera.position.y = Math.cos(t * 0.09) * 0.15;
    camera.lookAt(0, 0, 0);
    composer.render(dt);
    schedule(interval - (performance.now() - now) - 6);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    raf = timer = 0;
  };

  function wake() {
    if (!running || !focused || raf) return;
    // Something changed: don't wait out an idle-rate timer.
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    } else lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }

  return {
    setMorph(stage) {
      if (stage.intro !== undefined) target.intro = stage.intro;
      if (stage.globe !== undefined) target.globe = stage.globe;
      if (stage.radar !== undefined) target.radar = stage.radar;
      wake();
    },
    setFrost(v) {
      frost = v;
      // Sharpening back up: full resolution first, before the points shrink.
      if (!v && lowRes) {
        lowRes = false;
        layout();
      }
      wake();
    },
    setQuality(next) {
      q = next;
      applyQuality();
      wake();
    },
    setZone(zone) {
      dimmed = zone.dimmed;
      wake();
    },
    poke() {
      lastInput = performance.now();
      wake();
    },
    setRunning(next) {
      if (next === running) return;
      running = next;
      if (running) wake();
      else stop();
    },
    dispose() {
      running = false;
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      geometry.dispose();
      material.dispose();
      // composer.dispose() frees only its own two targets; the passes own theirs.
      bloomPass?.dispose();
      finish.dispose();
      composer.dispose();
      renderer.dispose();
      // Hand the GPU memory back now instead of whenever the context is collected.
      renderer.forceContextLoss();
    },
  };
}
