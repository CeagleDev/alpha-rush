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
 * FILES FROM ATLAS (1K WebP, one set per surface):
 *   textures/<set>_albedo.webp   textures/<set>_rough.webp   textures/<set>_normal.webp
 * for set in asphalt | tin | plank | deck | gold, plus sign_01..08.webp (768x512 lightbox faces),
 * noren_01..02.webp (512^2 stroke sprites) and sky_dusk.webp (2048x864, used by lighting.js). Any file may be missing; a missing albedo leaves the
 * set procedural, a missing roughness or normal keeps that one map procedural. Each tile must be
 * authored to cover SETS[set].tile metres per repeat, because surfaces.js has already scaled the
 * UVs to that density and `texture.repeat` stays (1, 1) on purpose: a repeat per size would be a
 * material per size and the draw calls go up several times over.
 *
 * Material name -> set: ground -> asphalt, metal -> tin, timber -> plank, stone -> deck,
 * gold | gold_tarnish -> gold. The other contract names (plaster, tile, fabric, foliage) stay on
 * surfaces.js's own recipes.
 *
 *   signFace(i)   -> ONE shared emissive material per sprite (i = 1..8, wraps): near-black base,
 *                    emissiveMap = the sprite, emissiveIntensity 2. E1 swaps it onto the face
 *                    mesh of a placed lightbox. Shared, so faces with the same i still merge.
 *   noren(i)      -> one shared 'fabric' material per noren sprite (i = 1..2), double sided.
 *
 * init() waits for the sets up to INIT_WAIT_MS so the materials an asset is built with already
 * carry the files when E1 re-shares materials by value and bakes; anything slower than that
 * still lands later through the registry, on the material objects apply() has seen. READY is
 * never held past that cap.
 *
 * How the swap stays merge-safe: the same Texture OBJECTS are assigned to every material of a
 * set, so materialKey() (which hashes texture uuid + repeat) agrees across instances exactly as
 * it did with the shared procedural maps. A material that arrives without maps (surfaces off)
 * gets the procedural set from surfaces.js so the look holds either way.
 */
import { surface, RECIPES } from '../surfaces.js';

export const SETS = {
  asphalt: { materials: ['ground'], recipe: 'ground', tile: RECIPES.ground.tile },
  tin:     { materials: ['metal'],  recipe: 'metal',  tile: RECIPES.metal.tile },
  plank:   { materials: ['timber'], recipe: 'timber', tile: RECIPES.timber.tile },
  deck:    { materials: ['stone'],  recipe: 'stone',  tile: RECIPES.stone.tile },
  // The coin. 'gold' is not a contract recipe, so surfaces.js classifies it by metalness as
  // 'metal' (and scales its UVs at the metal density, 0.55 m); the gold set replaces every map and
  // the material keeps its own metalness 0.85. It reflects scene.environment (lighting.js builds
  // one with the amber street in it) because its envMap stays null and envMapIntensity stays 1.
  gold:    { materials: ['gold', 'gold_tarnish'], recipe: 'metal', tile: RECIPES.metal.tile },
};
const BY_MATERIAL = {};
for (const [set, s] of Object.entries(SETS)) for (const m of s.materials) BY_MATERIAL[m] = set;
const MAPS = [['map', 'albedo', true], ['roughnessMap', 'rough', false], ['normalMap', 'normal', false]];
/** Lightbox sprites and noren stroke sprites the lead generated on Atlas. */
export const SIGN_COUNT = 8, NOREN_COUNT = 2;
const signMats = new Map(), norenMats = new Map();

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
  const all = Promise.all(Object.keys(SETS).map(loadSet));
  ctx.state = ctx.state || {};
  ctx.state.textures = status();
  await Promise.race([all, new Promise((r) => setTimeout(r, INIT_WAIT_MS))]);
  ctx.state.textures = status();
}
const INIT_WAIT_MS = 6000;

/** Shared emissive lightbox-face material for sprite i (1-based, wraps around SIGN_COUNT). */
export function signFace(i = 1) {
  const k = ((Math.round(i) - 1) % SIGN_COUNT + SIGN_COUNT) % SIGN_COUNT + 1;
  if (signMats.has(k)) return signMats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xffffff, emissiveIntensity: 2.0, roughness: 0.35, metalness: 0 });
  m.name = '';                       // unnamed on purpose: surfaces.js must leave emissive faces alone
  m.userData.sign = k;
  signMats.set(k, m);
  load(`sign_${String(k).padStart(2, '0')}.webp`).then((t) => {
    if (!t) return;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    m.emissiveMap = t; m.map = t; m.needsUpdate = true;
  });
  return m;
}

/** Shared noren banner material for sprite i (1-based, wraps around NOREN_COUNT). */
export function noren(i = 1) {
  const k = ((Math.round(i) - 1) % NOREN_COUNT + NOREN_COUNT) % NOREN_COUNT + 1;
  if (norenMats.has(k)) return norenMats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
  m.name = '';
  m.userData.noren = k;
  norenMats.set(k, m);
  load(`noren_${String(k).padStart(2, '0')}.webp`).then((t) => {
    if (!t) return;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    m.map = t; m.needsUpdate = true;
  });
  return m;
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
    } else console.info(`[textures] ${set}: no files, procedural stand-in`);
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
    out[set] = loaded[set] ? (loaded[set].map ? 'file' : 'file-partial') : (settled.has(set) ? 'procedural' : 'loading');
  }
  return out;
}

/** Everything settled (for a test harness; the game never awaits this). */
export function ready() { return Promise.all(Object.keys(SETS).map(loadSet)); }
