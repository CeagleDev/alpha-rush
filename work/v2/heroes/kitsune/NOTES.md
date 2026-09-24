# hero_kitsune - YUZU, Shrine Courier

`hero_kitsune.js`: 15,930 triangles, 67 meshes before merge, 15 materials. `verify.mjs --size=560` clean on both
`work/v2/heroes/kitsune` (rest: 0.618 x 1.625 x 0.669 m) and `work/v2/heroes/kitsune/posed` (mid-stride: 0.583 x 1.542 x 1.177 m).
Reference: `refs/alpha/char_kitsune.png`. Technical model: runner candidate C (`game/assets/runner.js`) - same joint contract,
same `tube()` deformed-sphere construction, same helper block verbatim, same recentring block, `jointHints` copied.

## Anchor heights (world, m)
sole 0, ankle 0.075, knee 0.425, hip joint 0.79, hips root 0.85, spine 0.93, chest 1.08, shoulder 1.258 (x +-0.135),
neck 1.315, head 1.37 (chin 1.325), crown 1.56; the fox ears reach 1.625 (the body is 1.56, the ears are the only thing
above it). Elbow ~1.02, wrist 0.78. Hips 0.29 m across the joints, skirt 0.44 m across at the hem, feet 0.25 m.
Rest pose: shoulders rotation.z = +-0.20, elbows rotation.x = -0.10 (anim.js poses as offsets from rest).

## Build / what is parented where
- hips: black shorts (pelvis), red knife-pleated skirt (18 pleats, sawtooth ripple growing to the hem, white stripe above the hem),
  red waistband + twisted rope belt + front knot, two hanging cords with gold bells and tassels, talisman bundle (5 fanned paper
  strips with ink strokes, red rope wraps) at the LEFT hip tilted outward past the hem, garter straps, and the TAIL: a sphere
  re-written along a CatmullRom curve (root at the tailbone, sweeping back, up and to +X, tip at world ~1.2 m, z -0.45)
  with layered sine fluff. Tail never drops below hip height, so no leg can reach it.
- spine: lower kosode + red centre piping. chest: kosode body (bust, shoulder blades, spine furrow), red cross-collar piping,
  armhole piping, collar band. Shoulders are bare skin (deltoid ball on the joint).
- l/r_shoulder: skin upper arm, detached sleeve top tied with a red ribbon ring + bow with two hanging ends.
- l/r_elbow: forearm skin, the wide kimono sleeve bag (hangs down and back, cuff folded inward so it reads hollow), red cuff band,
  wrist cord, open hand with thumb.
- neck / head: female head (small chin, brow, cheekbones, amber eyes with lash line), silver hair shell with a straight hime
  fringe (four fringe clumps), long side locks to the collarbone, red headband with a hanging ribbon + tassel, FOX EARS (fur cone +
  pink inner), KITSUNE MASK on the LEFT side of the head (flat white plate, ears, red brow/cheek/whisker strokes, green eyes,
  red cord), and the PONYTAIL: gathered at the upper back of the head through a red tie ring, then a grooved fall held at
  z <= -0.148 in head space (2-4 cm clear of the back at every height), narrowing and swaying to +X, tip at world ~0.95.
- l/r_hip: thigh skin, black thigh-high (rolled top band) over its lower two thirds, and a red pleated THIGH COVER hugging the
  thigh, hidden inside the skirt at rest (see joints below). l/r_knee: black calf, slouched white sock-boot top with the
  criss-cross red cord and bow on the shin. l/r_ankle: white sock foot (tabi toe notch, toe spring) on a black zori sole,
  red instep cords + thong strap, white sock ball at the joint.

## Joints (no skinning)
Each limb segment ends in a cap circular in the YZ plane centred on the joint (hip ball r 0.079, knee 0.052/0.0515, shoulder 0.047,
elbow 0.035), so rotation.x slides sphere inside sphere. Sock ball at the ankle sits inside the sock top; the shoulder ball is skin.
The skirt is rigid with the hips, so a 0.7 rad hip swing pushes the thigh through it; the red pleated cover on each thigh means what
comes through is skirt-coloured pleated cloth lifting with the leg, not skin (checked in the posed render, front, back and side).
I first tried pleat panels pivoting on the hip joints; at skirt radius they swing up above the thigh and cover nothing - removed.

## Checked by eye (1024 px renders, cropped and zoomed; 5 look-and-fix passes + posed check each time)
- v1: tail was a straight sausage out to the side, mask a helmet-sized blob, 22.9k tris -> re-curved tail (back+up), flat side
  mask, segment cuts everywhere.
- v2: eyes hidden under the fringe, ponytail rooted at the nape as a slab -> fringe raised + clumps, ponytail re-rooted at the crown
  through the tie ring, narrower with strand grooves and sway; sleeve hems calmed.
- v3: a black strip between waistband and skirt = the pelvis showing, because 6-ring tubes collapse their ends into one-row cones
  (same cause for the zigzag hem stripe and sleeve hems) -> ring spacing fixed on every short band; thighs poking through the
  skirt SIDES at rest -> skirt widened over the hips.
- v4: posed thigh through the skirt front/back -> thigh covers; cuff top buried inside the upper sleeve (jagged elbow edge gone).
- Final: rest and posed clean; mid-stride shows no gaps at knees, hips, elbows, shoulders; ponytail clear of the back; tail
  clear of legs and arms; talismans clear of the forward thigh; bells clear of the raised thigh.

## Known weaknesses
- The skirt is rigid: at the jump tuck (hip -1.9 rad) the thigh covers will show as red pleats well outside the skirt.
- Face is simple (fringe covers the brow; eyes are two amber ellipses); fine from the chase camera, bland close up.
- The mask's markings are ellipsoid blobs, not the reference's fine line work; reads as "fox mask" at game scale only.
- Hair, tail and socks are three near-white materials; under the street lamps they will be the brightest thing on screen.
- Total height with ears is 1.625 m (body 1.56); expect.json says 1.56 with 25 % tolerance, which passes.
- Width 0.62 m against the 0.66 expected: the sleeves hang closer to the body than the reference A-pose.
