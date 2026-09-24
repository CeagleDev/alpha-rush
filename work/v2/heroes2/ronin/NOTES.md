# hero_ronin - KAITO, The Last Ronin (detail pass + wardrobe, HERO2_BRIEF / HERO_API)

`hero_ronin.js` exports `OUTFITS` (3 outfits x 4 palettes), `build(THREE, {outfit, palette})` and a default that builds
outfit 1 / palette 1. Unknown ids fall back to the first outfit / first palette. Same joint contract and jointHints as before,
1.56 m (crown; the ponytail arcs 3 cm above), base y = 0, front +Z, vertex-measured recentring. No imports, textures,
vertexColors or emissive.

## Triangle counts (verify.mjs --size=640, all clean, reference palette of each outfit)
| outfit | id | tris | meshes before merge | materials | bbox (m) |
|---|---|---|---|---|---|
| 1 The Last Ronin | `ronin` | 23,320 | 69 | 22 | 0.56 x 1.59 x 0.43 |
| 2 Ashigaru | `ashigaru` | 25,680 | 91 | 25 | 0.53 x 1.61 x 0.61 (jingasa brim) |
| 3 Street Ronin | `street` | 22,832 | 71 | 25 | 0.55 x 1.60 x 0.43 |

Palettes change material colours only, so counts are identical across the 4 colourways of an outfit (checked: 6 alternate
palettes rendered in one verifier run, all clean, same counts). `posed/` (outfit 1, RUNNER_BRIEF mid-stride) 23,320 tris,
0.56 x 1.52 x 1.16; `closeup/` (head + both forearms at the origin) 8,048 tris.

Throwaway copies are generated from the main file by `node regen.mjs` (run in this directory): `outfit2/`, `outfit3/`
(default export switched to OUTFITS[1] / [2]), `posed/` and `closeup/` (the `/*@@POSE@@*/` marker replaced). Regenerate
after every edit of `hero_ronin.js`; do not edit the copies.

## Build method
Every body and cloth segment is a subdivided SphereGeometry re-written by `tube()` (Hermite profile: half-width, front
depth, back depth, centre offsets; ellipsoidal caps; gaussian bulges; cloth-fold ripples; `ymap` for open hems and
hairlines, `amap` for open fronts), computeVertexNormals + position-keyed normal weld. Cords are braided TubeGeometry,
lids / lips / brows / hair clumps are tapered tubes on CatmullRom curves, fingers are profile tubes bent along a curl,
collar bands / laces / straps are subdivided strips laid on a surface via `frameAt()`, armour plates are `panel()`s on the
torso surface, the bell and jingasa are lathes, the katana is built along +Y and aimed tip-to-tsuba.

## Outfit 1 - The Last Ronin (the reference)
Face: skull with brow ridge, eye sockets, cheekbones, jaw angles, chin; nose bridge bent to a bulbed tip with nostril wings
and nostril holes; upper / lower lids as tapered tubes, lash line, eye whites, iris, pupil, catchlight; upper and lower lips
with a mouth line; ears with concha, helix rim, antihelix and lobe; angled frown brows. Hair: slicked band to a topknot in
7 layered clumps, red tie, ponytail with 3 loose strands, a loose strand down the right side of the face, stubble shell on
the shaved sides. Hands: palm block with knuckle ridge, 4 segmented curled fingers, thumb on a thenar pad, white wrap over
the back of the hand. Cloth: kimono with a bare-chest V, crossed collar bands with thickness, rolled hem with a stitch line,
side seams, front overlap; wide sleeves with a rolled hem and a dark lining ring; red braided waist cord (3 turns, knot,
two hanging ends with whipped collars and tufts); torn haori cape with hanging threads, shoulder seam ridges and a braided
neck / front-edge cord tied in a loop with a tassel; hakama ballooning to a gathered cuff; leg wraps with bandage turns;
tabi socks (split toe, heel seam) on straw sandals with a woven edge and red thongs; brass bell (lathe, crown loop, lip ring,
slit with rounded ends); katana on the chest with chape, mouth collar + lip, tsuba + rim, sageo wound at the mouth, wrapped
hilt with red diamonds, kashira.

Palettes (kimono / cape / cord / wraps): `indigo` Indigo Dusk (reference: 4b566b / 96382f / a8332b / bdb8ad);
`ashbone` Ash & Bone (grey kimono, bone cape, near-black cord and hakama); `bloodiron` Blood Iron (black kimono, dark
red cape, rust cord, dirty wraps); `moss` Moss Court (green kimono, ochre cape, red cord, cream wraps). Hilt silk and the
topknot tie follow the cord / cape colour.

## Outfit 2 - Ashigaru
Lacquered do-maru cuirass round the torso: stepped horizontal lames (sawtooth ripple), 8 vertical lacing rows, bound top
and bottom edges; 8 laced kusazuri tassets (6 on the hips joint, 2 front ones on the hip joints so they swing with the
thighs); sode shoulder plates with 3 laces over short kimono sleeves; jingasa (lathe: shallow cone, rolled brim with a
bound edge, crest disc on the front, chin cord under the chin); suneate shin guards with two straps over the leg wraps;
waist cord over the cuirass; katana on the hips joint at the left hip, edge up, hilt forward. The ponytail is laid lower
so it clears the hat.
Palettes (plate / lace / kimono): `blacklacquer` (black plate, red lace, indigo kimono); `crimson` Crimson Plate (red plate,
black lace, grey kimono); `bronze` (bronze plate, dark green lace, brown kimono); `icewhite` Ice White (bone plate, steel-blue
lace, slate kimono). The hat takes the plate colour, the crest the lace / brass.

## Outfit 3 - Street Ronin
Bomber jacket open over the kimono top: ribbed hem and collar bands, zip tapes + zip pulls, welt pockets, a hood down behind
the neck with the lining showing, puffed sleeves with elbow creases, ribbed cuffs; fingerless gloves; face mask gathered
round the neck with ear loops; hakama ballooning to the ankle and tucked into high-top sneakers (bevelled sole, midsole
stripe, toe cap, heel tab, padded collar, tongue, criss-cross laces, side stripe); the katana in a slung canvas bag across
the back (tied at the top) with a strap across the chest and a buckle with a prong. Kimono skirt shortened so it sits under
the jacket hem.
Palettes (jacket / accent / kimono): `nightorange` Night Orange (charcoal jacket, orange lining + laces + cord, indigo
kimono, olive canvas bag); `mono` Monochrome (off-white jacket, black kimono and soles); `acid` Acid Lime (graphite jacket,
lime lining, laces, straps and gloves); `cobalt` (cobalt jacket, cream kimono and gloves, black hakama).

## Look-and-fix passes (Read tool on the 640 px verifier views, 2x crops of head / hands / torso / legs, and the closeup
copy, against refs/alpha/char_ronin.png each time)
1. Outfit 2 was 26,264 tris (over budget): cuirass rings 34 -> 28, jingasa lathe 30 -> 24 segments (25,784). Face: jaw too
   broad and eyes too small against the reference - jaw angles and lower profile narrowed, cheekbones raised, eyes +12 %,
   iris and pupil enlarged. Fingers and thumb thickened ~13 %. Cuirass read as a striped shirt - lame steps deepened
   (6.5 mm sawtooth), lacing 12 thin rows -> 8 wider rows. Outfit 3 was black-on-black - jacket, hakama, bag, strap and
   gloves separated tonally (olive canvas bag, mid-grey hakama).
2. Light dashes on the shaved back of the head: the 18-gon stubble shell lifted 1.2 mm let the 22-gon skull poke through -
   shell now 22-gon at 2.4 mm. Outfit 2's chin cord crossed the mouth - re-routed under the chin.
3. Wrist-wrap tab flared off the wrist (its guide surface was wider than the wrap) - guide follows the wrap taper; chin
   bulge strengthened; 6 alternate palettes rendered and checked for contrast.
4. Palm block showed at the wrap's end - wrap end radii widened; chin profile pushed forward 5 mm. Final renders of all
   four directories and the closeup checked: no gaps at knees, hips, elbows or shoulders in the stride; the scabbard,
   cape and bell clear the limbs; no problems reported.

## Weaknesses (honest)
- Face: reads as a frowning young man front-on, with all the parts the brief lists, but it is a stylised low-poly face -
  the chin still recedes a little in profile and the mouth sits slightly forward; the reference's soft skin shading and
  larger, wetter eyes are not there. Skin 0xb68d6a is darker than the reference's pale tone (albedo range of the street).
- Hands: four fingers and a thumb, curled, but the fingers are simple tubes with no nails and the knuckles are one ridge.
- Cloth: folds are low-amplitude ripples, so at chase distance the kimono and hakama read mostly by silhouette and seam
  lines; the cape's torn holes are not modelled (jagged hem + threads only); the two front kimono panels are flat strips.
- Outfit 2: the lames are a ripple on one tube, not separate plates, so the steps only show as shading; the tassets are
  flat panels; the sode plates are simple shells.
- Outfit 3: the sword bag is a plain tapered tube (reads as a flat plank from the side) and the hood is a single arc; the
  jacket has no quilting. The ponytail is rigid with the head in every outfit.
- Outfit 2's jingasa makes that outfit 0.61 m deep and 1.61 m tall; both inside the expect tolerance but wider than the
  other two - check the character-page framing.
