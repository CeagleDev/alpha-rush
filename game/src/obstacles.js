/**
 * obstacles.js — E1. Seeded obstacle rows, pooled instances, per-lane AABBs, `next` / `coin` telemetry.
 *
 * exports: init(ctx), update(dt), hit(aabb), spawnChunk(rec), releaseChunk(index), rows(), rowsOf(index)
 *
 * Rows: every 12–18 m (closer with distance: spacing = 18 − 6·d, d = clamp(chunkZ / 1500, 0, 1)),
 * none in a ramp's first 5 m, none in the first 18 m of chunk 0. Kinds by zone (alley: crate_stack /
 * cooler_bin / fallen_bicycle = jump, banner_cluster_low / awning_strut_low = roll, kei_van / yatai_cart
 * / vending_machine / parked_sedan = block; expressway and ramps: roadworks_barrier = jump,
 * gantry_board_low = roll (2 lanes wide), concrete_divider = block). A row occupies 1 or 2 lanes
 * (P(2) = 0.25 + 0.5·d) and ALWAYS leaves ≥ 1 free (null) lane, chosen so that a free lane is within
 * one lane of the previous row's free lanes. Rows are one class: jump, roll (only roll items; row depth
 * ≤ 2.5 m, since a 0.5 s roll at 9 m/s covers 4.5 m) or block (a block item, and with rising difficulty
 * a jump item beside it). Everything is deterministic from config.SEED and the chunk index.
 *
 * AABBs (world, axis-aligned): x = lane centre ± min(w/2, 0.95); z = near edge → near edge + depth;
 * y: jump kinds ground → ground + min(h, 0.75) (a 1.1 m apex clears them), roll kinds hang at
 * ground + 1.3 → +h (a roll halves the player's 1.7 m box), block kinds ground → ground + h.
 * hit(aabb) takes a Box3-like {min:{x,y,z}, max:{x,y,z}} and returns the item {id, kind, type, lane,
 * box, row} or null.
 *
 * state fields written (defaults in init): next (null | {id, dist, len, lanes, lane, kind, type}),
 * coin (null | {dist, lane}), coinLane (null | -1|0|1) — exactly tools/GATE_CONTRACT.md.
 */
import * as THREE from 'three';
import { mulberry32, hash32 } from './chunks.js?v=202609201508';
import { groundY, groundPitch, frame } from './track.js?v=202609201508';
import * as coins from './coins.js?v=202609201508';

const KINDS = {
  alley: {
    jump: ['crate_stack', 'cooler_bin', 'fallen_bicycle'],
    roll: ['banner_cluster_low', 'awning_strut_low'],
    block: ['kei_van', 'yatai_cart', 'vending_machine', 'parked_sedan'],
  },
  // concrete_divider (1.02 m) was the expressway's BLOCK while roadworks_barrier (1.2 m) is its JUMP:
  // a player who had just hopped the barrier would jump the lower divider and die. Blocks on the
  // expressway are now broken-down vehicles; dividers stay as edge scenery placed by chunks.js.
  expressway: { jump: ['roadworks_barrier'], roll: ['gantry_board_low'], block: ['parked_sedan', 'kei_van'] },
};
const LANES_WIDE = { gantry_board_low: 2 };
// JUMP_CAP was 0.75: a 1.25 m crate stack only "existed" to 0.75 m, so a late jump ploughed the
// shins through the top two crates with no hit. 0.9 leaves 20 cm under the 1.1 m apex.
const ROLL_CLEAR = 1.3, JUMP_CAP = 0.9, MAX_ROLL_LEN = 2.5, NEXT_RANGE = 60;

let ctx = null, seed = 1, root = null, LANE_X = [-2, 0, 2];
const pools = new Map();     // type → {proto, size, kind, lanes, free: []}
let rowsList = [];           // live rows sorted by z
let rowId = 0, nextRowZ = 0, lastChunkZ0 = -1, prevFree = [-1, 0, 1], doneFrame = -1;

// ---------------------------------------------------------------- pools
async function loadType(type, kind) {
  let proto;
  try { proto = await ctx.assets.get(type); } catch (e) { console.warn('[obstacles] get failed', type, e.message); proto = new THREE.Group(); }
  const box = new THREE.Box3().setFromObject(proto);
  const size = box.isEmpty() ? new THREE.Vector3(1, 1, 1) : box.getSize(new THREE.Vector3());
  const decl = proto.userData?.obstacle;
  pools.set(type, { proto, size, kind: decl?.kind || kind, lanes: decl?.lanes || LANES_WIDE[type] || 1, free: [] });
}
function acquire(type) {
  const p = pools.get(type);
  let inst = p.free.pop();
  if (!inst) { inst = p.proto.clone(true); inst.userData.obstacleType = type; }
  root.add(inst);
  return inst;
}
function releaseInst(type, inst) { root.remove(inst); pools.get(type).free.push(inst); }

// ---------------------------------------------------------------- generation
function laneSets(n) {
  return n === 1 ? [[-1], [0], [1]] : [[-1, 0], [0, 1], [-1, 1]];
}
function validSets(n, adjacentOnly) {
  return laneSets(n).filter((occ) => {
    if (adjacentOnly && occ.length === 2 && Math.abs(occ[0] - occ[1]) !== 1) return false;
    const free = [-1, 0, 1].filter((l) => !occ.includes(l));
    return free.some((f) => prevFree.some((p) => Math.abs(f - p) <= 1));
  });
}
function rowClass(rng, d) {
  const r = rng();
  if (r < 0.4) return 'jump';
  if (r < 0.7 - 0.05 * d) return 'roll';
  return 'block';
}

function makeRow(rng, z, zone, d, chunkIndex) {
  const set = KINDS[zone === 'alleyA' || zone === 'alleyB' ? 'alley' : 'expressway'];
  const cls = rowClass(rng, d);
  let n = rng() < 0.25 + 0.5 * d ? 2 : 1;
  const rollWide = cls === 'roll' && set.roll.every((t) => (pools.get(t)?.lanes || 1) >= 2);
  if (rollWide) n = 2;
  let sets = validSets(n, rollWide);
  if (!sets.length) { n = 1; sets = validSets(1, false); }
  if (!sets.length) sets = [[0]];
  const occ = sets[Math.floor(rng() * sets.length)];
  const items = [];
  const typeOf = (kind) => {
    const list = set[kind].filter((t) => pools.has(t) && (kind !== 'roll' || pools.get(t).size.z <= MAX_ROLL_LEN));
    return list.length ? list[Math.floor(rng() * list.length)] : null;
  };
  if (rollWide) {
    const type = typeOf('roll');
    if (type) items.push({ type, kind: 'roll', lanes: occ.slice() });
  } else {
    occ.forEach((lane, k) => {
      let kind = cls;
      if (cls === 'block' && k === 1 && rng() < 0.35 + 0.3 * d) kind = 'jump';
      const type = typeOf(kind);
      if (type) items.push({ type, kind, lanes: [lane] });
    });
  }
  if (!items.length) return null;
  const len = Math.max(...items.map((it) => pools.get(it.type).size.z), 0.3);
  const lanes = [null, null, null];
  const rank = { jump: 1, roll: 2, block: 3 };
  for (const it of items) for (const l of it.lanes) if (!lanes[l + 1] || rank[it.kind] > rank[lanes[l + 1]]) lanes[l + 1] = it.kind;
  const row = { id: ++rowId, chunk: chunkIndex, z, len, lanes, items: [], zone };
  const g = groundY(z + len / 2), pitch = groundPitch(z + len / 2);
  for (const it of items) {
    const p = pools.get(it.type);
    const inst = acquire(it.type);
    const x = it.lanes.reduce((a, l) => a + LANE_X[l + 1], 0) / it.lanes.length;
    const zc = z + p.size.z / 2;
    // Only banner_cluster_low is authored with its base at the HEM (hoist it to the clearance line);
    // awning_strut_low and gantry_board_low stand on the ground with their bar/board already at
    // 1.3 m. Hoisting all three put a scaffold pole at 2.6 m with its legs dangling in mid-air while
    // its box still "hit" a runner walking underneath - the Fable critic's number one finding.
    // Two different heights: where the INSTANCE stands, and where its HITBOX starts.
    //  - banner_cluster_low is authored base-at-hem, so the instance is hoisted to ROLL_CLEAR;
    //    awning_strut_low and gantry_board_low stand on the ground with their bar/board already at
    //    1.3 m (hoisting them put a scaffold in mid-air - the Fable critic's number one finding).
    //  - every ROLL hitbox starts at ROLL_CLEAR regardless: the thing in the LANE is the bar or the
    //    board, and the legs stand outside it. Boxing a ground-standing strut from y = 0 made a
    //    rolling runner collide with its legs (three deaths in one gate run).
    const yInst = g + (it.kind === 'roll' && it.type === 'banner_cluster_low' ? ROLL_CLEAR : 0);
    const yBase = g + (it.kind === 'roll' ? ROLL_CLEAR : 0);
    inst.position.set(x, yInst, zc);
    inst.rotation.set(-pitch, 0, 0);
    inst.updateMatrixWorld(true);
    const hw = Math.min(p.size.x / 2, it.lanes.length > 1 ? p.size.x / 2 : 0.95);
    const yTop = it.kind === 'jump' ? yBase + Math.min(p.size.y, JUMP_CAP) : yInst + p.size.y;
    const box = new THREE.Box3(new THREE.Vector3(x - hw, yBase, z), new THREE.Vector3(x + hw, yTop, z + p.size.z));
    const lane = it.lanes.length === 1 ? it.lanes[0] : it.lanes[0];
    row.items.push({ id: row.id * 4 + it.lanes[0] + 1, kind: it.kind, type: it.type, lane, lanes: it.lanes, box, inst, row });
  }
  prevFree = [-1, 0, 1].filter((l) => lanes[l + 1] === null);
  return row;
}

/** Called by track.js when chunk `rec` is placed. Returns the rows generated for it. */
export function spawnChunk(rec) {
  if (!ctx) return [];
  const z0 = rec.z0, zone = rec.zone;
  if (z0 <= lastChunkZ0) { nextRowZ = 0; prevFree = [-1, 0, 1]; }   // went backwards: a restart
  lastChunkZ0 = z0;
  const rng = mulberry32(hash32(`rows/${seed}/${rec.index}`));
  const d = Math.max(0, Math.min(1, z0 / 1500));
  const isRamp = zone === 'rampUp' || zone === 'rampDown';
  const minStart = rec.index === 0 ? 18 : isRamp ? 5 + rng() * 3 : 3 + rng() * 4;
  let z = Math.max(z0 + minStart, nextRowZ);
  const out = [];
  while (z < rec.z1 - 2) {
    const row = makeRow(rng, z, zone, d, rec.index);
    if (row) { out.push(row); rowsList.push(row); }
    z += 18 - 6 * d + (rng() * 3 - 1.5);
  }
  nextRowZ = z;
  rowsList.sort((a, b) => a.z - b.z);
  return out;
}
export function releaseChunk(index) {
  rowsList = rowsList.filter((row) => {
    if (row.chunk !== index) return true;
    for (const it of row.items) releaseInst(it.type, it.inst);
    return false;
  });
}
export const rows = () => rowsList;
export const rowsOf = (index) => rowsList.filter((r) => r.chunk === index);

// ---------------------------------------------------------------- queries
export function hit(aabb) {
  if (!aabb || !aabb.min || !aabb.max) return null;
  for (const row of rowsList) {
    if (row.z > aabb.max.z + 0.01) break;
    if (row.z + row.len < aabb.min.z) continue;
    for (const it of row.items) {
      if (it.knocked) continue;                 // knocked over: no longer solid
      const b = it.box;
      if (aabb.min.x <= b.max.x && aabb.max.x >= b.min.x && aabb.min.y <= b.max.y && aabb.max.y >= b.min.y &&
          aabb.min.z <= b.max.z && aabb.max.z >= b.min.z) return it;
    }
  }
  return null;
}

// KNOCK-OVER. Before this, a head-on hit on a crate stack left the runner (and 0.4 s later the
// camera) passing straight through it - the first four frames of the critic's death sheet are the
// inside of a crate. Light items (JUMP kind: crates, coolers, a bicycle, a barrier) now get knocked
// over: they tumble sideways off the lane, sink, and are released, and the row's lane is freed so
// `next` and the dogs stop treating it as solid. BLOCK items are not knockable - a van stops you.
const knocked = [];
export function knock(item, dir = 1) {
  if (!item || item.knocked || item.kind === 'block') return false;
  item.knocked = true;
  knocked.push({ it: item, t: 0, dir: dir >= 0 ? 1 : -1, x0: item.inst.position.x, y0: item.inst.position.y });
  const row = item.row;
  if (row && Array.isArray(row.lanes)) for (const l of item.lanes) row.lanes[l + 1] = null;
  return true;
}
function tumble(dt) {
  for (let i = knocked.length - 1; i >= 0; i--) {
    const k = knocked[i]; k.t += dt; const inst = k.it.inst; const u = k.t / 0.9;
    inst.rotation.z += -k.dir * dt * 6.5;                       // rolls over sideways
    inst.rotation.x += dt * 2.0;
    inst.position.x = k.x0 + k.dir * Math.min(1.4, k.t * 2.6);  // slides off the lane
    inst.position.y = k.y0 + (u < 0.35 ? 0.25 * Math.sin(u / 0.35 * Math.PI) : -Math.max(0, (u - 0.35)) * 3);   // a hop, then sinks
    if (k.t >= 0.9) {
      const row = k.it.row; if (row) row.items = row.items.filter((x) => x !== k.it);
      releaseInst(k.it.type, inst); inst.rotation.set(0, 0, 0); knocked.splice(i, 1);
    }
  }
}
let lastTumbleT = 0;
export function update() {
  if (!ctx) return;
  { const now = performance.now() / 1000; tumble(lastTumbleT ? Math.min(0.05, now - lastTumbleT) : 0.016); lastTumbleT = now; }
  const f = frame(); if (f === doneFrame) return; doneFrame = f;
  const st = ctx.state;
  const pz = Number.isFinite(st.z) ? st.z : (st.distance || 0);
  const myLane = Math.max(-1, Math.min(1, Math.round(st.lane ?? 0)));
  let next = null;
  for (const row of rowsList) {
    if (row.z + row.len < pz - 0.3) continue;
    const dist = Math.max(0, row.z - pz);
    if (dist > NEXT_RANGE) break;
    let lane = myLane;
    if (row.lanes[lane + 1] === null) {
      let best = null, bd = 9;
      for (let l = -1; l <= 1; l++) if (row.lanes[l + 1] !== null && Math.abs(l - myLane) < bd) { bd = Math.abs(l - myLane); best = l; }
      lane = best ?? myLane;
    }
    const item = row.items.find((it) => it.lanes.includes(lane));
    next = { id: row.id, dist, len: row.len, lanes: row.lanes.slice(), lane, kind: row.lanes[lane + 1] || (item && item.kind) || 'block', type: item ? item.type : '' };
    break;
  }
  st.next = next;
  const c = coins.nearestAhead(pz);
  st.coin = c;
  st.coinLane = c ? c.lane : null;
}

export async function init(c) {
  if (ctx === c && root) return;   // track.init already did this
  ctx = c;
  seed = Number(ctx.config?.SEED) || 1;
  LANE_X = ctx.config?.LANE_X || LANE_X;
  const st = ctx.state;
  if (st.next === undefined) st.next = null;
  if (st.coin === undefined) st.coin = null;
  if (st.coinLane === undefined) st.coinLane = null;
  root = new THREE.Group(); root.name = 'obstacles'; ctx.scene.add(root);
  rowsList = []; rowId = 0; nextRowZ = 0; lastChunkZ0 = -1; prevFree = [-1, 0, 1];
  const jobs = [];
  for (const set of Object.values(KINDS)) for (const [kind, types] of Object.entries(set)) for (const t of types) jobs.push(loadType(t, kind));
  await Promise.all(jobs);
}
