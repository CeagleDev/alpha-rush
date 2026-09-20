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
 * GROUND TEXEL DENSITY (planar()). surfaces.js takes the repeat from each mesh's own bounding box,
 * and on a road slab that is wrong in a way nothing reports. The carriageway is a BoxGeometry
 * 6 x 0.02 x 30, so applySurfaces computes uRep = 30 / 2.6 = 11.5 and vRep = 1 — and on a
 * BoxGeometry the +Y face takes u across X and v along Z. Measured on the live scene before this
 * change: 0.52 m per tile ACROSS the road and 30 m per tile ALONG it, a 58:1 stretch. One texel
 * row of asphalt is smeared over a whole 30 m chunk in exactly the direction the camera looks,
 * which is why the road had no grain at all and read as a painted gradient.
 *
 * planar() re-projects every UP-FACING vertex (normal.y > 0.85) of a 'ground' or 'stone' mesh onto
 * the XZ plane at PLANAR_TILE metres per tile, in the asset root's own space. Per-vertex on the
 * normal rather than per-mesh on the bounding box, because by the time apply() runs the loader has
 * already merged the slab, the tarmac patches, the dashes and the kerbs into one geometry per
 * material — a per-mesh test cannot tell a road from a wall inside that, a per-vertex one can, and
 * it leaves every vertical face on surfaces.js's own scaling.
 *
 * It goes into the UV ATTRIBUTE and never into texture.repeat, for the reason surfaces.js states at
 * length: a repeat per mesh is a material per mesh and the bake stops merging. The same shared
 * Texture objects stay on the same shared materials, so materialKey() is unchanged and the draw
 * count does not move. PLANAR_TILE.ground divides 30 m (the chunk length) a whole number of times,
 * so the asphalt is continuous across a chunk seam instead of jumping mid-street.
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
/**
 * Metres per texture tile for an up-facing slab, by material name. 2.5 m is close to the density
 * the Atlas asphalt was authored at (RECIPES.ground.tile 2.6) and divides the 30 m chunk exactly
 * 12 times, so the road tiles seamlessly from one chunk to the next.
 */
export const PLANAR_TILE = { ground: 2.5, stone: 1.5 };
/** Up-facing enough to be a road, a verge or a deck rather than a wall. cos(31 deg) — a ramp is 11 deg. */
const PLANAR_NY = 0.85;
/** The ground normal map only does its job once the UVs are right; at 0.85 the wet road stayed
 *  glassy, at 1.25 the grazing specular broke into aliasing glitter. */
const GROUND_NORMAL_SCALE = 1.10;
/** Lightbox sprites and noren stroke sprites the lead generated on Atlas. */
export const SIGN_COUNT = 8, NOREN_COUNT = 2;
const signMats = new Map(), norenMats = new Map();

let ctx = null, THREE = null;
let base = '../textures/';   // resolved against this module, so a fixture page elsewhere still finds game/textures/
const files = new Map();       // file -> Promise<Texture|null>
const loaded = {};             // set -> { map?, roughnessMap?, normalMap? } (only files that arrived)
const pending = {};            // set -> Promise
const registry = {};           // set -> Set<Material>
let maxAniso = 8;

export async function init(c) {
  ctx = c; THREE = c.THREE;
  try { maxAniso = Math.min(8, c.renderer.capabilities.getMaxAnisotropy()); } catch (e) { /* headless */ }
  try { base = new URL('../textures/', import.meta.url).href; } catch (e) { /* keep relative */ }
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
  // emissiveIntensity was 2.0 with a WHITE emissive, which clips the face to pure white after the
  // tone curve and washes the sprite's brush strokes out completely — the sign reads as a blank
  // glowing panel, which is exactly what the Atlas sprites were generated to stop. The emissiveMap
  // multiplies this colour, so the map can only show its own tone below the clip point. Measured on
  // the critic's frames, the lightbox faces and the awning soffits they lit were 5.8-6.8 % of
  // pixels over luma 235 against the reference's 1.5 % maximum.
  const m = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xffffff, emissiveIntensity: 0.95, roughness: 0.35, metalness: 0 });
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
 * Re-project the up-facing faces of one asset's ground/stone slabs to a real texel density.
 * See the header note. Idempotent: a geometry carries the tile it was projected at.
 *
 * Geometry is cloned before its UVs are touched, for the reason surfaces.js gives — a generated
 * asset can reuse one geometry on parts of different sizes and mutating in place corrupts the
 * others. InstancedMesh is skipped outright (the litter): its copies live in the instance matrices,
 * so a single projection of the prototype would be wrong for every copy but one.
 */
function planar(root) {
  if (!THREE || !root) return 0;
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const m = new THREE.Matrix4(), nm = new THREE.Matrix3(), v = new THREE.Vector3(), n = new THREE.Vector3();
  let moved = 0;
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.material || Array.isArray(o.material)) return;
    const tile = PLANAR_TILE[o.material.name];
    if (!tile) return;
    const geo0 = o.geometry;
    const pos = geo0 && geo0.attributes.position, nrm = geo0 && geo0.attributes.normal, uv0 = geo0 && geo0.attributes.uv;
    if (!pos || !nrm || !uv0) return;
    if (geo0.userData && geo0.userData.planarTile === tile) return;      // already done
    const geo = geo0.clone();
    const uv = geo.attributes.uv;
    m.copy(inv).multiply(o.matrixWorld);          // mesh local -> asset-root space
    nm.getNormalMatrix(m);
    let touched = 0;
    for (let i = 0; i < pos.count; i++) {
      n.fromBufferAttribute(nrm, i).applyMatrix3(nm).normalize();
      if (n.y < PLANAR_NY) continue;              // a wall, a kerb face, a bin side: leave it alone
      v.fromBufferAttribute(pos, i).applyMatrix4(m);
      uv.setXY(i, v.x / tile, v.z / tile);
      touched++;
    }
    if (!touched) return;
    uv.needsUpdate = true;
    geo.userData = { ...(geo.userData || {}), planarTile: tile };
    o.geometry = geo;
    moved += touched;
  });
  return moved;
}

/**
 * apply(group): every single-material mesh whose material is named after a set gets that set's
 * maps. Runs after surfaces so the UVs are already at the right density; safe to run twice.
 * Returns { applied, sets }.
 */
export function apply(group) {
  if (!THREE || !group) return { applied: 0, sets: [] };
  // BEFORE the maps go on: surfaces.js has already scaled these UVs from the bounding box, which is
  // wrong for a slab. Re-project the horizontal faces at a real density (see the header).
  const planarVerts = planar(group);
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
    if (set === 'asphalt' && m.normalScale) m.normalScale.set(GROUND_NORMAL_SCALE, GROUND_NORMAL_SCALE);
    setsHit.add(set);
  });
  return { applied, sets: [...setsHit], planarVerts };
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
