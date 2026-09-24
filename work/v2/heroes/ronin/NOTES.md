# hero_ronin - KAITO, The Last Ronin

`hero_ronin.js` (15,746 triangles, 50 meshes before merge, 16 materials). `verify.mjs --size=560` clean:
0.55 x 1.59 x 0.428 m (crown 1.56 m; the ponytail arcs 3 cm above it), ground offset 0, centred.
`posed/hero_ronin.js` (mid-stride pose from RUNNER_BRIEF step 3, generated from the `/*@@POSE@@*/` marker) verifies clean
against its own expect (0.55 x 1.52 x 1.15 m).

## Build method
Candidate C's method, copied: every body / cloth segment is a subdivided SphereGeometry re-written by `tube()` (Hermite
profile of half-width / front depth / back depth / centre offset, ellipsoidal end caps, gaussian bulges, sine cloth folds),
computeVertexNormals() + position-keyed normal weld. Two additions to `tube()`: `ymap` (open hems, hairlines, the torn cape
hem, the kimono V) and `amap` (angle clamp: the cape's open front). Cords are TubeGeometry with a per-ring radius modulation
(`braid()`), the ponytail and loose strand are profile tubes bent along a CatmullRom curve (`bend()`), the katana is built
along +Y and aimed tip-to-tsuba (`aim()`), collar bands are subdivided strips laid on the torso surface (`strip()`).
No boxes, no textures, no vertexColors, no emissive; materials named fabric / metal (skin, stubble, eye white, scabbard unnamed).

## Anchor heights (world, m)
sole 0, ankle 0.075, knee 0.425, hip joint 0.79, hips root 0.85, spine 0.93, chest 1.08, shoulder 1.258, neck 1.315,
head 1.37 (chin 1.325), crown 1.56. Elbow 1.00, wrist 0.78. Same joint contract and jointHints as runner C.
Rest pose: shoulders rotation.z = +-0.17, elbows rotation.x = -0.10.

## Costume vs the reference (refs/alpha/char_ronin.png)
- Hair: dark top band (hairline 0.11 front, undercut at 0.13-0.146 on the sides / back), skin-toned stubble shell on the shaved
  sides, topknot with a red tie, ponytail streaming back and to his left, loose strand down the right side of the face.
- Kimono 0x4b566b (faded indigo, in the 0xb8571f luminance band) with crossed dark collar bands, bare chest V, wide open sleeves
  to the elbow (concave cap + dark lining ring so the opening reads as a hollow from behind), hem at mid-thigh (world 0.68).
- Red braided waist cord (3 turns) with a knot at the front-left, two hanging ends with tufts; on the HIPS joint.
- Haori cape 0x96382f, DoubleSide, on the CHEST: closed at the neck base, open down the front, flares behind (back depth 0.185
  at the hem so the katana and the swinging sleeves stay inside it), jagged torn hem, red braided cord round the collar and
  down both front edges with a tied loop + tassel on the left chest.
- Hakama 0x2a2b2f: narrow under the kimono, ballooning to a 0.086 ball at the knee, gathered cuff below the knee (on the knee joint).
- White wraps 0xbdb8ad on both forearms (over the back of the hand) and from below the knee to the ankle, with sawtooth
  bandage turns; tabi socks 0xa39d91, straw sandals 0xa08a58 with red thongs.
- Katana on the CHEST: dark scabbard from the LEFT hip (tip x +0.195, world 0.66, z -0.185) up over the RIGHT shoulder
  (tsuba at x -0.115, world 1.33), brass kojiri / koiguchi / tsuba / kashira, sageo wound at the mouth, wrapped hilt with
  red silk diamonds. This follows the approved image (hilt over his right shoulder, tip at his left hip, bell at his left hip);
  the task text said "hilt over the left shoulder" - the image was treated as the spec. Flip = swap the sign of x in TIP / TSUBA.
- Brass bell (lathe) hanging from the cord at the left hip, on the HIPS joint, set outboard (x 0.205) so the forward-swinging
  thigh clears it.

## Loose parts and the pose
- Cape, katana, cape cord: chest. Waist cord, knot, tassels, bell: hips. Ponytail, strand, tie: head.
- The kimono skirt is closed round the back and sides on the spine joint; below the hip line its FRONT is open and two front
  panels hang from the hip joints (left laps over right) so a thigh at -0.7 rad swings its own panel instead of piercing the
  skirt. Their tops are tucked 6 mm under the skirt's front edge.
- Posed check (Read tool on 640 px close-ups: knees, hips, elbows, shoulders, side, back, chase angle): no gaps at knees,
  hips, elbows or shoulders; sleeves stay inside the cape at +-0.5 rad; the scabbard tip clears both legs; the bell clears the
  left thigh; the ponytail clears the hilt.

## Checked by eye (5 look-and-fix passes at 640-1024 px, against the reference each time)
- Pass 1: sleeve shoulder domes pierced the cape top (blue blobs), cape neck ring rose to the chin, ponytail hooked straight up
  (1.61 m), 20.3k triangles. Fixed: cape profile widened over the shoulders and lowered to the neck base, tail curve laid back.
- Pass 2: shaved sides read as a full dark helmet (stubble too dark, top band too wide). Fixed: stubble 0x6e5a4a, band narrowed.
- Pass 3: ponytail too thin, top hair flat, wrap ridges invisible at game scale, 17.8k triangles. Fixed: thicker tail, +8 mm
  hair volume, sawtooth bandage turns, segment trims (cords, cape, skirt, thighs, hilt) to 15.5k.
- Pass 4 (posed): sleeve openings showed as flat blue discs from behind; right front flap lifted off the skirt on the back
  swing. Fixed: deeper concave cap + dark lining ring; flap top shortened and tucked.
- Pass 5: open eyes (white + iris + lid line) instead of slits; left flap widened to lap over the right.

## Known weaknesses
- The cape is a poncho volume with a jagged hem; the reference's torn holes and frayed threads are not modelled.
- The two front kimono panels are flat strips bent on the torso surface: in stride their edges look angular where they cross,
  and a sliver of hakama shows through the front slit (hidden from the chase camera).
- The waist-cord tassel hangs at the front-left hip, not down between the legs as in the reference (it would cross the thighs).
- Face is simple (small eyes, wedge nose, brow ridges); fine from the chase camera, bland close up. Skin 0xb68d6a is a
  little darker than the reference's pale tone to stay in the street's albedo range.
- Hakama are plain; the reference's stitched panels and worn patches are not there. The sageo cord on the scabbard is tiny.
- Ponytail is a frozen curve rigid with the head; it does not swing.
