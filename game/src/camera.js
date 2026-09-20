/**
 * camera.js — E2. Chase camera, framed for portrait phones.
 *
 * Exports: init(ctx), update(dt) (also update(ctx, dt) / update(dt, ctx)).
 *
 * state fields OWNED here (defaults in init): heroBox = [sx, sy, w, h] — the runner's AABB projected to
 * CSS px (top-left origin). NEW: heroFrac — heroBox height / frame height; camDist — camera to hero centre, m (both informational).
 *
 * Framing (lead calls 2026-09-19): the hero's screen box is held at 29 % of frame height in portrait
 * (band 26–32 %) and 25 % in landscape (22–28 %): the follow distance is solved from the fov each frame
 * and then corrected slowly from the measured box so the band holds on ramps and jumps. The camera is
 * LOW like the bar video — ~1.3 m above the ground (elevation ~5°) and nearly level (pitch ~4° down,
 * aimed at the runner's mid-torso), so the sky fills the top fifth of a portrait frame and the pack
 * (2.2–3.3 m behind) reads large in the lower third. x is followed fully with lag (the portrait
 * horizontal half-fov is only ~16°); z follows exactly; fov 64 → 70 with speed; on ramps the pitch
 * follows track.groundPitch(z) clamped ±10°; shake on 'hit' (and a small one on 'stumble'); a slow
 * settle to a higher three-quarter view on 'death'.
 *
 * Reads: state.x/y/z/speed/running/over, ctx.camera, ctx.renderer, ctx.track.groundPitch (optional),
 * player.getAABB()/getObject(). Listens: 'hit', 'stumble', 'death', 'start'.
 */
import { getAABB } from './player.js?v=202609201508';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (cur, tgt, rate, dt) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));

let C, cam, THREE;
const S = {
  fov: 64, pitch: 0, distAdj: 1, shakeT: 0, shakeLen: 0.45, shakeAmp: 0,
  dead: false, deadT: 0, first: true,
  px: 0, py: 0, pz: 0, ax: 0, ay: 0, az: 0, t: 0,
};
// LOOK_DOWN raised 0.09 -> 0.15 rad. Both critics wanted less sky: round 3 measured 49-60 % of the
// upper frame as sky against the reference's 21-44 %, and the claims file's C4 had it at 63 % against
// 39.6 %. Closing the street helped the mid-band detail but barely touched the sky, because the
// reference's height-to-width ratio is ~2.3 and ours is ~0.95 even after narrowing — the geometry
// cannot close that gap without either 17 m buildings or a 3 m street that will not hold three lanes.
// Tilting the camera trades sky for road and frontage directly, and pulls with both critics.
// 0.15 -> 0.24 rad (elevation ~1.9 m). The behaviour critic showed a crate in the runner's own lane
// is invisible behind him until ~2-3 m at 1.3 m camera height: a human cannot react to what the
// hero's back hides, and a 1.25 m crate stack then passes through the lens. From 1.9 m the next
// row shows over the hero's shoulder and obstacle tops clear the camera.
const HERO_H = 1.72, LOOK_DOWN = 0.24;   // rad, the camera's elevation above the hero centre
const AIM_DY = 0.10, AIM_DZ = 0.3;        // aim point relative to the hero centre: mid-torso, just ahead
const PITCH_MAX = 10 * Math.PI / 180;
let _v, _size, _corners;

function trackMod() { return C && (C.track || (C.modules && C.modules.track)); }
function groundPitch(z) { const t = trackMod(); return t && typeof t.groundPitch === 'function' ? (t.groundPitch(z) || 0) : 0; }

export async function init(ctx) {
  C = ctx; THREE = ctx.THREE; cam = ctx.camera;
  _v = new THREE.Vector3(); _size = new THREE.Vector2();
  _corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  ctx.state.heroBox = [0, 0, 0, 0];
  ctx.state.heroFrac = 0;
  cam.fov = 64; cam.near = 0.1; cam.far = Math.max(cam.far || 0, 400); cam.updateProjectionMatrix();
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
  const targetFrac = portrait ? 0.29 : 0.25;

  // fov by speed; on death ease it in a little
  const spd = clamp(((s.speed || 0) - 9) / 11, 0, 1);
  const fovT = S.dead ? 60 : 64 + 6 * spd;
  S.fov = damp(S.fov, fovT, 4, dt);
  if (Math.abs(cam.fov - S.fov) > 0.01) { cam.fov = S.fov; cam.updateProjectionMatrix(); }

  // ground pitch, clamped, lagged
  const gp = clamp(groundPitch(s.z || 0), -PITCH_MAX, PITCH_MAX);
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
  const tm = trackMod(); const groundHere = tm && typeof tm.groundY === 'function' ? (tm.groundY(hz) || 0) : 0;
  const baseY = groundHere + (hy - groundHere) * 0.25;   // jumps lift the camera by a quarter
  const centreY = baseY + HERO_H * 0.5;

  let elev = LOOK_DOWN, yaw = 0, aheadZ = AIM_DZ, aheadY = AIM_DY, lagX = 7, lagY = 6;
  if (S.dead) {
    S.deadT += dt;
    const e = 1 - Math.exp(-S.deadT * 1.2);
    // death cam: rise and come in a little but KEEP THE RUNNER IN FRAME - the old yaw of 0.6 rad
    // swung the view onto the shophouse facade and the fall was never seen
    elev = LOOK_DOWN + 0.30 * e; yaw = 0.18 * e; aheadZ = 0.2; aheadY = AIM_DY - 0.75 * e; lagX = 1.6; lagY = 1.6;
    dist *= 1 + 0.25 * e;
  }
  // offset in the slope frame, rotated by −pitch about X so ramps tilt the view
  const back = dist * Math.cos(elev), up = dist * Math.sin(elev);
  const pr = -S.pitch, cp = Math.cos(pr), sp = Math.sin(pr);
  let oy = up * cp - (-back) * sp, oz = up * sp + (-back) * cp;
  const ox = Math.sin(yaw) * back;
  oz *= Math.cos(yaw);

  // x is followed fully (with lag): the portrait horizontal half-fov is only ~16°, so any lateral offset
  // pushes the pack out of frame
  const tx = hx + ox, ty = centreY + oy, tz = hz + oz;
  const ax = hx, ay = centreY + aheadY, az = hz + aheadZ;
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
  s.camDist = Math.hypot(cam.position.x - hx, cam.position.y - centreY, cam.position.z - hz);   // NEW, informational
}
