# Rooftops zone (R0..R5) — notes

Board: `refs/alpha/env_rooftops.png`. Directory: `work/v2/zones/rooftops/`. Verify: `node ../404-game-recipe/harness/verify.mjs work/v2/zones/rooftops --size=480`
(12/12 assets clean; the run also lists `zone` as FAIL "did not return an Object3D" because the recipe module sits in the same
directory and the gate treats every .js as an asset — it is not one).

## Assets (name, tris, size w x h x d in m)

| asset | tris | size | role |
|---|---|---|---|
| rooftop_deck_chunk | 5832 | 21.2 x 7.9 x 30 | the 30 m chunk: tar-and-gravel roof 6 m wide, 1.5 x 0.9 m parapet ledges, the building's outer faces (2 storeys of lit windows, AC boxes, balconies, downpipes) down to the street, a 2.5 m alley gap each side, three neighbour blocks per side (tops 3.8..7.6 m, windows facing the road). Base at street; ROOF SURFACE AT LOCAL 6.02 |
| plank_bridge | 1368 | 2.0 x 0.23 x 4.0 | plank walkway on two channel joists, warped/split/missing planks, moss |
| neon_billboard | 1320 | 3.3 x 3.3 x 2.2 | 3 x 2 magenta panel (cyan blobs, neon border, no text) on a braced post frame with catwalk and dead floods; magenta light |
| rooftop_hut | 1092 | 2.7 x 2.5 x 2.9 | stair-head hut, pitched tin roof, blue steel door, lit barred window, bulkhead lamp, vent; 2 warm lights |
| satellite_dish | 1324 | 1.24 x 1.8 x 1.05 | 1.2 m lathed dish, LNB on three struts, tilt clamp on a post, coax |
| vent_stack | 596 | 0.96 x 1.6 x 0.67 | pipe on a curb with flashing, cowl on struts, two guy braces, soot |
| neon_sign_vertical | 632 | 0.45 x 2.55 x 0.34 | 2.5 m cyan strip sign, abstract strokes, brackets; mounts back; cyan light |
| roof_water_tank | 1992 | 1.5 x 2.35 x 1.7 | rooftop_water_tank family at 2.4 m with a fixed ladder up the +z side |
| laundry_span | 1376 | 6.7 x 2.9 x 0.5 | ADDED (not in the list): two posts at x = ±3.2 with a sagging line and nine pegged pieces — the board's washing lines across the roof. Hems >= 2.05 above the post feet; placed on the 0.9 m ledges so hems are >= 2.95 over the roof |
| ac_unit_low (jump) | 2696 | 1.94 x 1.01 x 0.93 | outdoor condenser on a plinth, twin fan grilles facing +Z, louvres, two coiled hoses. `userData.obstacle = {kind:'jump', lanes:1}` |
| roof_tank_block (block) | 2760 | 1.87 x 2.24 x 1.16 | horizontal tank on a braced cradle, a slat crate between the legs so nothing is see-through. `{kind:'block', lanes:1}` |
| laundry_rail (roll) | 1624 | 2.14 x 1.53 x 0.24 | rail at 1.3 m between posts at x = ±0.95 (foot plates to ±1.07), sheet/towels folded over it, shirt and jeans on hangers, a mop; hems >= 0.78. Base-at-ground. `{kind:'roll', lanes:1}` |

Per chunk (dry-run with the verifier's sizes): 33–43 placements, 29–35 props outside |x| >= 3.05 (14–19 per side), 53k–72k
triangles before the coarse bake (deck 6k, ledge props ~1.5k each, cable_span counted at 2.4k).

## zone.js

`ZONE = { id:'rooftops', label:'rooftops', obstacles:{ jump:['ac_unit_low'], roll:['laundry_rail'], block:['roof_tank_block'] }, height:6, lightsMood:'neon' }`.
`build(ctx, variant, H)` places the deck at `(0, -(DECK_Y + ROAD_SURF), 15)` — the deck is authored base-at-street because the
contract/verifier require y = 0 at the lowest point, so it is pulled down 6.02 exactly as the expressway deck is pulled down by
DECK_Y; its roof surface lands on chunk y = 0. Then: ledge props on y = 0.9 in the band |x| 3.05..4.5 (15 slots of 2 m, an
overlap check, wide things overhang the OUTER edge over the gap); neighbour-roof props on the block tops (NEIGHBOUR table −
6.02, x 7..10, billboards/huts/dishes faced to the road); cyan strip signs on the road-facing walls of the two blocks that
stand above the roof; 2–3 laundry_spans (posts on the ledges) and 3–4 cable_spans at 4.6+ m overhead; `finish(ctx, B, 24)`.
Nothing but the game's obstacles enters |x| < 3 below 2.4 m (checked by a mock-Builder dry run over all six variants).

## The six variants
- R0 / R2 / R4: the standard mix; the side that carries the huts and the extra billboard flips (n % 4 < 2 → +x, else −x).
- R1 "washing day": five laundry_spans in a row (z 3..23) and only low props on the feature ledge so the cloth reads.
- R3 "tank farm": four roof_water_tanks in a row down one ledge (plus the neighbour roofs' own).
- R5 "dish array": six satellite dishes clustered on one ledge, a pair of cyan strip signs on that side's tall block.

## Emissives / lights
Windows use 0xe3c58c warm and 0x9accf2 cool over near-black (NOT the lightbox creams, which chunks.js would swap for sign
sprites). Practicals: deck 4 (tall-block windows), billboard 1 magenta, strip sign 1 cyan, hut 2 warm; obstacles none.

## Known weaknesses
- The deck's neighbour blocks are simple boxes with windows; no fire escapes or rooftop pipework of their own, and the
  street 6 m below is a flat dark plane (only glimpsed through the 2.5 m gaps).
- Low neighbour roofs (1–2.2 m below ours) are largely hidden behind the 0.9 m ledge from the runner's camera; what shows of
  them is the tall things (huts, billboards, tanks). The two blocks above roof height carry the signs and the enclosure.
- laundry_rail is 2.14 m over the foot plates (posts at ±0.95, the game clamps the hitbox to ±0.95 anyway); the brief's
  1.9 m would have put a post inside the lane edge.
- The dashed centre line is faint on purpose (the board has it; the alley critic disliked lane markings).
- Not run in the game (battery brief): placements were checked with a mock Builder only; the light pool with four
  window lights + signs + huts is untested for churn.
- neon_billboard is one look (magenta face, cyan blobs); the board's cyan panels are represented by the strip signs.
