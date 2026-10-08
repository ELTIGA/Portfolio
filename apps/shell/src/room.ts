import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Procedural room. 1 world unit = 1 mm, which keeps the CSS3DRenderer (where one
 * world unit is one CSS pixel) well behaved. Everything is built from three.js
 * primitives; there are no external model or texture files.
 */

export const COLORS = {
  bg: 0x0b0e11,
  wall: 0x1b2430,
  wallTrim: 0x0f1419,
  floor: 0x10151a,
  rug: 0x14241d,
  desk: 0x6a4b36,
  deskDark: 0x2a2f36,
  metal: 0x2b3138,
  bezel: 0x15191e,
  accent: 0x3ddc97,
  warm: 0xffc98a,
  leaf: 0x2f9a67,
  leafDark: 0x1f6d49,
  pot: 0xe6e2da,
  paper: 0xd9d4c8,
} as const;

/** Screen geometry in world units; iframe is 1280x800 CSS px (16:10). */
export const SCREEN = {
  width: 690,
  height: 431.25,
  center: new THREE.Vector3(0, 1118, -160),
  iframePx: { w: 1280, h: 800 },
} as const;

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function std(color: number, roughness = 0.75, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function rbox(w: number, h: number, d: number, r: number, mat: THREE.Material, seg = 3) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.1, h / 2 - 0.1, d / 2 - 0.1)), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(w: number, h: number, d: number, mat: THREE.Material, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

function cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number) {
  o.position.set(x, y, z);
  return o;
}

export interface Room {
  group: THREE.Group;
  /** Meshes that count as "the monitor" for hover/click. */
  monitorHit: THREE.Object3D[];
  bezelMaterial: THREE.MeshStandardMaterial;
  /** Transparent "hole" that reveals the CSS3D iframe layer behind the canvas. */
  screenHole: THREE.Mesh;
  /** Lights that follow the screen content brightness. */
  screenGlow: THREE.PointLight;
}

export function buildRoom(): Room {
  const group = new THREE.Group();
  const DESK_Y = 740;

  // ---- Shell: floor, walls, rug -------------------------------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), std(COLORS.floor, 0.9));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const rug = new THREE.Mesh(new THREE.CircleGeometry(1250, 64), std(COLORS.rug, 1));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-50, 2, 330);
  rug.scale.set(1.2, 1, 1);
  rug.receiveShadow = true;
  group.add(rug);
  const rugRing = new THREE.Mesh(new THREE.RingGeometry(1160, 1190, 64), std(COLORS.accent, 0.8, 0, { emissive: COLORS.accent, emissiveIntensity: 0.07 }));
  rugRing.rotation.x = -Math.PI / 2;
  rugRing.position.set(-50, 3, 330);
  rugRing.scale.set(1.2, 1, 1);
  group.add(rugRing);

  const wallMat = std(COLORS.wall, 0.95);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(7000, 3400), wallMat);
  backWall.position.set(0, 1700, -700);
  backWall.receiveShadow = true;
  group.add(backWall);

  const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(5000, 3400), wallMat);
  sideWall.rotation.y = Math.PI / 2;
  sideWall.position.set(-2300, 1700, 1800);
  sideWall.receiveShadow = true;
  group.add(sideWall);

  // Skirting boards
  const trimMat = std(COLORS.wallTrim, 0.8);
  group.add(at(box(7000, 110, 14, trimMat, false), 0, 55, -693));
  const sideTrim = box(14, 110, 5000, trimMat, false);
  group.add(at(sideTrim, -2293, 55, 1800));

  // ---- Desk ---------------------------------------------------------------------
  const deskMat = std(COLORS.desk, 0.6, 0.0);
  const top = rbox(1900, 44, 820, 10, deskMat);
  top.position.set(0, DESK_Y - 22, -10);
  group.add(top);
  const legMat = std(COLORS.deskDark, 0.5, 0.6);
  for (const sx of [-1, 1]) {
    const leg = box(40, DESK_Y - 44, 700, legMat);
    leg.position.set(sx * 880, (DESK_Y - 44) / 2, -10);
    group.add(leg);
  }
  group.add(at(box(1720, 40, 20, legMat), 0, DESK_Y - 120, -330));

  // Desk mat
  const mat = rbox(980, 5, 420, 3, std(0x1b2027, 0.95));
  mat.position.set(60, DESK_Y + 2.5, 150);
  mat.castShadow = false;
  group.add(mat);

  // ---- Monitor ------------------------------------------------------------------
  const bezelMaterial = std(COLORS.bezel, 0.4, 0.3, { emissive: COLORS.accent, emissiveIntensity: 0 });
  const monitor = new THREE.Group();
  monitor.position.copy(SCREEN.center);
  const bezelW = SCREEN.width + 44;
  const bezelH = SCREEN.height + 44;
  const bezel = rbox(bezelW, bezelH, 36, 12, bezelMaterial, 5);
  bezel.position.z = -19; // front face sits 1 unit behind the origin plane; the screen hole is in front of it
  monitor.add(bezel);
  // chin
  const chin = rbox(bezelW, 26, 36, 8, bezelMaterial);
  chin.position.set(0, -bezelH / 2 + 4, -18);
  monitor.add(chin);
  // tiny power LED
  const led = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8), new THREE.MeshBasicMaterial({ color: COLORS.accent }));
  led.position.set(bezelW / 2 - 30, -bezelH / 2 + 5, 3);
  monitor.add(led);

  // Screen "hole": writes transparent black so the CSS3D layer behind the canvas shows through.
  const holeMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0,
    transparent: true,
    blending: THREE.NoBlending,
    side: THREE.FrontSide,
  });
  const screenHole = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.width, SCREEN.height), holeMat);
  screenHole.position.z = 1.5;
  screenHole.renderOrder = 10;
  monitor.add(screenHole);
  group.add(monitor);

  // Stand
  const standMat = std(0x20262c, 0.35, 0.7);
  const neck = rbox(86, 330, 22, 6, standMat);
  neck.position.set(0, DESK_Y + 150 + 40, SCREEN.center.z - 38);
  group.add(neck);
  const base = rbox(380, 14, 230, 6, standMat);
  base.position.set(0, DESK_Y + 7, SCREEN.center.z + 15);
  group.add(base);

  // Screen glow on the desk
  const screenGlow = new THREE.PointLight(0x8fe9c4, 0.55, 1500, 0);
  screenGlow.position.set(0, SCREEN.center.y - 60, SCREEN.center.z + 220);
  group.add(screenGlow);

  // ---- Keyboard + mouse ---------------------------------------------------------
  const kb = new THREE.Group();
  kb.position.set(0, DESK_Y + 5, 175);
  kb.rotation.x = -0.05;
  kb.add(at(rbox(470, 18, 160, 6, std(0x1d2228, 0.5, 0.4)), 0, 9, 0));
  const keyGeo = new RoundedBoxGeometry(26, 9, 26, 2, 3);
  const keyMat = std(0x303842, 0.55, 0.1);
  const rows = [14, 14, 13, 12];
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, rows.reduce((a, b) => a + b, 0) + 1);
  const dummy = new THREE.Object3D();
  let ki = 0;
  rows.forEach((n, r) => {
    for (let c = 0; c < n; c++) {
      dummy.position.set(-212 + c * 32.2 + r * 3, 20, -52 + r * 31);
      dummy.updateMatrix();
      keys.setMatrixAt(ki++, dummy.matrix);
    }
  });
  dummy.position.set(0, 20, 72);
  dummy.scale.set(8, 1, 1);
  dummy.updateMatrix();
  keys.setMatrixAt(ki++, dummy.matrix);
  keys.receiveShadow = true;
  kb.add(keys);
  // accent keycap
  const esc = rbox(26, 9, 26, 3, std(COLORS.accent, 0.5, 0, { emissive: COLORS.accent, emissiveIntensity: 0.25 }));
  esc.position.set(-212, 21, -52);
  kb.add(esc);
  group.add(kb);

  const pad = rbox(260, 4, 220, 3, std(0x1b2027, 0.95));
  pad.position.set(430, DESK_Y + 2, 160);
  pad.castShadow = false;
  group.add(pad);
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), std(0x2a3037, 0.4, 0.3));
  mouse.scale.set(32, 17, 54);
  mouse.position.set(430, DESK_Y + 17, 160);
  mouse.rotation.y = 0.15;
  mouse.castShadow = true;
  group.add(mouse);

  // ---- Mug ----------------------------------------------------------------------
  const mug = new THREE.Group();
  mug.position.set(-470, DESK_Y, 120);
  const mugMat = std(COLORS.pot, 0.35);
  const mugBody = cyl(44, 40, 96, mugMat);
  mugBody.position.y = 48;
  mug.add(mugBody);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(38, 32), std(0x2a1a10, 0.3));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 90;
  mug.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(24, 6, 10, 24, Math.PI), mugMat);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(46, 50, 0);
  handle.castShadow = true;
  mug.add(handle);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(44.4, 40.4, 14, 32, 1, true), std(COLORS.accent, 0.5));
  band.position.y = 56;
  mug.add(band);
  group.add(mug);

  // Notebook + pen
  const nb = rbox(180, 14, 240, 3, std(0x20303a, 0.7));
  nb.position.set(-640, DESK_Y + 7, 160);
  nb.rotation.y = 0.18;
  group.add(nb);
  const nbPage = box(168, 6, 232, std(COLORS.paper, 0.9), false);
  nbPage.position.set(-640, DESK_Y + 11, 160);
  nbPage.rotation.y = 0.18;
  group.add(nbPage);
  const pen = cyl(4, 4, 150, std(COLORS.accent, 0.4));
  pen.rotation.set(Math.PI / 2, 0, 0.6);
  pen.position.set(-560, DESK_Y + 20, 210);
  group.add(pen);

  // ---- Desk lamp ----------------------------------------------------------------
  const lamp = new THREE.Group();
  lamp.position.set(-760, DESK_Y, -230);
  const lampMat = std(0x1c2127, 0.35, 0.7);
  lamp.add(at(cyl(85, 95, 16, lampMat), 0, 8, 0));
  const arm1 = cyl(7, 7, 380, lampMat, 12);
  arm1.position.set(40, 200, 0);
  arm1.rotation.z = -0.22;
  lamp.add(arm1);
  const joint = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12), lampMat);
  joint.position.set(112, 385, 0);
  lamp.add(joint);
  const arm2 = cyl(6, 6, 330, lampMat, 12);
  arm2.position.set(250, 340, 0);
  arm2.rotation.z = Math.PI / 2 - 0.35;
  lamp.add(arm2);
  const headPivot = new THREE.Group();
  headPivot.position.set(395, 298, 0);
  headPivot.rotation.z = -0.55;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(78, 120, 32, 1, true), std(0x242b32, 0.4, 0.6, { side: THREE.DoubleSide }));
  shade.position.y = -40;
  shade.castShadow = false;
  headPivot.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(28, 16, 12), new THREE.MeshBasicMaterial({ color: COLORS.warm }));
  bulb.position.y = -72;
  headPivot.add(bulb);
  lamp.add(headPivot);
  group.add(lamp);

  const lampLight = new THREE.SpotLight(COLORS.warm, 9, 1900, 0.9, 0.7, 0);
  lampLight.position.set(-760 + 395 + 10, DESK_Y + 215, -230);
  lampLight.target.position.set(-480, DESK_Y, 90);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0004;
  lampLight.shadow.radius = 5;
  group.add(lampLight, lampLight.target);

  // ---- Plants -------------------------------------------------------------------
  const makePlant = (seed: number, scale: number, leaves: number) => {
    const rand = rng(seed);
    const p = new THREE.Group();
    const potMat = std(COLORS.pot, 0.6);
    const potMesh = cyl(70, 52, 120, potMat);
    potMesh.position.y = 60;
    p.add(potMesh);
    p.add(at(new THREE.Mesh(new THREE.CylinderGeometry(62, 62, 6, 32), std(0x2a1d14, 1)), 0, 121, 0));
    for (let i = 0; i < leaves; i++) {
      const pivot = new THREE.Group();
      pivot.position.y = 122;
      pivot.rotation.y = (i / leaves) * Math.PI * 2 + rand() * 0.7;
      const tilt = new THREE.Group();
      tilt.rotation.z = 0.12 + rand() * 0.75;
      const len = 150 + rand() * 170;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), std(rand() > 0.5 ? COLORS.leaf : COLORS.leafDark, 0.65));
      leaf.scale.set(26 + rand() * 12, len / 2, 6);
      leaf.position.y = len / 2;
      leaf.rotation.y = rand() * 0.6;
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      tilt.add(leaf);
      pivot.add(tilt);
      p.add(pivot);
    }
    p.scale.setScalar(scale);
    return p;
  };
  group.add(at(makePlant(7, 0.8, 11), 745, DESK_Y, -200));
  group.add(at(makePlant(21, 1.9, 16), 1320, 0, -430));

  // ---- Chair --------------------------------------------------------------------
  const chair = new THREE.Group();
  chair.position.set(1150, 0, 640);
  chair.rotation.y = Math.PI + 0.9;
  const chairMat = std(0x1c2229, 0.85);
  chair.add(at(rbox(470, 70, 450, 26, chairMat, 4), 0, 470, 0));
  chair.add(at(rbox(450, 560, 70, 28, chairMat, 4), 0, 780, 215));
  const chairBack = chair.children[chair.children.length - 1];
  chairBack.rotation.x = -0.1;
  chair.add(at(cyl(24, 24, 380, std(0x2b3138, 0.4, 0.7), 16), 0, 255, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = box(260, 24, 36, std(0x2b3138, 0.4, 0.7));
    leg.position.set(Math.cos(a) * 130, 62, Math.sin(a) * 130);
    leg.rotation.y = -a;
    chair.add(leg);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(26, 12, 10), std(0x0d1013, 0.6));
    wheel.position.set(Math.cos(a) * 255, 28, Math.sin(a) * 255);
    wheel.castShadow = true;
    chair.add(wheel);
  }
  group.add(chair);

  // ---- Wall: LED strip, shelf, poster -------------------------------------------
  const strip = box(1700, 12, 8, new THREE.MeshBasicMaterial({ color: COLORS.accent }), false);
  strip.position.set(0, 900, -692);
  group.add(strip);
  const stripGlow = new THREE.PointLight(COLORS.accent, 2.4, 1900, 0);
  stripGlow.position.set(0, 910, -560);
  group.add(stripGlow);

  const shelfMat = std(COLORS.desk, 0.6);
  const shelf = rbox(980, 30, 240, 6, shelfMat);
  shelf.position.set(-950, 1650, -575);
  group.add(shelf);
  const bookRand = rng(33);
  const bookColors = [0x2a3a4a, 0x3a2f45, 0x20463a, 0x46352a, 0x3d4a2a, 0x23303d, COLORS.accent];
  let bx = -1380;
  for (let i = 0; i < 12; i++) {
    const w = 28 + bookRand() * 26;
    const h = 220 + bookRand() * 110;
    const color = bookColors[Math.floor(bookRand() * bookColors.length)];
    const book = box(w, h, 170, std(color, 0.7));
    const lean = i === 11 ? 0.28 : 0;
    book.position.set(bx + w / 2 + (lean ? 40 : 0), 1665 + h / 2 - (lean ? 4 : 0), -575);
    book.rotation.z = lean;
    group.add(book);
    bx += w + 2;
    if (bx > -1020) break;
  }
  // small cube + sphere ornaments on the shelf
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(52, 1), std(COLORS.accent, 0.35, 0.2, { emissive: COLORS.accent, emissiveIntensity: 0.18, flatShading: true }));
  orb.position.set(-640, 1665 + 52, -575);
  orb.castShadow = true;
  group.add(orb);
  const frameMat = std(0x1c2229, 0.5, 0.4);
  const photo = new THREE.Group();
  photo.position.set(-780, 1665 + 80, -620);
  photo.add(rbox(150, 190, 14, 3, frameMat));
  photo.add(at(new THREE.Mesh(new THREE.PlaneGeometry(120, 160), new THREE.MeshBasicMaterial({ color: 0x1a3a30 })), 0, 0, 8));
  photo.rotation.z = 0.04;
  group.add(photo);

  // Poster (canvas texture drawn at runtime)
  const poster = new THREE.Group();
  poster.position.set(690, 1500, -692);
  poster.add(rbox(470, 610, 18, 4, frameMat));
  poster.add(at(new THREE.Mesh(new THREE.PlaneGeometry(430, 570), new THREE.MeshBasicMaterial({ map: posterTexture() })), 0, 0, 10));
  group.add(poster);

  // ---- Ambient dust-free wall sconce glow to lift the left wall -----------------
  const fill = new THREE.PointLight(0x7fb0ff, 1.1, 4200, 0);
  fill.position.set(-1500, 1500, 900);
  group.add(fill);

  return {
    group,
    monitorHit: [bezel, chin, screenHole, neck],
    bezelMaterial,
    screenHole,
    screenGlow,
  };
}

function posterTexture() {
  const c = document.createElement("canvas");
  c.width = 430;
  c.height = 570;
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#0e1318";
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#3ddc97";
    g.lineWidth = 3;
    g.strokeRect(22, 22, c.width - 44, c.height - 44);
    g.fillStyle = "#3ddc97";
    g.font = "bold 150px ui-monospace, Menlo, Consolas, monospace";
    g.textAlign = "center";
    g.fillText("~/", c.width / 2, 250);
    g.font = "26px ui-monospace, Menlo, Consolas, monospace";
    g.fillStyle = "#e8edf2";
    g.textAlign = "left";
    const lines = ["$ audit      ok", "$ test       ok", "$ build      ok", "$ ship       ok"];
    lines.forEach((l, i) => g.fillText(l, 62, 340 + i * 44));
    g.fillStyle = "#3ddc97";
    g.fillRect(62, 500, 16, 28);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Scene-level lights (the room adds its own local ones). */
export function addGlobalLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xa9c8dc, 0x2a2018, 1.9));
  const sun = new THREE.DirectionalLight(0xdbe6f5, 1.35);
  sun.position.set(1500, 3200, 2400);
  sun.target.position.set(0, 600, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -2200;
  cam.right = 2200;
  cam.top = 2200;
  cam.bottom = -2200;
  cam.near = 500;
  cam.far = 7500;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 4;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);
}
