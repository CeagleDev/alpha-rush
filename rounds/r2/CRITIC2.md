# Critic round 2 verdict (fresh critic, 4 blind pairs, 810x1440 native, shuffle verified 2/2)

RESULT: the game wins 0 of 4, decisive on all four. "I had all four before I ran a single measurement."
Losses split: pairs 01/02 lose on ABSENCE (a thinner picture) — recoverable. Pairs 03/04 lose on ERROR
(3.5–4.1 % of pixels clipped to paper white vs the reference's 0.41–0.55 %) — "a viewer with no stake
would call those two frames broken, not stylised."

## On round 1's property (the street surface): BETTER, NOT AT REFERENCE. "The round paid for roughly half of itself."
Landed: the plane is no longer flat and dry; sign colour runs down the road; there is a wet sheen.
Did NOT land: "you added the reflection layer but not the material underneath it." With 220 px road
patches normalised to their own 2nd–98th percentile (so this cannot be argued away as a grading
difference), the reference asphalt shows irregular pebble-scale albedo variation, independent colour
variation and embedded litter at several scales; ours shows a smooth bloom gradient, single-pixel
un-antialiased sparkles and parallel scratch streaks that visibly tile. "Strip the sparkles and the
highlight blob and there is no diffuse signal left. It is not a dark road. It is not a road."

## THE ONE PROPERTY FOR ROUND 3
**Give the road a diffuse base: correct albedo VALUE and an actual texture.** Not the reflections —
those exist. The layer under them. It owns ~50 % of the pixels, it is the measurement furthest from
reference, the finding is grade-independent, and it completes work already paid for.

Targets (road band unless stated):
  near-field p25 luminance   4.9–11.5  ->  17–20      (reference 17.4–18.6)
  near-field p75 luminance   25.7–40.5 ->  28–31      (reference 24.8–31.0); IQR band 10–14 levels wide
  Laplacian variance         2954–6972 ->  low hundreds (reference 70–311)  <- our single-pixel sparkle is the cause
  mean saturation            0.68–0.74 ->  0.37–0.53
  frame-wide p05 luminance   2.4–7.0   ->  13–17       (reference 13.1–17.4)
  eye test: cover every specular highlight with your thumb and the ground must still read as a
  surface. Right now it reads as a hole.
Note: the sparkles are single-pixel and un-antialiased — they will crawl and shimmer once the camera
moves, and they have been pushed that hard only because they are doing all the work of selling "wet"
on their own. Give them a material to sit on and they can come back by more than half.

## A WIN, stated so it is not buried
**The night sky is AT REFERENCE.** Sky-only pixels: game RGB (26.4, 56.9, 101.0) vs reference
(28.3, 56.8, 99.5), matching in all four pairs. Do not go chasing the sky; it is solved.

## Remaining, in the critic's priority order
2. Highlight clipping on emissive signage: 3.5–4.1 % clipped vs 0.41–0.55 %; p95 238–240 vs 141–142.
   Cap emissive so lit surfaces land below ~200, put the sign artwork INTO the emissive texture, raise
   the bloom threshold.
3. Signage typography: every vertical surface in the reference carries type; ours are blank rectangles.
   "Blank glowing boxes are the loudest unfinished tell after the floor" — and it is density at zero
   geometry cost.
4. Kerb-line set dressing: the reference packs its bottom corners; we have long empty pavement runs,
   and the awning/lantern module visibly repeats (two identical green pharmacy crosses in one frame).
5. Street width: our sky is 18.5–23.5 % of frame vs 13.7 %; road 293–478 px wide at y=300 vs 50–325.
   "The game is a boulevard; the reference is an alley." Narrowing brings the light sources close to
   the ground and fixes much of the floor darkness for free. Halve the gap rather than match exactly —
   it collides with lane width.
6. Depth cueing: no aerial perspective, no DoF, no motion blur; uniform aliased sharpness (frame
   Laplacian 1281–1462 vs 162–352).
7. Character and prop materials: cylinder limbs with visible seams, sphere heads, flat-shaded cones.
8. The painted white lane line: a yokocho has no road markings; it reads as a generic road asset.

## Instrument faults (two serious)
- MOTION BLUR IS IN ONE SET ONLY. Every reference frame carries camera and per-object blur; no game
  frame has any. It inflates the gap on silhouette, aliasing and readability. Recapture with matched
  shutter, or the next verdict measures the artefact again. (Does not rescue the floor, the clipping
  or the blank signs — those survive any amount of blur.)
- LOCATION MISMATCH: the reference is a 2–4 m yokocho; ours is a 10–12 m street with kerbs, pavements
  and lane markings. "Stop comparing an alley to a boulevard and calling the difference a quality gap."
- Subject mismatch (low furred animals vs a tall humanoid), reference-set homogeneity (all four frames
  are one title, one location, possibly one shot — diversify), and unknown grade parity.
