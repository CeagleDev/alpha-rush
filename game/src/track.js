/**
 * track.js — E1. Chunk pool, seeded sequence, recycling, zones, ramps; drives obstacles, coins, far band.
 *
 * exports: init(ctx), update(dt), chunkAt(z), groundY(z), groundPitch(z), zoneAt(z), lights(), stats()
 *
 * Sequence: [A×6, RU, X×6, RD, B×6] cycling (20 chunks = 600 m per cycle). Within each 6-chunk
 * segment the six variants are a seeded permutation (config.SEED) that alternates odd/even variants,
 * so an alley cross-street and an expressway gantry land on every other chunk. Chunk i covers world
 * z ∈ [30 i, 30 i + 30). Pool: every variant is built and baked ONCE at init (chunks.js), a second
 * copy is a clone sharing geometry — never a bake during play. Live window: 1 chunk behind the
 * player, 5 ahead (~6–7 live); chunks leaving the window go back to the pool and the next index in
 * the sequence is placed ahead. A player z that jumps backwards (restart in place) is handled by the
 * same window: everything releases and chunk 0.. respawn with fresh rows and coins.
 *
 * Heights: alley y = 0; expressway running surface y = 6 (chunk group at y = 6, the deck slab sunk by
 * its thickness inside the chunk); ramps rise/fall linearly 0 ↔ 6 over their 30 m. groundY(z) and
 * groundPitch(z) (radians; + = rising with z) are computed from the sequence alone, so the camera
 * can look ahead before a chunk is live. Chunks are never rotated, so a chunk's chunk-local lights
 * (chunk.userData.lights) become world lights by adding the chunk's position — lights() does that.
 *
 * state fields written here (defaults set in init): zone ('alleyA'), plus the ones obstacles.js and
 * coins.js declare. Emits 'zone' {zone, prev, z} when the player's zone changes. RNG: derives its own
 * mulberry32 streams from config.SEED (never consumes state.rng, so the sequence cannot drift with
 * another module's draw order).
 */
import * as THREE from 'three';
import { VARIANTS, buildVariant, CHUNK_LEN, DECK_Y, mulberry32, hash32, materialCount } from './chunks.js';
import * as obstacles from './obstacles.js';
import * as coins from './coins.js';
import * as farband from './farband.js';

const PATTERN = ['A', 'A', 'A', 'A', 'A', 'A', 'RU', 'X', 'X', 'X', 'X', 'X', 'X', 'RD', 'B', 'B', 'B', 'B', 'B', 'B'];
const ZONE = { A: 'alleyA', RU: 'rampUp', X: 'expressway', RD: 'rampDown', B: 'alleyB' };
const SEG_START = { A: 0, X: 7, B: 14 };
const AHEAD = 5, BEHIND = 1;
const RAMP_PITCH = Math.atan2(DECK_Y, CHUNK_LEN);

let ctx = null, seed = 1, root = null;
const pool = new Map();        // variant id → [{group, inUse}]
const live = new Map();        // chunk index → record
const segOrders = new Map();   // `${cycle}:${seg}` → [variant ids]
let lightsCache = null, lastZone = null, lastPz = 0, buildInfo = null;

// ---------------------------------------------------------------- sequence
function segmentOrder(cycle, seg) {
  const key = `${cycle}:${seg}`;
  if (segOrders.has(key)) return segOrders.get(key);
  const rng = mulberry32(hash32(`seq/${seed}/${key}`));
  const ids = VARIANTS.filter((v) => v.id[0] === seg).map((v) => v.id);
  const odd = ids.filter((id) => Number(id.slice(1)) % 2 === 1), even = ids.filter((id) => Number(id.slice(1)) % 2 === 0);
  const sh = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const a = sh(odd), b = sh(even), out = [];
  const startOdd = rng() < 0.5;
  for (let i = 0; i < 3; i++) { if (startOdd) out.push(a[i], b[i]); else out.push(b[i], a[i]); }
  segOrders.set(key, out);
  return out;
}
function slotOf(i) { return ((i % 20) + 20) % 20; }
export function variantIdAt(i) {
  const s = slotOf(i), k = PATTERN[s];
  if (k === 'RU' || k === 'RD') return k;
  return segmentOrder(Math.floor(i / 20), k)[s - SEG_START[k]];
}
export function zoneAt(z) { return z < 0 ? 'alleyA' : ZONE[PATTERN[slotOf(Math.floor(z / CHUNK_LEN))]]; }
export function groundY(z) {
  if (z < 0) return 0;
  const i = Math.floor(z / CHUNK_LEN), k = PATTERN[slotOf(i)], t = (z - i * CHUNK_LEN) / CHUNK_LEN;
  if (k === 'X') return DECK_Y;
  if (k === 'RU') return DECK_Y * t;
  if (k === 'RD') return DECK_Y * (1 - t);
  return 0;
}
export function groundPitch(z) {
  if (z < 0) return 0;
  const k = PATTERN[slotOf(Math.floor(z / CHUNK_LEN))];
  return k === 'RU' ? RAMP_PITCH : k === 'RD' ? -RAMP_PITCH : 0;
}
export function chunkAt(z) { return live.get(Math.floor(z / CHUNK_LEN)) || null; }
export function chunkLength() { return CHUNK_LEN; }

// ---------------------------------------------------------------- pool
async function buildPool() {
  const t0 = performance.now();
  const built = await Promise.all(VARIANTS.map((v) => buildVariant(ctx, v)));
  let tris = 0, meshes = 0;
  built.forEach((g, i) => {
    const copies = [{ group: g, inUse: false }];
    const c = g.clone(true); c.userData = JSON.parse(JSON.stringify(g.userData)); copies.push({ group: c, inUse: false });
    pool.set(VARIANTS[i].id, copies);
    tris += g.userData.tris || 0;
    g.traverse((o) => { if (o.isMesh) meshes++; });
  });
  buildInfo = { ms: Math.round(performance.now() - t0), variants: built.length, trisPerVariant: built.map((g) => ({ id: g.userData.variant, tris: g.userData.tris, meshes: (() => { let n = 0; g.traverse((o) => { if (o.isMesh) n++; }); return n; })(), litter: g.userData.litter, props: g.userData.props, lights: g.userData.lights.length })), materials: materialCount() };
}

function spawn(i) {
  const id = variantIdAt(i);
  const copies = pool.get(id);
  let entry = copies.find((c) => !c.inUse);
  if (!entry) { console.warn('[track] no free copy of', id, '— cloning'); entry = { group: copies[0].group.clone(true), inUse: false }; entry.group.userData = copies[0].group.userData; copies.push(entry); }
  entry.inUse = true;
  const zone = ZONE[PATTERN[slotOf(i)]];
  const g = entry.group;
  g.position.set(0, zone === 'expressway' ? DECK_Y : 0, i * CHUNK_LEN);
  g.updateMatrixWorld(true);
  root.add(g);
  const rec = { index: i, id, zone, z0: i * CHUNK_LEN, z1: i * CHUNK_LEN + CHUNK_LEN, group: g, entry, cross: g.userData.cross };
  live.set(i, rec);
  const rows = obstacles.spawnChunk(rec);
  coins.spawnChunk(rec, rows);
  lightsCache = null;
  return rec;
}
function release(i) {
  const rec = live.get(i); if (!rec) return;
  root.remove(rec.group); rec.entry.inUse = false;
  obstacles.releaseChunk(i); coins.releaseChunk(i);
  live.delete(i); lightsCache = null;
}

/** World-space practicals of every live chunk: [{x,y,z,color,intensity,range,chunk}] */
export function lights() {
  if (lightsCache) return lightsCache;
  const out = [];
  for (const rec of live.values()) {
    const p = rec.group.position;
    for (const l of rec.group.userData.lights || []) out.push({ x: l.x + p.x, y: l.y + p.y, z: l.z + p.z, color: l.color, intensity: l.intensity, range: l.range, chunk: rec.index });
  }
  return (lightsCache = out);
}

export function stats() {
  let liveTris = 0;
  for (const rec of live.values()) liveTris += rec.group.userData.tris || 0;
  return { build: buildInfo, live: [...live.keys()], liveTris, rows: obstacles.rows().length, coins: coins.count(), farband: farband.stats() };
}

// ---------------------------------------------------------------- lifecycle
export async function init(c) {
  ctx = c;
  seed = Number(ctx.config?.SEED) || 1;
  const st = ctx.state;
  if (st.zone === undefined) st.zone = 'alleyA';
  root = new THREE.Group(); root.name = 'track'; ctx.scene.add(root);
  await buildPool();
  await obstacles.init(ctx);
  await coins.init(ctx);
  await farband.init(ctx);
  lastZone = null;
  update(0);
}

export function update(dt = 0.016) {
  if (!ctx) return;
  const st = ctx.state;
  const pz = Number.isFinite(st.z) ? st.z : (Number.isFinite(st.distance) ? st.distance : 0);
  const ci = Math.floor(pz / CHUNK_LEN);
  const lo = Math.max(0, ci - BEHIND), hi = ci + AHEAD;
  for (const i of [...live.keys()]) if (i < lo || i > hi) release(i);
  for (let i = lo; i <= hi; i++) if (!live.has(i)) spawn(i);
  const zone = zoneAt(pz);
  if (zone !== lastZone) {
    const prev = lastZone; lastZone = zone; st.zone = zone;
    if (prev !== null && ctx.events?.emit) ctx.events.emit('zone', { zone, prev, z: pz });
  }
  lastPz = pz;
  obstacles.update(dt);
  coins.update(dt);
  farband.update(dt);
}
