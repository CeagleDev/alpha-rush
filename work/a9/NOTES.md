# A9 — track-scale assets: winners, and the mounting conventions track.js must use

Six objects, three candidates each under `work/a9/cand/<name>/`, one verifier run over all
eighteen at once (`work/a9/cand/_all/_verify/`) and one re-run over the six winners after
trimming (`work/a9/cand/_win/_verify/`). Winners copied to `game/assets/<name>.js` with an
`expect.json` beside each.

---

## THE ONE THING THAT WILL BREAK INTEGRATION IF IT IS NOT READ

**`expressway_deck.js` is placed at y = 0, not at y = 5.2.**

The brief said "a 30 × 6 × 0.8 m deck, top at y = 0.8, the game places it at y = 5.2", and in the
same sentence asked for "three concrete piers underneath". Those cannot both hold: an asset whose
base is at y = 0 (the contract) and whose top is at 0.8 has nowhere to put a pier, and a deck
placed at 5.2 would need its piers to hang 5.2 m below its own origin. The reference image settles
it — deck and piers are one object standing on the street.

So the asset contains its piers, is **10.04 m tall**, and its base y = 0 is **the pier feet at
street level**. Place it at y = 0 exactly like the alley chunk. The running surface then lands at
y = 6.0 on its own, which is the number the rest of the game was designed around.

Same for `ramp_chunk.js`: base y = 0 is the foot of the ramp at street level, placed at y = 0.

Every chunk asset in this set is placed at **y = 0**. Nothing needs a vertical offset except
`cable_span.js`.

---

## Mounting conventions, per asset

| asset | place at | running surface | notes |
|---|---|---|---|
| `alley_road_chunk.js` | (0, 0, chunk centre) | **y = 0.02** | 9 m wide × 30 m. Carriageway x = ±3. Kerb/verge top y = 0.14. |
| `expressway_deck.js` | (0, **0**, chunk centre) | **y = 6.0** | deck underside 5.2, upstand top 7.0, sound-panel top 10.0 |
| `ramp_chunk.js` | (0, 0, chunk centre) | **y = 0.2·(z_local + 15) + 0.02** | 0.02 at z = −15, 6.02 at z = +15 |
| `cable_span.js` | (0, **4.5**, chunk centre) | — | lowest cable then at y = 4.5, highest endpoint 6.68 |
| `litter_set.js` | on the surface (y = 0.02 in the alley) | — | instance the named children, not the group |
| `road_cones.js` | on the surface (y = 0.02 in the alley) | — | verge prop / lane dressing |

### Details the track code needs

**alley_road_chunk** — 9.0 × 0.15 × 30.0 m, `userData.chunk = 'alley'`. Base y = 0 is the road
slab's *underside*; the wet asphalt top is at **y = 0.02**, so the player runs at y ≈ 0.02 (call it
0). Carriageway is 6 m, x = −3 … +3. The gutter strip runs x = 3.0–3.35, the kerb face is at
x = ±3.35 and its top at **y = 0.14**, and the paved verge runs to x = ±4.5 at the same 0.14. So a
shophouse standing on the verge line sits at x = ±4.5 on a floor of 0.14, and a prop standing on
the verge is placed at y = 0.14, not 0. Tiles exactly: depth is 30.000 m, and the centre-line
dashes were moved so none overhangs the chunk joint.

**expressway_deck** — 7.1 × 10.04 × 30.0 m, `userData.chunk = 'expressway'`. Clear road between the
upstands is 6.0 m (x = −3 … +3); the deck slab is 6.6 m and the widest point (7.1 m) is the
drainage scuppers poking out of the fascia. Upstand inner face x = ±3.0, coping top y = 7.0, sound
panels from 7.0 to 10.0. Piers at local z = −10, 0, +10 — twin columns at x = ±2.0 with a crossbeam,
so a sodium lamp or gantry leg must avoid those three stations. One 6 cm detail: the sound-wall post
at z = −15 overhangs the chunk joint by 0.06 m; it abuts the neighbouring deck rather than doubling
a post, because the post at +15 was deliberately dropped so that tiled chunks give one post every
5 m and not two back to back.

**ramp_chunk** — 6.54 × 6.56 × 30.0 m, `userData.chunk = 'ramp'`, `userData.rise = 6`. Grade is a
constant 1:5 (11.31°, `atan(0.2)`) with no easing at either end, so the camera pitch and the
player's foot IK can use that constant directly. The running surface is
**y = 0.2·(z_local + 15) + 0.02**: 0.02 at the foot, 6.02 at the top.

That means the joints work out to the centimetre with no fudge:
- ramp foot 0.02 against the alley surface 0.02 — **exact**
- ramp top 6.02 against the expressway surface 6.00 — a 2 cm step down, below anything the player
  or the camera will register.

Deck is 6.0 m of asphalt between parapets; parapets are 0.5 m tall (top rail 0.56 above the
surface) at x = ±3.125, outer face ±3.27. Hammerhead piers underneath at local z = −5, +5, +13.
The down ramp is this asset mirrored in Z (`scale.z = -1` or `rotation.y = Math.PI`); mirroring in
Z keeps the front +Z convention intact for everything placed on it.

**cable_span** — 9.04 × 2.18 × 20.4 m. **Place at y = 4.5.** Base y = 0 is the lowest point of the
lowest cable, so at y = 4.5 the lowest cable clears the road at exactly the 4.5 m STYLE.md
minimum, and the highest endpoint reaches 6.68 m — inside the 5.0–6.5 endpoint band once the
mounting bracket is taken into account. Three crossings at local z = −10, 0, +10 (hence a 20.4 m
bounding box on a 30 m chunk — place it at the chunk centre and the crossings land 10 m apart
across chunk joints). Cables run **across** the street, x = −4.52 … +4.52, so they terminate on the
verge line / shophouse fronts at x = ±4.5. Four cables per crossing at different heights and sags
(0.45–0.70 m), a junction box on the middle crossing at x = +3.0, a spare-cable loop at x = −2.6.

**litter_set** — 0.97 × 0.11 × 0.92 m, `userData.instanceable = ['paper','cup','can','bag']`. The
game instances the **named children**, not the group: `proto.getObjectByName('can').clone()`, zero
its position, drop it on the surface. Each child is authored about its own origin with its base at
y = 0 and a footprint of 0.11–0.26 m, all four well inside the 0.3 m cap, and each also carries
`userData.footprint = [w, d]`. Loading with `{ keepHierarchy: true }` is required to reach the
children by name — the default merge welds them into one mesh per material and drops the names
(traps.md).

**road_cones** — 1.38 × 0.61 × 0.63 m. Base y = 0, on the road surface. Two cones standing joined
by a bent striped bar at 0.40–0.45 m, one toppled cone lying across +Z, and a torn corrugated
sheet under the pile. The bar is the only thing above 0.55 m, so this reads as a low obstacle.

---

## Why each winner won

| object | winner | tris | why |
|---|---|---|---|
| alley_road_chunk | **A** (primitives) | 1936 | Irregular overlaid patches read as patched tarmac; B's swept kerb-and-gutter gave a verge too clean and uniform to sit in this street, and C's 2 × 3 m panel mosaic read as a regular grid — a concrete apron, not asphalt. A also keeps the kerb as discrete stones with uneven heights, which is what shows at player height. |
| expressway_deck | **C** (different reading) | 2124 | The only one whose sound wall is a *mix* — translucent panels, corrugated tin bays, one boarded, one missing with a shard left in the frame — which is exactly the reference. Twin-column piers with a crossbeam and tie beam read far better from below and from the side than A's single stub columns or B's hammerheads. |
| ramp_chunk | **B** (profiles) | 1246 | The brief and the reference both want weathered piers *visible underneath*; A and C bury them in a solid clad embankment, so the piers may as well not be there. B's wedge is drawn as its side profile and extruded, so the 1:5 grade is exact by construction rather than by a rotation that has to be got right, and at 6.54 m it is the only one narrow enough to sit between the 9 m alley and the 6.6 m deck without stepping out. |
| cable_span | **A** (tubes on CatmullRom) | 3344 | Builds precisely what was specified — three crossings of four cables, varied sag, loop, junction box — and reads as four clean lines per crossing at player height. C's twisted pairs are handsome up close and invisible at 4.5 m overhead, for 1.9× the triangles; B's chained cylinders lost the cable ends. |
| litter_set | **C** (different reading) | 706 | The reference litter is flat and trodden, and C is the only arm that read it that way: a fanned newspaper with print blocks, a cup stamped flat with its rim still round, a can crushed to a slab with the two ends surviving. B's lathes came out as small smooth white blobs with no read at all. |
| road_cones | **C** (different reading) | 964 | Has the two things the reference actually shows that the others missed — the bar is *bent*, with its tape peeling, and the cones stand on a torn corrugated sheet. B's lathe cones were the prettiest object in the set and cost 1972 triangles, twice the band for this class, for detail that does not survive being 6 m away in the dark. |

## Triangle counts against budget

| asset | tris | budget | |
|---|---|---|---|
| alley_road_chunk | 1936 | ≤ 2000 | ok |
| expressway_deck | 2124 | ≤ 3000 | ok |
| ramp_chunk | 1246 | ≤ 2500 | ok |
| cable_span | 3344 | ≤ 4000 | ok |
| litter_set | 706 | ≤ 800 | ok |
| road_cones | 964 | 200–1000 | ok |

Four winners were over budget as first written and were trimmed by segment count only — never by
decimation — before the second verifier run: cable tube segments 22 → 14, the manhole ring 24 → 14,
litter sphere/torus/capsule segments cut across the board, cone tape sleeves 6 → 5 and the debris
ribs 6 → 4. Nothing lost a part.

## Problems and things left open

1. **`cable_span` still warns on three sides** and this is inherent, not a defect. An object made
   of twelve horizontal 9 m lines has nothing at all on its ±X faces (you are looking down the
   cables, end-on) and very little on ±Z. `userData.mounts = ['left','right']` is declared because
   those ends genuinely terminate on the poles and shophouse walls, which is one of the two cases
   the contract allows; the verifier exempts a declared face from the detail comparison but still
   reports it as empty, so the warning stands on the record. No other asset in this set opts out of
   anything except the four chunk slabs, which declare `front`/`back` because those faces are the
   sawn joints where the next chunk butts on.
2. **The chamfer proxy will inflate these counts at load.** `src/chamfer.js` swaps any BoxGeometry
   with a min side ≥ 0.25 m for a RoundedBoxGeometry at 2 segments, which is roughly 6× the
   triangles of that box. The alley chunk is 138 meshes, most of them boxes under 0.25 m (kerb
   stones are 0.15 wide, patches are 3 mm thick) so they are untouched, but the deck slabs, piers,
   parapets and verge flags will all be rounded. E4 should measure the loaded cost before trusting
   the numbers above, and the chunk slabs are the obvious first candidate for an exemption if the
   budget bites.
3. **`userData` does not survive the default load.** `chunk`, `rise`, `instanceable`,
   `mountHeight` and `footprint` are all dropped by `ASSET()`'s merge unless it is called with
   `{ keepHierarchy: true }` (traps.md). `litter_set` genuinely needs the hierarchy to be usable at
   all; for the three chunk slabs, track.js should treat the heights in the table above as
   constants rather than reading them back off the asset.
4. **No textures are referenced.** Every material is a flat colour with a name from the contract
   list (`ground` at roughness 0.18 on every road and puddle surface, `stone` for concrete,
   `metal`, plus `timber`, `fabric`, `foliage`, `plaster` where they apply), so `textures.js` can
   map asphalt → ground and concrete → stone without any changes here.
5. **The reference for `cable_span` is a coiled bundle on a wall**, not a span, as the brief
   warned. It was used only for the clip, junction-box and taped-splice detail; the geometry follows
   the recipe in the brief and ASSETS.md.
