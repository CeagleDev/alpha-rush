# Critic round 1 verdict (fresh critic, 4 blind pairs vs the bar)

RESULT: lost 0 of 4 pairs, DECISIVE on all four. "It does not stand next to the real set. It fails."

## THE ONE PROPERTY
**The street surface. Make the ground a wet, reflective, textured plane that returns the signage.**
The road is the bottom ~45 % of a portrait frame and the region the player's eye is locked to; at 6x
it has no aggregate grain, no seams, no puddles, no debris and no contact shadow under the runner or
the dogs — "nothing in the frame is standing on anything". It is also the MECHANISM for three other
complaints: a wet road is how signage becomes light, and it is where all the reference's hue variety
lands. Brightening lanterns over a matte road just gives hotter pink ellipses in a dark frame.

Measurable targets the critic set:
  bottom-third edge energy          4.5–7.8  ->  12–20  (reference band)
  pixels above luma 235             0.006–0.068 %  ->  0.7–2.0 %
  bright pixels outside red/orange  0–8 px  ->  several hundred
  bottom-third std dev              up, with a bright tail rather than a narrow mid-grey

## The rest, in the critic's priority order
2. Wire density — SUBTRACT. 25–30 identical black catenaries alias into grey speckle; cut ~2/3, vary gauge/sag/depth.
3. Light colour is monochromatic: every source is the same orange-red. The reference runs green, blue, cyan, white and warm in one frame.
4. No emissive cores — lanterns are 60 %-luma pink ellipses; nothing in any frame clips.
5. No contact shadow / AO under runner, dogs or ground props.
6. Near-camera clutter missing: the first metres of both walls are empty; the reference packs that zone.
7. Character shading: the jacket is flat orange, no rim light from lanterns directly above.
8. Sky is flat cobalt; the reference grades navy to warm brown at the roofline (city glow).
9. The far end of the street terminates in a flat dark block — no aerial perspective or distant lights.

## Instrument faults the critic caught (all real, all fixed before round 2)
- THE BLINDING FAILED: our frame was LEFT in all four pairs (KEY.json confirms). Verdict's confidence is void; its
  measurements are position-independent so the findings stand.
- Aspect mismatch leaked the answer: our slot 250x502, the bar's 304x502, fixed per side. FIXED: gate --viewport=810x1440
  captures at the bar's exact shape, so both sides are now identical (810x1440).
- Frames judged at 250 px wide — a thumbnail. FIXED by the same change.
- Motion blur present in the reference only (its camera moves, ours is a still capture). Not yet addressed.
- ~690 px of black between the two frames; the eye cannot hold both at once.
- Subject mismatch: the reference is dog-POV with dogs as subject; ours is a human runner. Weakens composition-level
  conclusions only; the light/surface/value findings do not depend on it.
