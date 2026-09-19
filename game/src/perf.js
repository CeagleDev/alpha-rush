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
 *
 * State written (defaults here): state.tier, state.perf = report().
 * Budget: config.DRAW_BUDGET / TRI_BUDGET; `over` flags say which is exceeded. One console line the
 * first time either is, never per frame.
 */

let ctx = null, THREE = null;
let tier = 'high';
let fpsEma = 0, msEma = 16, lastT = 0, warned = false;
const lods = new Map();     // obj -> { min, max, axis }


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
    pixelRatio: r ? r.getPixelRatio() : 1, dpr: globalThis.devicePixelRatio || 1, w: size.x, h: size.y,
    programs: info && info.programs ? info.programs.length : 0,
    geometries: info ? info.memory.geometries : 0, textures: info ? info.memory.textures : 0,
    over,
  };
}
