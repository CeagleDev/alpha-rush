# Critic round 3 verdict (fresh critic, matched shutter, 810x1440 native, balanced shuffle)

RESULT: the game loses 4 of 4, all decisive, all called from the thumbnail before measuring.
"The margin is not two grades of the same picture - it is two different media. The reference frames
read as photographed places. The game frames read as a greybox with good lighting on it."
ONE SENTENCE: **the game frame is empty.** ~150 distinguishable objects in the reference, ~15 in ours.

## THE ONE PROPERTY: close the street
"The game is not rendering a back alley - it is rendering a four-lane boulevard, complete with dashed
lane markings and a centre line." A set-design error, not a shading error, and the root cause of most
of the rest: nothing is close enough to the camera to reward detail, the walls are too far to read
signage, there is no enclosure so there is no bounce, the sky opens to over half the upper frame, and
the ground dominates because nothing else is near. "Fix the ground perfectly and keep the boulevard
and you still lose all four pairs."
  sky fraction, upper 45 %   49-60 %  ->  <= 35 %   (reference 21-44 %)
  mid-band edge density y500-1000  6.8-8.7 -> >= 11 (reference 11.1-12.5)
  warm bounce on lower walls should appear WITHOUT being placed; highlight ceiling should climb off 231
"The reference alleys run roughly 3-4 m at the runner's depth and still hold two dogs abreast with
room. Three lanes of dodge space fits. Delete the lane markings regardless - no alley has them, and
they are currently the most legible graphic element on the ground plane."

## The street surface, asked directly: STILL BROKEN - and broken DIFFERENTLY, which is worse news
The albedo fix worked narrowly (median road luma 42-66 vs reference 33-51, if anything now slightly
bright) "but it was lifted to a single value". Masking everything above median+2.5s, what survives
scores 2.0-4.9 texture std against the reference's 6.2-17.5. "No, a surface does not remain. A
gradient remains."
THE MODEL WAS WRONG: our rebuilt grain is **film grain** - uniform isotropic pixel-scale noise over a
smooth ramp. The reference resolves into "individually countable stones, each with a lit top and an
occluded dark base, plus grit, cracks, litter and puddle edges". "Grain modulates value. Aggregate has
geometry, occludes, and casts shadow. They are not substitutes, and no amount of grain tuning converts
one into the other." Reference skew +1.7..+3.7 (lit micro-relief); ours reaches -0.10 (symmetric noise).
Three defects both earlier rounds missed:
  - the near-field road carries NO velocity streak: anisotropy 0.68-0.70 in all four frames vs the
    reference's 1.15-3.19. The ground under a forward-moving camera has the highest screen-space
    velocity in the picture and in ours it is the LEAST blurred thing. "This is backwards."
  - hard vertical tiling seams running the full height of the road in pairs 01 and 02.
  - reflections have no source identity: the reference's reflect the silhouette and colour of what made
    them and break over the stones; ours are smooth symmetrical grey cones, because there is no relief
    to break them. Decals (lane dashes, manhole rings) are flat-pasted with no relief or edge shadow.

## Motion blur, asked directly: EXTENT fixed, CHARACTER now a WORSE tell
"The shutter match fixed the wrong variable." Smear lengths are now plausible - that half of the
objection is addressed. But ours is discrete accumulation with too few samples: a lantern is six
countable opaque copies; shopfronts dissolve into a barcode of hard light/dark bars. Modulation INSIDE
our smear std 17.2 vs the reference's 7.2-12.9 - "the smear is lumpier than the object it is smearing".
"A crisp frame reads as a stylistic choice. A ghosted frame reads as a broken frame." Raise the sample
count until modulation is monotone, or move to velocity-buffer reconstruction. And the ground plane is
receiving no velocity at all.

## Other measurements, no overlap between the distributions
  hue entropy        reference 2.14-2.58 bits   ours 1.67-1.87   while ours has MORE saturated pixels
                     (64-67 % vs 32-47 %): "more colour, fewer colours - an ambient wash, not sources"
  highlight ceiling  pairs 01/02 clip at 231 and never reach white; every reference frame reaches 254-5
                     "the game's lights have no hot cores"

## Remaining priorities
2. Ground aggregate - geometry, not noise.   3. Blur sample count.
4. Frontage density and legible signage: not one kanji is readable in any game frame, and the reference
   frames are ALSO heavily blurred and their signs still read.
5. Light as sources, not wash: hot cores that clip, coloured pools carrying the source's hue, local falloff.
6. Palette breadth: green, magenta, cyan, cool fluorescent; drop the global orange saturation so they read.
7. Contact and clutter: the litter rectangles float - no contact shadow, no relief, no variety of shape.

## Instrument faults
- EFFECTIVE n IS ABOUT 2, NOT 4: our four frames are near-duplicates (same runner, pose, lantern, camera
  height). One genuinely different frame is worth more than three redundant ones.
- The reference set is not controlled either: two locations, and one frame carries far less blur.
- SUBJECT MISMATCH contaminates the judgement: the reference puts a dog - fur, warm rim light, organic
  silhouette - in the lower third; we put a humanoid in a flat orange jacket. "If the game's subject is
  a dog, show the dog. If it is not, this is the wrong reference and the comparison is mis-specified at
  the brief level."
- FORCED-CHOICE PAIRING MEASURES DISCRIMINABILITY, NOT QUALITY: "it will keep returning 4/4 long after
  the game is good, because there is always some tell. It can tell you that you have not arrived; it can
  never tell you that you have." Better now: show the game frame ALONE and ask "does this read as a
  finished night alley - yes or no, and what breaks it", at a 200 ms glance.
- No gutter: a 6 px divider makes the panels tone-map against each other in the eye. Use 40-60 px grey.
- The answer key sat in the same directory as the stimuli. CONTAINMENT FAILURE - fixed, keys now in work/keys/.
- Telling the critic the shuffle was balanced gave it a prior. Withhold that next time.
