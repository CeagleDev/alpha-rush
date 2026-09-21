# Runner candidate C - DEFORMED PRIMITIVES

`runner.js` (13,360 triangles, 39 meshes before merge, 11 materials). `verify.mjs --size=560` reports clean:
0.531 x 1.562 x 0.365 m, ground offset 0, centred.

## Build method
Every body segment is a subdivided `SphereGeometry` whose `attributes.position` is rewritten by one helper, `tube()`:
a Hermite-interpolated profile `[y, halfWidth, frontDepth, backDepth, cx, cz]`, true ellipsoidal end caps,
optional superellipse cross-section, gaussian directional bulges (pecs, shoulder blades, spine furrow, glutes + cleft,
quad sweep, hamstring, kneecap, calf belly high on the back, brow ridge, eye sockets, cheekbones) and low-amplitude sine
cloth folds (waist, inside of the elbows, back of the knee, stacked trouser break above the shoe). Then
`computeVertexNormals()` plus a position-keyed normal weld so the sphere's UV seam and poles never show.
Trims: bevelled `ExtrudeGeometry` plates (pouch, flap, buckle, pockets - the pockets are bent onto the cloth with `wrapOn()`),
bevelled footprint extrusions for the soles (toe spring + heel wedge applied by vertex edit), `TubeGeometry` for zip, yoke seam,
hood seam, hood rim and drawstrings. The strap is a `TorusGeometry` rewritten onto the torso surface along a tilted plane.
Chest and jacket-skirt are two rigid pieces cut from ONE shared torso surface and cross each other at ~3 degrees, so the
spine/chest joint shows no groove.

## Anchor heights (world, m)
sole 0, ankle 0.075, knee 0.425, hip joint 0.79, hips root 0.85, spine 0.93, chest 1.08, shoulder 1.258, neck 1.315,
head 1.37 (chin 1.325), crown 1.56. Elbow 1.00, wrist 0.78. Shoulder joints at x = +-0.15 (0.41 m across the sleeves),
hips 0.29 m, head 0.235 m chin to crown (6.6 heads), foot 0.262 m.
Rest pose: shoulders carry rotation.z = +-0.17 (arms clear the jacket), elbows rotation.x = -0.10; anim.js adds offsets to rest.

## Joints (no skinning)
Each limb segment ends in a cap that is circular in the YZ plane and centred exactly on the joint (hip ball r 0.082,
knee 0.054 / 0.0515, shoulder 0.055, elbow 0.043 / 0.0405), so rotation.x slides sphere inside sphere. Thigh ball is buried
in the pelvis, shoulder ball in the chest, sock ball at the ankle sits inside the trouser cuff.

## Checked by eye (Read tool, 1024 px renders, 8 look-and-fix rounds)
- Full figure front / back / sides / three-quarter vs `base/_verify/runner.png`: no boxes or hard 90 degree edges left.
- Close-ups (chest+head, shin+shoe, posed legs) rendered from throwaway part modules in the scratchpad.
- `posed/runner.js` (mid-stride pose from the brief, generated from runner.js via the `/*@@POSE@@*/` marker): no gaps at knees,
  hips, elbows, shoulders; thigh does not break through the hem; arms clear the jacket and the pouch; verify clean against
  a pose-specific expect.json (the pose is 1.13 m deep, so the standing expect would only flag size).
- Fixes made from what I saw: 20.5k -> 13.4k triangles; puffer-like torso slimmed; floating shoulder seam rings removed;
  "diaper" pelvis front tucked behind the thighs; lumpy ellipsoid hair replaced by two layered shells with a wavy overhang
  and a swept fringe; clog-like shoe rebuilt (upper fills the footprint, thinner wedge midsole, tread lugs for the kicked-up
  sole seen from the chase camera); back pockets bent onto the seat; strap re-routed over the trapezius instead of round
  the shoulder joint; pouch moved below the hood; mid-torso crease eliminated.

## Known weaknesses
- The face is simple (closed-slit eyes, wedge nose, faint mouth). Fine from the chase camera, bland in a close-up.
- Hair is near-black (0x15110f as briefed), so the layered detail on the back of the head mostly reads in the silhouette.
- A faint crease is visible at each knee and elbow in the rest pose where the smaller lower segment emerges from the upper one
  (reads as a trouser/sleeve crease, but it is a rigid-joint artefact).
- Width is 0.53 m against the 0.66 expected (inside the 25 % tolerance): the arms hang closer than the A-pose reference.
- Strap + pouch are rigid with the chest; at large chest-vs-spine twist the strap's lower run would slide over the skirt. The
  lower strap run also passes close to the right arm when that arm swings back.
- Cloth folds are regular sine ridges; under a raking street lamp they can look a little rhythmic.
- Trousers 0x26272b are very dark, so thigh / calf modelling is carried by the silhouette more than by shading at night.
