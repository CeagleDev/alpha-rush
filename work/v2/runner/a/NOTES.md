# Runner candidate A - LATHE-LED

Files: `runner.js`, `runner.expect.json`, `posed/runner.js` (throwaway mid-stride copy, regenerate with
`./mkposed.sh`, which injects the brief's pose at the `/*POSE*/` hook), `_verify/`, `posed/_verify/`.

## Anchors (world m, rest pose)
sole 0 | ankle 0.075 | knee 0.43 | hip 0.80 (x +-0.077) | hips-root 0.85 | spine 0.92 | chest 1.08 |
shoulder 1.252 (x +-0.155) | elbow ~1.00 | wrist ~0.78 | neck 1.315 | head 1.365 | chin 1.326 | skull top 1.548 | crown 1.56 incl. hair.
Head 0.234 (6.65 heads). Shoulders 0.41 over the jacket, hips 0.295, foot 0.262, crotch 0.716.
Verifier: 0.547 x 1.559 x 0.339 m, clean. 13,800 triangles, 83 meshes, 13 materials. No emissive, no vertexColors, no DoubleSide, no textures.

## Build
- Lathe profiles (centripetal Catmull-Rom through hand-placed control points) for pelvis, abdomen, hem rib, chest/yoke,
  neck, thighs, calves, upper arms, forearms, cuffs, finger mass and thumbs. Each is then deformed on
  `attributes.position`: super-elliptic torso section (wider than deep, flatter back), seat + cleft, shoulder blades, spine
  furrow, chest, S-curve offset, cloth drag folds and hem gathers; thigh quad/hamstring; calf belly on the back with a
  flattened shin; oval forearm; askew trouser stack over the shoe; fingers curled by an arc-bend with pressed-in finger valleys.
  Normals are recomputed and welded by position so the lathe seam and poles vanish.
- Joints: both neighbours end in the same sphere centred on the joint (child 0.5-1 mm smaller to avoid z-fight), with the
  wall held vertical through the joint so there is no groove at rest. Thigh tops are balls buried in the pelvis, sleeve caps are
  concentric with a shoulder mass on the chest.
- Deformed spheres: head (jaw narrowing to chin, skull base tucked into the nape), hood sack, shoe upper / midsole / outsole /
  toe cap / heel counter (shared foot-plan tables, toe spring, medial toe bias), pouch (super-ellipsoid).
- Hood collar = deformed torus swelling into the sack. Strap, zip, pocket welts, drawstrings, yoke seams, back-pocket
  stitching = ribbons laid ON the torso surface function (position + numeric normal), so they follow the body. The strap is a
  closed loop in a tilted plane, LEFT shoulder -> right hip, pouch behind the right ribs (hero side), slider on the chest.
- Colours exactly as briefed (jacket 0xb8571f / rib 0xa04a1b, trousers 0x26272b ...). Extra: lip 0x8a5f48, pocket stitch 0x2c2d32.
- Rest pose: shoulders abducted 0.19 rad, elbows -0.16, toes out 0.09 (anim.js adds offsets to the captured rest pose).

## Checked by eye (5 look-and-fix passes on _verify/runner.png at 2-4x crops, 3 on the posed render)
1. 24k tris, puffer-wide jacket, chin ball, bun hair -> slimmed jacket/arms, removed chin ball, resampled everything to budget.
2. Rib hem hidden in the waist, shoulder "pads", slipper shoes, sad brows, brief-like crotch -> fixed each.
3. Chest lathe rendered inside-out (orientation vote landed on a flat cap) -> caps no longer vote; verified normals numerically.
4. Knee groove from spline tangents, z-fighting shoulder spheres, jagged seam tori -> vertical-wall control points, smaller
   concentric shoulder mass, tori removed.
5. Pointed sole seen on the back-kick -> blunter toe, rubber pads under forefoot and heel.
Posed (brief's mid-stride values): no gaps at knees (1.2 rad), hips, elbows, shoulders; thigh does not pierce the hem; strap
and pouch stay on the jacket with spine 0.12.

## Known weaknesses
- Face is simple (small nose, dot eyes, flat profile) - fine from the chase camera, weak in a close front shot.
- A faint shading line remains at the knee and at the chest/abdomen overlap (reads as a crease/fold, but it is a rigid-piece seam).
- The jacket still reads slightly padded/bomber rather than thin shell; sleeve fold rings are axisymmetric-ish.
- Hair is clump ellipsoids: reads as thick short hair from behind, a bit lumpy in a front close-up.
- Shoe collar / heel counter boundaries are low-res (jagged within ~5 px at 560 px renders). Hands are mittens with a thumb.
- Strap is rigid with the chest: large chest-vs-spine bends (> ~0.3 rad) would let its low right-hip end drift off the abdomen.
- 13.8k of the 14k budget is used; 12-14 radial segments on limbs show facets only in extreme close-up.
