# Asset manifest — the names every agent codes against (game/assets/<name>.js, contract in 404-game-recipe/docs/asset-contract.md)

Every asset: `export default function (THREE) { return group }`, metres, base y=0, centred x/z, front +Z, materials named from the
contract list, emissive parts per STYLE.md, and `group.userData.lights = [{x,y,z,color,intensity,range}]` on anything that emits
(coordinates in the asset's own space, before the loader recentres — the level applies the loader's offset). Sizes in STYLE.md.
A `<name>.expect.json` sits beside each with width/height/depth. Reference image: refs/objects/<ref>.png.

## Characters — loaded with { keepHierarchy: true }, merged per joint by the game. Pivots AT the joints (geometry as a child offset
## inside a parent placed at the joint). Rest pose: standing, facing +Z, arms slightly out. `userData.joints` = the map below.
| file | ref | joints (exact keys) |
|---|---|---|
| runner.js | runner | hips, spine, chest, neck, head, l_shoulder, l_elbow, r_shoulder, r_elbow, l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle |
| dog_shiba.js / dog_spitz.js / dog_mutt.js | dog_shiba / dog_spitz / dog_mutt | spine, neck, head, tail, fl_hip, fl_knee, fr_hip, fr_knee, bl_hip, bl_knee, br_hip, br_knee |
Joint hints (write them into `userData.jointHints` like the example soldier): a downward limb pitched by +rotation.x swings BACKWARD.

## Pickup
| tau_coin.js | tau_coin (gold look only) | glyph = refs/logo/tao_symbol.png traced to a THREE.Shape (curves, ≤ 40 commands), extruded 6 mm proud on BOTH faces, mirrored correctly on the back |

## Obstacles — `userData.obstacle = { kind:'jump'|'roll'|'block', lanes:1|2|3 }` (lanes = how many lanes wide it is placed)
| file | ref | kind |
|---|---|---|
| crate_stack.js | crate_stack | jump |
| cooler_bin.js | cooler_bin | jump |
| fallen_bicycle.js | fallen_bicycle | jump |
| roadworks_barrier.js | roadworks_barrier (batch 3) | jump (expressway) |
| banner_cluster_low.js | banner_cluster_low (batch 3) | roll — hangs from a rope at 3.2 m down to 1.3 m clearance |
| awning_strut_low.js | awning_strut_low (batch 3) | roll — a scaffold pole across a lane at 1.3 m |
| gantry_board_low.js | gantry_board_low (batch 3) | roll (expressway) |
| kei_van.js | kei_van (NO maker's badge) | block |
| yatai_cart.js | yatai_cart | block |
| vending_machine.js | vending_machine | block in lane / prop on verge |
| concrete_divider.js | concrete_divider (batch 3) | block (expressway) |
| parked_sedan.js | parked_sedan | block |

## Alley scenery
shophouse_a.js shophouse_b.js shophouse_c.js shophouse_d.js (corner, two lit faces) · utility_pole.js · cable_span.js (batch 3: a 30 m
bundle of 3–5 catenaries, TubeGeometry, endpoints at x=±4.5, y 5.0–6.5) · paper_lantern.js · lantern_string.js · noren_string.js ·
wall_lightbox.js · standing_lightbox.js · tin_awning.js · ac_duct_cluster.js · bins_bags.js · litter_set.js (batch 3: children named
`paper`, `cup`, `can`, `bag` — the level instances them) · alley_road_chunk.js (batch 3: 30 × 9 m slab: 6 m wet road + 1.5 m verges,
gutters, one manhole, two puddle planes at roughness 0.18)

## Expressway
expressway_deck.js (batch 3: 30 × 6 × 0.8, 1 m upstands, 3 m sound panels both sides) · sodium_lamp.js · sign_gantry.js (green boards, lit
shape) · guard_rail.js (4 m) · ramp_chunk.js (30 m, rises 0 → 6 m; the level mirrors it for the down ramp)

## Detail set (batch 4, verge clutter; small, ≤ 1,500 tris each)
bicycle_parked.js scooter.js beer_keg.js gas_cylinders.js umbrella_stand.js laundry_line.js menu_board.js plant_pots.js cardboard_boxes.js
ashtray_stand.js traffic_mirror.js road_cones.js post_box.js electrical_box.js vertical_sign.js stool_table_set.js rooftop_water_tank.js
tv_antenna.js fire_ext_box.js drink_cases.js

## Chunk recipes (E1 builds these from the assets above; see ARCH.md)
alley A/B chunk = alley_road_chunk + 6 shophouse slots per side at x = ±(3 + 3.0) facing the road (units are 6 m deep, so their front
face sits on the verge line x = ±3) + tin awnings + ≥ 12 verge props per side + 1 utility pole per side + 3 cable spans + 1 lantern or
noren string across + litter (≥ 40 instances) · every other chunk: a 4 m cross-street gap on one side ending in a lit sign cluster.
expressway chunk = expressway_deck + sodium lamps every 15 m alternating sides + 1 sign gantry per 2 chunks + guard rails + dividers.
