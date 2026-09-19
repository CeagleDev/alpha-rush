/**
 * pack.js — E2. The dog pack: dog_shiba, dog_spitz, dog_mutt bounding behind the runner.
 *
 * Exports: init(ctx) (async), update(dt) (also update(ctx, dt) / update(dt, ctx)), getDogs() → [{name, obj}].
 *
 * state fields OWNED here (defaults in init): packDist — metres from the pack's lead dog to the player.
 * NEW state field: packDraws (dogs' draw calls after the per-joint merge, informational).
 *
 * Behaviour (SPEC + lead call 2026-09-19): the pack runs PACK_DIST (2.6 m) behind with per-dog offsets
 * (~2.2 / 2.75 / 3.3 m), weaving lanes with a lag behind the runner's lane changes; every 'hit' closes
 * it 1.4 m (to ~1.2 m) and a 'stumble' 0.7 m; it recovers at 1 m/s back to PACK_DIST;
 * when packDist < 0.8 m the pack has caught the runner → emits 'death' {reason:'caught', distance}.
 * A bark timer per dog emits 'bark' {dog, index, x, z, dist}. On 'death' (any cause) the dogs run up
 * to the fallen runner and bounce around it ('excited').
 *
 * Reads: state.x/z/lane/speed/running/over/distance (player, main), config.PACK_DIST, ctx.track.groundY /
 * groundPitch (optional), state.rng (optional, for bark timers). Listens: 'start', 'hit', 'stumble', 'death'.
 */
import { mergePerJoint, DogAnim, countMeshes } from './anim.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (cur, tgt, rate, dt) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));

let C, cfg;
const DOGS = [
  // zOff is relative to PACK_DIST (2.6): the three dogs sit ~2.2 / 2.75 / 3.3 m behind the runner
  { name: 'dog_shiba', xOff: -0.4, zOff: 0.4, lag: 0.30, weave: 0.9 },
  { name: 'dog_spitz', xOff: 0.4, zOff: -0.15, lag: 0.45, weave: 1.3 },
  { name: 'dog_mutt', xOff: 0.0, zOff: -0.7, lag: 0.60, weave: 1.1 },
];
const dogs = [];        // { name, obj, root, anim, x, z, y, dist, barkT, laneHist: [] , prevX, laneX }
const HIT_CLOSE = 1.4;
let packDist = 2.6, caught = false, dead = false, deadT = 0, clock = 0;
let drawInfo = { before: 0, after: 0 };

function cfgv(k, d) { return cfg && typeof cfg[k] === 'number' ? cfg[k] : d; }
function laneToX(l) { const lx = cfg && Array.isArray(cfg.LANE_X) ? cfg.LANE_X : [-2, 0, 2]; return lx[l + 1] ?? l * 2; }
function trackMod() { return C && (C.track || (C.modules && C.modules.track)); }
function groundY(z) { const t = trackMod(); return t && typeof t.groundY === 'function' ? (t.groundY(z) || 0) : 0; }
function groundPitch(z) { const t = trackMod(); return t && typeof t.groundPitch === 'function' ? (t.groundPitch(z) || 0) : 0; }
function emit(name, payload) { const e = C && C.events; if (e && typeof e.emit === 'function') e.emit(name, payload); }
function rnd() { const r = C && C.state && typeof C.state.rng === 'function' ? C.state.rng() : Math.random(); return r; }

function resetPack() {
  const s = C.state;
  packDist = cfgv('PACK_DIST', 5); caught = false; dead = false; deadT = 0;
  s.packDist = packDist;
  for (const d of dogs) {
    d.x = d.def.xOff; d.rel = -packDist + d.def.zOff; d.z = d.rel; d.y = groundY(d.z); d.dist = 0; d.prevX = d.x; d.laneX = 0;
    d.laneHist.length = 0; d.barkT = 1.5 + rnd() * 3;
    d.obj.position.set(d.x, d.y, d.z); d.obj.rotation.set(0, 0, 0);
  }
}

export async function init(ctx) {
  C = ctx; cfg = ctx.config || {};
  const THREE = ctx.THREE;
  let before = 0, after = 0;
  for (let i = 0; i < DOGS.length; i++) {
    const def = DOGS[i];
    let asset = null;
    try { asset = await ctx.assets.get(def.name, { keepHierarchy: true }); } catch (e) { console.warn('[pack]', def.name, e); }
    if (!asset) { asset = new THREE.Group(); asset.userData.placeholder = true; }
    before += countMeshes(asset);
    if (asset.userData && asset.userData.joints) mergePerJoint(THREE, asset);
    else if (!asset.userData?.placeholder) console.warn('[pack]', def.name, 'has no userData.joints — it will not animate');
    after += countMeshes(asset);
    const obj = new THREE.Group(); obj.name = def.name; obj.add(asset);
    ctx.scene.add(obj);
    dogs.push({ name: def.name, def, obj, root: asset, anim: new DogAnim(THREE, asset, i), x: 0, y: 0, z: 0, rel: 0, dist: 0, barkT: 2, laneHist: [], prevX: 0, laneX: 0 });
  }
  drawInfo = { before, after };
  ctx.state.packDraws = after;
  resetPack();
  const ev = ctx.events;
  if (ev && typeof ev.on === 'function') {
    ev.on('start', () => resetPack());
    // a hit closes the pack to ~1.2 m (PACK_DIST − 1.4), a stumble half that; catch stays at < 0.8 m
    ev.on('hit', () => { packDist = Math.max(0, packDist - HIT_CLOSE); for (const d of dogs) d.barkT = Math.min(d.barkT, 0.1 + rnd() * 0.3); });
    ev.on('stumble', () => { packDist = Math.max(0, packDist - HIT_CLOSE * 0.5); });
    ev.on('death', () => { dead = true; deadT = 0; });
  }
}

export function update(a, b) {
  const dt = clamp(typeof a === 'number' ? a : (typeof b === 'number' ? b : 1 / 60), 0, 0.1);
  const s = C.state;
  clock += dt;
  const PD = cfgv('PACK_DIST', 5);
  const live = s.running && !s.over && !dead;

  if (live) {
    if (packDist < PD) packDist = Math.min(PD, packDist + 1.0 * dt);
    if (packDist < 0.8 && !caught) {
      caught = true; dead = true; deadT = 0;
      emit('death', { reason: 'caught', distance: s.distance });
    }
  } else if (dead) {
    deadT += dt;
    packDist = damp(packDist, 0.9, 2.0, dt);          // run up to the fallen runner
  }
  s.packDist = packDist;

  const lane = s.lane | 0;
  const px = s.x || 0, pz = s.z || 0;
  const speed = s.speed || 0;
  for (let i = 0; i < dogs.length; i++) {
    const d = dogs[i], def = d.def;
    // lane with lag: remember the runner's lane over time and read it `lag` seconds back
    d.laneHist.push([clock, lane]);
    while (d.laneHist.length > 2 && d.laneHist[1][0] <= clock - def.lag) d.laneHist.shift();
    const lagLane = d.laneHist[0][1];
    const weave = live ? Math.sin(clock * def.weave + i * 2.1) * 0.15 : 0;
    const tx = laneToX(lagLane) + def.xOff + weave;
    // z is followed as an offset RELATIVE to the runner (damping toward a target that moves at 10–20 m/s
    // would settle v/rate metres short); only changes of packDist are smoothed
    const relT = -packDist + def.zOff - (dead ? 0.4 * i : 0);
    const nx = damp(d.x, tx, 6.5, dt);
    const prevZ = d.z;
    const rel = live ? damp(d.rel, relT, 9, dt) : (dead ? damp(d.rel, relT, 3, dt) : relT);
    d.rel = rel;
    const nz = pz + rel;
    d.x = nx; d.z = nz;
    const vz = dt > 0 ? (d.z - prevZ) / dt : 0;
    d.dist += Math.max(0, vz) * dt;
    const laneVel = dt > 0 ? (d.x - d.prevX) / dt : 0;
    d.prevX = d.x;
    d.y = groundY(d.z);
    d.obj.position.set(d.x, d.y, d.z);
    let mode = 'idle';
    if (live) mode = 'run';
    else if (dead) mode = (Math.abs(vz) > 1.5) ? 'run' : 'excited';
    d.anim.update(dt, { mode, speed: live ? Math.max(speed, 3) : Math.max(vz, 3), distance: mode === 'run' ? d.dist : undefined, laneVel, groundPitch: groundPitch(d.z) });

    // barks
    if (s.running) {
      d.barkT -= dt;
      if (d.barkT <= 0) {
        d.barkT = (dead ? 0.8 : 2.5) + rnd() * (dead ? 1.2 : 4.0);
        emit('bark', { dog: d.name, index: i, x: d.x, z: d.z, dist: pz - d.z });
      }
    }
  }
}

export function getDogs() { return dogs.map((d) => ({ name: d.name, obj: d.obj })); }
export function getDrawInfo() { return drawInfo; }
