/**
 * track.js — E1. Chunk pool, seeded sequence, recycling, zones, ramps; drives obstacles, coins, far band.
 *
 * exports: init(ctx), update(dt), chunkAt(z), groundY(z), groundPitch(z), zoneAt(z), lights(), stats(), frame()
 * main.js also inits/updates obstacles.js and coins.js directly; both are idempotent (init returns when
 * already done for this ctx, update runs once per track frame via frame()), so either order works.
 *
 * Sequence: [A×6, RU, X×6, RD, D×6, B×6] cycling (26 chunks = 780 m per cycle); D is the daylight street. Within each 6-chunk
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
import { VARIANTS, buildVariant, CHUNK_LEN, DECK_Y, mulberry32, hash32, materialCount } from './chunks.js?v=202609241255';
import * as obstacles from './obstacles.js?v=202609241255';
import * as coins from './coins.js?v=202609241255';
import * as farband from './farband.js?v=202609241255';

// THE THIRD SCENE (owner, 2026-09-21): night street -> ramp -> expressway, where DAWN breaks over the
// last stretch of the deck -> ramp down into a DAYLIGHT morning-market street (D x6) -> dusk falls
// over its last chunks -> the night market street (B) -> and round again. 26 chunks = 780 m a cycle.
// TWO MORE SCENES (owner, 2026-09-23): after the night market a ramp climbs onto the neon ROOFTOPS (R x6, at
// deck height like the expressway), a ramp comes down into the TORII shrine path (T x6, ground level, misty
// dusk-blue with warm lanterns), and the path opens back into the yokocho (A). 40 chunks = 1200 m a cycle.
const PATTERN = ['A', 'A', 'A', 'A', 'A', 'A', 'RU', 'X', 'X', 'X', 'X', 'X', 'X', 'RD', 'D', 'D', 'D', 'D', 'D', 'D', 'B', 'B', 'B', 'B', 'B', 'B',
  'RU', 'R', 'R', 'R', 'R', 'R', 'R', 'RD'];
// THE REVEALED LOCATION (owner, 2026-09-24: "one more location, only revealed as you play to a certain
// distance", then: the two new environments are enough, build no third). So the SHRINE PATH is the one
// held back: the first lap is the 34 chunks above (1,020 m) and never shows it; every later lap OPENS with
// it (T x6), so a run that reaches 1,020 m comes down off the rooftops into a place it has never seen.
// The 'reveal' event fires the first time a run enters it; the home screen keeps the name unlocked from
// then on, but the path itself is earned by distance, every run.
const PATTERN2 = ['T', 'T', 'T', 'T', 'T', 'T'].concat(PATTERN);
const REVEAL_ZONE = 'torii', REVEAL_LABEL = 'Shrine Path', REVEAL_M = 1020;
const ZONE = { A: 'alleyA', RU: 'rampUp', X: 'expressway', RD: 'rampDown', D: 'day', B: 'alleyB', R: 'rooftops', T: 'torii' };
const segStarts = (pat) => { const o = {}; pat.forEach((k, i) => { if (!(k in o)) o[k] = i; }); return o; };
const SEG_START = segStarts(PATTERN), SEG_START2 = segStarts(PATTERN2);
const HIGH = new Set(['X', 'R']);   // zones that run at deck height
const CYCLE = PATTERN.length, CYCLE2 = PATTERN2.length;
/** Slot of chunk i in its pattern: the first lap uses PATTERN, every later lap PATTERN2. */
function slotAndPattern(i) { if (i < CYCLE) return [i, PATTERN]; const j = (i - CYCLE) % CYCLE2; return [j, PATTERN2]; }
/** Slot re-based so the day zone starts at slot 14 in either pattern (dayAt's DAWN/DUSK constants are in those units). */
function dayU(z) { const i = Math.floor(z / CHUNK_LEN), [slot, pat] = slotAndPattern(i); const off = (pat === PATTERN2 ? SEG_START2.D : SEG_START.D) - 14; return slot + (z / CHUNK_LEN - i) - off; }
// time of day along one cycle, in chunk units: 0 = night, 1 = full day
const DAWN0 = 9.5, DAWN1 = 13.6, DUSK0 = 18.4, DUSK1 = 20.6;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** 0 (night) .. 1 (day) at world z. Pure function of z, so the camera, the lights and a photo at a fixed distance agree. */
export function dayAt(z) {
  if (!(z > 0)) return 0;
  const u = dayU(z);
  return sstep(DAWN0, DAWN1, u) * (1 - sstep(DUSK0, DUSK1, u));
}
/** 0 at first light .. 1 at last light: lighting.js swings the sun from ahead-left to ahead-right across the day. */
export function sunAzT(z) { const u = dayU(z > 0 ? z : 0); return Math.min(1, Math.max(0, (u - DAWN0) / (DUSK1 - DAWN0))); }
/** +1 while the sun is coming up, -1 while it goes down (lighting.js puts the sun ahead at dawn, behind at dusk). */
export function dayPhase(z) { const u = dayU(z > 0 ? z : 0); return u < (DAWN1 + DUSK0) / 2 ? 1 : -1; }
const AHEAD = 5, BEHIND = 1;
const RAMP_PITCH = Math.atan2(DECK_Y, CHUNK_LEN);

let ctx = null, seed = 1, root = null;
const pool = new Map();        // variant id → [{group, inUse}]
const live = new Map();        // chunk index → record
const segOrders = new Map();   // `${cycle}:${seg}` → [variant ids]
let lightsCache = null, lastZone = null, lastPz = 0, buildInfo = null, frameNo = 0;
/** Frame stamp: obstacles/coins run once per track frame even when main.js calls their update too. */
export const frame = () => frameNo;

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
function slotOf(i) { return slotAndPattern(Math.max(0, i))[0]; }
function kindOf(i) { const [slot, pat] = slotAndPattern(Math.max(0, i)); return pat[slot]; }
export function variantIdAt(i) {
  const s = slotOf(i), k = kindOf(i);
  if (k === 'RU' || k === 'RD') return k;
  // the segment order re-shuffles per lap; the N segment only exists from lap 2, its slot is fixed
  const lap = i < CYCLE ? 0 : 1 + Math.floor((i - CYCLE) / CYCLE2);
  return segmentOrder(lap, k)[s - (lap ? SEG_START2 : SEG_START)[k]];
}
export function zoneAt(z) { return z < 0 ? 'alleyA' : ZONE[kindOf(Math.floor(z / CHUNK_LEN))]; }
export function groundY(z) {
  if (z < 0) return 0;
  const i = Math.floor(z / CHUNK_LEN), k = kindOf(i), t = (z - i * CHUNK_LEN) / CHUNK_LEN;
  if (HIGH.has(k)) return DECK_Y;
  if (k === 'RU') return DECK_Y * t;
  if (k === 'RD') return DECK_Y * (1 - t);
  return 0;
}
export function groundPitch(z) {
  if (z < 0) return 0;
  const k = kindOf(Math.floor(z / CHUNK_LEN));
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
  const zone = ZONE[kindOf(i)];
  const g = entry.group;
  g.position.set(0, zone === 'expressway' || zone === 'rooftops' ? DECK_Y : 0, i * CHUNK_LEN);
  // A pooled chunk comes back with whatever visibility perf.js last gave it - usually HIDDEN, because a
  // chunk is released once it is far behind, and far chunks are culled. perf.js only rediscovers the
  // live set every 30 frames, so after a restart the whole street was invisible for ~14 frames: the
  // "blank blue screen" (owner). A spawned chunk starts fully visible, fine bake on, coarse off.
  // by NAME, not by identity: a pooled clone's userData is a JSON copy, so its `coarse` is not its child
  g.visible = true;
  for (const ch of g.children) ch.visible = ch.name !== 'coarse';
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
  return { build: buildInfo, live: [...live.keys()], liveTris, rows: obstacles.rows().length, coins: coins.count(), coinTris: coins.geometryTris(), farband: farband.stats(), shadows: !!ctx.renderer?.shadowMap?.enabled };
}

// ---------------------------------------------------------------- lifecycle
export async function init(c) {
  ctx = c;
  seed = Number(ctx.config?.SEED) || 1;
  const st = ctx.state;
  if (st.zone === undefined) st.zone = 'alleyA';
  if (ctx.events && ctx.events.on) ctx.events.on('start', () => { st.revealedThisRun = false; });
  root = new THREE.Group(); root.name = 'track'; ctx.scene.add(root);
  await buildPool();
  await obstacles.init(ctx);
  await coins.init(ctx);
  await farband.init(ctx);
  lastZone = null;
  // QA 2026-09-21: a restart after an EARLY death kept the chunks that were still live, with their
  // coins already collected and their knocked-over obstacles gone. A new run gets a new street.
  if (ctx.events && ctx.events.on) ctx.events.on('start', () => { for (const i of [...live.keys()]) release(i); lastZone = null; update(0); });
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
    if (zone === REVEAL_ZONE && !st.revealedThisRun && ctx.events?.emit) { st.revealedThisRun = true; ctx.events.emit('reveal', { id: REVEAL_ZONE, label: REVEAL_LABEL, z: pz, at: REVEAL_M }); }
  }
  lastPz = pz;
  frameNo++;
  obstacles.update(dt);
  coins.update(dt);
  farband.update(dt);
}
