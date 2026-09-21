/**
 * assets.js — E4. Every asset in the game comes through here.
 *
 *   init(ctx)
 *   get(name, opts)   -> Promise<Object3D>: `./assets/${name}.js` through ASSET() from assetlib.js
 *                        with { surfaces: true, ...opts }, built against the chamfer proxy so boxes
 *                        with a side >= 25 cm come out rounded, then textures.apply() by material
 *                        name. Prototypes are cached by assetlib; each call is a fresh clone.
 *   lights(group)     -> the asset's userData.lights transformed by group.matrixWorld. For a
 *                        placed instance whose chunk root is not yet in the scene, that IS chunk
 *                        space, which is what chunks.js reads. Loader recentring is already folded
 *                        in (see below). Pass a second Object3D to get them in ITS local space.
 *   has(name)         -> Promise<boolean>: does ./assets/<name>.js exist (HEAD, cached).
 *   preload(names)    -> Promise: warm the cache.
 *
 * HOW THE CHAMFER GETS IN. assetlib's ASSET() calls the asset's default export with its own THREE,
 * and assetlib is never edited, so the wrapped THREE cannot be passed through it. Instead get()
 * hands ASSET() a blob: module that imports the real asset and re-exports
 *   (THREE) => real(wrapTHREE(THREE))
 * so every rule in assetlib (instance expansion, merge by value, height scaling, surfaces per
 * instance) still runs on the result. The wrapper also reports the built group's userData.lights
 * and bounding box back here (`_meta`) before the merge can drop them, which is how lights() works
 * WITHOUT a second keepHierarchy load: docs/traps.md "The loader drops userData, and re-origins".
 * The loader moves the built group by (-centre.x, -min.y, -centre.z); a light authored in asset
 * space gets the same offset and is then in the instance's local space, pre-scale.
 *
 * PLACEHOLDERS. When ./assets/<name>.js is missing, get() returns a named Box sized from SIZES
 * (STYLE.md / ASSETS.md), `userData.placeholder = true`, one console line per name, so E1/E2 build
 * and test before the assets land. Emitting placeholders carry userData.lights so lighting.js can
 * be tested on them. Integrator: `grep placeholder` must come back empty before a round ships.
 *
 * Returned instances carry userData: assetName, lights (local space), placeholder (bool),
 * nativeSize (from assetlib). Nothing else on ctx/state is written by this module.
 */
import { ASSET } from '../assetlib.js?v=202609211517';
import { applySurfaces } from '../surfaces.js?v=202609211517';
import { wrapTHREE, CHAMFER } from './chamfer.js?v=202609211517';
import * as textures from './textures.js?v=202609211517';

/**
 * Placeholder sizes [w, h, d] in metres, plus (optional) y0 = height of the base above the ground
 * for things that hang, mat = surface recipe name, emit = light entries in asset space. `emit`
 * intensities are on the assets' own relative scale (0.3 to 1.6; lighting.js multiplies it into
 * candela), so a placeholder and the asset that replaces it light the street the same amount.
 */
const WARM = 0xe5b055, CREAM = 0xd8ae70, COOL = 0x9accf2, SODIUM = 0xe5b055;
const box = (w, h, d, extra = {}) => ({ w, h, d, ...extra });
const SIZES = {
  runner:        box(0.6, 1.72, 0.5, { mat: 'fabric', color: 0xe8852a }),
  dog_shiba:     box(0.3, 0.55, 0.8, { mat: 'fabric', color: 0xc98a45 }),
  dog_spitz:     box(0.3, 0.50, 0.75, { mat: 'fabric', color: 0xe6ddd0 }),
  dog_mutt:      box(0.32, 0.60, 0.85, { mat: 'fabric', color: 0x3a2a22 }),
  tau_coin:      box(0.6, 0.6, 0.07, { mat: 'metal', color: 0xd8ae70, metalness: 0.85, roughness: 0.35, y0: 0.7 }),
  crate_stack:   box(0.5, 0.9, 0.35, { mat: 'timber', color: 0xf8e845 }),
  cooler_bin:    box(0.6, 0.9, 0.6, { mat: 'metal', color: 0x4a4a4c }),
  fallen_bicycle: box(1.7, 0.5, 0.6, { mat: 'metal', color: 0x37201b }),
  roadworks_barrier: box(1.5, 0.8, 0.4, { mat: 'metal', color: 0xf8e845 }),
  banner_cluster_low: box(2.0, 1.9, 0.3, { mat: 'fabric', color: 0xb8302a, y0: 1.3 }),
  awning_strut_low: box(2.2, 0.1, 0.1, { mat: 'metal', color: 0x4a4a4c, y0: 1.3 }),
  gantry_board_low: box(6.0, 0.6, 0.2, { mat: 'metal', color: 0x2f5a2a, y0: 1.3 }),
  kei_van:       box(1.5, 1.9, 3.4, { mat: 'metal', color: 0xeee2c8, emit: [{ x: 0.55, y: 0.8, z: -1.7, color: 0xb8302a, intensity: 0.4, range: 2.5 }, { x: -0.55, y: 0.8, z: -1.7, color: 0xb8302a, intensity: 0.4, range: 2.5 }] }),
  yatai_cart:    box(1.2, 2.1, 2.4, { mat: 'timber', color: 0x4f2d21, emit: [{ x: 0, y: 1.9, z: 0, color: CREAM, intensity: 0.9, range: 4 }] }),
  vending_machine: box(1.0, 1.83, 0.8, { mat: 'metal', color: 0xeee2c8, emit: [{ x: 0, y: 1.1, z: 0.42, color: COOL, intensity: 1.0, range: 4.5 }], face: { w: 0.7, h: 1.2, color: COOL, i: 2.2 } }),
  concrete_divider: box(0.6, 0.8, 2.0, { mat: 'stone', color: 0x8a8378 }),
  parked_sedan:  box(1.7, 1.5, 4.4, { mat: 'metal', color: 0x212841 }),
  shophouse_a:   box(5.0, 7.0, 6.0, { mat: 'timber', color: 0x4f2d21, emit: [{ x: 0, y: 2.4, z: 3.1, color: WARM, intensity: 1.0, range: 5.5 }] }),
  shophouse_b:   box(5.0, 7.0, 6.0, { mat: 'metal', color: 0x37201b, emit: [{ x: 1.2, y: 2.6, z: 3.1, color: WARM, intensity: 1.1, range: 6 }, { x: -1.6, y: 4.2, z: 3.1, color: 0x40559f, intensity: 0.7, range: 4 }] }),
  shophouse_c:   box(5.0, 7.0, 6.0, { mat: 'plaster', color: 0x8b6141 }),
  shophouse_d:   box(5.0, 7.0, 6.0, { mat: 'timber', color: 0x4f2d21, emit: [{ x: 0, y: 2.6, z: 3.1, color: WARM, intensity: 1.0, range: 5.5 }, { x: 2.6, y: 2.6, z: 0, color: CREAM, intensity: 0.9, range: 5 }] }),
  utility_pole:  box(0.3, 9.0, 0.3, { mat: 'stone', color: 0x4a4a4c }),
  // NOT a 9 m slab: a placeholder that spans the alley as a solid roof blacks out the sky, which
  // is CLAIMS C4 gone and very hard to attribute in a still. Thin, like the bundle it stands in for.
  cable_span:    box(0.06, 0.06, 30.0, { mat: 'metal', color: 0x110f12, y0: 5.5 }),
  paper_lantern: box(0.45, 0.6, 0.45, { mat: 'fabric', color: 0xeee2c8, y0: 2.6, emit: [{ x: 0, y: 2.9, z: 0, color: 0xf1d899, intensity: 0.6, range: 4 }], face: { w: 0.45, h: 0.6, color: 0xf1d899, i: 2.2, all: true } }),
  lantern_string: box(6.0, 0.35, 0.35, { mat: 'fabric', color: 0xb8302a, y0: 3.0, emit: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => ({ x, y: 3.15, z: 0, color: 0xf1d899, intensity: 0.6, range: 3 })), face: { w: 6, h: 0.35, color: 0xf1d899, i: 1.6, all: true } }),
  noren_string:  box(6.0, 1.2, 0.05, { mat: 'fabric', color: 0xb8302a, y0: 2.0 }),
  wall_lightbox: box(0.9, 0.6, 0.15, { mat: 'metal', color: 0x37201b, emit: [{ x: 0, y: 0.3, z: 0.09, color: WARM, intensity: 1.2, range: 5.5 }], face: { w: 0.8, h: 0.5, color: WARM, i: 2.6 } }),
  standing_lightbox: box(0.6, 1.5, 0.3, { mat: 'metal', color: 0x37201b, emit: [{ x: 0, y: 0.9, z: 0.17, color: CREAM, intensity: 1.0, range: 5 }], face: { w: 0.5, h: 1.2, color: CREAM, i: 2.4 } }),
  tin_awning:    box(5.0, 0.3, 1.5, { mat: 'metal', color: 0x8b6141, y0: 3.0 }),
  ac_duct_cluster: box(1.2, 1.0, 0.6, { mat: 'metal', color: 0x8a8378 }),
  bins_bags:     box(1.5, 0.9, 0.8, { mat: 'metal', color: 0x212841 }),
  litter_set:    box(0.3, 0.1, 0.3, { mat: 'fabric', color: 0xeee2c8 }),
  alley_road_chunk: box(9.0, 0.05, 30.0, { mat: 'ground', color: 0x231718, roughness: 0.18 }),
  expressway_deck: box(6.0, 0.8, 30.0, { mat: 'stone', color: 0x4a4a4c, roughness: 0.18 }),
  sodium_lamp:   box(0.3, 10.0, 1.5, { mat: 'metal', color: 0x4a4a4c, emit: [{ x: 0, y: 9.6, z: 0.6, color: SODIUM, intensity: 1.6, range: 14 }] }),
  sign_gantry:   box(8.0, 6.0, 0.5, { mat: 'metal', color: 0x4a4a4c, emit: [{ x: 0, y: 5.2, z: -0.3, color: 0xa7e761, intensity: 0.7, range: 6 }] }),
  guard_rail:    box(4.0, 0.8, 0.1, { mat: 'metal', color: 0x8a8378 }),
  ramp_chunk:    box(9.0, 6.0, 30.0, { mat: 'stone', color: 0x4a4a4c }),
  bicycle_parked: box(0.5, 1.0, 1.7, { mat: 'metal', color: 0x37201b }),
  scooter:       box(0.7, 1.1, 1.8, { mat: 'metal', color: 0xb8302a }),
  beer_keg:      box(0.4, 0.6, 0.4, { mat: 'metal', color: 0x8a8378 }),
  gas_cylinders: box(0.8, 1.2, 0.4, { mat: 'metal', color: 0x8a8378 }),
  umbrella_stand: box(0.3, 0.7, 0.3, { mat: 'metal', color: 0x4a4a4c }),
  laundry_line:  box(4.0, 1.2, 0.3, { mat: 'fabric', color: 0xeee2c8, y0: 2.2 }),
  menu_board:    box(0.6, 1.0, 0.4, { mat: 'timber', color: 0x6c4028 }),
  plant_pots:    box(0.8, 0.6, 0.4, { mat: 'foliage', color: 0x3f6a2a }),
  cardboard_boxes: box(1.0, 0.8, 0.6, { mat: 'timber', color: 0x8b6141 }),
  ashtray_stand: box(0.3, 0.8, 0.3, { mat: 'metal', color: 0x4a4a4c }),
  traffic_mirror: box(0.6, 3.0, 0.3, { mat: 'metal', color: 0xe8852a }),
  road_cones:    box(0.4, 0.7, 0.4, { mat: 'fabric', color: 0xe8852a }),
  post_box:      box(0.5, 1.3, 0.5, { mat: 'metal', color: 0xb8302a }),
  electrical_box: box(0.6, 1.2, 0.4, { mat: 'metal', color: 0x8a8378 }),
  vertical_sign: box(0.5, 2.5, 0.3, { mat: 'metal', color: 0x37201b, emit: [{ x: 0, y: 1.3, z: 0.17, color: 0x40559f, intensity: 0.8, range: 4.5 }], face: { w: 0.4, h: 2.2, color: 0x40559f, i: 2.2 } }),
  stool_table_set: box(1.2, 0.75, 1.2, { mat: 'timber', color: 0x6c4028 }),
  rooftop_water_tank: box(1.2, 1.4, 1.2, { mat: 'metal', color: 0x8a8378 }),
  tv_antenna:    box(1.2, 1.5, 0.3, { mat: 'metal', color: 0x4a4a4c }),
  fire_ext_box:  box(0.3, 0.7, 0.2, { mat: 'metal', color: 0xb8302a }),
  drink_cases:   box(0.6, 0.7, 0.4, { mat: 'timber', color: 0x40559f }),
};

let ctx = null, THREE = null;
const meta = new Map();        // name -> { lights, offset:[x,y,z], size:[w,h,d] }
const wrappers = new Map();    // name -> blob url
const existence = new Map();   // name -> Promise<boolean>
const said = new Set();
let assetsBase = '../assets/';   // resolved against this module (game/src/), not the page

export function init(c) {
  ctx = c; THREE = c.THREE;
  try { assetsBase = new URL('../assets/', import.meta.url).href; } catch (e) { /* relative */ }
}

/** Called by the blob wrapper right after the asset function ran, before the loader merges. */
export function _meta(name, built, T) {
  try {
    built.updateMatrixWorld(true);
    const b = new T.Box3().setFromObject(built);
    if (b.isEmpty()) { meta.set(name, { lights: [], offset: [0, 0, 0], size: [0, 0, 0] }); return; }
    const c = b.getCenter(new T.Vector3()), s = b.getSize(new T.Vector3());
    const raw = Array.isArray(built.userData && built.userData.lights) ? built.userData.lights : [];
    const lights = raw.map((l) => ({ ...l, x: (l.x || 0) - c.x, y: (l.y || 0) - b.min.y, z: (l.z || 0) - c.z }));
    meta.set(name, { lights, offset: [-c.x, -b.min.y, -c.z], size: [s.x, s.y, s.z] });
  } catch (e) { meta.set(name, { lights: [], offset: [0, 0, 0], size: [0, 0, 0] }); }
}

export function has(name) {
  if (existence.has(name)) return existence.get(name);
  const p = (async () => {
    const url = assetsBase + name + '.js';
    try {
      let r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (r.status === 405 || r.status === 501) r = await fetch(url, { method: 'GET', cache: 'no-store' });
      return r.ok;
    } catch (e) { return false; }
  })();
  existence.set(name, p);
  return p;
}

function wrapperUrl(name) {
  if (wrappers.has(name)) return wrappers.get(name);
  const assetUrl = assetsBase + name + '.js';
  const chamferUrl = new URL('./chamfer.js', import.meta.url).href;
  const selfUrl = import.meta.url;
  const src = `import build from ${JSON.stringify(assetUrl)};
import { wrapTHREE } from ${JSON.stringify(chamferUrl)};
import { _meta } from ${JSON.stringify(selfUrl)};
export default function (THREE) {
  const g = build(wrapTHREE(THREE));
  _meta(${JSON.stringify(name)}, g, THREE);
  return g;
}
`;
  let url;
  try { url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); }
  catch (e) { url = assetUrl; }      // no Blob: plain load, no chamfer, no lights
  wrappers.set(name, url);
  return url;
}

export async function get(name, opts = {}) {
  if (!THREE) throw new Error('assets.init(ctx) first');
  const present = await has(name);
  let inst = null;
  if (present) {
    inst = await ASSET(wrapperUrl(name), { surfaces: true, ...opts });
    if (!inst.children.length && !meta.has(name)) {
      if (!said.has(name)) { said.add(name); console.warn(`[assets] ${name}: built nothing — placeholder instead`); }
      inst = null;
    }
  }
  if (!inst) return placeholder(name, opts);
  const m = meta.get(name) || { lights: [], offset: [0, 0, 0] };
  textures.apply(inst);
  inst.name = name;
  inst.userData.assetName = name;
  inst.userData.placeholder = false;
  inst.userData.lights = m.lights.map((l) => ({ ...l }));
  return inst;
}

/**
 * Lights of `group` (and of any descendant that publishes its own, when the group has none),
 * transformed by matrixWorld into whatever space that maps to. `range` scales with the world
 * scale. `into` (optional Object3D): express them in that object's local space instead.
 */
export function lights(group, into = null) {
  const out = [];
  if (!group || !THREE) return out;
  group.updateMatrixWorld(true);
  const v = new THREE.Vector3(), s = new THREE.Vector3();
  const inv = into ? new THREE.Matrix4().copy(into.matrixWorld).invert() : null;
  const visit = (o) => {
    const L = o.userData && o.userData.lights;
    if (Array.isArray(L) && L.length) {
      o.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), s);
      const k = Math.max(s.x, s.y, s.z) || 1;
      for (const l of L) {
        v.set(l.x || 0, l.y || 0, l.z || 0).applyMatrix4(o.matrixWorld);
        if (inv) v.applyMatrix4(inv);
        out.push({ ...l, x: v.x, y: v.y, z: v.z, range: (l.range || 5) * k, intensity: l.intensity ?? 0.8, color: l.color ?? WARM, asset: o.userData.assetName || o.name });
      }
      return;                        // aggregated: do not double count children
    }
    for (const c of o.children) visit(c);
  };
  visit(group);
  return out;
}

export function preload(names) {
  return Promise.all(names.map((n) => get(n).catch((e) => console.warn('[assets]', n, e.message))));
}

/* ------------------------------------------------------------ placeholders */

const RECIPE_COLOR = { timber: 0x4f2d21, metal: 0x37201b, stone: 0x4a4a4c, plaster: 0x8b6141, fabric: 0xb8302a, foliage: 0x3f6a2a, ground: 0x231718, tile: 0x6c4028 };

function placeholder(name, opts = {}) {
  const S = SIZES[name] || box(0.5, 0.5, 0.5, { mat: 'timber' });
  if (!said.has(name)) { said.add(name); console.info(`[assets] ${name}: no ./assets/${name}.js — placeholder box ${S.w}x${S.h}x${S.d}`); }
  const T = wrapTHREE(THREE);
  const g = new THREE.Group();
  g.name = name;
  const mat = new THREE.MeshStandardMaterial({ color: S.color ?? RECIPE_COLOR[S.mat] ?? 0x4f2d21, roughness: S.roughness ?? 0.85, metalness: S.metalness ?? (S.mat === 'metal' ? 0.3 : 0) });
  mat.name = S.mat || 'timber';
  const y0 = S.y0 || 0;
  const body = new THREE.Mesh(new T.BoxGeometry(S.w, S.h, S.d), mat);
  body.position.y = y0 + S.h / 2;
  body.castShadow = body.receiveShadow = true;
  body.name = name + '_body';
  g.add(body);
  // the grounding band, STYLE.md signature 2: the bottom 4 cm sits black into the wet road
  if (!y0 && S.h > 0.3 && S.mat !== 'ground') {
    const band = new THREE.Mesh(new THREE.BoxGeometry(S.w + 0.004, 0.04, S.d + 0.004), new THREE.MeshStandardMaterial({ color: 0x110f12, roughness: 0.9 }));
    band.position.y = 0.02; band.name = name + '_band';
    g.add(band);
  }
  if (S.face) {
    const f = S.face;
    const em = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: f.color, emissiveIntensity: f.i, roughness: 0.35, metalness: 0 });
    if (f.all) {
      const glow = new THREE.Mesh(new THREE.BoxGeometry(S.w * 0.9, S.h * 0.8, S.d * 0.9), em);
      glow.position.y = y0 + S.h / 2; glow.name = name + '_glow';
      body.material = new THREE.MeshStandardMaterial({ color: mat.color, roughness: 0.9, transparent: true, opacity: 0.35, forceSinglePass: true });
      g.add(glow);
    } else {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), em);
      face.position.set(0, y0 + S.h / 2, S.d / 2 + 0.004); face.name = name + '_face';
      g.add(face);
    }
  }
  applySurfaces(THREE, g, {});
  textures.apply(g);
  if (opts.height && S.h > 0) g.scale.setScalar(opts.height / (S.h + y0));
  g.userData.placeholder = true;
  g.userData.assetName = name;
  g.userData.nativeSize = new THREE.Vector3(S.w, S.h + y0, S.d);
  g.userData.lights = (S.emit || []).map((l) => ({ ...l }));
  if (opts.keepHierarchy) g.userData.joints = {};
  return g;
}

export { SIZES, CHAMFER };
