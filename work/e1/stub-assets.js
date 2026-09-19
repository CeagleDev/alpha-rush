// E1 fixture stub for ctx.assets (ARCH.md addendum). Real files under game/assets/ load through ASSET();
// anything missing becomes a named placeholder Box sized from STYLE.md with userData.placeholder = true,
// a few palette materials (so material sharing and the bake get exercised), emissive faces + userData.lights
// on emitters, and userData.obstacle on obstacle kinds. Surfaces are applied like E4's loader will.
import { ASSET } from '../../game/assetlib.js';
import { applySurfaces } from '../../game/surfaces.js';

const P = { black: 0x110f12, shade: 0x231718, rust: 0x37201b, timber: 0x4f2d21, lit: 0x6c4028, plank: 0x8b6141, lamp: 0xbf7c42,
  cream: 0xd8ae70, yellow: 0xe5b055, paper: 0xeee2c8, crate: 0xf8e845, red: 0xb8302a, blue: 0x40559f, fluo: 0x9accf2,
  green: 0xa7e761, concrete: 0x4a4a4c, sodium: 0x8a8378 };
// [w, h, d, colour, material name, emissive?, obstacle]
const SIZES = {
  shophouse_a: [5, 7, 6, P.timber, 'timber', 'yellow'], shophouse_b: [5, 7, 6, P.rust, 'metal', 'cream'],
  shophouse_c: [5, 7, 6, P.shade, 'metal'], shophouse_d: [5, 7, 6, P.timber, 'timber', 'yellow'],
  utility_pole: [0.3, 9, 0.3, P.concrete, 'stone'], cable_span: 'cables', paper_lantern: [0.45, 0.45, 0.45, P.red, 'fabric', 'yellow'],
  lantern_string: [6, 0.5, 0.35, P.red, 'fabric', 'yellow'], noren_string: [3, 1.2, 0.05, P.red, 'fabric'],
  wall_lightbox: [0.9, 0.6, 0.15, P.black, 'metal', 'cream'], standing_lightbox: [0.6, 1.5, 0.3, P.black, 'metal', 'yellow'],
  tin_awning: [4.6, 0.3, 1.2, P.plank, 'metal'], ac_duct_cluster: [1.2, 0.8, 0.5, P.sodium, 'metal'], bins_bags: [1.4, 0.9, 0.7, P.shade, 'metal'],
  alley_road_chunk: [9, 0.12, 30, P.black, 'ground'], parked_sedan: [1.7, 1.5, 4.4, P.shade, 'metal', null, 'block'],
  expressway_deck: 'deck', sodium_lamp: [0.3, 10, 0.3, P.concrete, 'metal', 'yellow'], sign_gantry: 'gantry',
  guard_rail: [0.15, 0.8, 4, P.sodium, 'metal'], ramp_chunk: 'ramp',
  crate_stack: [0.5, 1.05, 0.35, P.crate, 'plaster', null, 'jump'], cooler_bin: [1.2, 0.9, 0.6, P.fluo, 'plaster', null, 'jump'],
  fallen_bicycle: [1.7, 0.5, 0.6, P.rust, 'metal', null, 'jump'], roadworks_barrier: [1.6, 1.0, 0.4, P.crate, 'metal', null, 'jump'],
  banner_cluster_low: [1.6, 1.9, 0.4, P.red, 'fabric', null, 'roll'], awning_strut_low: [2.0, 0.1, 0.1, P.sodium, 'metal', null, 'roll'],
  gantry_board_low: [4, 0.6, 0.3, P.green, 'metal', null, 'roll', 2],
  kei_van: [1.5, 1.9, 3.4, P.paper, 'metal', null, 'block'], yatai_cart: [1.2, 2.1, 2.4, P.plank, 'timber', 'yellow', 'block'],
  vending_machine: [1.0, 1.83, 0.8, P.blue, 'metal', 'fluo', 'block'], concrete_divider: [0.6, 0.8, 2.0, P.concrete, 'stone', null, 'block'],
  bicycle_parked: [0.6, 1.0, 1.8, P.rust, 'metal'], scooter: [0.7, 1.1, 1.8, P.red, 'metal'], beer_keg: [0.4, 0.6, 0.4, P.sodium, 'metal'],
  gas_cylinders: [0.8, 1.4, 0.4, P.sodium, 'metal'], umbrella_stand: [0.4, 0.9, 0.4, P.shade, 'metal'], laundry_line: [3, 1.2, 0.4, P.paper, 'fabric'],
  menu_board: [0.6, 1.0, 0.4, P.paper, 'timber', 'cream'], plant_pots: [1.0, 0.6, 0.5, P.green, 'foliage'], cardboard_boxes: [1.0, 0.9, 0.8, P.plank, 'plaster'],
  ashtray_stand: [0.3, 0.9, 0.3, P.sodium, 'metal'], traffic_mirror: [0.5, 2.6, 0.3, P.sodium, 'metal'], road_cones: [1.0, 0.7, 0.5, P.red, 'plaster'],
  post_box: [0.4, 1.3, 0.4, P.red, 'metal'], electrical_box: [0.6, 1.2, 0.4, P.sodium, 'metal'], vertical_sign: [0.6, 3.0, 0.3, P.black, 'metal', 'red'],
  stool_table_set: [1.2, 0.8, 1.2, P.timber, 'timber'], rooftop_water_tank: [1.5, 1.8, 1.5, P.sodium, 'metal'], tv_antenna: [1.2, 1.5, 0.3, P.sodium, 'metal'],
  fire_ext_box: [0.4, 0.7, 0.3, P.red, 'metal'], drink_cases: [0.8, 0.9, 0.5, P.blue, 'plaster'], tau_coin: 'coin', litter_set: 'litter',
};
const EMIT = { yellow: 0xe5b055, cream: 0xd8ae70, fluo: 0x9accf2, red: 0xb8302a };

function hashName(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; }
function jitter(hex, k) { const c = new THREE_.Color(hex); c.multiplyScalar(1 + (k - 0.5) * 0.08); return c; }
let THREE_;
function mat(hex, name, k = 0.5, extra = {}) { const m = new THREE_.MeshStandardMaterial({ color: jitter(hex, k), roughness: 0.85, metalness: name === 'metal' ? 0.3 : 0, ...extra }); m.name = name; return m; }
function emissive(key) { return new THREE_.MeshStandardMaterial({ color: 0x110f12, emissive: EMIT[key], emissiveIntensity: 2.2, roughness: 0.35 }); }
function box(w, h, d, m, x = 0, y = 0, z = 0) { const b = new THREE_.Mesh(new THREE_.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.userData.placeholder = true; return b; }

function placeholder(name) {
  const THREE = THREE_, g = new THREE.Group(); g.name = name; g.userData.placeholder = true;
  const spec = SIZES[name] || [0.6, 0.6, 0.6, P.shade, 'metal'];
  const k = hashName(name);
  if (spec === 'cables') {
    for (let i = 0; i < 4; i++) g.add(box(0.04, 0.04, 30, mat(P.black, 'metal', k), -1.5 + i, 0.5 + (i % 2) * 0.6, 0));
  } else if (spec === 'deck') {
    g.add(box(7.2, 0.8, 30, mat(P.concrete, 'stone', k, { roughness: 0.18 }), 0, 0.4, 0));
    for (const s of [1, -1]) { g.add(box(0.3, 1.0, 30, mat(P.concrete, 'stone', k + 0.1), s * 3.45, 1.3, 0)); g.add(box(0.05, 3, 30, mat(P.fluo, 'plaster', k, { transparent: true, opacity: 0.35, forceSinglePass: true }), s * 3.55, 3.3, 0)); }
  } else if (spec === 'gantry') {
    for (const s of [1, -1]) g.add(box(0.3, 6, 0.3, mat(P.sodium, 'metal', k), s * 3.8, 3, 0));
    g.add(box(8, 0.4, 0.4, mat(P.sodium, 'metal', k), 0, 5.8, 0)); g.add(box(5, 1.6, 0.2, emissive('cream'), 0, 4.8, 0.2));
    g.userData.lights = [{ x: 0, y: 4.8, z: 1, color: 0xa7e761, intensity: 2, range: 8 }];
  } else if (spec === 'ramp') {
    const m = mat(P.concrete, 'stone', k, { roughness: 0.18 });
    for (let i = 0; i < 15; i++) { const y0 = 6 * i / 15, y1 = 6 * (i + 1) / 15; g.add(box(7.2, y1 + 0.8, 2, m, 0, (y1 + 0.8) / 2 - 0.8, -14 + i * 2)); }
  } else if (spec === 'coin') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 24), mat(P.cream, 'metal', k, { metalness: 0.6, roughness: 0.35 })); c.rotation.x = Math.PI / 2; c.position.y = 0.3; g.add(c);
  } else if (spec === 'litter') {
    const names = ['paper', 'cup', 'can', 'bag'], cols = [P.paper, P.cream, P.red, P.black];
    names.forEach((n, i) => { const m = box(0.18 + i * 0.03, 0.02 + i * 0.03, 0.22, mat(cols[i], 'plaster', k + i * 0.1), 0, 0.02, 0); m.name = n; m.position.set(i * 0.5, 0, 0); g.add(m); });
  } else {
    const [w, h, d, col, mname, em, obst, lanes] = spec;
    const band = Math.min(0.06, h * 0.1);
    g.add(box(w, h - band, d, mat(col, mname, k), 0, band + (h - band) / 2, 0));
    g.add(box(w, band, d, mat(P.black, 'metal', 0.5), 0, band / 2, 0));
    if (h > 1.5) g.add(box(w * 0.9, 0.3, d * 0.2, mat(P.rust, 'timber', k + 0.2), 0, h * 0.6, d / 2 - d * 0.1));
    if (em) {
      const fw = Math.min(w * 0.6, 2), fh = Math.min(h * 0.25, 1.2), fy = h > 4 ? 3.8 : h * 0.6;
      g.add(box(fw, fh, 0.06, emissive(em), 0, fy, d / 2 + 0.03));
      g.userData.lights = [{ x: 0, y: fy, z: d / 2 + 0.5, color: EMIT[em], intensity: 2.5, range: 6 }];
    }
    if (obst) g.userData.obstacle = { kind: obst, lanes: lanes || 1 };
  }
  applySurfaces(THREE, g, { size: 256 });
  // base y = 0, centred x/z (like the loader)
  const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  if (g.userData.lights) for (const l of g.userData.lights) { l.x -= c.x; l.y -= bb.min.y; l.z -= c.z; }
  return g;
}

export function makeAssets(THREE) {
  THREE_ = THREE;
  const protos = new Map(), real = new Map();
  let placeholders = 0;
  async function exists(url) { if (real.has(url)) return real.get(url); const p = fetch(url, { method: 'HEAD' }).then((r) => r.ok).catch(() => false); real.set(url, p); return p; }
  return {
    async get(name, opts = {}) {
      const url = `../../game/assets/${name}.js`;
      if (await exists(url)) return ASSET(url, { surfaces: true, ...opts });
      const key = name + (opts.keepHierarchy ? '#tree' : '');
      if (!protos.has(key)) { protos.set(key, placeholder(name)); placeholders++; console.log('[assets] placeholder', name); }
      return protos.get(key).clone(true);
    },
    lights(inst) {
      const L = inst.userData?.lights; if (!Array.isArray(L)) return [];
      inst.updateWorldMatrix(true, false);
      return L.map((l) => { const v = new THREE.Vector3(l.x, l.y, l.z).applyMatrix4(inst.matrixWorld); return { x: v.x, y: v.y, z: v.z, color: l.color, intensity: l.intensity, range: l.range }; });
    },
    get placeholders() { return placeholders; },
  };
}
