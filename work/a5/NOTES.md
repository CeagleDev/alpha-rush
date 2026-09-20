# A5 notes — two jointed dogs and five obstacles

Candidates: `work/a5/cand/<name>/<name>_{a,b,c}.js` (21 files, three genuinely different construction
strategies per object — primitives/capsules, lathe/extrude profiles, a different part breakdown).

Verifier runs: **two browser launches total** (laptop on battery). One over a flat copy of all 21
candidates (`work/a5/verify-all/_verify/sheet.png`, `--size=480`, 21/21 clean), then one over the seven
winners with their `expect.json` beside them (`work/a5/winners/_verify/sheet.png`, 7/7 clean, every
stated size inside tolerance). Picking was done from per-object contact sheets built from the
per-candidate PNGs, by eye — never by triangle count.

Pose test: `a5_posetest.mjs` (scratch) imports a winner with three 0.185, checks the 12 joint keys are
present, bends `fl_knee` +0.9 rad and `fl_hip` -0.6 rad, and compares vertex bounding boxes of the
geometry under each joint before and after. It passes only if the joint itself does not move, the top
of the limb stays put, the paw swings back and up, and the limb's box **centre** moves (a centre that
stays put means the limb spun about its own middle).

Winners are copied to `game/assets/<name>.js` with `<name>.expect.json` (tolerance 0.25).

---

## dog_spitz → winner **B** (lathe profiles), 2,684 tris, 39 meshes, 0.351 × 0.685 × 0.820 m
Body, belly fringe, neck, mane, skull, muzzle, cheeks, ears, nose, eyes, legs and paws are
`LatheGeometry` sweeps (body and skull lathed along their own axis then rotated to lie along +z); the
plumed tail is a fat torus arc (4.4 rad) curling forward over the back with a lathed plume tip.
- **Why it won:** the only one whose coat reads as one continuous fluffy mass from all four sides, with
  the big neck ruff that is the defining feature of the reference. A (capsules + spheres) showed its
  construction — visible seams where the chest ball and rump ball meet the barrel — and came in at
  6,760 tris, well over the dog band. C's `TubeGeometry` tail curled up like a carry handle and its
  extruded coat slab read as a flat shelf along the flank.
- Withers 0.50 m as specified; overall height 0.685 is the ear tips. Blue collar `0x40559f` + buckle,
  muddy `0x8b6141` paws and shin splashes, `0x110f12` pad under every paw (the grounding band).
- **Pose test PASS**: `fl_knee` +0.9 → joint moved 0.0000 m, lower-leg box top moved 0.010 m (the
  knee-cap dome), paw swung 0.140 m backward and 0.029 m up, box centre moved 0.082 m;
  `fl_hip` -0.6 → hip joint 0.0000 m, thigh top unchanged (0.430 → 0.430), knee moved 0.091 m forward
  and 0.028 m up; combined stride keeps the lower-leg box top within 0.029 m of the knee (attached).
- Joints: `spine` (0, 0.36, 0) in a wrapper, `neck` (0, 0.42, 0.21), `head` (0, 0.54, 0.33),
  `tail` (0, 0.46, -0.23); hips at (±0.085, 0.36, +0.15 / -0.16), knees 0.16 below. Legs hang down
  local -Y, so +rotation.x on a knee swings the paw BACK; -rotation.x on a hip swings the leg forward.
  `fl_`/`bl_` are on +X. All of this is in `userData.jointHints`.

## dog_mutt → winner **C** (different breakdown), 2,784 tris, 45 meshes, 0.270 × 0.837 × 1.008 m
The lean body is one `ExtrudeGeometry` of a side-profile Shape (the tuck-up drawn directly) crossed
with a capsule ribcage; box muzzle and jaw; extruded ear flaps (one pricked, one folded); the raised
tail is a `TubeGeometry` along a CatmullRom curve.
- **Why it won:** the only clean one. A's folded ear was a rotated box that flew off the skull and
  read as a detached slab from three sides; B's black tail tip was a lathe that detached from the
  tail and floated behind the dog as a speck. C reads as a lean mongrel from every side — deep chest,
  tucked loin, long legs, raised tail, one ear up and one folded, rope collar.
- Shoulder 0.60 m as specified; 0.837 overall is the raised tail. Fur `0x3a2a22`, black `0x1a1512`
  muzzle and ears, tan `0x8b6141` lower legs and brow dots, rope collar (two torus strands + a frayed
  end), a faded patch and a tan stain as the wear signature, `0x110f12` pads.
- **Pose test PASS**: `fl_knee` +0.9 → joint moved 0.0000 m, lower-leg box top moved 0.019 m, paw swung
  0.185 m backward and 0.046 m up, box centre moved 0.123 m; `fl_hip` -0.6 → hip joint 0.0000 m, thigh
  top 0.526 → 0.522, knee moved 0.119 m forward and 0.037 m up; combined stride attached (box top
  within 0.004 m of the knee).
- Joints: `spine` (0, 0.46, 0), `neck` (0, 0.52, 0.22), `head` (0, 0.68, 0.38), `tail` (0, 0.52, -0.31);
  hips at (±0.075, 0.46, +0.19 / -0.22), knees 0.21 below. Same sign conventions as the spitz.

## fallen_bicycle → winner **A** (primitives), 2,664 tris, 109 meshes, 1.678 × 0.635 × 1.074 m
A step-through mamachari built upright from torus wheels, cylinder-tube frame, wire basket, rear rack,
sprung saddle, chain guard, mudguards, pedals and kickstand, then laid on its left side (rotation.x
= -π/2 + 0.2, so it rests on a bar end and a pedal rather than perfectly flat).
- **Why it won:** cleanest read of a bicycle from every side — spoked wheels, frame triangle, basket,
  rack and saddle all separate. B's lathe mudguards read as thick dark crescents that looked like two
  extra wheels; C (built directly in the fallen pose) scattered — the handlebars read as antennae and
  the basket as a solid grey block.
- `userData.obstacle = { kind:'jump', lanes:1 }`; `userData.lights` has the red tail reflector, its
  coordinates taken from the mesh's world position AFTER the recentre, so the level does not have to
  apply the loader offset itself.
- Wear: rust sleeves on the down tube and seat tube, mud cake arcs on both tyres, a bent (0.86-squashed,
  skewed) front wheel, `0x110f12` contact bands under both tyres.
- **Could not do:** the brief's 1.8 × 0.6 footprint is not reachable for a whole bicycle lying on its
  side — the bike's own height (1.06 m to the handlebars) becomes the depth, and the wheels alone are
  0.62 m across, so the honest footprint is 1.68 × 1.07 with a max height of 0.635 m. Height and lane
  width are inside the brief; the depth is documented as measured in `fallen_bicycle.expect.json` so
  the level places it from the truth rather than from the intention.
- Trimmed after the pick: wheel torus 7×24 → 6×16, rim 5×24 → 4×16, spokes 12 → 8, mudguard arcs
  5×16 → 4×12, tube radial 7 → 5. 3,828 → 2,664 tris (band 800–3,000). Segment counts only.

## cooler_bin → winner **B** (profiles), 1,180 tris, 24 meshes, 0.997 × 0.445 × 0.424 m
Cooler body and lid are `ExtrudeGeometry` sweeps of a rounded-rectangle Shape with the bevel subtracted
from the drawn profile (so the box measures 0.60 × 0.40 × 0.40 and does not sit below its own base);
the crack is an extruded zigzag ribbon; the bucket is ONE lathe (floor, tapered wall, rolled rim) with
the dent pushed into its vertices after construction.
- **Why it won:** the cracked lid actually reads — from the top, the front and the three-quarter — and
  the dent is real geometry rather than a dark decal. A's crack was a pair of hairline boxes invisible
  at any distance. C (lid ajar, bucket knocked over) read as a drum lying next to a box; the reference
  has the bucket standing.
- Together 0.997 m wide (under the 1.0 m limit). `userData.obstacle = { kind:'jump', lanes:1 }`.
  Materials: `plaster` for the styrofoam, `metal` for the bucket, `timber` for the handle grip.
- Wear: grey scuff patches on three faces, rust runs on the bucket wall and rim, the dent, and a
  `0x110f12` grounding band under both objects.
- Trimmed after the pick: lathe 18 → 12 segments, extrude curveSegments 4 → 2, bevelSegments 2 → 1,
  handle tube 14×5 → 10×4. 1,836 → 1,180 tris (band 300–1,500).

## roadworks_barrier → winner **B** (profiles), 1,824 tris, 61 meshes, 1.880 × 1.199 × 0.760 m
The bar is a C-channel section (profile drawn in world z/y) extruded 1.80 m along X; the stripes are
extruded parallelogram Shapes lying 6 mm proud of each face; the stands are tube legs with lathe
wheel-feet and a cross tube; the lamps are lathe domes on lathe bases.
- **Why it won:** its diagonals are contained inside the bar. A's rotated stripe boxes overhung the
  bar's top and bottom edges and left a ragged saw-tooth silhouette along the rail. C's stripes were
  too narrow and the bar read as a dark plank with flecks on it from more than a few metres.
- Stands 0.98 m tall (the brief's 1.0 m), bar 1.8 m plus end caps, three amber dome lamps
  (base `0x110f12`, `emissive: 0xe5b055`, intensity 2.4, roughness 0.35, unnamed) with three matching
  `userData.lights` entries, recentred with the asset. `userData.obstacle = { kind:'jump', lanes:1 }`.
- Wear: rust sleeves at every foot, a rusted-through patch on the bar face, rusted lip rails, a rusted
  rear brace, `0x110f12` pads under all four feet.

## concrete_divider → winner **C** (different breakdown), 772 tris, 33 meshes, 1.840 × 1.020 × 0.544 m
The jersey shoulder is ONE box whose top vertices are pulled inward in z after construction (a true
single-axis taper), on a box plinth with a kick-step, forklift notches, a crown, chipped corner blocks
and reflectors.
- **Why it won:** the end view shows one straight slope, which is what a jersey barrier is. A stacked
  two tilted slabs and left a visible step where they crossed; B's chipped ends were 15 cm dark
  sections that read as painted ends rather than knocked-off corners.
- **Size:** placed ACROSS a lane — 1.80 m along X (1.84 with the chip blocks) and 0.50 m along Z (0.544
  with the reflectors), 1.02 m tall, all documented in `concrete_divider.expect.json`. NOT the 3.0 m
  length in STYLE.md, per the brief.
- Weathered concrete `0x8a8378` with `0x4a4a4c` chips and cracks and a `0x6b665d` stain band; faded
  yellow strip along the top, worn through in one place; two cracks, a tyre scuff band, an end stain;
  four amber side reflectors (emissive `0xd8ae70`) with four `userData.lights`;
  `userData.obstacle = { kind:'block', lanes:1 }`.
- Trimmed after the pick: reflector spheres 12×8 → 8×4 and 10×6 → 6×3, bezel cylinders 12 → 8 and
  10 → 6. 1,716 → 772 tris (band 150–1,000).

## gantry_board_low → winner **C** (different breakdown), 1,448 tris, 76 meshes, 2.660 × 2.420 × 0.580 m
Columns are extruded I-beam sections with patchwork plank and tin panels bolted over them at staggered
heights; the top beam is an extruded channel; the board hangs on two short chains of torus links; the
lamps are cans with emissive front discs on swing brackets; the base is a slatted grating.
- **Why it won:** it is the only one inside the 0.6 m depth the roll clearance needs — A measured 0.634
  and B 0.674, both over. It also matches the reference's patchwork of timber and rusted tin over a
  steel frame, and its side view is the busiest of the three (panels, beam channel, lamp can, grating)
  rather than a plain clad box like A's. B's lattice tower was handsome but read as scaffolding.
- Board: plain `0x2f6b3a` green, white `0xd9d4c4` border, **no text**, 1.90 × 0.80 m with its bottom
  edge at exactly 1.30 m. Two orange lamps (`emissive: 0xe5b055`, intensity 2.2) with two
  `userData.lights`. `userData.obstacle = { kind:'roll', lanes:1 }`.
- Wear: rust runs down both columns, rusted caps and beam bands, a faded green panel and a rust stain
  on the board, rust along its back bottom edge, rusted slats in the grating, `0x110f12` grounding
  bands under both columns and the sill.
- Trimmed after the pick: chain links 4 → 3 per side and torus 5×8 → 4×6, lamp cans 12 → 8 segments.
  1,872 → 1,448 tris (band 300–1,500).

---

## Things I could not do
- **fallen_bicycle depth** — see above; the brief's 0.6 m is geometrically impossible for a bicycle on
  its side, and the measured 1.07 m is documented instead of hidden.
- **Fur, rope and corrugation are colour, not texture.** Both dogs are flat-coloured masses: the spitz's
  fluff is the silhouette of the lathe profiles plus a shaded belly fringe, not strands; the mutt's coat
  patchiness is two flat patches; the rope collar is two torus strands and a frayed stub rather than a
  twist. The gantry's corrugated tin is alternating shade bands and thin ribs, not a real corrugation
  profile (arm B had a true zigzag extrusion but lost on depth).
- **No text anywhere**, as required — the barrier's bar carries stripes only and the gantry board is a
  plain green panel, where both references have painted kana.
- The bicycle's chain, derailleur, brake calipers and spoke nipples are not modelled; the chain guard
  is a slab and the chainring a disc.
- The cooler's moulded logo and the bucket's stickers are not modelled (raised blank panels instead).
- Triangle trims on four winners were segment-count reductions after the pick, re-measured headlessly
  and re-rendered in the second verifier run — no decimation, no shape changes.
