/**
 * powerups.js — the four pickups and their timed effects (Subway Surfers' power-up layer, re-themed).
 *
 *   magnet   10 s  every coin within reach flies to the runner, from all three lanes (coins.js reads state.magnetT)
 *   omamori  20 s  a protective charm = Subway Surfers' hoverboard: absorbs ONE crash, then it is spent
 *                  (player.js reads state.shieldT and calls absorb())
 *   x2       12 s  doubles the score multiplier (progress.js reads state.x2T)
 *   sneakers 10 s  super sneakers: jump apex 1.1 m -> 2.0 m (player.js reads state.sneakT)
 *
 * exports: init(ctx), update(dt), live() (for tools/clashcheck), absorb() -> true when a shield took the hit
 *
 * PLACEMENT. One pickup at most per chunk, none before 120 m, at least three chunks apart, seeded from
 * config.SEED + chunk index so a seed replays. It stands in the GAP between two obstacle rows, in a lane
 * that is free in the row ahead (obstacles.rowsOf), so reaching it never costs a crash; it floats at chest
 * height, spins, and carries a coloured ground ring so it reads at night from 25 m.
 * Geometry is code (game/assets/pickup_*.js, the jam rule); a missing asset falls back to a plain token so
 * the mechanic still works.
 *
 * state written (defaults in init): magnetT, shieldT, x2T, sneakT (seconds left), powerDur {type: seconds}.
 * Emits 'powerup' {type}, 'shieldbreak'. Listens 'start' (clear everything).
 */
import * as THREE from 'three';
import { mulberry32, hash32, CHUNK_LEN } from './chunks.js?v=202609211528';
import { groundY, chunkAt } from './track.js?v=202609211528';
import * as obstacles from './obstacles.js?v=202609211528';

export const TYPES = {
  magnet:   { asset: 'pickup_magnet',   dur: 10, key: 'magnetT', ring: 0xff5a4a, label: 'magnet' },
  omamori:  { asset: 'pickup_omamori',  dur: 20, key: 'shieldT', ring: 0x7fd4ff, label: 'charm' },
  x2:       { asset: 'pickup_x2',       dur: 12, key: 'x2T',     ring: 0xffd24a, label: 'x2 score' },
  sneakers: { asset: 'pickup_sneakers', dur: 10, key: 'sneakT',  ring: 0x5af0d0, label: 'super jump' },
};
const ORDER = ['magnet', 'omamori', 'x2', 'sneakers'];
const Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
const qn = (k, d) => { const v = Number(Q.get(k)); return Q.has(k) && Number.isFinite(v) ? v : d; };
// ?pfirst= ?pgap= ?pprob= ?ptype= exist for testing only (tools/shot.mjs); the defaults are the game
const FIRST_M = qn('pfirst', 120), MIN_GAP_CHUNKS = qn('pgap', 3), PROB = qn('pprob', 0.55), FORCE_TYPE = Q.get('ptype'), HOVER = 0.75, REACH = 0.95;

let ctx = null, seed = 1, root = null, LANE_X = [-2, 0, 2];
const protos = new Map();          // type -> Group
let items = [];                    // {type, x, y, z, lane, chunk, obj}
const decided = new Set();         // chunk indices already considered this run
let lastSpawnChunk = -99, spin = 0, prevZ = null, shield = null;

function fallbackToken(color) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 }));
  m.position.y = 0.3; g.add(m); return g;
}
async function loadProto(type) {
  const T = TYPES[type];
  let g = null;
  try { g = await ctx.assets.get(T.asset); } catch (e) { g = null; }
  if (!g || g.userData?.placeholder || !g.children.length) g = fallbackToken(T.ring);
  // a pickup must read in an unlit stretch: a low self-colour floor, far under the bloom threshold
  g.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material.clone(); m.emissive = m.color.clone(); m.emissiveIntensity = 0.22; m.userData.pickup = true; o.material = m;
    o.castShadow = false;
  });
  const holder = new THREE.Group(); holder.name = 'pickup.' + type;
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3());
  g.position.set(-c.x, -c.y, -c.z);                       // spin about its own centre
  const spinner = new THREE.Group(); spinner.name = 'spin'; spinner.add(g); holder.add(spinner);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 40),
    new THREE.MeshBasicMaterial({ color: T.ring, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -HOVER + 0.03; ring.name = 'ring'; ring.renderOrder = 3;
  holder.add(ring);
  protos.set(type, holder);
}

function place(i) {
  decided.add(i);
  const rec = chunkAt(i * CHUNK_LEN + 1);
  if (!rec) { decided.delete(i); return; }                 // not live yet: ask again next frame
  if (i * CHUNK_LEN < FIRST_M || i - lastSpawnChunk < MIN_GAP_CHUNKS) return;
  if (rec.zone === 'rampUp' || rec.zone === 'rampDown') return;
  const rng = mulberry32(hash32(`power/${seed}/${i}`));
  if (rng() > PROB) return;
  const rows = obstacles.rowsOf(i).slice().sort((a, b) => a.z - b.z);
  // the widest gap inside this chunk
  const edges = [[rec.z0, rec.z0]].concat(rows.map((r) => [r.z, r.z + r.len])).concat([[rec.z1, rec.z1]]);
  let best = null;
  for (let k = 0; k + 1 < edges.length; k++) {
    const a = edges[k][1], b = edges[k + 1][0];
    if (b - a >= 9 && (!best || b - a > best.w)) best = { w: b - a, z: (a + b) / 2, nextRow: rows[k] || null };
  }
  if (!best) return;
  const free = best.nextRow ? [-1, 0, 1].filter((l) => best.nextRow.lanes[l + 1] === null) : [-1, 0, 1];
  const lane = free.length ? free[Math.floor(rng() * free.length)] : 0;
  const type = TYPES[FORCE_TYPE] ? FORCE_TYPE : ORDER[Math.floor(rng() * ORDER.length)];
  const proto = protos.get(type); if (!proto) return;
  const obj = proto.clone(true);
  const z = best.z, y = groundY(z) + HOVER + 0.3;
  obj.position.set(LANE_X[lane + 1], y, z);
  root.add(obj);
  items.push({ type, lane, x: LANE_X[lane + 1], y, z, chunk: i, obj });
  lastSpawnChunk = i;
}

function clearAll() {
  for (const it of items) root.remove(it.obj);
  items = []; decided.clear(); lastSpawnChunk = -99; prevZ = null;
  const st = ctx.state; for (const T of Object.values(TYPES)) st[T.key] = 0;
  if (shield) shield.visible = false;
}

export async function init(c) {
  ctx = c; seed = Number(c.config?.SEED) || 1; LANE_X = c.config?.LANE_X || LANE_X;
  const st = c.state;
  for (const T of Object.values(TYPES)) st[T.key] = 0;
  st.powerDur = Object.fromEntries(Object.entries(TYPES).map(([k, T]) => [k, T.dur]));
  root = new THREE.Group(); root.name = 'powerups'; c.scene.add(root);
  await Promise.all(ORDER.map(loadProto));
  // the charm's protection, shown: a thin pale shell round the runner while it lasts
  shield = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide }));
  shield.name = 'shield'; shield.visible = false; shield.renderOrder = 4; shield.scale.set(0.62, 0.95, 0.62);
  c.scene.add(shield);
  c.events.on('start', clearAll);
}

/** player.js asks this on any hit: true = the charm took it (and is now spent). */
export function absorb() {
  const st = ctx.state;
  if (!((st.shieldT || 0) > 0)) return false;
  st.shieldT = 0;
  ctx.events.emit('shieldbreak', { z: st.z });
  return true;
}
export const live = () => items;

export function update(dt = 0.016) {
  if (!ctx) return;
  const st = ctx.state;
  const pz = Number.isFinite(st.z) ? st.z : 0, px = st.x || 0, py = Number.isFinite(st.y) ? st.y : 0;
  const running = st.running && !st.over;
  if (running) for (const T of Object.values(TYPES)) if (st[T.key] > 0) st[T.key] = Math.max(0, st[T.key] - dt);

  const ci = Math.floor(pz / CHUNK_LEN);
  if (running) for (let i = ci + 1; i <= ci + 4; i++) if (!decided.has(i)) place(i);

  spin += dt * 2.4;
  if (prevZ === null || pz < prevZ - 5) prevZ = pz;
  const zLo = Math.min(prevZ, pz) - REACH, zHi = Math.max(prevZ, pz) + REACH;
  const camZ = ctx.camera ? ctx.camera.position.z : pz - 5;
  for (let k = items.length - 1; k >= 0; k--) {
    const it = items[k];
    const sp = it.obj.getObjectByName('spin'); if (sp) { sp.rotation.y = spin; sp.position.y = Math.sin(spin * 1.3 + it.z) * 0.06; }
    const ring = it.obj.getObjectByName('ring'); if (ring) ring.material.opacity = 0.4 + 0.2 * Math.sin(spin * 2.2);
    const hitIt = running && it.z >= zLo && it.z <= zHi && Math.abs(it.x - px) <= REACH && Math.abs(it.y - (py + 0.85)) <= 1.1;
    if (hitIt) {
      const T = TYPES[it.type];
      st[T.key] = T.dur;
      ctx.events.emit('powerup', { type: it.type, label: T.label, dur: T.dur });
    }
    if (hitIt || it.z < camZ + 0.9) { root.remove(it.obj); items.splice(k, 1); }
  }
  prevZ = pz;

  if (shield) {
    const on = (st.shieldT || 0) > 0 && !st.over;
    shield.visible = on;
    if (on) {
      shield.position.set(px, py + (st.rolling ? 0.5 : 0.82), pz);
      const blink = st.shieldT < 3 ? (Math.sin(st.shieldT * 14) > 0 ? 1 : 0.35) : 1;
      shield.material.opacity = 0.13 * blink;
      shield.scale.set(0.62, st.rolling ? 0.55 : 0.95, 0.62);
    }
  }
}
