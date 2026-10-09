import * as THREE from "three";
import { SCREEN } from "./room";

/** Reused by Tween.write so the intro flight allocates nothing per frame. */
const scratch = new THREE.Vector3();

/** Camera expressed as an orbit around a target: easy to arc around the desk. */
export interface Pose {
  target: THREE.Vector3;
  yaw: number;
  pitch: number;
  radius: number;
}

export function clonePose(p: Pose): Pose {
  return { target: p.target.clone(), yaw: p.yaw, pitch: p.pitch, radius: p.radius };
}

const DESK_TARGET = new THREE.Vector3(0, 1060, -150);

/** Settled view: the monitor is the subject, with desk and props around it. */
export function deskPose(aspect: number): Pose {
  const pull = THREE.MathUtils.clamp(1.7 / aspect, 1, 2.4);
  return { target: DESK_TARGET.clone(), yaw: 0, pitch: 0.05, radius: 1620 * pull };
}

/**
 * Straight-on, fitted so the screen fills the viewport while leaving a band at the top
 * (Skip button) and bottom (Back button) for the HTML controls.
 */
export function zoomPose(aspect: number, fovDeg: number, viewportH: number): Pose {
  const halfV = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2);
  const band = 56;
  const fraction = Math.max(0.6, (viewportH - band * 2) / viewportH);
  const rH = SCREEN.height / fraction / 2 / halfV;
  const rW = (SCREEN.width * 1.05) / 2 / (halfV * aspect);
  return {
    target: new THREE.Vector3(SCREEN.center.x, SCREEN.center.y, SCREEN.center.z + 1),
    yaw: 0,
    pitch: 0,
    radius: Math.max(rH, rW),
  };
}

const START: Pose = { target: new THREE.Vector3(0, 900, -100), yaw: 1.05, pitch: 0.55, radius: 4800 };
const MID: Pose = { target: new THREE.Vector3(0, 980, -120), yaw: -0.5, pitch: 0.24, radius: 2700 };

export const introCurve = {
  start: () => clonePose(START),
  /** Smooth arc: high on the right, sweeping left, settling in front of the monitor. */
  path(end: Pose) {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(START.yaw, START.pitch, START.radius),
      new THREE.Vector3(MID.yaw, MID.pitch, MID.radius),
      new THREE.Vector3(end.yaw, end.pitch, end.radius),
    ]);
  },
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Tween {
  private t = 0;
  private from: Pose;
  private done = false;

  constructor(
    from: Pose,
    private to: Pose,
    private duration: number,
    private path: THREE.CatmullRomCurve3 | undefined,
    private onDone: () => void,
  ) {
    this.from = clonePose(from);
  }

  update(dt: number, out: Pose) {
    if (this.done) return;
    this.t = Math.min(this.t + dt / this.duration, 1);
    this.write(easeInOut(this.t), out);
    if (this.t >= 1) this.finish(out);
  }

  /** Jump to the end of the move. */
  finish(out?: Pose) {
    if (this.done) return;
    this.done = true;
    if (out) this.write(1, out);
    this.onDone();
  }

  private write(u: number, out: Pose) {
    out.target.lerpVectors(this.from.target, this.to.target, u);
    if (this.path) {
      const p = this.path.getPoint(u, scratch);
      out.yaw = p.x;
      out.pitch = p.y;
      out.radius = p.z;
    } else {
      out.yaw = THREE.MathUtils.lerp(this.from.yaw, this.to.yaw, u);
      out.pitch = THREE.MathUtils.lerp(this.from.pitch, this.to.pitch, u);
      out.radius = THREE.MathUtils.lerp(this.from.radius, this.to.radius, u);
    }
  }
}

export function applyPose(cam: THREE.PerspectiveCamera, p: Pose, yawOffset: number, pitchOffset: number, scratch: THREE.Vector3) {
  const yaw = p.yaw + yawOffset;
  const pitch = p.pitch + pitchOffset;
  const cp = Math.cos(pitch);
  scratch.set(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp).multiplyScalar(p.radius);
  cam.position.copy(p.target).add(scratch);
  cam.lookAt(p.target);
}
