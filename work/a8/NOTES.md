# A8 — vehicles and expressway (7 assets)

Three independent candidates per object under `work/a8/cand/<name>/`, one verifier run per object
(batched: `cand/yatai_cart`, `cand/parked_sedan`, `batch1` = bicycle + scooter, `batch2` = lamp +
gantry + rail — four browser launches for seven objects, no re-runs needed). Every candidate came
back `ok` on the first pass: 3/3, 3/3, 6/6, 9/9 clean, no blank-side warnings anywhere, so no asset
needed a `userData.mounts` exemption. Sheets are in each folder's `_verify/sheet.png`.

Picking was by eye off the sheets (silhouette on all four sides, proportions against the reference
PNG, the three STYLE.md signatures). Triangle counts below are what the winner measures, not a
selection criterion.

| file | winner | tris | measured (w×h×d m) |
|---|---|---|---|
| yatai_cart.js | arm B — profiles | 5,914 | 1.34 × 2.17 × 2.56 |
| parked_sedan.js | arm B — profiles | 3,284 | 1.72 × 1.48 × 4.50 |
| bicycle_parked.js | arm A — primitives | 3,740 | 0.56 × 1.09 × 1.77 |
| scooter.js | arm A — primitives | 2,440 | 0.59 × 1.10 × 1.73 |
| sodium_lamp.js | arm B — profiles | 1,348 | 0.64 × 10.29 × 2.82 |
| sign_gantry.js | arm A — primitives | 3,272 | 8.80 × 7.34 × 1.76 |
| guard_rail.js | arm B — profiles | 784 | 4.00 × 0.76 × 0.38 |

All seven: base at y=0, centred on x/z, front +Z, inside their `.expect.json` at tolerance 0.25.

## Why each winner

**yatai_cart (B)** — the scalloped pantile profile extruded along the cart gives a tiled canopy that
reads as tiles from every side, where A's cylinder rows only read from the ends and C's hipped roof
lost the deep eaves the reference leans on. B's lathed pot, bowls and lantern bodies also sit better
on the steel counter than A's spheres. Fixed one thing in the winner before delivery: the +X curtain
now breaks either side of the lightbox instead of running across it, as the reference does.
3 lights (cream lightbox + two red lanterns). `obstacle = {kind:'block', lanes:1}`.

**parked_sedan (B)** — the side elevation drawn as a Shape (wheel arches as real arcs) and extruded
across X is the only one of the three with proper arches and a tapering glasshouse; A and C both
read as stacked boxes with the arches painted on. Mind the trap noted in `traps.md`: the windscreen
uses a **negative** rotation.x so its top leans back, and the rear glass a positive one. Glass is the
STYLE.md rule (`transparent, opacity 0.9, forceSinglePass`) and is deliberately left unnamed so the
surfacer does not paint a metal recipe onto it. 4 lights (two warm headlights, two red tails).

**bicycle_parked (A)** — closest to the reference: rope coils on the rear rack, both mudguards
reading as arcs from the side, a chain guard and a wire basket that is bars rather than a mesh.
B's curved loop frame was elegant but its lathed saddle read as a mushroom, and C invented blue
bungees the reference does not have. No `userData.lights` — the dynamo lamp is unlit when parked.

**scooter (A)** — cleanest delivery-scooter silhouette from all four sides, with the cargo box and
leg-shield proportions closest to the reference. B's lathed rims read as solid discs instead of
spokes; C's turned front wheel was characterful but made the front view asymmetric. 2 lights
(warm headlamp, red tail).

**sodium_lamp (B)** — one continuous LatheGeometry from base to tip gives the smoothest column with
its swages and collars, and its TubeGeometry gooseneck reaches furthest over the deck (2.1 m), which
is what the lamp is for. Head glows 0xe5b055, one light at intensity 1.2, range 12, as briefed.

**sign_gantry (A)** — the reference's towers are straight, densely laced verticals, which A has and
C's splayed tapered towers do not; B lost lattice density when I trimmed it under the triangle band.
Boards are plain green 0x2f6b3a with white borders and no shapes or glyphs; bottom edge at 5.35 m,
overall 7.34 m. 4 warm lamps under the boards, walkway and handrail behind (-Z).

**guard_rail (B)** — a true W section as an ExtrudeGeometry swept along X, so the two ribs and the
centre valley catch light properly; A's box stack is flat in the three-quarter view and C's kinked
beam read as a modelling error rather than damage at this size. Reflector, scuffs, rust run, moss at
the post feet, three C-channel posts on bolted plates.

## Bugs caught in the loop (none of which throw)

- **guard_rail B/C**: my sweep helper took its 5th argument as a *world z* position when it was meant
  as an offset *along* the sweep, so every scuff sat 0.75–1.15 m behind the rail and the measured
  depth was 1.92 m instead of 0.38 m. Caught by measuring before rendering, not by anything failing.
- **yatai_cart B**: the +X roof slope was originally mirrored with a negative scale, which flips
  winding; replaced with a real Ry(π) rotation so the tiles stay on top and the normals stay out.
- **bicycle_parked B**: mudguards were being positioned with a three-axis Euler in a non-default
  order and landed sideways; rebuilt as a lathe inside a group whose axis is already turned.
- Triangle trims: sign_gantry B (4,836 → 4,036) and C (4,192 → 3,448) by thinning lattice bays, and
  guard_rail B/C by dropping bolt segment counts — segment counts at generation time, never a
  decimator.

## What I could not do

- The `sodium_lamp` reference is a short, squat yard lamp; the brief says a 10 m highway post. I
  built the brief's 10 m and took only the *form* from the reference (square base box, hinged access
  hatch, bolted plate, gooseneck, rectangular head). If the reference was meant literally, the height
  is the one number to change.
- `sign_gantry` measures 8.80 m wide because the 8 m span is post-centre to post-centre and the base
  plates stand proud; `expect.json` records 8.8, not 8.0.
- No maker's badges, plates with text, or glyphs anywhere — the sedan's number plates and the yatai
  lightbox are blank panels, and the gantry boards are plain green.
- `bicycle_parked` and `scooter` sit a little short of their briefed depth (1.77 m vs 1.8, 1.73 m vs
  1.9) because both are parked on their stands rather than stretched to fill the box; both are inside
  tolerance.
