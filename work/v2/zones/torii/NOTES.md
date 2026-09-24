# Shrine path (zone `torii`, T0..T5) — notes

Reference: `refs/alpha/env_torii.png`. Gate: `node ../404-game-recipe/harness/verify.mjs work/v2/zones/torii --size=480`
→ 11/11 assets clean (`zone.js` shows as FAIL in the same run: the gate treats every `.js` as an asset; it is the
recipe, not an asset). Renders: `_verify/<name>.png`, first pass kept in `_verify/pass1/` for diffing.

## Assets

| asset | tris | size (w x h x d, m) | role |
|---|---|---|---|
| torii_path_chunk | 4692 | 9.05 x 0.23 x 30 | 30 m slab: flagstones (top y = 0.02), kerbs 3.0..3.3 (top 0.14), earth verges to 4.5 (top 0.10); mounts front/back |
| torii_gate | 3718 | 8.08 x 6.03 x 0.90 | pillars at x = +-3.6 (r 0.31), kasagi 7.5 wide, nuki at 4.45, rope + shide under it |
| stone_lantern_lit | 834 | 0.74 x 1.81 x 0.77 | emissive interior + candle, `userData.lights` 1 warm entry (0xf0a060, 1.2, range 4) |
| cedar_trunk | 1694 | 3.34 x 14.07 x 3.11 | 14 m trunk, root flare, 2 big + 3 small branch stubs |
| bamboo_clump | 3852 | 2.03 x 3.93 x 1.59 | 7 culms, ~200 leaves, stumps + a fallen culm |
| shrine_fox_statue | 1126 | 0.62 x 1.23 x 0.64 | seated kitsune on a plinth, red bib |
| talisman_rope | 2406 | 7.01 x 0.84 x 0.29 | authored along X; `userData.hangAt = 4.5`; placed at y = top - size.y + 0.03 |
| moss_boulder | 870 | 1.08 x 0.74 x 1.00 | noise-warped sphere, flat cut base, moss + lichen |
| fallen_log | 1206 | 1.94 x 1.05 x 1.02 | `obstacle {kind:'jump', lanes:1}`, lies along X across one lane |
| shrine_offering_box | 1448 | 1.91 x 1.90 x 1.12 | `obstacle {kind:'block', lanes:1}` |
| shimenawa_bar | 3388 | 1.92 x 1.61 x 0.17 | `obstacle {kind:'roll', lanes:1}`, base at ground, bar centred at 1.30, posts at +-0.88 |

Chunk cost (before the coarse bake): T0/T1/T2/T5 ≈ 85-90k, T3 ≈ 92k, T4 (thicket) ≈ 105k. All under 120k; every asset under 6k.
Materials: named from the contract list; emissive only on the lantern interior/candle (base 0x110f12, per STYLE.md).

## zone.js

`ZONE = { id:'torii', label:'shrine path', obstacles:{ jump:['fallen_log'], roll:['shimenawa_bar'], block:['shrine_offering_box'] }, height:0, lightsMood:'warm' }`
and `build(ctx, variant, H)`; matches the `ZONE_HELPERS` the integrator added to chunks.js. Also exports `VARIANTS` (T0..T5).

Placement: slab at (0, -ROAD_SURF, 15); gates at z 2.5 + 5k with alternating yaw jitter (0.012-0.035 rad) and every other one turned
by pi; lanterns every 4 m per side at |x| 4.15 (nudged >= 1.05 m off a pillar), windows facing the path, 16 practicals per chunk;
3-4 cedars per side at |x| 5.9-8.6, 3 bamboo at 4.9-6.8, 2-3 boulders at 4.55-5.4, all through a footprint check; three shide ropes
across at z 5/15/25 with rope ends 4.5-4.75 m up (paper bottoms >= 3.65 m). >= 16 props per side on every variant. Nothing inside
|x| < 3 below 2.4 m. Litter 6.

Variants: T0 plain · T1 fox pair flanking at z 15 · T2 gate slot 2 missing, boulders where its plinths stood, a rope over the gap ·
T3 wayside inari shrine on +x (three foxes, an offering box behind them as scenery, a boulder; lanterns z 13-17 dropped there) ·
T4 bamboo thicket (five clumps per side, cedars pulled in to 5.6-7.2) · T5 gatekeeper foxes at z 26.3, last gate leaning +0.05, extra
low rope at z 20 (4.4 m).

## Known weaknesses

- The board's gates are taller and closer together than 7.5 x 6 every 5 m; at the brief's size the tunnel is airier than the picture.
  The pillars at +-3.6 with a 0.31 m radius make the gate 8.08 m across (the kasagi is the 7.5 m); the expect file states the true box.
- No fox statue, offering box, fallen log or shimenawa bar is visible on the board; they were built from the brief's prompt in the
  board's materials (grey mossy stone, dark timber, straw, paper), not from a reference.
- Flagstones are boxes with flat colour; the wet look depends on the loader's 'stone'/'ground' surfaces and the practicals, as with
  alley_road_chunk. Moss is flat discs and squashed spheres, which reads at run distance but not close up.
- Cedars stop at 14 m with no canopy: the mist has to cover the top of frame, as in the board. If fog is thin the trunks end in the air.
- The stone lantern's roof is a 4-segment lathe with flat shading; the eave upturn is small. The candle is a cylinder behind the window.
- talisman_rope is a sliver from the side (coverage 0.5-0.6 %); it passes the empty-side test only because the shide are yawed.
- The shimenawa_bar's posts stand at the lane edges (|x| 0.88-0.95), not outside the 2 m lane as the strut's do at 1.1: the brief fixed
  it at 1.9 m wide. The roll hitbox starts at 1.3 m so the posts never collide; visually a runner in the adjacent lane brushes them.
- Not tested in the game (battery brief): the yaw jitter on gates, the rope heights and the lantern light density are by arithmetic.
