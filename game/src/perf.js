/**
 * perf.js — E4. Tier switch, pixel ratio cap, far-band LOD hooks, and the numbers for the HUD.
 *
 *   detectTier(config?)  -> 'phone' | 'high'. Pure; usable before the rig exists. ?q=phone|high wins,
 *                           then width < config.PHONE_MAX_W (700), then a dense small touch screen.
 *   init(ctx)            applies the tier: pixel ratio = min(devicePixelRatio, rig tier ratio, 2)
 *                           (?dpr=x overrides), shadow maps off (the key is below the horizon at
 *                           19.4, so a shadow pass is a second draw of every chunk for nothing; the
 *                           phone tier never gets a second pass), composer already off on phone by
 *                           the rig's own tier. Writes state.tier and state.perf.
 *   update(dt)           fps EMA from real time; LOD visibility by distance from the camera.
 *   lod.add(obj, {min, max, axis})  show obj only while its distance from the camera is inside
 *                           [min, max] (metres; axis 'z' = along the run, default; 'xz' = planar).
 *                           lod.remove(obj). The far band registers itself here if it wants to.
 *   report()             { tier, draws, tris, fps, ms, pixelRatio, dpr, w, h, programs, geometries,
 *                           textures, over: { draws, tris } } from renderer.info after rig.render.
 *   coarseBake(root, o)  -> { group, tris, dropped }: the SECOND, coarser bake (traps.md "when one
 *                           view holds the whole level"). Every mesh whose largest world dimension
 *                           is under `minSize` (default 0.25 m) is dropped and the rest is baked
 *                           with bakeStatic. Call it on the UNBAKED tree, next to the full bake.
 *   FAR                  the measured distances below, and what they cost.
 *
 * FAR BAND / CHUNK LOD, and why the numbers are measured rather than carried over. traps.md quotes
 * 90 m for the coarse swap and then says a night build with real fog paid at 16 / 30 / 66 instead,
 * because fog is what decides it. Ours is `lighting.PARAMS.fogDensity` from a start of 12 m, so
 * this module MEASURES its own: work/e4/shoot.mjs --lod hides chunks past a distance, re-renders,
 * and reports the mean absolute pixel difference against the full frame. FAR.full / FAR.cull are
 * set from that run (see the table in the E4 report), and `?far=<m>` overrides for an A/B.
 *
 * Chunk LOD is applied WITHOUT touching track.js or chunks.js: update() finds groups named
 * `chunk_*` under the scene and sets `.visible` by distance, re-evaluated every frame, so a
 * recycled chunk corrects itself the same frame it is respawned. If a chunk carries a coarse bake
 * as `userData.coarse` (E1 can add it with coarseBake above), the swap uses it instead of hiding.
 *
 * State written (defaults here): state.tier, state.perf = report(). `state.perf.shadows` is there
 * so the gate can assert the shadow pass never comes back.
 * Budget: config.DRAW_BUDGET / TRI_BUDGET; `over` flags say which is exceeded. One console line the
 * first time either is, never per frame.
 */

import { bakeStatic } from '../assetlib.js?v=202609211528';

let ctx = null, THREE = null;
let tier = 'high';
let fpsEma = 0, msEma = 16, lastT = 0, warned = false, shadowWarned = false;
const lods = new Map();     // obj -> { min, max, axis }
let chunkRoots = [], chunkFrame = -999, frames = 0;

/** Measured against our own fog; see the header. Metres from the camera, along z. */
/**
 * MEASURED in work/e4 at 390x844 against our own fog (start 12 m, density 0.008), by hiding or
 * coarsening chunks and diffing every pixel against the full frame:
 *
 *   swap to coarse at 40 m   mean diff 0.000 luma, 0.000 % of pixels moved by more than 8
 *   cull past       90 m     mean diff 0.055 luma, 0.148 %   (758 -> 616 draws, 631k -> 503k tris)
 *   cull past       55 m     mean diff 0.289 luma, 0.597 %   (474 draws) — the alley's vanishing
 *                            point starts losing lit signs here, so it is not the default
 *
 * `full` is how far BEHIND the camera a chunk is kept (the chase camera sits 6.5 m back).
 */
export const FAR = { full: 40, coarse: 40, cull: 90, minSize: 0.25 };
try {
  const q = new URLSearchParams(location.search);
  if (q.has('far')) { const v = Number(q.get('far')); if (Number.isFinite(v)) { FAR.coarse = v; FAR.cull = v * 1.25; } }
  if (q.get('lod') === '0') { FAR.coarse = Infinity; FAR.cull = Infinity; }
} catch (e) { /* no location */ }


export function detectTier(config) {
  const PHONE_MAX_W = (config && config.PHONE_MAX_W) || 700;
  try {
    const q = new URLSearchParams(location.search).get('q');
    if (q === 'phone' || q === 'high') return q;
  } catch (e) { /* no location */ }
  const w = globalThis.innerWidth || 1280, h = globalThis.innerHeight || 720;
  const dpr = globalThis.devicePixelRatio || 1;
  const touch = typeof navigator !== 'undefined' && ((navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in globalThis);
  if (w < PHONE_MAX_W) return 'phone';
  if (Math.min(w, h) <= 500) return 'phone';
  if (touch && dpr >= 2 && Math.min(w, h) <= 900) return 'phone';
  return 'high';
}

export function init(c) {
  ctx = c; THREE = c.THREE;
  const cfg = c.config || {};
  tier = (c.rig && c.rig.tier && c.rig.tier.name) || (cfg.phone ? 'phone' : detectTier(cfg));
  const dpr = globalThis.devicePixelRatio || 1;
  let q = null;
  try { q = new URLSearchParams(location.search); } catch (e) { /* none */ }
  const tierRatio = (c.rig && c.rig.tier && c.rig.tier.pixelRatio) || (tier === 'phone' ? 1.0 : 1.5);
  const forced = q && Number(q.get('dpr'));
  const ratio = forced && Number.isFinite(forced) && forced > 0 ? Math.min(forced, 2) : Math.min(dpr, tierRatio, 2);
  try { c.renderer.setPixelRatio(ratio); } catch (e) { /* headless */ }
  // Hour 19.4 puts the key below the horizon, so every shadow pass is a second full draw of the
  // scene for a map nothing samples. E1 measured chunk draws doubling; off, and kept off by the
  // guard in update().
  c.renderer.shadowMap.enabled = false;
  c.renderer.shadowMap.autoUpdate = false;
  c.state = c.state || {};
  c.state.tier = tier;
  c.state.perf = report();
  lastT = performance.now();
  console.info(`[perf] tier ${tier}, pixel ratio ${ratio.toFixed(2)} (dpr ${dpr}), shadow maps off`);
}

export const lod = {
  add(obj, opts = {}) { if (obj) lods.set(obj, { min: opts.min ?? 0, max: opts.max ?? Infinity, axis: opts.axis || 'z' }); },
  remove(obj) { lods.delete(obj); },
  size() { return lods.size; },
};

export function update(dt) {
  if (!ctx) return;
  // Nothing may switch shadows back on: a module that sets castShadow is free to, but the map
  // itself stays off. One line, once, so a re-enable is attributable instead of just expensive.
  if (ctx.renderer.shadowMap.enabled) {
    ctx.renderer.shadowMap.enabled = false;
    if (!shadowWarned) { shadowWarned = true; console.warn('[perf] something re-enabled shadowMap; forced off (the key is below the horizon at 19.4)'); }
  }
  chunkLOD();
  const now = performance.now();
  const raw = Math.max(0.0001, (now - lastT) / 1000); lastT = now;
  const inst = 1 / raw;
  fpsEma = fpsEma ? fpsEma + (inst - fpsEma) * 0.12 : inst;
  msEma = msEma + (raw * 1000 - msEma) * 0.12;
  if (lods.size) {
    const cam = ctx.camera.position;
    for (const [obj, o] of lods) {
      if (!obj.parent) { lods.delete(obj); continue; }
      const p = obj.position;
      const d = o.axis === 'xz' ? Math.hypot(p.x - cam.x, p.z - cam.z) : Math.abs(p.z - cam.z);
      obj.visible = d >= o.min && d <= o.max;
    }
  }
  if (ctx.state) ctx.state.perf = report();
}

/**
 * Hide or coarsen live chunks by distance. Groups are found by name so this needs no change in
 * track.js; `userData.coarse` (a coarseBake of the same chunk) is used when the owner provides one.
 */
function chunkLOD() {
  if (FAR.cull === Infinity && FAR.coarse === Infinity) return;
  if (++frames - chunkFrame > 30) {             // rediscover twice a second, not per frame
    chunkFrame = frames;
    chunkRoots = [];
    ctx.scene.traverse((o) => { if (o.name && o.name.startsWith('chunk_')) chunkRoots.push(o); });
  }
  const cz = ctx.camera.position.z;
  for (const g of chunkRoots) {
    if (!g.parent) continue;
    const d = g.position.z - cz;                // chunks are placed along +z ahead of the runner
    const far = d > FAR.cull || d < -FAR.full;  // past the fog ahead, or well behind
    g.visible = !far;
    const co = g.userData && g.userData.coarse;
    if (co && co.parent === g) {
      const useCoarse = d > FAR.coarse;
      co.visible = useCoarse && !far;
      for (const ch of g.children) if (ch !== co) ch.visible = !useCoarse && !far;
    }
  }
}

/**
 * The second, coarser bake. Run it on the UNBAKED chunk tree, beside the full bake:
 *
 *   const coarse = perf.coarseBake(B.root).group;   // before bakeStatic(B.root)
 *   coarse.visible = false; chunk.add(coarse); chunk.userData.coarse = coarse;
 *
 * Everything whose largest world dimension is under minSize goes: handles, slats, cups, bolts,
 * lantern hoops. At the distance it swaps in, none of them is more than a pixel.
 */
export function coarseBake(root, opts = {}) {
  const minSize = opts.minSize ?? FAR.minSize;
  const tmp = new THREE.Group();
  const box = new THREE.Box3(), size = new THREE.Vector3();
  let dropped = 0, kept = 0;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    box.setFromObject(o); box.getSize(size);
    if (Math.max(size.x, size.y, size.z) < minSize) { dropped++; return; }
    const c = o.clone();                        // shares geometry and material
    c.matrixAutoUpdate = false;
    c.matrix.copy(o.matrixWorld);
    c.matrix.decompose(c.position, c.quaternion, c.scale);
    c.matrixAutoUpdate = true;
    tmp.add(c);
    kept++;
  });
  let group;
  try { group = bakeStatic(tmp); }
  catch (e) { console.warn('[perf] coarseBake failed', e && e.message); group = tmp; }
  group.name = 'coarse';
  let tris = 0;
  group.traverse((o) => { if (o.isMesh && o.geometry) { const p = o.geometry.attributes.position; tris += (o.geometry.index ? o.geometry.index.count : p.count) / 3; } });
  return { group, tris, dropped, kept };
}

export function report() {
  const r = ctx && ctx.renderer;
  const info = r ? r.info : null;
  const cfg = (ctx && ctx.config) || {};
  const draws = info ? info.render.calls : 0, tris = info ? info.render.triangles : 0;
  const over = { draws: cfg.DRAW_BUDGET ? draws > cfg.DRAW_BUDGET : false, tris: cfg.TRI_BUDGET ? tris > cfg.TRI_BUDGET : false };
  if (!warned && (over.draws || over.tris)) { warned = true; console.warn(`[perf] over budget: ${draws} draws / ${tris} tris`); }
  const size = r ? r.getSize(new THREE.Vector2()) : { x: 0, y: 0 };
  return {
    tier, draws, tris, fps: Math.round(fpsEma), ms: +msEma.toFixed(1),
    chunks: chunkRoots.length, chunksVisible: chunkRoots.reduce((n, g) => n + (g.visible ? 1 : 0), 0),
    pixelRatio: r ? r.getPixelRatio() : 1, dpr: globalThis.devicePixelRatio || 1, w: size.x, h: size.y,
    shadows: !!(r && r.shadowMap.enabled),
    programs: info && info.programs ? info.programs.length : 0,
    geometries: info ? info.memory.geometries : 0, textures: info ? info.memory.textures : 0,
    over,
  };
}
