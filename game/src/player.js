/**
 * player.js — E2. The runner: lanes / jump / roll / stumble / death state machine, speed ramp,
 * collision via ctx.obstacles.hit(aabb), and the run-cycle animation on the runner's joints.
 *
 * Exports: init(ctx) (async), update(dt) — also accepts update(ctx, dt) / update(dt, ctx) —
 *          reset(), getAABB() → THREE.Box3 (feet at y, 0.6 × 1.7 × 0.5; height halves in a roll),
 *          getObject() → the positioned runner group (camera.js uses both).
 *
 * state fields OWNED here (defaults set in init):
 *   distance, speed, z (= distance), lane (-1|0|1, the TARGET lane — updated the instant a swipe is
 *   accepted), laneX (target x), x (actual, eased), y (feet height incl. jump), airborne, rolling,
 *   stumbleT (seconds of no-input left), jumps, rolls.
 * NEW state fields (documented here, defaults in init): playerState ('idle'|'run'|'laneChange'|'jump'|
 *   'roll'|'stumble'|'dead'), hits (head-on hits this run), hitT (seconds since the last head-on hit,
 *   -1 if none), speedMul (stumble speed factor, 1 = full), playerDraws (runner draw calls after the merge).
 *
 * Reads: state.running, state.over (main), config (SPEED0 9, SPEED_STEP 0.6, SPEED_STEP_M 150,
 *   SPEED_MAX 20, JUMP_H 1.1, JUMP_T 0.55, ROLL_T 0.5, LANE_T 0.18, LANE_X), ctx.input.consume(),
 *   ctx.obstacles.hit(aabb), ctx.track.groundY(z) / groundPitch(z) (all optional; 0 when absent).
 * Emits: 'jump' {z}, 'roll' {z}, 'stumble' {x, z, kind, type}, 'hit' {x, z, kind, type, hits},
 *   'death' {reason: 'hit'|'block', distance}. Listens: 'start' → reset; 'death' (from pack) → dead.
 *
 * Collision rule (SPEC): the AABB is tested every frame against obstacles.hit(). A side clip (thin
 * x-overlap, or mid lane change) is a stumble: −35 % speed and 0.4 s of no input. A head-on hit emits
 * 'hit' (the pack closes 2 m); a second head-on hit within 5 s is death. Whatever hit() returns is
 * accepted: a string kind, or an object with kind/type/box|min,max/side.
 *
 * The speed ramp is a pure function of distance (9 → 20 m/s, +0.6 per 150 m), so ?gate=1 is
 * satisfied by construction; the stumble factor multiplies it.
 */
import { mergePerJoint, RunnerAnim, countMeshes } from './anim.js?v=202609201508';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

let C;                 // ctx
let cfg;
let obj = null;        // positioned group: (x, y, z)
let root = null;       // asset root inside obj (anim drives its own rotation/position)
let anim = null;
let aabb = null;
let drawInfo = { before: 0, after: 0 };

// private run state
const P = {
  mode: 'idle', modeT: 0, modeLen: 0,
  laneFrom: 0, laneTo: 0, laneT: 1, laneVel: 0, prevX: 0,
  jumpT: -1, rollT: -1, wall: null,
  stumbleAnimT: 0, stumbleHard: false,
  invulnT: 0, lastHitAt: -1e9, clock: 0, deathT: 0,
};

function cfgv(k, d) { return cfg && typeof cfg[k] === 'number' ? cfg[k] : d; }
function laneToX(l) { const lx = cfg && Array.isArray(cfg.LANE_X) ? cfg.LANE_X : [-2, 0, 2]; return lx[l + 1] ?? l * 2; }
function rampSpeed(d) {
  const s0 = cfgv('SPEED0', 9), st = cfgv('SPEED_STEP', 0.6), sm = cfgv('SPEED_STEP_M', 150), mx = cfgv('SPEED_MAX', 20);
  return Math.min(mx, s0 + st * Math.floor(Math.max(0, d) / sm));
}
function trackMod() { return C && (C.track || (C.modules && C.modules.track)); }
function obstaclesMod() { return C && (C.obstacles || (C.modules && C.modules.obstacles)); }
function groundY(z) { const t = trackMod(); return t && typeof t.groundY === 'function' ? (t.groundY(z) || 0) : 0; }
function groundPitch(z) { const t = trackMod(); return t && typeof t.groundPitch === 'function' ? (t.groundPitch(z) || 0) : 0; }
function emit(name, payload) { const e = C && C.events; if (e && typeof e.emit === 'function') e.emit(name, payload); }

export function reset() {
  const s = C.state;
  s.distance = 0; s.z = 0; s.speed = 0; s.speedMul = 1;
  s.lane = 0; s.laneX = 0; s.x = 0; s.y = groundY(0);
  s.airborne = false; s.rolling = false; s.stumbleT = 0;
  s.jumps = 0; s.rolls = 0; s.hits = 0; s.hitT = -1; P.wall = null;
  s.playerState = 'idle';
  P.mode = 'idle'; P.modeT = 0; P.modeLen = 0;
  P.laneFrom = 0; P.laneTo = 0; P.laneT = 1; P.laneVel = 0; P.prevX = 0;
  P.jumpT = -1; P.rollT = -1; P.stumbleAnimT = 0; P.stumbleHard = false;
  P.invulnT = 0; P.lastHitAt = -1e9; P.deathT = 0;
  if (obj) { obj.position.set(0, s.y, 0); obj.rotation.set(0, 0, 0); }
}

export async function init(ctx) {
  C = ctx; cfg = ctx.config || {};
  const THREE = ctx.THREE;
  const s = ctx.state;
  aabb = new THREE.Box3();

  obj = new THREE.Group(); obj.name = 'runner';
  let asset = null;
  try { asset = await ctx.assets.get('runner', { keepHierarchy: true }); } catch (e) { console.warn('[player] runner load failed', e); }
  if (!asset) { asset = new THREE.Group(); asset.userData.placeholder = true; }
  root = asset;
  if (root.userData && root.userData.joints) {
    drawInfo.before = countMeshes(root);
    drawInfo = { before: drawInfo.before, ...mergePerJoint(THREE, root) };
    drawInfo.after = countMeshes(root);
  } else {
    drawInfo = { before: countMeshes(root), after: countMeshes(root) };
    if (!root.userData?.placeholder) console.warn('[player] runner has no userData.joints — loaded merged? it will not animate');
  }
  obj.add(root);
  ctx.scene.add(obj);
  anim = new RunnerAnim(THREE, root);

  reset();
  const ev = ctx.events;
  if (ev && typeof ev.on === 'function') {
    ev.on('start', () => { reset(); });
    ev.on('death', (p) => { if (P.mode !== 'dead') enterDead(p && p.reason ? p.reason : 'caught', false); });
  }
  s.playerDraws = drawInfo.after;   // NEW, informational: runner draw calls after the per-joint merge
}

function enterDead(reason, doEmit = true) {
  const s = C.state;
  P.mode = 'dead'; P.modeT = 0; P.modeLen = 0.8; P.deathT = 0;
  P.jumpT = -1; P.rollT = -1;
  s.airborne = false; s.rolling = false; s.playerState = 'dead';
  s.speed = 0; s.stumbleT = 0;
  if (doEmit) emit('death', { reason, distance: s.distance });
}

function startJump() {
  const s = C.state;
  P.jumpT = 0; P.mode = 'jump'; P.modeT = 0; P.modeLen = 2 * cfgv('JUMP_T', 0.55);
  s.airborne = true; s.jumps = (s.jumps | 0) + 1;
  emit('jump', { z: s.z });
}
function startRoll() {
  const s = C.state;
  P.rollT = 0; P.mode = 'roll'; P.modeT = 0; P.modeLen = cfgv('ROLL_T', 0.5);
  s.rolling = true; s.rolls = (s.rolls | 0) + 1;
  emit('roll', { z: s.z });
}
function startLane(dir) {
  const s = C.state;
  const to = clamp((s.lane | 0) + dir, -1, 1);
  if (to === s.lane) return false;
  P.laneFrom = s.x; P.laneTo = laneToX(to); P.laneT = 0;
  s.lane = to; s.laneX = P.laneTo;
  return true;
}

function stumble(hard, info) {
  const s = C.state;
  s.speedMul = Math.min(s.speedMul, 0.65);
  s.stumbleT = Math.max(s.stumbleT, 0.4);
  P.stumbleAnimT = 0; P.stumbleHard = !!hard;
  if (P.mode === 'run' || P.mode === 'laneChange' || P.mode === 'stumble') { P.mode = 'stumble'; P.modeT = 0; P.modeLen = 0.7; }
  if (!hard) emit('stumble', { x: s.x, z: s.z, kind: info.kind, type: info.type });
}

function classifyHit(r, box) {
  const info = { kind: 'block', type: undefined, side: false };
  if (typeof r === 'string') info.kind = r;
  else if (r && typeof r === 'object') {
    info.kind = r.kind || (r.obstacle && r.obstacle.kind) || 'block';
    info.type = r.type || r.name || (r.obstacle && r.obstacle.type);
    const ob = r.box || r.aabb || (r.min && r.max ? r : null);
    if (typeof r.side === 'boolean') info.side = r.side;
    else if (ob && ob.min && ob.max) {
      const ox = Math.min(box.max.x, ob.max.x) - Math.max(box.min.x, ob.min.x);
      info.side = ox < 0.22;                         // thin lateral overlap = a clip
    } else {
      info.side = P.laneT < 1 && Math.abs(C.state.x - P.laneTo) > 0.45;   // mid lane change
    }
  }
  return info;
}

export function update(a, b) {
  const dt0 = typeof a === 'number' ? a : (typeof b === 'number' ? b : 1 / 60);
  const dt = clamp(dt0, 0, 0.1);
  const s = C.state, THREE = C.THREE;
  P.clock += dt;

  // ---- run lifecycle from main's flags
  if (s.running && !s.over) {
    if (P.mode === 'idle' || P.mode === 'dead') { reset(); P.mode = 'run'; }
  } else if (!s.running && P.mode !== 'dead' && P.mode !== 'idle') {
    // paused / stopped by main: hold the pose, no motion
  }

  // ---- input
  const inp = C.input && typeof C.input.consume === 'function' ? C.input.consume() : null;
  if (inp && P.mode !== 'dead' && P.mode !== 'idle' && s.running && !s.over) {
    if (s.stumbleT > 0) { /* 0.4 s of no input after a stumble */ }
    else if (inp === 'left') startLane(-1);
    else if (inp === 'right') startLane(1);
    else if (inp === 'up') { if (!s.airborne && !s.rolling) startJump(); }
    else if (inp === 'down') { if (!s.airborne && !s.rolling) startRoll(); }
  }

  const live = s.running && !s.over && P.mode !== 'dead' && P.mode !== 'idle';

  // ---- speed and distance
  if (live) {
    if (s.speedMul < 1) s.speedMul = Math.min(1, s.speedMul + 0.5 * dt);
    s.speed = rampSpeed(s.distance) * s.speedMul;
    s.distance += s.speed * dt;
    s.z = s.distance;
    if (s.stumbleT > 0) s.stumbleT = Math.max(0, s.stumbleT - dt);
    if (s.hitT >= 0) s.hitT += dt;
    if (P.invulnT > 0) P.invulnT -= dt;
  } else if (P.mode === 'dead' || P.mode === 'idle') {
    s.speed = 0;
  }

  // ---- lane ease
  if (P.laneT < 1) {
    const T = cfgv('LANE_T', 0.18);
    P.laneT = Math.min(1, P.laneT + (live ? dt / T : 0));
    s.x = P.laneFrom + (P.laneTo - P.laneFrom) * easeInOut(P.laneT);
  } else s.x = P.laneTo;
  P.laneVel = dt > 0 ? (s.x - P.prevX) / dt : 0;
  P.prevX = s.x;

  // ---- vertical: jump over the ground
  const JT = cfgv('JUMP_T', 0.55), JH = cfgv('JUMP_H', 1.1);
  let jumpY = 0;
  if (P.jumpT >= 0) {
    if (live) P.jumpT += dt;
    const u = (P.jumpT - JT) / JT;                    // −1 at take-off, 0 at apex, +1 at landing
    jumpY = Math.max(0, JH * (1 - u * u));
    if (P.jumpT >= 2 * JT) { P.jumpT = -1; jumpY = 0; s.airborne = false; if (P.mode === 'jump') { P.mode = 'run'; P.modeT = 0; } }
  }
  if (P.rollT >= 0) {
    if (live) P.rollT += dt;
    if (P.rollT >= cfgv('ROLL_T', 0.5)) { P.rollT = -1; s.rolling = false; if (P.mode === 'roll') { P.mode = 'run'; P.modeT = 0; } }
  }
  s.y = groundY(s.z) + jumpY;

  // ---- mode bookkeeping
  P.modeT += dt;
  if (P.mode === 'stumble' && P.modeT >= P.modeLen) { P.mode = 'run'; P.modeT = 0; }
  if (P.mode === 'run' && P.laneT < 1) s.playerState = 'laneChange';
  else s.playerState = P.mode;

  // ---- the wall (a block item the runner has bounced off): he cannot advance into it; he can
  // dodge out of its lane; if he is still pinned after 0.6 s the pack catches him
  if (P.wall && live) {
    if (Math.abs(s.x - P.wall.x) > 1.05) P.wall = null;                       // dodged clear
    else {
      if (s.z > P.wall.z) { s.z = P.wall.z; s.distance = s.z; }
      P.wall.t += dt;
      if (P.wall.t > 0.6) { P.wall = null; emit('hit', { x: s.x, z: s.z, kind: 'block', type: 'wall', hits: s.hits, fatal: true }); enterDead('block'); }
    }
  }
  // ---- AABB and collision
  const h = s.rolling ? 0.85 : 1.7;
  aabb.min.set(s.x - 0.3, s.y, s.z - 0.25);
  aabb.max.set(s.x + 0.3, s.y + h, s.z + 0.25);
  if (live && P.invulnT <= 0 && obstaclesMod() && typeof obstaclesMod().hit === 'function') {
    const r = obstaclesMod().hit(aabb);
    if (r) {
      const info = classifyHit(r, aabb);
      P.invulnT = 0.7;
      if (info.side) stumble(false, info);
      else {
        const dtHit = P.clock - P.lastHitAt;
        P.lastHitAt = P.clock;
        s.hits = (s.hits | 0) + 1; s.hitT = 0;
        // CONTACT. Before this the runner (and 0.4 s later the camera) passed straight through
        // whatever he hit - the critic's death sheet opens inside a crate stack. Now a light JUMP
        // item is knocked over (obstacles.knock: it tumbles off the lane and stops being solid) and
        // the runner takes a small check-step back; a BLOCK item is a WALL: he bounces to just in
        // front of it and cannot run into it, and unless he dodges out of the lane within ~0.6 s
        // the pack has him. That is the spec's "head-on block = caught", made physical.
        const bx = r && r.box ? (r.box.min.x + r.box.max.x) / 2 : s.x;
        if (info.kind === 'jump' && r && obstaclesMod().knock) { obstaclesMod().knock(r, s.x <= bx ? -1 : 1); s.z -= 0.3; s.distance = s.z; }
        if (info.kind === 'block' && r && r.box) { P.wall = { z: r.box.min.z - 0.55, x: bx, t: 0 }; s.z = Math.min(s.z, P.wall.z); s.distance = s.z; }
        if (dtHit < 5) {
          emit('hit', { x: s.x, z: s.z, kind: info.kind, type: info.type, hits: s.hits, fatal: true });
          enterDead(info.kind === 'block' ? 'block' : 'hit');
        } else {
          stumble(true, info);
          emit('hit', { x: s.x, z: s.z, kind: info.kind, type: info.type, hits: s.hits, fatal: false });
        }
      }
    }
  }

  // ---- place and animate
  if (obj) {
    obj.position.set(s.x, s.y, s.z);
    if (anim) {
      const mode = P.mode === 'laneChange' ? 'run' : P.mode;
      anim.update(dt, {
        mode, t: P.modeT, T: P.modeLen || undefined,
        speed: s.speed, distance: s.distance, laneVel: P.laneVel,
        groundPitch: s.airborne ? 0 : groundPitch(s.z), hard: P.stumbleHard,
      });
    }
  }
}

export function getAABB() { return aabb; }
export function getObject() { return obj; }
export function getDrawInfo() { return drawInfo; }
