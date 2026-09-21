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

## Behaviour round (Fable critic, 2026-09-20) — what changed, what is still open
Evidence: a 4,662-frame screencast with the driver's decision log, consecutive-frame strips, and
tools/clashcheck.mjs, an in-engine probe that tests the runner's box, every dog, every live obstacle
box and coin, and the ground under each, 25 times a second (work/fable1/). Probe verdict now, on
seeds 7 and 23 over 800 m and on an unsteered run into the obstacles: ZERO clashes of any class.
Fixed from the critic's 18 findings:
 - the dogs ran through vans, carts, sedans and crates (141 instances): the pack now steps to a free
   lane at the next row, tested on where each dog's body is, and holds it until the row is passed;
   x is clamped to the carriageway so no dog runs the verge.
 - the runner strobed at ~3 Hz: the road-crossing lantern/noren strings were placed turned by 90 deg
   and lay DOWN the lane (six lanterns a metre apart over his head); strings now cross, practicals
   cluster and fade instead of hard-switching.
 - the scaffold pole and the low gantry floated 1.3 m in the air (every ROLL item was hoisted; only
   the banner is authored base-at-hem). Instances stand on the ground; ROLL hitboxes still start at
   the 1.3 m clearance line because the thing in the lane is the bar, not the legs.
 - a 1.25 m crate only existed to 0.75 m for the jump test (shins through the top crates): cap 0.9.
 - the expressway's BLOCK (1.02 m divider) was lower than its JUMP (1.2 m barrier): blocks there are
   now broken-down vehicles.
 - head-on contact: light items are KNOCKED OVER (tumble off the lane, stop being solid); a van is a
   WALL the runner bounces off and stalls against - dodge out of the lane within 0.6 s or the pack has
   him. Before, runner and camera passed straight through the crate stack.
 - the pack eases in over ~0.6 s on a hit instead of lurching 1.4 m in one frame.
 - coins: vertical collect tolerance 1.15 -> 0.6 m so arc coins need the jump; a missed coin is
   dropped before it flies through the lens.
 - roll ball held to the last 0.05 s; stumble is arms-forward, not the jump's spread; lane lean legible.
 - camera 1.3 -> 1.9 m so the next row shows over the hero's shoulder and obstacle tops clear the
   lens; the death cam stays on the runner; the death card waits 1.4 s for the fall.
 - the low gantry narrowed so its columns stay inside the lane.
Still open from that round:
 - lane-0 obstacles may still be hidden behind the hero until late (camera raised; not re-measured).
 - the ramp and expressway road read flat and dark with a faint tile grid (albedo 0.016 vs the
   alley's 0.019, roughness 0.45; no clutter to break the tiling).
 - a hit on a ROLL bar while upright: the head passes through the thin pole after the stumble.
 - the critic's hand-test list: swipe feel and latency on a real phone; restart in place; death by
   pack on open road; the banner_cluster hems at 1.3 m; landscape aspect; expressway pop-in at 150 m.

## Rules pass from the reference games (2026-09-21)
Looked up Subway Surfers, Temple Run, Talking Tom Gold Run and Sonic Dash and aligned our rules:
 - CHASER VISIBILITY (SS guard / TR monkeys): pack 2.4 m behind for the first 3.5 s, then falls out of
   frame (hidden outright beyond 6 m); any stumble brings it surging to 1.9 m for 6 s
   (state.packChase counts down); a SECOND stumble inside that window = caught.
 - CRASH vs STUMBLE: a hard obstacle head-on (van, cart, sedan, vending machine) ends the run on the
   spot; light obstacles (crates, cooler, bicycle, barrier, banner/bar to the head) and side clips are
   stumbles. Light items still get knocked over.
 - SIDE CLIP mid lane-change bounces the runner back to the lane he came from (SS train-side bump).
 - SLIDE 0.5 -> 0.8 s (user: "too quick"); swipe UP during a slide cancels into a jump; swipe DOWN in
   mid-air is a fast-fall that lands into a slide (SS's jump-cancel). Lane changes in the air were
   already allowed.
 - Expressway "barricades" the runner passed through were guard rails placed ACROSS the road (asset
   authored along X, no rotation): edge furniture now runs along the road.
Not built yet, proposed from the same research: power-ups (magnet, shield/helmet, score multiplier,
jetpack-style flight section), running on top of vehicles via ramps, coins as one-hit protection
(Sonic Dash rings), a dash meter filled by coins, missions/daily goals, a boss section (Tom Gold Run).


## 2026-09-21, second batch (owner's seven requests, see REQUESTS.md)

What changed
- Subway Surfers layer: `src/powerups.js` (magnet 10 s, omamori charm = one-crash shield 20 s, x2 score 12 s,
  super sneakers 10 s; one pickup per chunk at most, none before 120 m, always in a lane that is free in the
  row ahead), `src/progress.js` (score = metres x multiplier + 10 x multiplier per coin; three missions per
  set; a finished set raises the multiplier for good, cap x30; best score; localStorage `md.save.v1`).
  Four new code-geometry assets `pickup_*.js` (single candidate each, verified clean, picked by eye).
- Third scene: track pattern is now A x6, RU, X x6, RD, D x6, B x6 (26 chunks, 780 m). `track.dayAt(z)` drives
  `lighting.applyTimeOfDay()`: sky stops, own DirectionalLight sun (ahead-left at sunrise, round the left,
  behind-left at sunset), fill, bounce, exposure, haze, emissive exposure, practical pool, ground pools,
  reflection streaks, road ambient light map, road dries and lightens by day, day PMREM swapped at the midpoint.
- Runner: candidate C of three (work/v2/runner/{a,b,c}); 1.56 m; hitbox 1.55 / 0.8 m; camera HERO_H 1.56, 25 %.
- Runner "glow": HERO_ALBEDO 0.62 in player.js; HERO_SOFT_M / HERO_E_MAX in lighting.applyPool.
- Coins: vertex tones (rim/tau full, field dark bronze), near-white-yellow colour, metalness 0.62, emissive 0.16.

Measured: tools/gate.mjs PASS (802 m, 88 coins, 14 jumps, 8 rolls, peak 484 draws, 1.33M tris, 0 errors);
clashcheck seed 7: 0 clashes over 801 m; harness/jam.mjs PASS (ready 11.6 s on 4G, 4.5 MB, 402 draws, 1.27M tris).

Still wrong / not done
- Daylight has NO cast shadows (a sun shadow pass would redraw ~1M triangles); grounding is contact shadows only.
- The far skyline keeps some lit windows by day and reads blue in the haze.
- Day street reuses the night street's kit; it has no assets of its own yet (market stalls, trees, awnings in colour).
- A 1-lane low gantry's leg fills a third of the frame for ~0.1 s as the camera passes it on the expressway.
- textures/sky_day.webp (Atlas FLUX.2 Max) ships in the folder but is OFF until the owner signs it off (?daysky=1).
- Not built from the reference games: running on vehicle roofs via ramps, moving traffic, a flight section,
  revive, daily challenge. Power-up pickups were not three-candidate assets.
- The rebuilt runner's face and hands are simple; fine from the chase camera, weak on the title screen.
