/**
 * zone.js — the ROOFTOPS zone (variants R0..R5), built from refs/alpha/env_rooftops.png.
 *
 * Chunk space: the roof surface is y = 0, lanes at x = -2/0/+2, 30 m along +Z. The chunk group is
 * placed at world y = 6 (ZONE.height) like the expressway, so the ramps meet it. Everything here is
 * authored against the roof surface:
 *   - rooftop_deck_chunk is base-at-street (the contract's y = 0 rule) with its roof surface at
 *     local 6.02, so it is put at y = -(DECK_Y + ROAD_SURF) = -6.02, the same trick the
 *     expressway uses (deck at -DECK_Y). The 0.9 m parapet ledges then top out at y = 0.9 for
 *     |x| 3.0..4.5, and the neighbouring blocks across the 2.5 m gap (|x| 7..10) have their roofs
 *     at NEIGHBOUR[side][segment] - 6.02 (see the table: two of the six stand above the roof).
 *   - ledge props stand on y = 0.9 in the band |x| 3.05..4.5 (props wider than the band overhang
 *     the OUTER edge, over the gap, never the lane); neighbour-roof props stand on their tops.
 *   - overhead: laundry_span posts stand on the ledges (y = 0.9) with every hem >= 2.95 above the
 *     roof; cable_span bundles at 4.6+ like the alley.
 * Nothing placed here enters |x| < 3 below 2.4 m; the obstacles come from ZONE.obstacles and the
 * game places them. Variants: even = the standard mix (which side carries the huts and billboards
 * flips); odd = one distinctive feature each — R1 a washing-day roof (five laundry spans in a row),
 * R3 a tank farm (a row of four water tanks down one ledge), R5 a dish array (six dishes clustered
 * on one ledge under a pair of cyan signs).
 */
export const ZONE = {
  id: 'rooftops',
  label: 'rooftops',
  obstacles: { jump: ['ac_unit_low'], roll: ['laundry_rail'], block: ['roof_tank_block'] },
  height: 6,
  lightsMood: 'neon',
};

// neighbour block tops, base space (the asset's y = 0 is the street), per side and 10 m segment
const NEIGHBOUR = { 1: [4.6, 7.6, 3.8], '-1': [7.2, 4.2, 5.0] };
const DECK_SURF = 6.02;        // roof surface height inside rooftop_deck_chunk
const LEDGE = 0.9;             // ledge top over the roof
const LEDGE_IN = 3.05;         // inner edge of the prop band on the ledge
const NB_X = 8.5;              // neighbour roof centre |x| (7..10)

// what stands on the ledges: [name, rotation kind, footprint across x when so rotated]
// 'road' = faceRoad(s) (front toward the lane), 'along' = long axis along z
const LEDGE_PROPS = [
  ['satellite_dish', 'road'], ['satellite_dish', 'road'], ['vent_stack', 'road'], ['vent_stack', 'road'],
  ['roof_water_tank', 'road'], ['ac_unit_low', 'along'], ['ac_unit_low', 'along'], ['plank_bridge', 'along'],
  ['plank_bridge', 'along'], ['roof_tank_block', 'along'], ['laundry_rail', 'along'], ['satellite_dish', 'road'],
];
const NB_PROPS = ['rooftop_hut', 'neon_billboard', 'roof_water_tank', 'satellite_dish', 'vent_stack', 'ac_unit_low', 'rooftop_hut', 'satellite_dish'];

export async function build(ctx, variant, H) {
  const { Builder, pick, range, shuffle, faceRoad, finish, ROAD_SURF, DECK_Y } = H;
  const B = new Builder(ctx, variant), rng = B.rng;
  const n = Number(variant.id.slice(1)) || 0;
  const odd = n % 2 === 1;
  const featureSide = n % 4 < 2 ? 1 : -1;            // which side carries the variant's feature / huts
  const nbTop = (s, z) => NEIGHBOUR[s][Math.min(2, Math.floor(z / 10))] - DECK_SURF;

  // 1. the roof itself (surface at local 6.02 → chunk y = 0)
  await B.put('rooftop_deck_chunk', 0, -((DECK_Y ?? 6) + ROAD_SURF), 15);

  // 2. ledge dressing, both sides: 15 slots at 2 m, ≥ 10 used per side
  const used = { 1: [], '-1': [] };
  const ledgeSlot = async (s, name, kind, z) => {
    const sz = await B.size(name);
    const across = kind === 'along' ? sz.x : (sz.z > 0.05 ? sz.z : 0.5);   // when faced to the road the asset's z runs across x
    const spanZ = kind === 'along' ? sz.z : sz.x;
    const x = s * (LEDGE_IN + Math.max(across, 0.4) / 2 + (across < 1.0 ? rng() * (1.0 - across) : 0));
    const ry = kind === 'along' ? (rng() < 0.5 ? 0 : Math.PI) : faceRoad(s);
    await B.put(name, x, LEDGE, z, ry);
    used[s].push([z - spanZ / 2, z + spanZ / 2]);
    B.props++;
  };
  const free = (s, z, half) => used[s].every(([a, b]) => z + half < a - 0.15 || z - half > b + 0.15);

  for (const s of [1, -1]) {
    let names = shuffle(rng, LEDGE_PROPS);
    // the odd variants' features take one ledge over
    if (odd && s === featureSide) {
      if (n === 1) names = [['satellite_dish', 'road'], ['vent_stack', 'road'], ['satellite_dish', 'road'], ['vent_stack', 'road'], ['ac_unit_low', 'along'], ['roof_water_tank', 'road'], ['vent_stack', 'road'], ['satellite_dish', 'road']];   // R1: laundry day — low things only, so the washing reads
      if (n === 3) { for (const z of [3.5, 9.5, 15.5, 21.5]) await ledgeSlot(s, 'roof_water_tank', 'road', z); names = [['vent_stack', 'road'], ['plank_bridge', 'along'], ['satellite_dish', 'road']]; }
      if (n === 5) { for (const z of [4, 6, 8, 10, 12, 14]) await ledgeSlot(s, 'satellite_dish', 'road', z); names = [['ac_unit_low', 'along'], ['plank_bridge', 'along'], ['vent_stack', 'road']]; }
    }
    const slots = shuffle(rng, [...Array(15).keys()]);
    let k = 0;
    for (const slot of slots) {
      if (k >= names.length) break;
      const [name, kind] = names[k];
      const sz = await B.size(name);
      const half = (kind === 'along' ? sz.z : sz.x) / 2;
      const z = Math.min(29.5 - half, Math.max(0.5 + half, 1 + slot * 2 + range(rng, -0.4, 0.4)));
      if (!free(s, z, half)) continue;
      await ledgeSlot(s, name, kind, z);
      k++;
    }
  }

  // 3. the neighbour roofs across the gap: 3 segments per side, 1-3 props each; the tall blocks
  //    (roof above ours) carry the high billboards and the cyan strip signs on their faces
  for (const s of [1, -1]) {
    for (let seg = 0; seg < 3; seg++) {
      const top = nbTop(s, seg * 10 + 5), z0 = seg * 10 + 0.4, z1 = seg * 10 + 9.6;
      const tall = top > 0;
      const list = shuffle(rng, NB_PROPS).slice(0, 2 + (rng() < 0.5 ? 1 : 0));
      const wantBill = tall || (s === featureSide && seg === 1) || rng() < 0.3;
      if (wantBill && !list.includes('neon_billboard')) list[0] = 'neon_billboard';
      if (!tall && s === featureSide && !list.includes('rooftop_hut')) list[1] = 'rooftop_hut';
      let z = z0 + 1.0;
      for (const name of list) {
        const sz = await B.size(name);
        const facing = name === 'neon_billboard' || name === 'rooftop_hut' || name === 'satellite_dish';
        const len = facing ? sz.x : sz.z;                          // along z once faced to the road
        if (z + len > z1) break;
        const x = s * (NB_X + range(rng, -0.4, 0.4));
        await B.put(name, x, top, z + len / 2, facing ? faceRoad(s) : rng() * Math.PI * 2);
        B.props++;
        z += len + range(rng, 0.6, 1.6);
      }
      if (tall) {
        // cyan strip signs on the road-facing wall, hanging off the parapet line
        const sg = await B.size('neon_sign_vertical');
        const d = sg.z > 0.05 ? sg.z : 0.3;
        const count = (n === 5 && s === featureSide) ? 2 : 1;
        for (let i = 0; i < count; i++) await B.put('neon_sign_vertical', s * (7.0 - d / 2), top - 2.4 - i * 0.2, z0 + 2.5 + i * 4.5 + range(rng, 0, 2), faceRoad(s));
        B.props += count;
      }
    }
  }
  // 4. overhead: laundry across the roof between the ledges, and the cable bundles
  const spans = n === 1 ? [3, 8, 13, 18, 23] : [range(rng, 4, 10), range(rng, 15, 22)].concat(rng() < 0.5 ? [range(rng, 25, 28)] : []);
  for (const z of spans) await B.put('laundry_span', 0, LEDGE, z, 0);
  const cableZ = odd ? [6, 17, 26] : [4, 11, 20, 27];
  for (let i = 0; i < cableZ.length; i++) await B.put('cable_span', [-0.3, 0.2, 0.35, -0.1][i], 4.6 + (i % 3) * 0.5, cableZ[i], 0);

  return finish(ctx, B, 24);
}
