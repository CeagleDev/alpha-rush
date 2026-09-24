# hero_oni - RAIDEN, the Neon Oni

`hero_oni.js` (15,992 triangles, 94 meshes before merge, 15 materials). `verify.mjs --size=560` clean:
0.545 x 1.595 x 0.352 m (the 1.595 is the horn tips; crown of the hair ~1.55, body 1.56 as briefed), ground 0, centred.
`posed/hero_oni.js` (mid-stride pose from RUNNER_BRIEF step 3) also verifies clean: 0.491 x 1.505 x 1.138 m.

## Build method
Runner candidate C's technical model, unchanged: every body segment is a subdivided SphereGeometry re-written by `tube()`
(Hermite radius-by-height profile, ellipsoidal caps centred on the joints, gaussian bulges, sine folds, welded normals),
bevelled ExtrudeGeometry plates for pockets / pads / pack, TubeGeometry seams for piping and cable lines, footprint extrusions
for the soles. Same joint contract, same jointHints, same 6-line recentring block.
New helpers: `amap` on `tube()` makes an OPEN shell driven by the sphere's own u coordinate (the free edges land exactly on the
sphere seam): the cropped jacket with its front opening (`openFront(gap(y))`), the mask over the face (`frontOnly`), the black
shoulder yoke, the collar stand and the bare-chest patch inside the tank's scoop. `grow(S, d)` offsets a surface while KEEPING
its bulges (a trim never sinks into a muscle). `band()` pushes a short tube's collapsing poles past its ends so a belt / stripe
is full radius over its whole height. `stretchFrom()` maps a shell's rows onto a curved lower edge (hairline, neckline)
instead of clamping, so the edge is smooth rather than saw-toothed. `slab()` (12-tri box) replaces bevelled plates for rivets,
loops, buckles, brows, teeth.

## Anchor heights (world, m)
sole 0, ankle 0.075, knee 0.425, hip joint 0.79, hips root 0.85, spine 0.93, chest 1.08, shoulder 1.258, neck 1.315,
head 1.37 (chin 1.325), crown ~1.55, horn tips 1.595. Elbow 1.00, wrist 0.78. Shoulders at x = +-0.15, hips 0.30, feet 0.27.

## Design match (refs/alpha/char_oni.png)
- Head joint: skull (skin) + glossy blue mask shell over the face (brow ridges, eye sockets, nose, cheek bulges, grin mass,
  black rim piping, unlit cyan tracery, white eyes with pupils, angled black brows, bared teeth), gold curved horns from the
  mask's temples, black hair shell with 20 swept spike clumps (fringe over the mask top, crown, layered down the back).
- Chest joint: black tank top (scoop neckline over a skin patch), cropped orange jacket (open front, black yoke over the
  shoulders, stand-up collar, two black bands with emissive cyan strips at chest and hem, front-edge and hem piping, zip pocket
  on his left chest, round patch on his right shoulder). Spine joint: the tank's lower half. Hips: cargo seat, back pockets,
  waistband, black belt with belt loops and steel buckle.
- Arms: orange sleeve, black shoulder cap with two orange chevrons, black band + cyan strip round the upper arm, black outer
  stripe with cyan line; forearm: sleeve end, ribbed black cuff, bare skin with two emissive cyan cable lines, fingerless glove
  (black wrist band with a cyan stud and gold tag, orange back-of-hand panel, black palm and curled fingers, skin fingertips,
  three emissive knuckle studs).
- Legs: baggy cargo trousers (thigh and shin folds, bag over the boot top, ribbed elastic cuff), LEFT thigh cargo pocket with
  flap, RIGHT thigh (-X) two holster straps with steel buckles, battery pack with an emissive cyan line, adjustable wrench (head
  up beside the belt). Knee pads: two bevelled armour plates bent round the knee, black straps. Boots: armour shaft rigid with
  the shin (front lacing, side plates, heel plate, top strap with gold buckle, gold rivets), foot on the ankle (chunky bevelled
  outsole / emissive cyan glow layer / midsole, tread lugs, armoured upper, black toe cap, two buckle straps, gold heel vents,
  emissive cyan ankle disc and toe strip).
- Emissive ONLY on the cyan strips / studs / cable lines / boot glows / pack line: colour 0x0e1f1f, emissive 0x2fe3da at 0.8.
  Materials named fabric | metal or unnamed (skin, mask, sole, eyes). No vertexColors, no textures, no imports.
- Colours: jacket 0xb8571f, blacks 0x1a1819 / 0x1e1d1f / 0x232326, armour 0x2e3136, gold 0x9c7a2c, steel 0x8a8e93,
  mask 0x1b2d8c, whites 0xbdb8ad, skin 0xa97f5e, hair 0x15110f.

## Joints (no skinning)
Cap radii: hip ball 0.084, knee 0.062 / 0.060, shoulder 0.058 (cap 0.061 over it), elbow 0.045 / 0.0425, ankle ball 0.042.
The boot shaft is on the SHIN piece and the foot on the ankle piece; the foot's upper rises 0.06 into the shaft (clearance for
the anim's +-0.3 rad ankle). The knee pad is on the shin piece at r >= 0.068 from the joint, so at 1.2 rad of flex it stays
outside the thigh cap. Wrench / pack / pocket ride on the thigh pieces; nothing hangs loose.

## Checked by eye (Read tool, 700 px close-ups from a scratchpad renderer + the verify sheets; 10 look-and-fix rounds)
- Chase view (behind + above), back, front, sides; head front / back; torso front / back; arm; legs; boots front / back.
- Posed: full three-quarter, knees, elbows, side: no gaps at hips / knees / elbows / shoulders, thigh stays inside the
  trouser seat, wrench and pack clear the pelvis and jacket hem, arms clear the jacket.
- Fixes made from what I saw: 24k -> 16k triangles (bevelled plates on rivets / loops / buckles replaced by 12-tri slabs, seam
  radial 5 -> 4, segment counts trimmed); hedgehog hair replaced by shorter swept clumps; horns enlarged and moved out to the
  temples; mask raised under the hairline; brows flipped from sad to angry; black body poking through the skin patch and the
  shoulder cap (offset copies had lost the parent's bulges); saw-toothed neckline / hairline (clamp -> stretch); a thick collar
  ring replaced by a stand-up collar; a saw-toothed "folded edge" experiment on the hem / yoke reverted to hidden flat caps +
  piping; cyan strips that were collapsing into cones (2-ring tubes) rebuilt with `band()` so they read as in the reference;
  wrench floating off the thigh pulled in; cargo shins bagged out.

## Known weaknesses
- The mask is simpler than the reference's hannya: no fangs / lip modelling, the grin is a slab with tooth gaps; the eyes are
  small ovals. Reads as "blue oni mask with horns" from the chase camera, bland in a close-up.
- Hair is clumps on a shell; from behind at night it reads mainly as silhouette (near-black as briefed).
- The jacket's shoulder chevrons are two thin seams, not panels; the reference's chest patch is a plain disc.
- Boots are less ornate than the reference (no exposed gold gear at the heel, straps are simple half-tori).
- Faint rigid-joint creases at knees and elbows in the rest pose (same as the runner).
- Width 0.545 m vs 0.66 expected (inside tolerance): arms hang closer than the reference's A-pose. Height 1.595 with horns.
