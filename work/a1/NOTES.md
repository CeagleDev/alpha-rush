# A1 notes — runner and shiba

Candidates in `work/a1/cand/runner/` and `work/a1/cand/dog/` (three each, one verifier run per
folder at `--size=480`; sheets in each `_verify/sheet.png`). Pose test: `posetest.mjs` (scratch)
imports the winner with three 0.185, bends the named knee +0.9 rad and hip -0.6 rad and compares
vertex bounding boxes of the geometry under each joint before/after.

## runner → game/assets/runner.js  (winner: A, primitives + capsules)
- A: boxes for torso/pelvis/hood-fold, capsules for upper arm/thigh, tapered cylinder shins,
  sphere deltoids/knees, boxed trainers with a 3 cm `0x110f12` outsole. **Won**: best silhouette
  from all four sides — the hood reads as a bunched mass on the back, the strap + buckle + pouch
  read from the front, back and three-quarter, trainers read as trainers, the head/hair is a
  head. Proportions match the reference (slim, long legs, shoulders 0.40 m).
- B (lathe torso/limbs, extruded trainer profile): smooth but the elliptical lathes turn the torso
  into a peanut and the hem rib into a fat disc; egg head too smooth. Lost.
- C (extruded rounded-rect jacket, half-torus hood, box head): the torus hood reads as a ring from
  the side and the box head reads as a block even knowing the loader chamfers it. Lost.
- Tris: 7,584 by the verifier (three 0.169), 5,568 by three 0.185's capsule count — in the
  4,000–10,000 band either way. 77 meshes, materials `fabric`, `metal`, skin and outsole unnamed.
- Measured 0.712 × 1.739 × 0.367 m (hair cap puts the crown 2 cm over 1.72; within the 25 %
  tolerance in `runner.expect.json` = 0.7 × 1.72 × 0.4).
- Pose test PASS: l_knee +0.9 → knee joint moved 0.0000 m, top of the lower-leg box moved 0.000 m,
  foot swung 0.33 m backward and up; l_hip -0.6 → hip joint moved 0.0000 m, thigh top stayed
  (0.922 → 0.930), knee moved forward 0.24 m and up 0.07 m; in the combined stride the lower-leg
  box top sits within 0.018 m of the knee (attached, no tearing).
- Joint conventions (in `userData.jointHints`): limbs hang down local -Y, so +rotation.x pitches
  a limb BACKWARD; knee flex = +x, hip/shoulder swing forward = -x, elbow flex = -x, arms out =
  left +z / right -z. Figure's left is +X. Root chain: root → hips → spine → chest → neck → head;
  shoulders on chest, hips on hips. `hips.position` is authored (0, 0.95, 0) inside a wrapper, so
  the game can bob `hips.position.y` without disturbing the recentre offset.
- Not reproduced from the reference: the ribbed knit texture of hem/cuffs (flat darker orange
  bands instead), the paint-speckle wear on the jacket (one faded panel + pocket flaps in a
  darker orange), individual fingers (hand = palm + finger block + thumb), the mud on the
  trousers is two flat stain patches per leg rather than a spatter.

## dog_shiba → game/assets/dog_shiba.js  (winner: B, lathe profiles)
- B: body, neck, skull, muzzle, chin, cheeks, ears, nose, eyes, legs and paws are LatheGeometry
  sweeps (body and skull lathed along their own axis then rotated to lie along +z); tail is a
  torus arc (4.6 rad) standing in the y-z plane with a cream tip. **Won**: the only one whose
  body reads as one smooth barrel with a tuck-up from the side; tapered legs; head/ears/muzzle
  read from every side. After the sheet the dark saddle band (which stood 2 cm proud of the back
  and read as a lump) was rebuilt as an open half-lathe shell 6 mm proud of the barrel; the
  change was re-measured headlessly (bounds, ground, centre, tris) but not re-rendered.
- A (capsules + spheres): chest sphere, rump sphere and saddle sphere all bulge out of the
  capsule body — lumpy from the side and back. Lost. (Also 6,892 tris by the verifier, over band.)
- C (two-mass body, box head, extruded triangle ears, sphere-chain tail): box head and the back
  stripe box read as blocks; sphere-chain tail reads as beads. Lost.
- Tris: 2,776 (2,800 on the sheet before the saddle change) — in the 2,500–6,000 band. 41 meshes.
- Measured 0.338 × 0.687 × 0.870 m; withers at 0.55, head joint at 0.56, skull top 0.645, ear
  tips 0.687. `dog_shiba.expect.json` = 0.35 × 0.62 × 0.85, tolerance 0.25 (all within).
- Pose test PASS: fl_knee +0.9 → joint moved 0.0000 m, lower-leg box top moved 0.015 m (the
  knee-cap dome), paw swung 0.165 m backward and up 0.044 m; fl_hip -0.6 → hip joint 0.0000 m,
  thigh top stayed (0.490 → 0.487), knee moved forward 0.10 m and up 0.03 m; combined stride
  stays attached (box top within 0.048 m of the knee).
- Joint conventions: spine is the root (0, 0.42, 0) inside a wrapper; neck at (0, 0.47, 0.22),
  head at (0, 0.56, 0.33), tail at (0, 0.50, -0.26); four hips at (±0.095, 0.42, +0.17 / -0.19),
  knees 0.18 below. Legs hang down -Y: swing forward = -rotation.x on a hip, knee flex = +x.
  fl_/bl_ are on +X.
- Not reproduced: fur texture/fluff (flat colours; the ruff is a cream lathe collar), the
  double-layered tail fur (one torus tube + cream tip), the mud/dirt spatter (one mud patch on
  the flank and one on each lower leg), the grey inner ear shading.
