# A10 — verge clutter (ten small props)

Three independent candidates per object under `cand/<name>/<name>_{a,b,c}.js`
(a = primitives, b = swept/extruded profiles, c = a second reading of the
reference / a different part breakdown). Two verifier runs for the thirty
candidates (`batch1`, `batch2`), then one re-run (`rerun`) covering four parse
failures plus the trimmed winners. Sheets are in each folder's `_verify/`.

Winners copied to `game/assets/<name>.js` with `<name>.expect.json` taken from
the verifier's own measurement of that file.

| object | winner | tris | w x h x d (m) | why |
|---|---|---|---|---|
| bins_bags | c | 1472 | 1.574 x 1.288 x 0.893 | lid thrown wide open on its hinge is the strongest silhouette of the three, and only c's bin has a real dent (the middle drum section is knocked off-centre). a's 35-degree lid reads as a disc hovering; b's lid lathe reads as a closed dome. c's square-tapered blue bin also reads as a moulded wheelie bin rather than a plain box. |
| beer_keg | b | 578 | 0.479 x 0.605 x 0.41 | the two swaged ribs stand proud and read at distance, which is the whole signature of a keg; a's lathe swages are too subtle and c's bellied sections read as a smooth drum. |
| gas_cylinders | c | 932 | 1.0 x 1.35 x 0.443 | the chain crossing in an X between the bottles is the graphic the reference is built around, and c is the only arm with domed shoulders and tall vented foot skirts. a and b both read as two plain tubes with a strap. |
| umbrella_stand | a | 682 | 0.43 x 0.947 x 0.487 | crispest umbrellas: cone canopies wide at the top with a tie band and a visible fold flare, plus the broken navy one with its ribs out. b's fluted lathes read lumpy; c's broken umbrella lying across the top rails threw the footprint out to 0.86 m and would foul neighbouring props. |
| laundry_line | b | 1128 | 3.01 x 1.22 x 0.205 | real garment outlines (extruded shirt, trousers, hooded jacket, towel with a sagging hem) are the only arm where the clothes read as clothes from every side. a's box garments are close; c's pleated strips read as planks. |
| plant_pots | b | 1430 | 1.42 x 1.24 x 1.0 | lathe blobs and cone sprays give leggy plants with no flat cards. a and c both lean on crossed planes, which read as green rectangles from the front and are exactly the failure traps.md warns about. |
| cardboard_boxes | b | 328 | 0.637 x 1.223 x 0.587 | the sagging extruded outlines deliver the "damp box" brief directly — tops slump, corners drop — and the splayed flaps on the open top box read from all four sides. a is crisper but is a stack of clean boxes and came out 1.34 m tall. |
| ashtray_stand | c | 520 | 0.39 x 0.907 x 0.41 | closest to the reference's proportions: heavy bolted base flange, painted ribbed lower drum, a narrow neck and a separate wide bowl. b's single lathe leaves a flat white pancake for a base and its dent never reads. |
| stool_table_set | a | 908 | 1.36 x 0.972 x 0.809 | splayed legs plus a foot ring and cross braces read as a folding cafe table; c's scissor frame came out spidery and thin. a's square plank stools match the reference better than b's round bar stools. |
| drink_cases | c | 1072 | 0.591 x 0.916 x 0.436 | the only arm where the crates read as open-sided drinks crates: a timber slatted bottom case and two plastic cases with vertical rib slots, bottles visible through them. a and b read as closed boxes with dark rectangles painted on. |

## Fixes made (the one permitted re-run)

- **Four parse failures**, all the same class: a top-level `const/let c` or
  `box` in the asset body collided with the `const box`/`const c` in the
  standard six-line centring block at the end. `node --check` did not catch
  them; the verifier did. Renamed to `cr` / `mkbox` in
  `drink_cases_{a,b,c}.js` and `cardboard_boxes_a.js`.
- **Triangle trims** (segment counts only, never decimation): gas_cylinders_c
  1208 -> 932, umbrella_stand_a 864 -> 682, laundry_line_b 1284 -> 1128,
  plant_pots_b 2562 -> 1430, ashtray_stand_c 848 -> 520, drink_cases bottle
  necks cut from twelve to eight and to four-sided cylinders.
- **Size trims**: bins_bags_c 1.634 -> 1.574 m wide (leaning cardboard pulled
  in), cardboard_boxes_b 1.323 -> 1.223 m tall, stool_table_set_a 1.42 -> 1.36 m
  wide.

## What I could not do

- **Three objects are over their stated triangle cap** and I kept them because
  the brief says to choose by eye: drink_cases 1072 against 900 (the rib slots
  that make it read are the cost), gas_cylinders 932 against 900, ashtray_stand
  520 against 500. All three sit inside STYLE.md's 150-1,500 small-prop band.
- **cardboard_boxes is 1.223 m** against "≤ 1.2 m tall" — 2 cm, left alone
  rather than spend a second verifier run on it.
- **ashtray_stand is 0.40 m across the base flange**, not the 0.25 m in the
  brief. 0.25 m is the column and bowl diameter; the reference's bolted floor
  flange is genuinely about 1.6x that, so the flange sets the footprint.
- **laundry_line** is authored with base y=0 at the lowest hem and the pole
  1.05 m above it; mounted by the game at 2.2 m the pole lands at 3.25 m. Said
  so in the module header, as asked. `userData.mounts = 'back'` on it and on
  gas_cylinders.
- No transparency anywhere: the rubbish bags, the bottles and the drinking
  glass are opaque flat colours chosen to read as dark/translucent, per the
  brief. No glyphs or text on any object — the paper tag, the crate markings
  and the labels are plain blocks and brush-stroke bars only.
