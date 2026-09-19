/**
 * textures.js — E4. Atlas texture files by material name, with surfaces.js standing in until
 * the files exist.
 *
 *   init(ctx)        starts loading textures/*.webp in the background. Never awaited by READY.
 *   apply(group)     after surfaces ran: swaps maps on materials by NAME (see SETS). Materials
 *                    are mutated in place and shared, never cloned per mesh, so assetlib's
 *                    merge-by-value keeps merging (docs/surfaces.md, "UV scaling vs repeat").
 *   load(file)       -> Promise<Texture|null> for any file under textures/ (lighting uses it
 *                    for sky.webp). Cached. Resolves null on a 404, never rejects.
 *   status()         { asphalt: 'file'|'procedural'|'loading', ... }
 *
 * FILES THE LEAD GENERATES ON ATLAS (1K WebP, one set per surface, ≤ 2.5 MB all told):
 *   textures/<set>_albedo.webp   textures/<set>_roughness.webp   textures/<set>_normal.webp
 * for set in asphalt | tin | plank | deck. Any file may be missing; a missing albedo leaves the
 * set procedural, a missing roughness or normal keeps that one map procedural. Each tile must be
 * authored to cover SETS[set].tile metres per repeat, because surfaces.js has already scaled the
 * UVs to that density and `texture.repeat` stays (1, 1) on purpose: a repeat per size would be a
 * material per size and the draw calls go up several times over.
 *
 * Material name -> set: ground -> asphalt, metal -> tin, timber -> plank, stone -> deck. The
 * other contract names (plaster, tile, fabric, foliage) stay on surfaces.js's own recipes.
 *
 * How the swap stays merge-safe: the same Texture OBJECTS are assigned to every material of a
 * set, so materialKey() (which hashes texture uuid + repeat) agrees across instances exactly as
 * it did with the shared procedural maps. A material that arrives without maps (surfaces off)
 * gets the procedural set from surfaces.js so the look holds either way.
 */
import { surface, RECIPES } from '../surfaces.js';

export const SETS = {
  asphalt: { material: 'ground', recipe: 'ground', tile: RECIPES.ground.tile },
  tin:     { material: 'metal',  recipe: 'metal',  tile: RECIPES.metal.tile },
  plank:   { material: 'timber', recipe: 'timber', tile: RECIPES.timber.tile },
  deck:    { material: 'stone',  recipe: 'stone',  tile: RECIPES.stone.tile },
};
const BY_MATERIAL = Object.fromEntries(Object.entries(SETS).map(([set, s]) => [s.material, set]));
const MAPS = [['map', 'albedo', true], ['roughnessMap', 'roughness', false], ['normalMap', 'normal', false]];

let ctx = null, THREE = null;
let base = './textures/';
const files = new Map();       // file -> Promise<Texture|null>
const loaded = {};             // set -> { map?, roughnessMap?, normalMap? } (only files that arrived)
const pending = {};            // set -> Promise
const registry = {};           // set -> Set<Material>
let maxAniso = 8;

export function init(c) {
  ctx = c; THREE = c.THREE;
  try { maxAniso = Math.min(8, c.renderer.capabilities.getMaxAnisotropy()); } catch (e) { /* headless */ }
  try { base = new URL('./textures/', globalThis.document ? document.baseURI : location.href).href; } catch (e) { /* keep relative */ }
  for (const set of Object.keys(SETS)) registry[set] = registry[set] || new Set();
  // Kick every set off now; nobody waits on these. A set that lands re-applies itself to every
  // material registered so far, and to every one registered later.
  for (const set of Object.keys(SETS)) loadSet(set);
  ctx.state = ctx.state || {};
  ctx.state.textures = status();
}

/** Load one file under textures/. Cached, never rejects. */
export function load(file, opts = {}) {
  if (files.has(file)) return files.get(file);
  const p = (async () => {
    if (!THREE) return null;
    try {
      const t = await new THREE.TextureLoader().loadAsync(base + file);
      t.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = maxAniso;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.flipY = opts.flipY !== undefined ? opts.flipY : true;
      t.needsUpdate = true;
      return t;
    } catch (e) {
      return null;     // missing is normal until Atlas has run; the procedural stand-in stays
    }
  })();
  files.set(file, p);
  return p;
}

function loadSet(set) {
  if (pending[set]) return pending[set];
  pending[set] = (async () => {
    const got = {};
    await Promise.all(MAPS.map(async ([slot, suffix, srgb]) => {
      const t = await load(`${set}_${suffix}.webp`, { srgb });
      if (t) got[slot] = t;
    }));
    if (Object.keys(got).length) {
      loaded[set] = got;
      for (const m of registry[set]) assign(m, set);
      console.info(`[textures] ${set}: ${Object.keys(got).join(', ')} from file`);
    }
    settled.add(set);
    if (ctx && ctx.state) ctx.state.textures = status();
    return got;
  })();
  return pending[set];
}
const settled = new Set();

/** Put the best available maps on one material: file where it arrived, procedural otherwise. */
function assign(m, set) {
  const s = SETS[set];
  const file = loaded[set] || {};
  let proc = null;
  const need = (slot) => file[slot] || (proc || (proc = surface(THREE, s.recipe)))[slot];
  let changed = false;
  for (const [slot] of MAPS) {
    const t = need(slot);
    if (t && m[slot] !== t) { m[slot] = t; changed = true; }
  }
  if (changed) {
    if (!m.normalScale) m.normalScale = new THREE.Vector2(0.85, 0.85);
    m.needsUpdate = true;
  }
  return changed;
}

/**
 * apply(group): every single-material mesh whose material is named after a set gets that set's
 * maps. Runs after surfaces so the UVs are already at the right density; safe to run twice.
 * Returns { applied, sets }.
 */
export function apply(group) {
  if (!THREE || !group) return { applied: 0, sets: [] };
  const seen = new Set();
  const setsHit = new Set();
  let applied = 0;
  group.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material;
    if (seen.has(m)) return;
    seen.add(m);
    const set = m.name && BY_MATERIAL[m.name];
    if (!set || !m.isMeshStandardMaterial) return;
    registry[set].add(m);
    if (assign(m, set)) applied++;
    setsHit.add(set);
  });
  return { applied, sets: [...setsHit] };
}

export function status() {
  const out = {};
  for (const set of Object.keys(SETS)) {
    out[set] = loaded[set] ? (loaded[set].map ? 'file' : 'file-partial') : (files.has(`${set}_albedo.webp`) ? 'loading' : 'procedural');
  }
  return out;
}

/** Everything settled (for a test harness; the game never awaits this). */
export function ready() { return Promise.all(Object.keys(SETS).map(loadSet)); }
