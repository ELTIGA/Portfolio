import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { finishShader, fragmentShader, vertexShader } from "./shaders";

export interface SignalScene {
  /** 0..1 for each morph stage; values are eased toward on the GPU clock. */
  setMorph(stage: { intro?: number; globe?: number; radar?: number }): void;
  setRunning(running: boolean): void;
  dispose(): void;
}

interface Options {
  canvas: HTMLCanvasElement;
  word: string;
  fontFamily: string;
  count: number;
  bloom: boolean;
}

const CAMERA_Z = 10;
const FOV = 35;

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

function buildGeometry(count: number, text: Float32Array) {
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

  const g = new THREE.BufferGeometry();
  // `position` is required by three for bounds; the shader never reads it.
  g.setAttribute("position", new THREE.BufferAttribute(cloud, 3));
  g.setAttribute("aCloud", new THREE.BufferAttribute(cloud, 3));
  g.setAttribute("aText", new THREE.BufferAttribute(text, 3));
  g.setAttribute("aGlobe", new THREE.BufferAttribute(globe, 3));
  g.setAttribute("aRadar", new THREE.BufferAttribute(radar, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
  return g;
}

export function createSignalScene({ canvas, word, fontFamily, count, bloom }: Options): SignalScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x05070a, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uToGlobe: { value: 0 },
    uToRadar: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseForce: { value: 0 },
    uPixelRatio: { value: dpr },
    uSize: { value: 2.2 },
    uTextScale: { value: new THREE.Vector2(1, 1) },
    uTextCenter: { value: new THREE.Vector3() },
    uGlobeCenter: { value: new THREE.Vector3() },
    uGlobeRadius: { value: 1.6 },
    uRadarCenter: { value: new THREE.Vector3() },
    uRadarRadius: { value: 3 },
  };

  const geometry = buildGeometry(count, sampleText(word, fontFamily, count));
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
  const bloomPass = bloom ? new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.6, 0.12) : null;
  if (bloomPass) composer.addPass(bloomPass);
  const finish = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // Without bloom, points are 1-2px and a strong RGB split turns them into rainbow noise.
      uAberration: { value: bloom ? 0.018 : 0.003 },
    },
    vertexShader: finishShader.vertexShader,
    fragmentShader: finishShader.fragmentShader,
  });
  composer.addPass(finish);

  // Layout depends on aspect: the name spans most of the width on wide screens,
  // the globe sits to the right on desktop and centered behind content on phones.
  const layout = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloomPass?.resolution.set(w / 2, h / 2);
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
    uniforms.uSize.value = wide ? 2.2 : 3;
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(canvas);

  // Cursor -> point on the z=0 plane.
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const mouseTarget = new THREE.Vector3(99, 99, 0);
  let lastMove = 0;
  const onMove = (e: PointerEvent) => {
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) mouseTarget.copy(hit);
    lastMove = performance.now();
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const target = { intro: 0, globe: 0, radar: 0 };
  let last = 0;
  let elapsed = 0;
  let running = false;
  let raf = 0;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    // Morphs ease on wall-clock time so slow GPUs still finish them; noise time is clamped.
    const real = Math.min((now - last) / 1000, 0.5);
    const dt = Math.min(real, 0.05);
    last = now;
    elapsed += dt;
    const t = elapsed;
    uniforms.uTime.value = t;
    finish.uniforms.uTime.value = t;
    const k = 1 - Math.exp(-real * 3.2);
    uniforms.uIntro.value += (target.intro - uniforms.uIntro.value) * (1 - Math.exp(-real * 1.6));
    uniforms.uToGlobe.value += (target.globe - uniforms.uToGlobe.value) * k;
    uniforms.uToRadar.value += (target.radar - uniforms.uToRadar.value) * k;
    uniforms.uMouse.value.lerp(mouseTarget, 1 - Math.exp(-dt * 10));
    const active = performance.now() - lastMove < 1200 ? 1 : 0;
    uniforms.uMouseForce.value += (active - uniforms.uMouseForce.value) * (1 - Math.exp(-dt * 4));
    // A slow camera drift keeps the scene alive even when nothing moves.
    camera.position.x = Math.sin(t * 0.11) * 0.25 + uniforms.uMouse.value.x * 0.015;
    camera.position.y = Math.cos(t * 0.09) * 0.15;
    camera.lookAt(0, 0, 0);
    composer.render(dt);
  };

  return {
    setMorph(stage) {
      if (stage.intro !== undefined) target.intro = stage.intro;
      if (stage.globe !== undefined) target.globe = stage.globe;
      if (stage.radar !== undefined) target.radar = stage.radar;
    },
    setRunning(next) {
      if (next === running) return;
      running = next;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geometry.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
