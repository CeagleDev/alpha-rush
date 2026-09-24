/**
 * zone.js — the SHRINE PATH (zone 'torii', variants T0..T5). Built from refs/alpha/env_torii.png:
 * a mossy flagstone path running through a tunnel of weathered vermilion torii, a lit stone lantern
 * every 4 m on both verges, cedar trunks and bamboo behind them, shide ropes across the path. Mist
 * is the game's job (lighting.js fog).
 *
 * Contract (ENV_BRIEF.md): `ZONE` and `build(ctx, variant, H)` where H = chunks.js ZONE_HELPERS
 * { Builder, pick, range, shuffle, faceRoad, finish, ROAD_SURF, ... }. Chunk-local: 30 m along +Z,
 * lanes at x = -2, 0, +2, running surface at y = 0. Nothing here crosses |x| < 3 below 2.4 m; the
 * three obstacles in ZONE.obstacles are placed by obstacles.js, never by this recipe.
 *
 * Layout (all deterministic from the variant's seed via B.rng):
 *   - torii_path_chunk at (0, -ROAD_SURF, 15): stone tops at y = 0, kerb 3.0..3.3, earth verge to 4.5
 *   - torii_gate every 5 m (z 2.5 .. 27.5), pillars at x = +-3.6; alternating yaw jitter, and every
 *     other one turned by pi so its flaked/faded patches and tassels show on the other face
 *   - stone_lantern_lit every 4 m per side at |x| = 4.15, nudged along z off any pillar, open
 *     windows turned to the path (faceRoad); each carries a userData.lights entry
 *   - cedar_trunk x3-4 per side at |x| 5.9..8.6, bamboo_clump x3 (x6 on T4) at |x| 4.9..6.8,
 *     moss_boulder x2-3 per side at |x| 4.55..5.4 — all placed with a footprint check so nothing
 *     stands through a lantern or a pillar
 *   - talisman_rope across the path at z 5, 15, 25, rope ends 4.5-4.75 m up (paper bottoms >= 3.65)
 * Variants: T0 plain · T1 a fox pair flanking the path at z 15 · T2 a gate missing from slot 2
 * (boulders where its plinths stood) · T3 a wayside inari shrine on one side (three foxes, an
 * offering box behind them, a boulder; the lanterns there dropped) · T4 a bamboo thicket (five
 * clumps per side, cedars pulled in) · T5 gatekeeper foxes before the last gate, the last gate
 * leaning, an extra low rope.
 */
export const ZONE = {
  id: 'torii',
  label: 'shrine path',
  obstacles: { jump: ['fallen_log'], roll: ['shimenawa_bar'], block: ['shrine_offering_box'] },
  height: 0,
  lightsMood: 'warm',
};

const FEATURES = ['plain', 'fox_pair', 'gap', 'wayside_shrine', 'thicket', 'gatekeepers'];
export const VARIANTS = FEATURES.map((feature, i) => ({ id: `T${i}`, zone: 'torii', cross: 0, feature }));

const GATE_Z = [2.5, 7.5, 12.5, 17.5, 22.5, 27.5];
const LANTERN_Z = [1, 5, 9, 13, 17, 21, 25, 29];
const PILLAR_X = 3.6, LANTERN_X = 4.15, ROPE_Z = [5, 15, 25];
// the verge earth top is 0.10 in the slab (0.08 in chunk space); verge props stand 2 cm into it
const VERGE_Y = 0.06;

export async function build(ctx, variant, H) {
  const { Builder, pick, range, shuffle, faceRoad, finish, ROAD_SURF } = H;
  const B = new Builder(ctx, variant), rng = B.rng;
  const n = Number(String(variant.id).slice(1)) || 0;
  const feature = variant.feature || FEATURES[n % 6];
  // footprints already on the verges, so nothing is put through a pillar, a lantern or a fox
  const busy = [];
  const clear = (x, z, r) => busy.every(([bx, bz, br]) => Math.hypot(bx - x, bz - z) >= br + r);
  const claim = (x, z, r) => busy.push([x, z, r]);
  const tryPut = async (name, x, z, r, ry, y = VERGE_Y) => {
    if (!clear(x, z, r)) return false;
    await B.put(name, x, y, z, ry); claim(x, z, r); return true;
  };

  await B.put('torii_path_chunk', 0, -ROAD_SURF, 15);

  // ---- gates every 5 m
  for (let k = 0; k < GATE_Z.length; k++) {
    const z = GATE_Z[k];
    if (feature === 'gap' && k === 2) {
      // the fallen gate: two boulders where its plinths stood
      for (const s of [1, -1]) await tryPut('moss_boulder', s * 3.9, z + range(rng, -0.3, 0.3), 0.6, rng() * Math.PI * 2, 0);
      continue;
    }
    let ry = (k % 2 ? 1 : -1) * range(rng, 0.012, 0.035);
    if ((k + n) % 2) ry += Math.PI;
    if (feature === 'gatekeepers' && k === 5) ry += 0.05;
    await B.put('torii_gate', 0, 0, z, ry);
    for (const s of [1, -1]) claim(s * PILLAR_X, z, 0.5);
  }

  // ---- the odd variants' one distinctive feature (placed before the lanterns so they take the room)
  const shrineSide = n % 4 === 3 ? 1 : -1;
  if (feature === 'fox_pair') {
    for (const s of [1, -1]) { await tryPut('shrine_fox_statue', s * 4.1, 15, 0.4, faceRoad(s), 0.02); B.props++; }
  } else if (feature === 'wayside_shrine') {
    const s = shrineSide;
    for (const z of [13.6, 15, 16.4]) { await tryPut('shrine_fox_statue', s * 4.05, z, 0.4, faceRoad(s) + range(rng, -0.1, 0.1), 0.02); B.props++; }
    await tryPut('shrine_offering_box', s * 5.65, 15, 1.1, faceRoad(s), 0); B.props++;
    await tryPut('moss_boulder', s * 5.1, 12.3, 0.6, rng() * 3, 0); B.props++;
  } else if (feature === 'gatekeepers') {
    for (const s of [1, -1]) { await tryPut('shrine_fox_statue', s * 4.1, 26.3, 0.4, faceRoad(s), 0.02); B.props++; }
  }

  // ---- lanterns every 4 m, both sides, windows to the path, nudged off any pillar
  for (const s of [1, -1]) {
    let count = 0;
    for (let z of LANTERN_Z) {
      if (feature === 'wayside_shrine' && s === shrineSide && z >= 13 && z <= 17) continue;
      for (const gz of GATE_Z) { const d = z - gz; if (Math.abs(d) < 1.05) z = gz + (d < 0 ? -1.05 : 1.05); }
      const x = s * (LANTERN_X + range(rng, -0.04, 0.04)), zz = z + range(rng, -0.12, 0.12);
      if (await tryPut('stone_lantern_lit', x, zz, 0.42, faceRoad(s) + range(rng, -0.05, 0.05))) count++;
    }
    B.props += count;
  }

  // ---- the wood behind: cedars, bamboo, boulders
  const thicket = feature === 'thicket';
  for (const s of [1, -1]) {
    let count = 0;
    const cz = shuffle(rng, [2.5, 10, 18, 26]).slice(0, thicket ? 4 : 3);
    for (const z0 of cz) {
      const x = s * range(rng, thicket ? 5.6 : 5.9, thicket ? 7.2 : 8.6), z = z0 + range(rng, -2, 2);
      if (await tryPut('cedar_trunk', x, z, 1.3, rng() * Math.PI * 2, 0)) count++;
    }
    for (let i = 0, tries = 0; i < (thicket ? 5 : 3) && tries < 30; tries++) {
      const x = s * range(rng, 4.9, 6.8), z = range(rng, 0.8, 29.2);
      if (await tryPut('bamboo_clump', x, z, 0.8, rng() * Math.PI * 2, 0)) { i++; count++; }
    }
    const nb = 2 + Math.floor(rng() * 2);
    for (let i = 0, tries = 0; i < nb && tries < 30; tries++) {
      const x = s * range(rng, 4.55, 5.4), z = range(rng, 0.6, 29.4);
      if (await tryPut('moss_boulder', x, z, 0.6, rng() * Math.PI * 2, 0)) { i++; count++; }
    }
    B.props += count;
  }

  // ---- ropes of shide across the path (authored along X: no rotation), ends 4.5-4.75 m up
  const rope = await B.size('talisman_rope');
  const ropeZ = feature === 'gap' ? [5, 12.5, 25] : ROPE_Z.slice();
  if (feature === 'gatekeepers') ropeZ.push(20);
  for (const z of ropeZ) {
    const top = z === 20 ? 4.4 : 4.5 + range(rng, 0, 0.25);
    await B.put('talisman_rope', 0, top - rope.y + 0.03, z + range(rng, -0.4, 0.4), 0);
  }

  void pick;
  return finish(ctx, B, 6);
}
