# Runner candidate B - SCULPTED-ELLIPSOID

Files: `runner.js`, `runner.expect.json`; `posed/runner.js` (mid-stride pose from the brief);
`chase/runner.js` (same pose, root turned so the verifier's 3/4 camera sees him from behind and above,
like the game camera). `posed/` and `chase/` carry a relaxed expect file because a stride is 1.1 m deep.

## Anchor heights (world m, rest pose)
sole 0.00 | ankle 0.075 | knee 0.43 | hip 0.80 | hips-root 0.85 | spine 0.93 | chest 1.08 |
shoulder 1.255 | neck 1.315 | head 1.36 (chin 1.32) | crown 1.56.
Shoulder pivots +-0.15 (0.40 across the sleeves), hip pivots +-0.08 (0.30 across the seat), elbow 1.005,
wrist 0.78, fingertips ~0.63, foot 0.26 long. Head 0.235 -> 6.6 heads. Legs 0.80 / 1.56.
Rest offsets: shoulders rotation.z = +-0.15 (arms hang slightly out), elbows rotation.x = -0.15.

## Numbers (verify.mjs --size=560, clean)
13,774 triangles, 36 meshes (one per joint per material, already baked), 0.529 x 1.56 x 0.354 m.
Every mesh has position + normal + uv (box-projected 0..1, so surfaces.js texel density works).
No emissive, no vertexColors, no imports. Material names: fabric / metal / unnamed (skin, lip, sole).

## How it is built
~100 "blobs" (ellipsoids and tapered oval capsules) blocked in like clay: rib cage, shoulder girdle,
traps, scapulae, lats, abdomen, blouson roll, waist folds, hood bag/point/side rolls, pelvis, glutes,
hip sides, deltoid, biceps, triceps, forearm mass, sleeve blousing, elbow folds, palm, curled fingers,
knuckles, thumb, thigh, quad, hamstring, inner thigh, kneecap, calf belly, shin, trouser break, toe box,
vamp, quarters, heel counter, toe cap, tongue, skull, jaw, chin, nose, brow, ears, 13 hair clumps.
Blobs on one rigid piece are fused: vertex normals come from the distance-weighted blend of every
blob's implicit-field gradient, so intersections shade as fillets, not seams; triangles buried inside a
sibling blob on the same joint are dropped (that is what keeps it under budget).
Joint balls (shoulder, elbow, hip, knee) are spheres centred exactly on the pivot and shared by both
segments, so flexing cannot open a gap.
Detail over the clay: swept bands/tubes ray-projected onto the clay surface (zip, pocket welts,
drawstrings, raglan seams front+back, back yoke seam, back-pocket stitching, trouser side seams, laces),
explicit rings (blouson hem, sleeve cuffs, hood rim, trouser hems, shoe collars), a cross-body strap
that follows the CONVEX HULL of the torso section so it sits taut, and bevelled ExtrudeGeometry for the
pouch, flap, buckles and the foot-shaped soles (bent into a toe spring + heel wedge).

## Checked by eye (5 look-and-fix passes at 1024 px, then 560 px final)
1. First render: chest blobs read as a bust, rib cage overhung the abdomen like a crop top, hood side
   rolls looked like bear ears, traps buried the neck, nose too big, hair too bouffant, arms too thick.
   Fixed all of these.
2. Shoulders sat above the chin -> dropped the shoulder pivot to 1.255 and shortened the upper arm;
   straightened raglan seams; enlarged hands; added inner-thigh mass; flattened the fly.
3. Posed (posed/): no gaps at knees, hips, elbows or shoulders at the brief's stride; thighs do not
   poke through the hem; calf lobe was too abrupt when the knee was bent -> longer, shallower calf;
   pouch floated off the back -> now seated on a plane fitted to four hits under it.
4. Chase view (chase/): strap hung like a hose across the back creases -> replaced with the taut
   convex-hull strap. Seat, back pockets, hood, pouch, calves and heel counters read from behind.
5. Removed the chest blobs entirely, de-jagged the lat/abdomen intersection, re-verified all three dirs.
Compared with work/v2/runner/base/_verify/runner.png: no boxes or hard edges anywhere; silhouette is
continuous from every side.

## Known weaknesses
- Fusing is shading-only. Silhouettes are still the union of blobs, so at very close range the
  intersection lines between low-res blobs (hip side / thigh top, elbow folds) show a slight zigzag.
- The hood is a lumpy bunched mass rather than a clearly draped hood with an opening.
- Face is simple (dot eyes, brows, lip sliver); fine at chase distance, not for a close-up.
- Hair reads a bit fuller than the reference's neat short cut.
- The strap is rigid with the chest; its lower end crosses the spine/hips region, so with large spine
  twist it would slide over the jacket rather than deform (at the anim's +-0.12 it is invisible).
- Skin is unnamed per the brief, so surfaces.js classifies it by colour (lands on 'stone').
- Sole underside has no tread geometry (visible for a moment on the kicking foot).
- Not tested in the game or under the night lighting (brief forbids running it); colours are the brief's.
