/**
 * chunks.js — E1. One recipe per chunk variant; each returns a baked Group.
 *
 * Every chunk is 30 m along +Z in its own space (z 0 → 30, road centred on x = 0, running surface at
 * y = 0). Variants (20): alley A ×6 (A0–A5), alley B ×6 (B0–B5), expressway ×6 (X0–X5), RU, RD.
 * Odd alley variants carry a 4 m cross-street on one side; even expressway variants carry a sign
 * gantry (so "every other chunk" holds when track.js alternates odd/even). Layouts are deterministic
 * from a per-variant seed (hash of the variant id), independent of config.SEED — the seed drives the
 * ORDER of chunks, obstacles and coins, not the dressing.
 *
 * Assets come only from `ctx.assets.get(name, opts)`; each name is fetched once per page and cloned
 * (`clone(true)` shares geometry and materials, which is what lets bakeStatic collapse a chunk).
 * Before the bake, materials are re-shared by VALUE snapped to the STYLE.md palette (colour to the
 * nearest palette entry, roughness/metalness to 1/8) so near-identical materials from different
 * assets land on one material and one draw. Maps are kept from the first material seen for a key.
 *
 * Returned chunk Group: children = [baked static group, litter InstancedMesh ×(1–4)]. userData:
 *   variant, zone, cross (0 | -1 | +1: side of the cross-street), lights (chunk-local, from
 *   `ctx.assets.lights(inst)` — assumed to return the instance's lights in the space the instance's
 *   matrixWorld maps to, which at build time is chunk space), litter (instance count), props (count).
 *
 * Deviation from ASSETS.md, on purpose: shophouse fronts stand on the OUTER verge line x = ±4.5, not
 * ±3 — the alley_road_chunk slab's 1.5 m verges are at |x| 3–4.5 and the ≥ 12 verge props per side
 * live there; a front at ±3 would put the clutter inside the buildings. SHOP_X below flips it.
 */
import * as THREE from 'three';
import { signFace, noren } from './textures.js?v=202609211528';
import * as perf from './perf.js?v=202609211528';
import { bakeStatic } from '../assetlib.js?v=202609211528';

export const CHUNK_LEN = 30;
// CLOSE THE STREET (critic round 3, the one property). At 4.5 the shophouse fronts stood 9 m apart
// and the critic read the set as "a four-lane boulevard, complete with dashed lane markings", not a
// yokocho: sky filled 49-60 % of the upper frame against the reference's 21-44 %, nothing was close
// enough to the camera to reward detail, and with no enclosure there was no bounce light. The
// reference alleys run 3-4 m at the runner's depth, but three 2 m lanes of dodge space cannot fit in
// that, so per the critic's own advice this halves the excess rather than matching outright:
// 9.0 m between fronts becomes 7.4 m. The verge prop band narrows with it (see the placement below).
export const SHOP_X = 3.7;          // shophouse front face |x|
export const DECK_TOP = 0.8;        // expressway_deck slab thickness (ASSETS.md: 30 × 6 × 0.8)
export const DECK_Y = 6;            // expressway running surface height
export const ROAD_SURF = 0.02;      // alley/ramp assets: carriageway sits this far above the asset base
export const VERGE_TOP = 0.12;      // world height of the kerb top once the road is placed (0.14 - ROAD_SURF)

export const VARIANTS = [];
for (let i = 0; i < 6; i++) VARIANTS.push({ id: `A${i}`, zone: 'alleyA', cross: i % 2 ? (i % 4 === 1 ? 1 : -1) : 0 });
VARIANTS.push({ id: 'RU', zone: 'rampUp', cross: 0 });
for (let i = 0; i < 6; i++) VARIANTS.push({ id: `X${i}`, zone: 'expressway', cross: 0, gantry: i % 2 === 0 });
VARIANTS.push({ id: 'RD', zone: 'rampDown', cross: 0 });
for (let i = 0; i < 6; i++) VARIANTS.push({ id: `D${i}`, zone: 'day', cross: i % 2 ? (i % 4 === 1 ? 1 : -1) : 0 });
for (let i = 0; i < 6; i++) VARIANTS.push({ id: `B${i}`, zone: 'alleyB', cross: i % 2 ? (i % 4 === 1 ? -1 : 1) : 0 });

// ---------------------------------------------------------------- seeded helpers
export function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
const range = (rng, a, b) => a + rng() * (b - a);
function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------------------------------------------------------------- material sharing (per page)
const PALETTE = [0x110f12, 0x231718, 0x37201b, 0x4f2d21, 0x6c4028, 0x8b6141, 0xbf7c42, 0xd8ae70, 0xe5b055,
  0xf1d899, 0xeee2c8, 0xf8e845, 0xb8302a, 0x1d406f, 0x1d3150, 0x212841, 0x40559f, 0x9accf2, 0xa7e761,
  0xe8852a, 0xc98a45, 0xe6ddd0, 0x3a2a22, 0x4a4a4c, 0x8a8378]
  .map((h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]);
const matCache = new Map();
const _c = new THREE.Color();
export function shareMaterials(root) {
  const q = (v, n) => Math.round(v * n) / n;
  root.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material;
    let col = '-';
    if (m.color) {
      _c.copy(m.color).convertLinearToSRGB();
      let best = null, bd = 1e9;
      for (const p of PALETTE) {
        const d = (p[0] - _c.r) ** 2 + (p[1] - _c.g) ** 2 + (p[2] - _c.b) ** 2;
        if (d < bd) { bd = d; best = p; }
      }
      col = bd < 0.02 ? best.join(',') : [q(_c.r, 12), q(_c.g, 12), q(_c.b, 12)].join(',');
    }
    const key = [m.type, m.name || '', col, q(m.roughness ?? 1, 8), q(m.metalness ?? 0, 8),
      m.transparent ? 1 : 0, q(m.opacity ?? 1, 10), m.side, m.flatShading ? 1 : 0,
      m.emissive ? m.emissive.getHexString() : '-', q(m.emissiveIntensity ?? 1, 4),
      m.vertexColors ? 1 : 0, m.map ? 'map' : '-', m.normalMap ? 'nrm' : '-'].join('|');
    const shared = matCache.get(key);
    if (shared) o.material = shared; else matCache.set(key, m);
  });
}
export const materialCount = () => matCache.size;

// ---------------------------------------------------------------- vertex-colour tinting
// WHY. bakeStatic merges by material VALUE, so every distinct colour/roughness/emissive combination
// is its own draw call. Measured on this game: ~185 materials survived per baked chunk, six live
// chunks, 1,121 draws for the track alone against a 900 budget for the whole frame.
//
// The fix (rust17 #14): tint by the asset's own colour in a vertex attribute and SHARE one material
// per recipe family and roughness band. Detail still comes from the family's texture maps, so the
// surfaces do not flatten; only the colour moves from the material to the geometry. Emissive parts
// and anything carrying its own sprite are left alone — they are few, and they are the frame's
// bright pixels, so they must keep their own maps.
//
// Buckets are (material.name | '', roughness band). Every mesh in a bucket is given a `color`
// attribute, which also keeps the attribute signature uniform: mixing geometry that carries `color`
// with geometry that does not is what makes a merged vertexColors material render black.
const ROUGH_BANDS = [0.2, 0.5, 0.75, 0.95];
const tintCache = new Map();
const _tc = new THREE.Color();

function bandOf(r) {
  let best = 0, bd = 1e9;
  for (let i = 0; i < ROUGH_BANDS.length; i++) { const d = Math.abs(ROUGH_BANDS[i] - r); if (d < bd) { bd = d; best = i; } }
  return best;
}

export function tintByVertexColor(root) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material;
    // leave the frame's light sources and anything with its own sprite exactly as authored
    if (m.emissive && m.emissive.getHex() !== 0) return;
    if (m.userData && (m.userData.sign || m.userData.noren)) return;
    if (m.transparent && (m.opacity ?? 1) < 0.95) return;
    const g = o.geometry;
    const pos = g && g.attributes && g.attributes.position;
    if (!pos) return;

    const band = bandOf(m.roughness ?? 1);
    const key = `${m.name || ''}|${band}|${m.side}|${m.map ? 'm' : '-'}${m.normalMap ? 'n' : '-'}${m.roughnessMap ? 'r' : '-'}`;
    let shared = tintCache.get(key);
    if (!shared) {
      shared = m.clone();
      shared.color.setRGB(1, 1, 1);          // white base: the tint now lives in the vertices
      shared.vertexColors = true;
      shared.roughness = ROUGH_BANDS[band];
      shared.needsUpdate = true;
      tintCache.set(key, shared);
    }

    // bake this material's colour into the geometry (clone: generated assets reuse geometry)
    const geo = g.clone();
    _tc.copy(m.color || { r: 1, g: 1, b: 1 });
    const n = pos.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = _tc.r; arr[i * 3 + 1] = _tc.g; arr[i * 3 + 2] = _tc.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    o.geometry = geo;
    o.material = shared;
  });
}
export const tintCount = () => tintCache.size;


// ---------------------------------------------------------------- prototypes (one get per name)
const protos = new Map();
async function proto(ctx, name, opts) {
  const key = name + (opts && opts.keepHierarchy ? '#tree' : '');
  if (!protos.has(key)) {
    protos.set(key, (async () => {
      let inst;
      try { inst = await ctx.assets.get(name, opts); } catch (e) { console.warn('[chunks] get failed', name, e.message); inst = new THREE.Group(); }
      const box = new THREE.Box3().setFromObject(inst);
      const size = box.isEmpty() ? new THREE.Vector3() : box.getSize(new THREE.Vector3());
      return { inst, size };
    })());
  }
  return protos.get(key);
}
export async function sizeOf(ctx, name) { return (await proto(ctx, name)).size; }

// ---------------------------------------------------------------- the builder
class Builder {
  constructor(ctx, variant) {
    this.ctx = ctx; this.variant = variant;
    this.rng = mulberry32(hash32('midnight-dash/' + variant.id));
    this.root = new THREE.Group();           // everything static, baked at the end
    this.placed = [];                        // instances, for the lights pass
    this.props = 0;
  }
  async put(name, x, y, z, ry = 0, opts) {
    const p = await proto(this.ctx, name, opts);
    const inst = p.inst.clone(true);
    inst.position.set(x, y, z); inst.rotation.y = ry;
    inst.userData.assetName = name;
    dressSprites(inst, this.rng);
    this.root.add(inst); this.placed.push(inst);
    return { inst, size: p.size };
  }
  async size(name) { return (await proto(this.ctx, name)).size; }
}


// ---------------------------------------------------------------- sign sprites
// The assets build their lit sign faces as a near-black material with a cream emissive, because an
// asset module may not load an image (the 404 contract). The jam rules DO allow texture files, and
// Atlas generated eight lightbox faces and two noren, so the faces get their brush-stroke sprites
// here at placement time: a shared material per sprite, so bakeStatic still merges by value and the
// draw-call count does not move. Without this the street is a row of blank glowing panels, which is
// what separated our frames from the reference most visibly.
const SIGN_EMISSIVE = new Set([0xd8ae70, 0xf1d899, 0xe5b055]);   // the cream/yellow face colours in STYLE.md
const NOREN_ASSETS = new Set(['noren_string', 'banner_cluster_low']);

function dressSprites(inst, rng) {
  const name = inst.userData.assetName;
  const wantNoren = NOREN_ASSETS.has(name);
  let n = 0;
  inst.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material;
    if (wantNoren) {
      // the banner cloth is the 'fabric' material carrying the (currently blank) faces
      if (m.name === 'fabric') { o.material = noren(1 + Math.floor((rng ? rng() : 0.5) * 2)); n++; }
      return;
    }
    if (!m.emissive) return;
    if (!SIGN_EMISSIVE.has(m.emissive.getHex())) return;
    o.material = signFace(1 + Math.floor((rng ? rng() : 0.5) * 8));
    n++;
  });
  if (n) inst.userData.sprites = n;
  return n;
}

// A verge prop that is longer than it is wide is parked along the wall, not facing the road.
const ALONG = new Set(['bicycle_parked', 'scooter', 'stool_table_set', 'fallen_bicycle']);
const PROPS_A = ['vending_machine', 'standing_lightbox', 'bins_bags', 'beer_keg', 'gas_cylinders', 'umbrella_stand',
  'menu_board', 'plant_pots', 'ashtray_stand', 'bicycle_parked', 'scooter', 'stool_table_set', 'drink_cases',
  'crate_stack', 'fire_ext_box', 'post_box', 'electrical_box', 'traffic_mirror', 'road_cones', 'cardboard_boxes'];
const PROPS_B = ['crate_stack', 'cardboard_boxes', 'drink_cases', 'bins_bags', 'beer_keg', 'gas_cylinders',
  'vending_machine', 'road_cones', 'bicycle_parked', 'scooter', 'plant_pots', 'electrical_box', 'post_box',
  'menu_board', 'standing_lightbox', 'umbrella_stand', 'fire_ext_box', 'traffic_mirror', 'ashtray_stand', 'stool_table_set'];
const PROPS_D = ['plant_pots', 'plant_pots', 'bicycle_parked', 'bicycle_parked', 'crate_stack', 'drink_cases', 'cardboard_boxes',
  'stool_table_set', 'stool_table_set', 'menu_board', 'umbrella_stand', 'vending_machine', 'post_box', 'scooter', 'beer_keg',
  'cooler_bin', 'bins_bags', 'traffic_mirror', 'fire_ext_box', 'standing_lightbox'];
const UNITS_D = ['shophouse_a', 'shophouse_b', 'shophouse_b', 'shophouse_d', 'shophouse_c'];
const WALL_D = [['laundry_line', 4.6], ['laundry_line', 4.4], ['ac_duct_cluster', 3.6], ['vertical_sign', 3.4], ['wall_lightbox', 4.2]];
const UNITS_A = ['shophouse_a', 'shophouse_a', 'shophouse_b', 'shophouse_b', 'shophouse_c'];
const UNITS_B = ['shophouse_c', 'shophouse_c', 'shophouse_c', 'shophouse_b', 'shophouse_a'];
const WALL = [['wall_lightbox', 4.2], ['ac_duct_cluster', 3.6], ['vertical_sign', 3.4], ['laundry_line', 4.6]];

/** side s = +1 (right, x > 0) or -1. A unit at +x must face -x. */
const faceRoad = (s) => (s > 0 ? -Math.PI / 2 : Math.PI / 2);

async function alley(ctx, variant) {
  const B = new Builder(ctx, variant), rng = B.rng, isB = variant.zone === 'alleyB', isDay = variant.zone === 'day';
  // THE MORNING MARKET (zone 'day'). Same street furniture family, dressed for daylight: open sky
  // (three cable spans instead of six, no lit strings), the verge given to market life - carts,
  // crates, plants, bicycles, laundry - and no lantern rows. It is lit by lighting.js's sun, not by
  // practicals, so what reads here is form and colour, where the night street reads by its lights.
  const UNITS = isDay ? UNITS_D : isB ? UNITS_B : UNITS_A, PROPS = isDay ? PROPS_D : isB ? PROPS_B : PROPS_A;
  const WALLS = isDay ? WALL_D : WALL;
  const cross = variant.cross;                          // 0 | -1 | +1
  const crossSlot = cross ? 2 + Math.floor(rng() * 2) : -1;   // slot 2 or 3 → z 12.5 or 17.5
  const crossZ = 2.5 + crossSlot * 5;

  // road slab: A9 built it base-at-0 with the carriageway at local y = 0.02 and the kerb tops at
  // 0.14, so it is placed at -0.02 to put the running surface exactly on the chunk's y = 0 plane.
  // Sinking it by its own height (the old rule) buried the road 13 cm under the player's feet.
  await B.put('alley_road_chunk', 0, -ROAD_SURF, 15);

  // shophouse rows, 6 slots per side, fronts on the verge line
  for (const s of [1, -1]) {
    const ry = faceRoad(s);
    for (let k = 0; k < 6; k++) {
      const zc = 2.5 + k * 5;
      if (s === cross && k === crossSlot) continue;                       // the 4 m gap
      let name = pick(rng, UNITS);
      if (s === cross && Math.abs(k - crossSlot) === 1) name = 'shophouse_d';   // corner units flank it
      const u = await B.size(name);
      const depth = u.z > 0.5 ? u.z : 6;
      const { size } = await B.put(name, s * (SHOP_X + depth / 2), 0, zc, ry);
      // tin awning on the front at 3.0 m, projecting over the verge
      const aw = await B.size('tin_awning');
      const awd = aw.z > 0.05 ? aw.z : 1.2;
      await B.put('tin_awning', s * (SHOP_X - awd / 2), 3.0, zc, ry);
      // wall-mounted things
      if (rng() < 0.7) {
        const [w, y] = pick(rng, WALLS);
        const ws = await B.size(w); const wd = ws.z > 0.02 ? ws.z : 0.15;
        await B.put(w, s * (SHOP_X - wd / 2), y, zc + range(rng, -1.6, 1.6), ry);
      }
      if (rng() < 0.4) {
        const r = pick(rng, ['rooftop_water_tank', 'tv_antenna']);
        await B.put(r, s * (SHOP_X + depth * range(rng, 0.35, 0.7)), size.y > 3 ? size.y : 7, zc + range(rng, -1.5, 1.5), ry);
      }
    }
  }

  // cross-street: two units along its sides 6 m back, and a lit sign cluster 12 m back
  if (cross) {
    const s = cross, back = SHOP_X;
    for (const side of [-1, 1]) {
      const name = pick(rng, ['shophouse_b', 'shophouse_a', 'shophouse_c']);
      const u = await B.size(name); const d = u.z > 0.5 ? u.z : 6, w = u.x > 0.5 ? u.x : 5;
      // behind the corner units (6 m deep), fronts on the cross-street's edges (crossZ ± 2), facing it
      await B.put(name, s * (back + 6 + w / 2), 0, crossZ + side * (2 + d / 2), side < 0 ? 0 : Math.PI);
    }
    const bx = s * (back + 12);
    const u = await B.size('shophouse_b'); const d = u.z > 0.5 ? u.z : 6;
    await B.put('shophouse_b', bx + s * (d / 2), 0, crossZ, faceRoad(s));
    await B.put('wall_lightbox', bx - s * 0.08, 4.2, crossZ - 1.4, faceRoad(s));
    await B.put('wall_lightbox', bx - s * 0.08, 2.6, crossZ + 1.5, faceRoad(s));
    await B.put('standing_lightbox', bx - s * 0.6, 0, crossZ - 1.0, faceRoad(s));
    await B.put('standing_lightbox', bx - s * 0.8, 0, crossZ + 1.2, faceRoad(s));
    await B.put('paper_lantern', bx - s * 1.0, 2.7, crossZ, 0);
    await B.put(isB ? 'noren_string' : 'lantern_string', s * (back + 7), isB ? 2.0 : 2.9, crossZ, 0);
  }

  // verge props, ≥ 12 per side, on the 1.5 m verge |x| 3–4.5
  for (const s of [1, -1]) {
    const slots = shuffle(rng, [...Array(15).keys()]).slice(0, 14);
    let n = 0;
    for (const k of slots) {
      const z = 1 + k * 2 + range(rng, -0.4, 0.4);
      if (s === cross && Math.abs(z - crossZ) < 2.6) continue;
      const name = pick(rng, PROPS);
      const sz = await B.size(name);
      const along = ALONG.has(name);
      const w = along ? Math.min(sz.z, 1.4) : Math.min(sz.x, 1.4);
      const x = s * (3.05 + w / 2 + rng() * Math.max(0, 0.6 - w));   // band 3.05..3.65, inside the new shop line
      await B.put(name, x, 0, z, along ? (rng() < 0.5 ? 0 : Math.PI) : faceRoad(s));
      n++;
    }
    B.props += n;
    // a lantern hung at the awning edge (the day street keeps one: unlit paper, a spot of red)
    for (let i = 0; i < (isDay ? 1 : 2); i++) await B.put('paper_lantern', s * 3.7, 2.6, range(rng, 1, 29), 0);
  }

  // one utility pole per side, three cable spans, one string across the road
  await B.put('utility_pole', 4.3, 0, range(rng, 4, 8), 0);
  await B.put('utility_pole', -4.3, 0, range(rng, 19, 24), 0);
  // OVERHEAD ENCLOSURE. Measured against the bar (tools/claims.py, C4): the reference alley shows
  // blue sky in 39.6 % of its top fifth, ours showed 62.5 % — the street read as open road rather
  // than a yokocho, because only three cable spans and one lantern string crossed a 30 m chunk.
  // The reference's upper half is a mat of cables, strings and eaves. So: six cable bundles at
  // staggered heights across the chunk, and two to three lit strings, which also buys C2 brights
  // and the warm bounce for C3, since every lantern is a practical.
  const spanZ = isDay ? [6, 16, 25] : [4, 9, 14, 18, 23, 28];
  for (let i = 0; i < spanZ.length; i++) {
    await B.put('cable_span', [-0.35, 0.1, 0.35, -0.2, 0.25, 0][i], 4.6 + (i % 3) * 0.55, spanZ[i], 0);
  }
  // The string assets are authored ALONG X (rope ends at x = ±3), so a string that crosses the road
  // is placed with NO rotation. These three used to be turned by π/2, which laid each string down
  // the lane centre instead: six lanterns a metre apart directly over the runner's head. That was
  // the vertical column of lanterns in every frame, and it strobed the runner at ~3 Hz as the
  // six-light pool swapped on every lantern passed (measured: 19 orange/washed flips in 6.4 s).
  if (isDay) {
    // cloth, not light: a noren string and laundry across the street, high enough to run under
    await B.put('noren_string', 0, 2.3, range(rng, 5, 12), 0);
    if (rng() < 0.6) await B.put('noren_string', 0, 2.5, range(rng, 18, 26), 0);
    return finish(ctx, B, 30);
  }
  const str = isB ? 'noren_string' : 'lantern_string';
  const other = isB ? 'lantern_string' : 'noren_string';
  await B.put(str, 0, isB ? 2.0 : 2.9, range(rng, 4, 11), 0);
  await B.put(other, 0, isB ? 2.9 : 2.0, range(rng, 13, 20), 0);
  if (rng() < 0.7) await B.put(str, 0, isB ? 2.2 : 3.1, range(rng, 22, 28), 0);

  return finish(ctx, B, 48);
}

async function expressway(ctx, variant) {
  const B = new Builder(ctx, variant), rng = B.rng;
  // A9's deck is one object from the street up: base y = 0, piers included, running surface at
  // local 6.0. The chunk group already sits at DECK_Y, so the deck is pulled back down by DECK_Y
  // to stand on the ground. (It used to be sunk by its 0.8 m slab thickness, which assumed a
  // free-floating slab and left this asset 5.2 m in the air.)
  await B.put('expressway_deck', 0, -DECK_Y, 15);
  // sodium lamps every 15 m, alternating sides (parity flips per variant so the run alternates)
  const p = Number(variant.id.slice(1)) % 2 ? 1 : -1;
  await B.put('sodium_lamp', 3.5 * p, 0, 7.5, faceRoad(p));
  await B.put('sodium_lamp', -3.5 * p, 0, 22.5, faceRoad(-p));
  // guard rails, 4 m sections, both sides
  // ORIENTATION. guard_rail is authored 4 m long ALONG X and concrete_divider 1.84 m ALONG X (it was a
  // lane obstacle once); the sodium lamp's arm is authored along +Z. Placed with no rotation the rails
  // lay ACROSS the road - each one spanning x 1.15..5.15, straight over an outer lane, with no
  // collider, so the runner "ran through barricades" (the user's screenshot). Edge furniture runs
  // ALONG the road (rotation pi/2), and lamps face the carriageway like the shophouses do.
  for (const s of [1, -1]) for (let k = 0; k < 7; k++) await B.put('guard_rail', s * 3.15, 0, 2 + k * 4 + (k === 6 ? -1 : 0), Math.PI / 2);
  if (variant.gantry) await B.put('sign_gantry', 0, 0, 15, 0);
  // edge dividers (scenery, outside the lanes) and a little shoulder detail
  for (let i = 0; i < 3; i++) await B.put('concrete_divider', pick(rng, [1, -1]) * 3.75, 0, range(rng, 2, 28), Math.PI / 2);
  if (rng() < 0.6) await B.put('road_cones', pick(rng, [1, -1]) * 3.3, 0, range(rng, 3, 27), 0);
  return finish(ctx, B, 12);
}

async function ramp(ctx, variant) {
  const B = new Builder(ctx, variant);
  // The asset's surface runs local 0.02 at z = -15 to 6.02 at z = +15 on a constant 1:5 grade; the
  // height it has beyond 6 m is PARAPET above that surface, not slab below it. So it is placed at
  // -ROAD_SURF like the alley road, which lands its surface on 0 at the foot and 6.0 at the crest,
  // meeting the alley and the deck exactly. Mirrored by a half turn for the down ramp.
  await B.put('ramp_chunk', 0, -ROAD_SURF, 15, variant.zone === 'rampDown' ? Math.PI : 0);
  for (const s of [1, -1]) for (let k = 0; k < 7; k++) {
    const { inst } = await B.put('guard_rail', s * 3.15, 0, 2 + k * 4 + (k === 6 ? -1 : 0), Math.PI / 2);   // along the ramp edge, not across it
    inst.position.y = 0; // rails are placed on the ramp surface below
  }
  // place the rails on the slope: y from the rise, pitched to it
  const pitch = Math.atan2(DECK_Y, CHUNK_LEN);
  for (const inst of B.placed) {
    if (inst.userData.assetName !== 'guard_rail') continue;
    const tz = inst.position.z / CHUNK_LEN;
    inst.position.y = variant.zone === 'rampDown' ? DECK_Y * (1 - tz) : DECK_Y * tz;
    inst.rotation.x = variant.zone === 'rampDown' ? pitch : -pitch;
  }
  return finish(ctx, B, 0);
}

// ---------------------------------------------------------------- litter, lights, bake
const LITTER_NAMES = ['paper', 'cup', 'can', 'bag'];
let litterPieces = null;   // [{geo, mat}] resolved once per page
async function litterProto(ctx) {
  if (litterPieces) return litterPieces;
  litterPieces = [];
  let set;
  try { set = await ctx.assets.get('litter_set', { keepHierarchy: true }); } catch { set = null; }
  if (!set) return litterPieces;
  set.updateMatrixWorld(true);
  const named = [];
  set.traverse((o) => { if (LITTER_NAMES.includes(o.name)) named.push(o); });
  const sources = named.length ? named : (set.children.length ? set.children : [set]);
  for (const src of sources) {
    const baked = bakeStatic(src);
    const meshes = []; baked.traverse((o) => { if (o.isMesh) meshes.push(o); });
    if (!meshes.length) continue;
    let geo = meshes[0].geometry;
    if (meshes.length > 1) {
      // several materials in one piece: keep the first material, union the geometry
      const geos = meshes.map((m) => (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()));
      for (const g of geos) for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      try {
        const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');
        geo = mergeGeometries(geos, false) || geo;
      } catch { /* keep the first */ }
    }
    // re-origin: base at y = 0, centred
    geo.computeBoundingBox();
    const bb = geo.boundingBox, c = bb.getCenter(new THREE.Vector3());
    geo = geo.clone(); geo.translate(-c.x, -bb.min.y, -c.z);
    litterPieces.push({ geo, mat: meshes[0].material });
  }
  return litterPieces;
}

async function finish(ctx, B, litterCount) {
  const rng = B.rng;
  B.root.updateMatrixWorld(true);
  // practicals, chunk-local (see header)
  const lights = [];
  for (const inst of B.placed) {
    let L = null;
    try { L = ctx.assets.lights ? ctx.assets.lights(inst) : null; } catch { L = null; }
    if (Array.isArray(L)) for (const l of L) lights.push({ x: l.x, y: l.y, z: l.z, color: l.color, intensity: l.intensity, range: l.range });
  }
  shareMaterials(B.root);
  tintByVertexColor(B.root);     // colour into the vertices, one material per recipe family: see above
  // The SECOND, coarser bake (traps.md "when one view holds the whole level, trimming assets is not
  // the fix"): the same chunk with every part under ~25 cm dropped, swapped in beyond a measured
  // distance by perf.js. E4 measured the swap at 40 m with a 0.000 mean pixel difference, so it is
  // invisible in a filmstrip, and it is the triangle headroom the road work is about to spend.
  let coarse = null;
  try { coarse = perf.coarseBake ? perf.coarseBake(B.root) : null; } catch (e) { coarse = null; }
  const baked = bakeStatic(B.root);
  baked.name = 'static';
  let tris = 0; baked.traverse((o) => { if (o.isMesh && o.geometry) { const p = o.geometry.attributes.position; tris += (o.geometry.index ? o.geometry.index.count : p.count) / 3; } });

  const chunk = new THREE.Group();
  chunk.name = 'chunk_' + B.variant.id;
  chunk.add(baked);
  if (coarse && coarse.group) { coarse.group.visible = false; chunk.add(coarse.group); chunk.userData.coarse = coarse.group; }
  // litter: InstancedMesh per litter_set piece (≤ 4 per chunk), on the road and verges
  let litter = 0;
  if (litterCount > 0) {
    const pieces = await litterProto(ctx);
    if (pieces.length) {
      const per = Math.ceil(litterCount / pieces.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
      for (const piece of pieces) {
        const im = new THREE.InstancedMesh(piece.geo, piece.mat, per);
        im.name = 'litter'; im.castShadow = false; im.receiveShadow = true; im.frustumCulled = true;
        for (let i = 0; i < per; i++) {
          const verge = rng() < 0.6;
          const x = verge ? pick(rng, [1, -1]) * range(rng, 2.6, 4.4) : range(rng, -2.9, 2.9);
          p.set(x, 0.005, range(rng, 0.2, 29.8));
          e.set(0, rng() * Math.PI * 2, 0); q.setFromEuler(e);
          const k = range(rng, 0.8, 1.3); s.set(k, k, k);
          im.setMatrixAt(i, m.compose(p, q, s));
          litter++;
        }
        im.instanceMatrix.needsUpdate = true;
        im.computeBoundingSphere();
        chunk.add(im);
      }
    }
  }
  chunk.userData = { variant: B.variant.id, zone: B.variant.zone, cross: B.variant.cross, lights, litter, props: B.props, tris, placed: B.placed.length };
  return chunk;
}

/** Build one variant's chunk Group (baked). Called by track.js at init only. */
export async function buildVariant(ctx, variant) {
  if (variant.zone === 'expressway') return expressway(ctx, variant);
  if (variant.zone === 'rampUp' || variant.zone === 'rampDown') return ramp(ctx, variant);
  // 'day' is built by alley(): same street kit, daylight dressing
  return alley(ctx, variant);
}
