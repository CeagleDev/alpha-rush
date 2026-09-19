/**
 * camera.js — E2. Chase camera, framed for portrait phones.
 *
 * Exports: init(ctx), update(dt) (also update(ctx, dt) / update(dt, ctx)).
 *
 * state fields OWNED here (defaults in init): heroBox = [sx, sy, w, h] — the runner's AABB projected to
 * CSS px (top-left origin). NEW: heroFrac — heroBox height / frame height (informational).
 *
 * Framing: the hero's screen box is held at 33 % of frame height in portrait (band 28–38 %) and 26 %
 * in landscape (22–30 %): the follow distance is solved from the fov each frame and then corrected
 * slowly from the measured box so the band holds on ramps and jumps. Behind and above with lag on x/y
 * (z follows exactly); fov 62 → 70 with speed; pitch follows track.groundPitch(z) clamped ±14°;
 * shake on 'hit' (and a small one on 'stumble'); a slow settle to a higher three-quarter view on 'death'.
 *
 * Reads: state.x/y/z/speed/running/over, ctx.camera, ctx.renderer, ctx.track.groundPitch (optional),
 * player.getAABB()/getObject(). Listens: 'hit', 'stumble', 'death', 'start'.
 */
import { getAABB } from './player.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (cur, tgt, rate, dt) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));

let C, cam, THREE;
const S = {
  fov: 62, pitch: 0, distAdj: 1, shakeT: 0, shakeLen: 0.45, shakeAmp: 0,
  dead: false, deadT: 0, first: true,
  px: 0, py: 0, pz: 0, ax: 0, ay: 0, az: 0, t: 0,
};
const HERO_H = 1.72, LOOK_DOWN = 0.33;   // rad, the camera's elevation above the hero centre
let _v, _size, _corners;

function groundPitch(z) { const t = C && C.track; return t && typeof t.groundPitch === 'function' ? (t.groundPitch(z) || 0) : 0; }

export async function init(ctx) {
  C = ctx; THREE = ctx.THREE; cam = ctx.camera;
  _v = new THREE.Vector3(); _size = new THREE.Vector2();
  _corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  ctx.state.heroBox = [0, 0, 0, 0];
  ctx.state.heroFrac = 0;
  cam.fov = 62; cam.near = 0.1; cam.far = Math.max(cam.far || 0, 400); cam.updateProjectionMatrix();
  const ev = ctx.events;
  if (ev && typeof ev.on === 'function') {
    ev.on('hit', () => { S.shakeT = S.shakeLen = 0.45; S.shakeAmp = 0.13; });
    ev.on('stumble', () => { S.shakeT = S.shakeLen = 0.25; S.shakeAmp = 0.05; });
    ev.on('death', () => { S.dead = true; S.deadT = 0; });
    ev.on('start', () => { S.dead = false; S.deadT = 0; S.first = true; });
  }
}

function frameSize() {
  const r = C.renderer;
  if (r && typeof r.getSize === 'function') { r.getSize(_size); if (_size.x > 0 && _size.y > 0) return _size; }
  const el = r && r.domElement;
  _size.set(el ? el.clientWidth : innerWidth, el ? el.clientHeight : innerHeight);
  return _size;
}

export function update(a, b) {
  const dt = clamp(typeof a === 'number' ? a : (typeof b === 'number' ? b : 1 / 60), 0, 0.1);
  const s = C.state;
  S.t += dt;
  const size = frameSize();
  const portrait = size.y >= size.x;
  const targetFrac = portrait ? 0.33 : 0.26;

  // fov by speed; on death ease it in a little
  const spd = clamp(((s.speed || 0) - 9) / 11, 0, 1);
  const fovT = S.dead ? 58 : 62 + 8 * spd;
  S.fov = damp(S.fov, fovT, 4, dt);
  if (Math.abs(cam.fov - S.fov) > 0.01) { cam.fov = S.fov; cam.updateProjectionMatrix(); }

  // ground pitch, clamped, lagged
  const gp = clamp(groundPitch(s.z || 0), -0.25, 0.25);
  S.pitch = damp(S.pitch, gp, 3, dt);

  // follow distance from the fov so the hero's height lands on targetFrac of the frame
  const half = Math.tan((S.fov * Math.PI / 180) / 2);
  let dist = (HERO_H / (2 * targetFrac * half)) * S.distAdj;
  // slow correction from what we actually measured last frame
  if (s.heroFrac > 0.05 && !S.dead) {
    const want = clamp(s.heroFrac / targetFrac, 0.7, 1.4);
    S.distAdj = clamp(damp(S.distAdj, S.distAdj * want, 1.5, dt), 0.6, 1.6);
  }

  const hx = s.x || 0, hy = (s.y || 0), hz = s.z || 0;
  const cy = hy * 0.35 + (C.track ? 0 : 0) + 0.0;   // feet height follows the ground fully, the jump only partly
  const groundHere = C.track && typeof C.track.groundY === 'function' ? (C.track.groundY(hz) || 0) : 0;
  const baseY = groundHere + (hy - groundHere) * 0.25;   // jumps lift the camera by a quarter
  const centreY = baseY + HERO_H * 0.5;

  let elev = LOOK_DOWN, yaw = 0, aheadZ = 3.5, aheadY = 0.55, lagX = 7, lagY = 6;
  if (S.dead) {
    S.deadT += dt;
    const e = 1 - Math.exp(-S.deadT * 1.2);
    elev = LOOK_DOWN + 0.32 * e; yaw = 0.6 * e; aheadZ = 0.4; aheadY = -0.35 * e; lagX = 1.6; lagY = 1.6;
    dist *= 1 + 0.25 * e;
  }
  // offset in the slope frame, rotated by −pitch·0.7 about X so ramps tilt the view
  const back = dist * Math.cos(elev), up = dist * Math.sin(elev);
  const pr = -S.pitch * 0.7, cp = Math.cos(pr), sp = Math.sin(pr);
  let oy = up * cp - (-back) * sp, oz = up * sp + (-back) * cp;
  const ox = Math.sin(yaw) * back;
  oz *= Math.cos(yaw);

  const tx = hx * 0.7 + ox, ty = centreY + oy, tz = hz + oz;
  const ax = hx * 0.85, ay = centreY + aheadY, az = hz + aheadZ;
  if (S.first) { S.px = tx; S.py = ty; S.pz = tz; S.ax = ax; S.ay = ay; S.az = az; S.first = false; }
  S.px = damp(S.px, tx, lagX, dt); S.py = damp(S.py, ty, lagY, dt); S.pz = S.dead ? damp(S.pz, tz, 2, dt) : tz;
  S.ax = damp(S.ax, ax, lagX + 2, dt); S.ay = damp(S.ay, ay, lagY + 2, dt); S.az = S.dead ? damp(S.az, az, 2, dt) : az;

  // shake
  let shx = 0, shy = 0, shr = 0;
  if (S.shakeT > 0) {
    S.shakeT -= dt;
    const k = S.shakeAmp * (S.shakeT / S.shakeLen);
    const t = S.t * 47;
    shx = Math.sin(t * 1.3) * k; shy = Math.cos(t * 1.7 + 1) * k * 0.7; shr = Math.sin(t * 0.9) * k * 0.15;
  }

  cam.position.set(S.px + shx, S.py + shy, S.pz);
  cam.up.set(Math.sin(shr), Math.cos(shr), 0);
  cam.lookAt(S.ax + shx * 0.5, S.ay + shy * 0.5, S.az);

  // heroBox from the runner's AABB
  const box = getAABB();
  if (box) {
    cam.updateMatrixWorld();
    const W = size.x, H = size.y;
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, behind = false;
    for (let i = 0; i < 8; i++) {
      _v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      _v.project(cam);
      if (_v.z > 1) behind = true;
      const sx = (_v.x + 1) * 0.5 * W, sy = (1 - _v.y) * 0.5 * H;
      if (sx < minX) minX = sx; if (sx > maxX) maxX = sx; if (sy < minY) minY = sy; if (sy > maxY) maxY = sy;
    }
    if (!behind && isFinite(minX)) {
      const r = (v) => Math.round(v * 10) / 10;
      s.heroBox = [r(minX), r(minY), r(maxX - minX), r(maxY - minY)];
      s.heroFrac = H > 0 ? (maxY - minY) / H : 0;
    }
  }
}
