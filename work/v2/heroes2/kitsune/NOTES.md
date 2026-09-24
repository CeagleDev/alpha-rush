# hero_kitsune v2 - YUZU, three outfits x four colourways

`hero_kitsune.js` implements `work/v2/HERO_API.md` (OUTFITS, build(THREE, {outfit, palette}), default export = shrine/vermilion;
unknown ids fall back to the first outfit / first palette). Reference `refs/alpha/char_kitsune.png`. Same joint contract, anchors and
`tube()` construction as the v1 file (`work/v2/heroes/kitsune/NOTES.md`); the shared body is built once and each outfit only hangs
garments on the joints, a palette only changes material colours.

## Triangles (404 verifier, --size=640, all clean)
| outfit | id | tris | meshes before merge | rest box (m) |
|---|---|---|---|---|
| 1 Shrine Courier (reference) | `shrine` | **25,066** | 107 | 0.627 x 1.627 x 0.678 |
| 2 Festival Yukata | `yukata` | **24,208** | 108 | 0.606 x 1.623 x 0.673 |
| 3 Night Courier | `courier` | **20,014** | 111 | 0.539 x 1.623 x 0.676 |
| posed (shrine, mid-stride) | | 25,066 | 107 | 0.592 x 1.544 x 1.198 |

Budget 26,000 / 160 meshes. `hero_kitsune.expect.json` = 0.66 x 1.56 x 0.60, tolerance 0.25 (height 1.627 is the fox ears; the body
is 1.56). `posed/hero_kitsune.expect.json` is its own (depth 1.15) because the stride is 1.2 m deep. Close-ups: `closeup/face.js`,
`face2.js`, `face3.js` (head joint isolated per outfit), `closeup/hands.js` (both elbow joints, skin only) - 5.8k / 5.6k / 5.5k / 1.7k tris.
Every throwaway copy (`outfit2/`, `outfit3/`, `posed/`, `closeup/*`) is generated from the main file by a script, never hand-edited.

## Outfits
- **shrine** - white kosode (red cross-collar piping, armhole piping, side seams, bust darts, collar band with rolled edge), bare
  shoulders, detached sleeves tied with a ribbon ring + bow, wide kimono cuffs (elbow creases, back seam, red trim band whose cap is
  recessed 2 cm so the opening reads as a red-lined hollow), twisted wrist cords; red knife-pleated skirt (18 pleats, lining wall,
  rolled hem, white stripe), red waistband with rolled edges, twisted rope belt + knot, two twisted bell cords with slit gold bells
  and tassels, talisman bundle at the LEFT hip (5 fanned strips with ink strokes, rope wraps) tied at the band and hanging outside
  the skirt; black thigh-highs whose rolled top sits 7 cm below the hem (thigh + garter straps with clips show, as in the reference),
  slouched white sock-boot tops with criss-cross red cord and bow, tabi socks on a bevelled black zori sole with red instep cords and
  thong; red headband with hanging ribbon + tassel; fox mask on the LEFT side of the head.
- **yukata** - indigo summer yukata split high at both sides (lining wall, rolled hem, slit edges), ohashori fold, wide obi with rolled
  edges + twisted obijime and knot, bunko bow at the back with two tails, folded paper fan tucked in the obi at the right hip, the fox
  mask hung on the obi at the left hip, scattered five-petal blossoms on robe/sleeves/bow, flower kanzashi with hanging bira strands
  on the right of the head, bare calves, tabi ankle bands, tabi socks on geta (dai + two teeth + twisted hanao).
- **courier** - black sport kimono jacket (offset torso surface), panel-colour lapel bands, raglan seams, shoulder yoke, hood down
  as a bunched roll with lining showing, standing collar, waist drawcord with toggles, glow-tape stripes on upper and lower arms
  (emissive 0.6), ribbed cuffs; satchel at the right hip with flap, buckle + prong and D-rings, strap wrapped across the chest;
  leggings with side stripes, ankle socks, sneakers (outsole, bevelled midsole, toe bumper, heel cup, toe cap, tongue, eyelets,
  laces, bow, heel tab, side stripe); the fox mask worn OVER the face, tied round the head.

## Palettes (colour only; skin / eyes / hair / tail fur never change)
- shrine: **vermilion** = reference (white top, red skirt/trim/band, black stockings, gold bells); **midnight** = near-black top and
  socks, wine skirt, GOLD trim/marks/cord; **sakura** = blush top, rose skirt/band, rose-brown stockings, rose-gold bells;
  **jade** = white top, jade skirt/trim/cord/marks, silver bells.
- yukata: **indigo** = navy robe, cream obi, red cord/hanao, white print; **peach** = peach robe, crimson obi, pink print and flower;
  **inkgold** = black robe and fan, gold obi/print/flower, dark red cord, black mask with gold marks; **seaglass** = sea-green robe,
  ivory obi, coral cord/flower.
- courier: **ember** = black jacket, red panels, orange glow tape, cream soles; **ice** = charcoal jacket, blue panels, ice-blue glow and
  laces; **ultraviolet** = aubergine jacket, purple panels, magenta glow; **ghost** = off-white jacket and satchel, grey panels,
  pale blue glow, BLACK soles.
Swatches in `OUTFITS[].palettes[].swatch` are primary / secondary / accent for the UI chips.

## Detail pass - what was checked by eye (640 px renders cropped 2-3x, five views + posed + close-ups, four passes)
1. Face at close range: nose was an 18 mm wedge -> 9 mm, thinner bridge, small wings and nostrils; lips were a pink pill -> thin
   wide lips with a faint-smile mouth line; eyes enlarged 20 % (white / iris / pupil / highlight, upper lid, lash line with outer
   flick, lower lid, crease); skin lightened to the reference's pale tone; eye sockets widened. Hands: finger segments necked into
   beads at each joint -> segments overlap 0.7 r, fingers 12 % longer, curl halved, palm slimmed 20 %.
2. Hair: the fringe was a smooth shelf stepping 4 mm proud of the shell under the band (read as a hat brim) -> strand ridges, jagged
   bottom edge, top blended into the shell and ended under the headband; two "crown clump" ellipsoids and two fringe-corner clumps
   read as grey patches on the dome -> removed; side locks taper and curve in toward the jaw. Thigh gap under the skirt: none ->
   7 cm with garters spanning it. Sleeve opening: a flat red disc plugged the cuff -> the trim band's cap is recessed into a cavity.
3. Torso cinched at the waist (all outfits share the surface); shrine collar lowered from a turtleneck to a collar band; hair
   lightened to silver-white; iris brighter amber.
4. Talisman bundle was entirely INSIDE the skirt (its tilt swung the bottom inward, the skirt is 20 cm from centre at that height)
   -> re-tied at the band, bottom flaring out and forward past the hem, rope wraps at the band; fringe raised 7 mm so the brows show.
   Yukata kanzashi scaled 1.3x so it reads; courier mask over the face checked in its own close-up.
Budget: the first pass sat at 25,910 (verifier) / 25,998 (in-file), so additions were paid for by things the camera cannot see:
skirt rolled hem 5-sided -> 4-sided (-108), hem stripe rings 4 -> 3 (-108), the duplicate inner zori sole slab removed (-472),
crown / corner hair clumps removed (-320). Net after the additions: 25,066.

## Known weaknesses (honest)
- Hair is a low-poly shell with 3 mm strand grooves; the reference's flowing volume is not there. Side locks are 8-sided tubes
  and read as blades from the front. The ponytail is a single grooved fall.
- Face: eyes are stacked ellipsoids on the head surface (no eyelid fold depth, no eye socket cavity); brows are a 2 mm tube; the
  cheek shape is still rounder-than-reference at the jaw. It reads as a young female face from the chase camera and holds up
  full-screen on the character page, but it is not the reference's illustration-grade face.
- Hands: 7-sided finger tubes, no nails; the thumb is stubby; the palm is a smooth tube (knuckle ridge only at the base of the fingers).
- Cloth is rigid per joint: the skirt does not swing; at big hip angles (jump tuck) the red pleated thigh covers show as red pleats
  outside the skirt. The detached sleeve top overlaps the cuff bag at the elbow with a visible step (needed for the sphere-in-sphere
  joint). Yukata sleeves are barrel-shaped from the front. Folds are sine ripples of 2-4 mm, not sculpted creases.
- The mask markings are tubes and blobs, not the reference's fine line work; from the front in outfit 1 the side-mounted mask reads
  as a jumble of red bits (fine from three-quarter and side).
- Yukata: the obi bow is hidden by the tail from directly behind; the fan is a stick from most angles. Courier: black-on-black, all
  the detail is carried by the panel colour and the glow tape (the ghost palette shows it best).
- Three near-white materials (hair 0xc6c7c9, tail fur 0xbdbab2, socks / top 0xbdb8ad) will be the brightest things under the street
  lamps; they are kept 3-5 % apart so they separate.
- Width 0.627 vs the 0.66 expected (sleeves hang closer to the body than the reference A-pose); height 1.627 with the ears.
