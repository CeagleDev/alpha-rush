/**
 * coins.js — E1. One InstancedMesh of tau_coin; lines of 5–8 in free lanes, arcs over jump obstacles.
 *
 * exports: init(ctx), update(dt), spawnChunk(rec, rows), releaseChunk(index), nearestAhead(z), count()
 *
 * The tau_coin prototype is fetched once; its meshes are merged to ONE geometry (first material kept)
 * and recentred, so a single InstancedMesh (capacity 512, frustum culling off — the instances span
 * 200 m) draws every coin. Live coins are packed densely and `mesh.count` is the live number, because
 * an InstancedMesh submits every instance up to `count` — hidden zero-scale slots still cost their
 * triangles (512 × the coin's ~2k tris was 1M tris a frame). Coins hover 1.0 m over the running surface (groundY), spin about Y, and are
 * collected within 0.9 m laterally of the player (swept along z between frames so no coin is skipped
 * at low frame rates, 1.1 m vertical tolerance about the player's chest). Collecting emits
 * events 'coin' {lane, z}, increments state.coins and recomputes state.score = coins + distance / 10.
 * Layout is deterministic from config.SEED and the chunk index; lines sit in the gaps between obstacle
 * rows in a lane that is free in the row ahead, arcs (5 coins, +1.0 m at the top) go over jump items.
 *
 * state fields written (defaults in init): coins (0), score (0). Reads x, y, z, distance.
 */
import * as THREE from 'three';
import { mulberry32, hash32 } from './chunks.js?v=202609211323';
import { groundY, frame } from './track.js?v=202609211323';

const CAP = 512, HOVER = 1.0, SPACING = 1.5, MAGNET = 0.9, MAGNET_AHEAD = 9, MAGNET_PULL = 9;
let ctx = null, seed = 1, mesh = null, LANE_X = [-2, 0, 2];
let live = [];                              // dense: {z, x, y, lane, chunk}
let spin = 0, prevZ = null, doneFrame = -1, geoTris = 0;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
const HIDE = new THREE.Matrix4().makeScale(0, 0, 0);
const RIM_TONE = [1, 1, 1], GLYPH_TONE = [1, 1, 0.92], FIELD_TONE = [0.30, 0.19, 0.07];

async function coinGeometry() {
  let proto;
  try { proto = await ctx.assets.get('tau_coin'); } catch (e) { console.warn('[coins] get failed', e.message); proto = new THREE.Group(); }
  proto.updateMatrixWorld(true);
  const geos = []; let mat = null;
  proto.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone());
    g.applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    // THE LOGO HAS TO SHOW (owner, 2026-09-21). All the coin's parts are merged under ONE material, so
    // the raised tau and the recessed field behind it were the same gold and the glyph vanished. The
    // part's tone now rides in a vertex colour: rim, reeding and the tau stay full gold, the recessed
    // field goes to a dark bronze, which is how a struck coin actually reads (proud = polished,
    // recess = toned).
    const om = Array.isArray(o.material) ? o.material[0] : o.material;
    const tone = om && om.name === 'gold_tarnish' ? FIELD_TONE : (o.name === 'glyph' || /tau|glyph/i.test(o.name || '') ? GLYPH_TONE : RIM_TONE);
    const n = g.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = tone[0]; col[i * 3 + 1] = tone[1]; col[i * 3 + 2] = tone[2]; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geos.push(g);
    if (!mat && om && om.name === 'gold') mat = om;
  });
  let geo = null;
  if (geos.length === 1) geo = geos[0];
  else if (geos.length > 1) {
    try { const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js'); geo = mergeGeometries(geos, false); } catch { geo = geos[0]; }
  }
  if (!geo) { geo = new THREE.CylinderGeometry(0.3, 0.3, 0.07, 24); geo.rotateX(Math.PI / 2); }
  geo.computeBoundingBox();
  const c = geo.boundingBox.getCenter(new THREE.Vector3());
  geo.translate(-c.x, -c.y, -c.z);
  geo.computeBoundingSphere();
  geoTris = Math.round((geo.index ? geo.index.count : geo.attributes.position.count) / 3);
  // YELLOW, NOT ORANGE. The asset's 0xd8ae70 multiplied the Atlas gold albedo (mean 233/187/72) down
  // to a deep orange, and a 0.85-metal surface then showed only the amber street in its reflection,
  // so the coins read as copper rings. The colour is now a near-white yellow so the albedo map is
  // the gold; metalness comes down so lamps light it as well as reflect in it; and a low yellow
  // emissive floor keeps a pickup legible in an unlit stretch (it is a game token, the one object
  // allowed to carry its own light; it is far below the bloom threshold).
  const m = (mat || new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.35 })).clone();
  m.name = 'gold'; m.color.setRGB(1.0, 0.97, 0.78); m.metalness = 0.62; m.roughness = 0.3;
  m.emissive = new THREE.Color(0xffc81f); m.emissiveIntensity = 0.16; m.userData.coin = true;
  m.vertexColors = true; m.needsUpdate = true;
  return { geo, mat: m };
}

export async function init(c) {
  if (ctx === c && mesh) return;
  ctx = c;
  seed = Number(ctx.config?.SEED) || 1;
  LANE_X = ctx.config?.LANE_X || LANE_X;
  const st = ctx.state;
  if (st.coins === undefined) st.coins = 0;
  if (st.score === undefined) st.score = 0;
  const { geo, mat } = await coinGeometry();
  mesh = new THREE.InstancedMesh(geo, mat, CAP);
  mesh.name = 'coins'; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false;
  for (let i = 0; i < CAP; i++) mesh.setMatrixAt(i, HIDE);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceMatrix.needsUpdate = true;
  mesh.count = 0;
  live = []; prevZ = null;
  ctx.scene.add(mesh);
}

function add(chunk, lane, z, lift = 0) {
  if (live.length >= CAP) return;
  live.push({ z, x: LANE_X[lane + 1], y: groundY(z) + HOVER + lift, lane, chunk });
}

/** Called by track.js after obstacles.spawnChunk; `rows` are that chunk's rows (sorted by z). */
export function spawnChunk(rec, rows) {
  if (!mesh) return;
  const rng = mulberry32(hash32(`coins/${seed}/${rec.index}`));
  const sorted = rows.slice().sort((a, b) => a.z - b.z);
  // gaps between rows (and the chunk's ends)
  let from = rec.z0 + (rec.index === 0 ? 8 : 1.5);
  const bounds = sorted.map((r) => [r.z, r.z + r.len]).concat([[rec.z1 - 1, rec.z1]]);
  bounds.forEach(([rz, rz1], k) => {
    const nextRow = sorted[k] || null;
    const gap0 = from + 2.5, gap1 = rz - 2.5;
    if (gap1 - gap0 >= 6 && rng() < 0.8) {
      const n = Math.min(5 + Math.floor(rng() * 4), Math.floor((gap1 - gap0) / SPACING) + 1);
      const freeLanes = nextRow ? [-1, 0, 1].filter((l) => nextRow.lanes[l + 1] === null) : [-1, 0, 1];
      const lane = freeLanes[Math.floor(rng() * freeLanes.length)];
      const z0 = (gap0 + gap1) / 2 - ((n - 1) * SPACING) / 2;
      for (let i = 0; i < n; i++) add(rec.index, lane, z0 + i * SPACING);
    }
    from = rz1;
    // an arc over a jump item in this row
    if (nextRow && rng() < 0.6) {
      const jl = [-1, 0, 1].filter((l) => nextRow.lanes[l + 1] === 'jump');
      if (jl.length) {
        const lane = jl[Math.floor(rng() * jl.length)];
        const a0 = nextRow.z - 2.5, a1 = nextRow.z + nextRow.len + 2.5;
        for (let i = 0; i < 5; i++) { const t = i / 4; add(rec.index, lane, a0 + (a1 - a0) * t, 1.0 * (1 - (2 * t - 1) ** 2)); }
      }
    }
  });
}
export function releaseChunk(index) {
  live = live.filter((r) => r.chunk !== index);
  mesh.count = live.length;
  mesh.instanceMatrix.needsUpdate = true;
}
export const count = () => live.length;
export const liveCoins = () => live;          // read-only, for tools/clashcheck.mjs
export const geometryTris = () => geoTris;

export function nearestAhead(pz) {
  let best = null;
  for (const r of live) {
    if (r.z < pz - 0.3 || r.z - pz > 60) continue;
    if (!best || r.z < best.z) best = r;
  }
  return best ? { dist: Math.max(0, best.z - pz), lane: best.lane } : null;
}

export function update(dt = 0.016) {
  if (!mesh || !ctx) return;
  const f = frame(); if (f === doneFrame) return; doneFrame = f;
  const st = ctx.state;
  const pz = Number.isFinite(st.z) ? st.z : (st.distance || 0);
  const px = Number.isFinite(st.x) ? st.x : 0, py = Number.isFinite(st.y) ? st.y : groundY(pz);
  if (prevZ === null || pz < prevZ - 5) prevZ = pz;    // restart: no sweep across the jump back
  const zLo = Math.min(prevZ, pz) - MAGNET, zHi = Math.max(prevZ, pz) + MAGNET, chest = py + 0.9;
  spin += dt * 3;
  _e.set(0, spin, 0); _q.setFromEuler(_e);
  let got = 0;
  const magnetOn = (st.magnetT || 0) > 0 && st.running !== false;
  for (let i = 0; i < live.length; i++) {
    const r = live[i];
    if (st.running !== false && r.z >= zLo && r.z <= zHi && Math.abs(r.x - px) <= MAGNET && Math.abs(r.y - chest) <= 0.6) {   // was 1.15: arc-apex coins were collected from the ground, so jump arcs were decoration
      live[i] = live[live.length - 1]; live.pop(); i--; got++;
      if (ctx.events?.emit) ctx.events.emit('coin', { lane: r.lane, z: r.z });
      continue;
    }
    // MAGNET (powerups.js): coins within reach leave their lane and fly to the runner's chest.
    if (magnetOn && r.z > pz - 1.5 && r.z < pz + MAGNET_AHEAD) {
      const k = 1 - Math.exp(-MAGNET_PULL * dt);
      r.x += (px - r.x) * k; r.y += (chest - r.y) * k; r.z += (pz + 0.3 - r.z) * k * 0.9;
      r.pulled = true;
    }
    _p.set(r.x, r.y + (r.pulled ? 0 : Math.sin(spin * 0.7 + r.z) * 0.04), r.z);
    mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
  }
  mesh.count = live.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (got) st.coins = (st.coins || 0) + got;
  // score lives in progress.js now (metres x multiplier + coins x 10 x multiplier)
  // a missed coin flies past the runner and, 0.4 s later, through the camera lens (it filled the
  // frame in the critic's strips). Drop it once it is a metre in front of the lens (camera ~4.9 m back).
  // keyed to the CAMERA, not the runner: after a hit the camera closes in on him (fov/distance
  // follow speed), and a runner-relative margin let a missed coin fill the lens on the death sheet.
  const camZ = ctx.camera ? ctx.camera.position.z : pz - 4.9;
  if (live.length) { const cut = camZ + 0.9; let w = 0; for (let i = 0; i < live.length; i++) if (live[i].z >= cut) live[w++] = live[i]; live.length = w; }
  prevZ = pz;
}
