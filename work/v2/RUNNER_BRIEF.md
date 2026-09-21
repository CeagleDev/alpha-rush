# Brief: rebuild the hero runner (midnight-dash)

The owner's verdict on the current runner (`game/assets/runner.js`, render in
`work/v2/runner/base/_verify/runner.png`, in-game frame `work/v2/base/d0060.png`):
"He's too tall. His body doesn't feel very well built. He looks like a wooden sculpture. Get it to a
better level of realism." Your job is a replacement `runner.js` that reads as a living young man in
street clothes mid-run, seen mostly FROM BEHIND and slightly above (a Subway-Surfers style chase
camera ~4 m back), at night under warm street lights and also in daylight.

Read first: `../404-game-recipe/docs/asset-contract.md`, `ASSETS.md` (runner row), `STYLE.md`,
`refs/objects/runner.png` (the approved design reference: orange hooded jacket, dark slim trousers,
white trainers, cross-body strap with a small pouch, short dark hair). Keep that DESIGN. Change the BUILD.

## Hard contract (the game breaks if any of these is wrong)
- ES module, `export default function (THREE) { ... return g }`, no imports, no textures, no files.
- Metres, lowest point y = 0, centred x/z, FRONT FACES +Z, the figure's LEFT is +X.
- `g.userData.joints` with exactly these keys, each an Object3D pivot located AT the anatomical joint:
  `hips, spine, chest, neck, head, l_shoulder, l_elbow, r_shoulder, r_elbow, l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle`.
  Hierarchy: hips > spine > chest > neck > head; chest > shoulders > elbows; hips > hip > knee > ankle.
- Every limb hangs down its joint's local -Y in the rest pose (arms at the sides, legs straight), so
  +rotation.x pitches a limb BACKWARD. Copy `g.userData.jointHints` from the current file verbatim.
- The animation system (`game/src/anim.js`) merges all meshes under each joint into ONE rigid piece
  per joint. So there is no skinning: each body segment is rigid, and joints must be hidden by
  OVERLAP - a rounded volume at each joint (shoulder ball, elbow, knee, hip) that both neighbouring
  segments bury into, so that at +-1.3 rad of knee flex and +-0.8 rad of hip swing no gap or hard
  hinge edge opens. Check by posing: set joints to a mid-stride pose and render it.
- The same final 6-line recentring block the current file ends with (vertex-measured box).
- Material names only from: plaster|stone|timber|tile|metal|fabric|foliage|ground (or unnamed).
  Skin is unnamed. No emissive anywhere. No vertexColors.
- Budget: <= 14,000 triangles, <= 90 meshes before merge.

## Proportions (the "too tall" fix)
- Total height 1.56 m (was 1.72). Stylised-athletic like mobile runner heroes, not a fashion figure:
  about 6.6 heads tall (head ~0.235 m chin to crown incl. hair), shoulders ~0.40 m wide, hips ~0.30 m,
  legs a touch under half the height, hands and feet slightly generous (feet ~0.26 m).
- Write the anchor heights (sole, ankle, knee, hip, spine, chest, shoulder, neck, head, crown) in the header comment.
- `runner.expect.json` next to it: `{ "width": 0.66, "height": 1.56, "depth": 0.36, "tolerance": 0.25 }`.

## Realism (the "wooden sculpture" fix) - what is wrong now and what to do instead
- NOW: the torso, pelvis, hands and shoes are BOXES; limbs are constant-radius capsules; flat planes
  everywhere, hard 90 degree edges. That is the mannequin look.
- DO: organic, tapered, continuous volumes. Tools that are allowed: LatheGeometry (profiles for
  torso, thigh, calf, forearm, neck), SphereGeometry scaled to ellipsoids, CapsuleGeometry,
  CylinderGeometry with two radii, ExtrudeGeometry with bevels, TubeGeometry, and you MAY modify
  `geometry.attributes.position` after construction (e.g. squash a lathe to an oval cross-section,
  flatten the back of a calf, bulge a chest) - then call computeVertexNormals(). Smooth shading.
- Torso: an oval cross-section that tapers from the shoulders to the waist then flares at the hips;
  the jacket is CLOTH over that: slightly looser than the body, a blouson hem that overhangs the
  waistband, a hood that sits as a soft collar mass behind the neck, soft folds (a few shallow
  wedge/ellipsoid ridges at the elbows and waist), raglan or set-in sleeve seams as thin tubes.
- Legs: thigh fuller at the top, tapering to the knee; calf with its belly high on the back;
  slim-fit trousers that break over the shoe with a cuff.
- Shoes: a real trainer silhouette - rounded toe box, sloped vamp, heel counter, a thicker
  midsole with a toe spring, tread line. Not a brick.
- Hands: relaxed fists / mitten with separate thumb - a palm ellipsoid plus a curled finger mass.
- Head: skull ellipsoid + jaw that narrows to the chin, ears, nose, brow ridge, a neck with
  trapezius slope into the shoulders; hair as overlapping ellipsoid clumps with a swept fringe and
  a tapered nape (he is seen from BEHIND - the back of the head, hood, shoulders, strap, pouch,
  seat and calves are the hero surfaces. Spend your detail there).
- COLOURS (this also fixes the owner's complaint that the runner "glows"): the old jacket 0xe8852a
  is far brighter than every other surface in the night street, so lamps blow it out. Use albedos
  a real garment has: jacket base about 0xb8571f with a slightly darker 0xa04a1b for panels/ribs,
  trousers 0x26272b, shoes off-white 0xbdb8ad with 0x8e887d dirt, sole 0x1a1819, skin 0xa97f5e,
  hair 0x15110f, strap 0x2c2c2e, pouch 0x3a3b3d, buckle metal 0x7a7f84. Roughness 0.8-0.95 for cloth,
  skin 0.65, shoe 0.7. Keep the jacket the single saturated thing on him.

## Deliver (write ONLY inside your own candidate directory)
1. `<your dir>/runner.js` and `<your dir>/runner.expect.json`.
2. Run `node ../404-game-recipe/harness/verify.mjs <your dir> --size=560` from the midnight-dash
   root until it reports clean. LOOK at `<your dir>/_verify/runner.png` with the Read tool and
   iterate on what you SEE (at least three look-and-fix passes; compare against
   `work/v2/runner/base/_verify/runner.png` - yours must be obviously less boxy).
3. A posed check: write a throwaway copy `<your dir>/posed/runner.js` that imports nothing, builds the
   same figure and applies a mid-stride pose to the joints before returning (l_hip.rotation.x=-0.7,
   l_knee.rotation.x=0.5, r_hip.rotation.x=0.55, r_knee.rotation.x=1.2, l_shoulder.rotation.x=0.5,
   r_shoulder.rotation.x=-0.5, both elbows rotation.x=-1.1, spine.rotation.x=0.12), verify that
   directory too, and LOOK at it: no gaps at knees, hips, elbows, shoulders; no limb poking through the jacket.
4. `<your dir>/NOTES.md`: anchor heights, triangle count, what you checked by eye, known weaknesses.
Laptop is on battery: do not run anything else heavy, no dev servers, no game runs.
Your final message: the candidate path, triangle count, and an honest self-assessment in 5 lines.
