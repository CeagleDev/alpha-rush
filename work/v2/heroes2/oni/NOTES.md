# hero_oni - RAIDEN, the Neon Oni: detail pass + wardrobe (HERO2_BRIEF / HERO_API)

Files: `hero_oni.js` (implements the API: OUTFITS, build(THREE, {outfit, palette}), default = outfit 1 / palette 1),
`hero_oni.expect.json`, throwaway copies `outfit2/`, `outfit3/`, `posed/` (mid-stride pose from RUNNER_BRIEF step 3) and
`closeup/` (head and left hand of each outfit detached to the origin). All regenerated from the main file by a sync script;
every directory verified with `node ../404-game-recipe/harness/verify.mjs <dir> --size=640`.

## Triangle counts (verify.mjs, meshes before the per-joint merge)
| outfit | id | tris | meshes | size (m) |
| --- | --- | --- | --- | --- |
| 1 Neon Mechanic (reference) | `mechanic` | 25,337 | 70 | 0.537 x 1.611 x 0.355 (1.611 = horn tips; body 1.56) |
| 2 Street Oni | `street` | 21,145 | 52 | 0.535 x 1.598 x 0.394 |
| 3 Rider | `rider` | 21,787 | 70 | 0.564 x 1.594 x 0.335 |
| posed (outfit 1, mid-stride) | | 25,337 | 70 | 0.491 x 1.528 x 1.158 |
Head close-ups: 7.3k / 6.8k / 6.0k tris; hands 1.7k / 1.5k / 1.7k. Budget 26,000 per outfit: outfit 1 has ~660 tris of headroom.

## What is shared (identity) and what an outfit changes
Shared in every outfit: the FACE under the mask (skin head tube 24x16 with socket / brow / nose / cheek / jaw / chin bulges,
eyeballs with white + iris + pupil, upper and lower lids as spherical crescents, lash line, brows, nostrils, lips + mouth line,
ears with concha / helix / lobe), the black spiky hair (a hair shell + ~60 flat tapered blade clumps), the blue oni MASK with
cut EYE HOLES (the real eyes show through; gold rim + dark socket ring hide the cut edge), angry brow bars, cyan tracery,
snarl creases, a wide grin (dark cavity, tooth band with 9 gap lines, two fangs up from the lower jaw), gold horns, and the
HANDS (palm shell, four 3-segment curled fingers, 2-segment thumb, knuckle bulges; glove modes: fingerless / bare / armoured).
- Outfit 1 `mechanic`: cropped orange jacket (open front, black yoke, two black bands with emissive strips, double-walled hem,
  stand collar, zip pocket, shoulder patch), black tank with the skin scoop, belt with prong buckle + loops, baggy cargo trousers
  (curved cargo pocket + flap, holster straps + battery pack + wrench on the right thigh), knee pads, armoured boots with glow soles.
- Outfit 2 `street`: hoodie with the HOOD UP over the horns (double-walled hood, drawstrings with aglets, kangaroo pocket,
  ribbed hem), chest rig (three pouches, straps over the shoulders), sling bag on the back, cargo shorts over leggings, socks
  with a reflective stripe, chunky white-soled sneakers (tongue, laces, heel tab). Hands bare. Hair mode 'fringe'.
- Outfit 3 `rider`: armoured moto jacket (chest plates, 7-segment spine protector, princess + side seams, centre zip, padded
  collar), hard shoulder / elbow / knee / shin / hip plates, knee slider pucks, HALF-HELMET over the skull with the horns on the
  temples and a brow visor, armoured gloves with knuckle plates + knuckle caps, tall boots with two exhaust pipes whose mouths
  glow. Hair mode 'nape' (only the nape strands show under the helmet).

## Palettes (recolours only; skin / eyes / hair / lips never change)
Slots: primary (main garment), dark (black panels / straps / cuffs / belt), base2 (trousers / shorts / leggings), glow
(the ONLY emissive, 0.8), mask, maskLine (tracery), gold, steel, armour, white (teeth / midsoles / knee pucks).
- mechanic: Neon Orange (reference: orange / black / cyan, blue mask), Plasma Purple (purple jacket, violet glow, dark-violet
  mask), Hazard Yellow (yellow jacket, red-orange glow, black mask), Arctic White (white jacket, slate panels, ice-blue glow, pale
  blue mask, steel instead of gold).
- street: Charcoal (grey hoodie, cyan glow, blue mask), Red Alert (oxblood hoodie, red glow, black mask), Teal Drift (teal hoodie,
  mint glow), Sand (sand hoodie, brown panels, amber glow, dark-bronze mask).
- rider: Black Chrome (black leather, chrome plates + horns, orange exhaust glow, blue mask/helmet), Cyan Circuit (navy leather,
  cyan glow, cyan tracery), Magenta Pulse (plum leather, magenta glow, plum mask), Gold Rush (dark leather, gold plates / helmet,
  amber glow).

## Build notes (what changed in this pass)
- FOUND AND FIXED: `slab()` was a 1-segment box, so anything wide wrapped on a curved surface with `wrapOn()` kept its flat
  middle INSIDE the surface (only the corners reached it). The mask's teeth were built and invisible; the kangaroo pocket, knee
  cups, helmet visor lip and cargo pockets were mostly sunk. `slab()` now subdivides by width / height and `cplate()` (a
  subdivided box with rounded corners, chamfered front edge, no back face) replaces the bevelled extrusions for every plate
  that is wrapped on cloth or armour.
- Eyes: bigger white eyeball, lids reduced to crescents so the white shows round the iris, eye holes 0.30 rad x 12.5 mm with a
  gold rim and a dark socket ring (the two rings no longer cross at the nose bridge).
- Grin: dark cavity 88 x 21 mm, tooth band 80 x 12 mm with 9 gap lines, two fangs from the lower jaw, lips slightly prouder
  than the teeth, heavier brows with the inner end low.
- Hair: the round clumps became flat 4-sided blades (wide across the surface, thin along the normal, tapered to a point),
  rooted 8 mm inside a rippled shell: two fringe rows over the mask, a crown ring, a top, and two shingle layers on the sides
  and back lying flat and overlapping. From behind at chase distance it reads as a spiky black mass, not a dome with thorns.
- Rider glove: knuckle plate moved above the finger bases (it was covering them), armour caps on both knuckles of each finger.
- Rider's first palette keeps the blue mask / helmet (identity) instead of black.
- Hood: fold bulges and side-panel seams on the back.
- Budget trims: mask tube 28x22 -> 24x18, eye whites 14x10 -> 12x8, chest tank 18x12 -> 16x10.

## Checked by eye (Read tool on 640 px tiles and 2x zooms of the closeups; four look-and-fix passes after the first)
Front / back / both sides / three-quarter of outfit 1; head front / side / back / three-quarter and 2x mouth-and-eyes zoom;
left hand front / side / back for all three outfits; front / back / three-quarter of outfits 2 and 3; posed side and
three-quarter (no gaps at hips / knees / elbows / shoulders, wrench and pack clear the pelvis); legs / boots zoom.

## Known weaknesses (honest)
- The lids still read as a heavy squint: the upper lid crescent covers the top third of the eyeball, so the whites show
  mostly beside the iris, not above it. The face under the mask (nose, lips, cheeks) is fully built but only the eyes, the
  cheeks behind the mask edge and the ears are ever visible.
- Hair blades are 4-sided; in the closeup individual blades read as folded paper. Fine at chase distance.
- Fingers are straight-ish capsule chains; the fingerless glove's proximal segments and the palm merge into one dark mass from
  some angles. No fingernails.
- `closeup/face2` (outfit 2 head) WARNs: the hood's back is plain cloth and the edge-density test calls it featureless even with
  the fold bulges and seams. The full outfit 2 verifies clean.
- Cloth folds are low-amplitude sine ridges; the kangaroo pocket and cargo pockets are curved boxes with hard corners, not sewn
  patches. The rider's plates are all the same rounded-rectangle language.
- Width 0.537 m vs the 0.66 in expect.json (inside the 0.25 tolerance): the arms hang closer than the reference's A-pose.
- Outfit 1 is 660 tris under the 26k limit; nothing more can be added to it without a trim elsewhere.
