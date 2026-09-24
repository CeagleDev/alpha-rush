# Brief: hero detail pass + wardrobe (one hero per agent)

Owner (2026-09-24): "I need the run characters to be well and detailed built. Add options to change their
clothing and also the colour of the different clothing. Each run character should have their unique set of
clothing options: 3 each, each with colour options."

Start from the CURRENT hero file (game/assets/hero_<id>.js, built last night from the approved reference
refs/alpha/char_<id>.png; its NOTES in work/v2/heroes/<id>/NOTES.md) and read work/v2/HERO_API.md — your output
must implement that API exactly. Read the reference image with the Read tool before you start and before every
look-and-fix pass.

## 1. DETAIL PASS on the reference outfit (outfit 1)
"Well and detailed built" means, concretely, seen from the chase camera AND full-screen on the character page:
- a FACE: eyes with whites, iris and pupil, eyelids, brows, a modelled nose with nostrils, lips with a mouth
  line, cheekbones and jawline, ears with a helix; hair in layered clumps with a silhouette that reads;
- HANDS with four fingers and a thumb (segmented, slightly curled), wrists, knuckle bulge;
- CLOTH that reads as cloth: hems with thickness (double-walled or a rolled edge), folds and creases as
  low-amplitude ridges where cloth bunches (elbows, waist, behind the knee), seams as thin raised lines,
  overlapping layers with visible depth (collar over shoulder, belt over top, cuffs over sleeves);
- FEET with proper footwear geometry (sole edge, toe cap, straps/laces, heel);
- ACCESSORIES with real construction (a bell with a slit, a cord with twist, a buckle with a prong, a mask with
  eye holes, a scabbard with a mouth and a chape);
- smooth normals on all organic parts, hard edges only where the object is hard.
Budget per outfit <= 26,000 tris, meshes before merge <= 160 (the game merges per joint).

## 2. THREE OUTFITS (the first is the detailed reference outfit), 4 COLOURWAYS EACH
Outfits are described in your prompt. Each outfit is a distinct silhouette (different garments, headwear,
accessories), not a recolour; palettes are recolours only. Keep the character's identity (face, hair, build).
Palette swatches: three hex colours the UI shows as chips; the first palette is the reference colours.

## 3. Deliver into work/v2/heroes2/<id>/
`hero_<id>.js` (implements the API), `hero_<id>.expect.json` ({width, height 1.56, depth, tolerance 0.25}),
plus for verification: `outfit2/hero_<id>.js` and `outfit3/hero_<id>.js` — throwaway copies whose default
export builds outfit 2 / outfit 3 (so the 404 verifier can render them), and `posed/hero_<id>.js` (outfit 1 in
the mid-stride pose from work/v2/RUNNER_BRIEF.md step 3). Verify each directory with
`node ../404-game-recipe/harness/verify.mjs <dir> --size=640` from the midnight-dash root until clean, LOOK at
every render with Read and iterate at least four times against the reference; also render a CLOSE-UP of the
head and hands (write a small variant with the camera-facing head at the origin, or crop the 640 render) and
judge the face honestly. `NOTES.md`: triangle counts per outfit, what each palette changes, weaknesses.
Laptop on battery: verify only, one browser at a time, no servers, do not run the game.
Final message: paths, tris per outfit, 5 honest lines about the face, hands, cloth, and the two new outfits.
