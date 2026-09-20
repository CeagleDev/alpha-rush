# midnight-dash — what this is, and what is still wrong

An endless runner through a Showa-era Tokyo yokocho at blue dusk: three lanes, swipe to change lane,
up to jump, down to roll, a pack of three dogs chasing, tau coins to collect, and an elevated
expressway between alley sections. Built with the 404 game recipe: every 3D object in it is a
JavaScript module that returns a Three.js Group, generated from a reference image, verified from four
sides and chosen by eye. 58 assets, no mesh files.

## Gates
harness/jam.mjs against the shipped build, phone viewport, emulated 4G, real touch:
  ready 11.0 s (budget 20) · weight 4.4 MB (budget 10) · started by tap on #startb · moved 49.5 m
  peak draws 376 (budget 900) · peak tris 1,310,328 (budget 1.5M) · 60 fps · 0 errors · 0 404s · PASS
tools/gate.mjs, our own gate, drives 800 m with real swipes: 802 m, ~92 coins, 14 jumps, 8 rolls, PASS.

## Declared files (jam rules allow these; all geometry is code)
Atlas-generated: 5 tileable PBR sets (gold, asphalt, tin, plank, deck), a dusk sky panorama, 8 lightbox
sign faces, 2 noren. 2.2 MB total, WebP. The asphalt albedo was regenerated locally by
tools/asphalt_regrade.py. The Bittensor tau on the coin is traced from the user's own logo file into 22
Shape commands and extruded as geometry, not a texture. Audio is procedural (no files).

## What three critic rounds fixed
r1 the street surface was a flat dead plane. Root cause: a 58:1 texture stretch — one texel row of
   asphalt smeared over each 30 m chunk in the direction the camera looks.
r2 the road had reflections but no material under them. Root cause: the Atlas asphalt map was an
   already-lit, gold-graded night photo (luma 30, sat 0.79) where every other albedo is a base colour;
   multiplied by the road's near-black tint the diffuse albedo reached the shader at 1.3e-4.
r3 the set read as a four-lane boulevard, not an alley. Shop fronts closed from 9.0 m to 7.4 m, the
   dashed centre line deleted, the camera pitched from 5.2 to 8.6 degrees.
Also found along the way: assets.init was never called so the whole world built EMPTY while the gate
passed on 8 draw calls; the eight sign sprites were generated but never applied; bakeStatic merged
nothing (185 materials per chunk, 1,121 draws) until colour moved into vertex attributes; and
ship.mjs --stamp created TWO instances of every module because main.js's dynamic imports were not
stamped — only the jam gate, run against what was actually shipped, caught that one.

## STILL WRONG — the honest list
The stopping rule was three critic rounds. All three ended 0 of 4 in blind pairs against the reference
video. The build got measurably closer every round and is not at reference standard.

1. THE FRAME IS EMPTY. The critic's own summary: roughly 150 distinguishable objects in a reference
   frame, about 15 in ours. Everything below is downstream of that.
2. The ground is a gradient, not a surface. Our grain is FILM GRAIN — isotropic pixel-scale noise over
   a smooth ramp (skew reaches -0.10). The reference resolves into countable stones with lit tops and
   occluded dark bases (skew +1.7..+3.7). "Grain modulates value. Aggregate has geometry, occludes, and
   casts shadow. They are not substitutes." This needs relief, not more noise.
3. Sky is still 40.8 % of the upper frame against the reference's 29 %. Closing the street helped the
   mid-band (9.34 -> 10.33 edge density, bar 12.20) but the geometry cannot close the rest: the
   reference's height-to-width ratio is ~2.3 and ours is ~0.95 even after narrowing. It needs either
   much taller frontage or lanes narrower than 2 m, which is a gameplay decision.
4. No legible signage. Not one kanji reads in any frame. The Atlas sprites are applied and no longer
   clip to white, but the faces are too small and too far to resolve. The reference's signs read THROUGH
   heavy motion blur.
5. Lights are a wash, not sources. Hue entropy 1.67-1.87 bits against 2.14-2.58, while carrying MORE
   saturated pixels — "more colour, fewer colours". Highlights clip at 231 and never reach white, so
   nothing has a hot core.
6. The ground receives no velocity: gradient anisotropy 0.68-0.70 where the reference is 1.15-3.19. The
   surface with the highest screen-space velocity in the picture is the least blurred thing in it.
7. Hard vertical tiling seams down the road in some frames.
8. Litter floats — no contact shadow, no relief.
9. The expressway zone is the weakest: two lamps per 30 m and long unlit spans; f2 still reads washed.
10. tools/gate.mjs --shutter is DISCRETE accumulation and ghosts at low sample counts (a lantern becomes
    six countable copies). Frames for a critic should be captured crisp, or the sample count raised
    until modulation inside a smear is monotone. The game itself has no motion blur, which is fine.

## Instrument, for whoever runs the next round
Blind pairs must use tools/pairs.py (equal 810x1440 panels, verified balanced shuffle, keys written to
work/keys/ OUTSIDE the stimulus directory — a critic caught that containment failure). Capture with
  node tools/gate.mjs game --seed=7 --nohud --viewport=810x1440
because band statistics measured at the phone's 390x844 disagree badly with the same build measured at
the bar's shape (see CLAIMS.md). Two warnings from the round-3 critic worth heeding: our four frames are
near-duplicates so effective n is about 2, and forced-choice pairing measures discriminability, not
quality — "it will keep returning 4/4 long after the game is good". A better next instrument is a single
frame shown alone: does this read as a finished night alley, yes or no, and what breaks it.
A Fable-judged verdict on the identical round-2 pairs is still outstanding as a judge A/B.
