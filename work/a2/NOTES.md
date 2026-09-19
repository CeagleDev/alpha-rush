# A2 notes — alley scenery batch (shophouse_a, shophouse_b, utility_pole, lantern_string)

Three candidates per object under work/a2/cand/<name>/, one verifier run per object (sheets in each `_verify/`),
winner picked by eye from the four-side sheet, copied to game/assets/<name>.js with an expect.json beside it.
All lights are published as `group.userData.lights` in the asset's own (recentred) space.

## shophouse_a — winner: arm A (primitives), 4,984 tris, 5.37 x 7.08 x 6.26 m
- Why: closest to the reference — gable roof with visible tile courses and ridge, batten-clad walls, four red
  lanterns under the corrugated awning, striped noren, the horizontal lightbox with its red band, balcony rail with
  laundry, AC on a bracket with a rust run beneath it, drainpipe; the lit interior (emissive back wall, counter,
  stools, shelves, fridge) shows through the one-material glass front. Sides carry pipes, vents, ACs, barred
  windows; the back has a door, an extractor duct with a hood, a small window and a splash band.
- Arm B (extruded shapes / ridged skins / stepped-tile roof) rendered clean but the tile courses vanish at
  distance and stray bright flecks showed at the eave line. Arm C (post-and-beam + hipped roof) reads too flat on
  top and unlike the reference.
- Not done from the reference: the brush-stroke sign (no text by rule), the tangle of wires across the facade,
  the satellite dish and the small propped-up litter at the step.

## shophouse_b — winner: arm A (primitives), 6,964 tris, 5.88 x 7.60 x 6.32 m
- Why: the vertical rib field reads as corrugated tin from every side; faded green right/back, rust-red
  left/front, cream upper front, with rust and fade patches; gable tin roof with ridge along z, tank on a stand,
  three lightboxes of three sizes, blue fluorescent sign, narrow sliding door with a dark recess, tin awning on
  struts, frosted window, stapled cable run and meters on the right, AC and barred window on the left, ladder,
  duct and door on the back.
- Arm B (corrugated profile extrudes) was close but the ground-floor front reads flat with a grey door slab.
  Arm C (recessed porch, shed roof) looks top-heavy and does not match the reference roof.
- Not done: the sagging mains cable across the front, the second small meter cluster on the far right, rain
  streaks (they will come from surfaces.js), and the kana strokes on the boxes (sprite textures only, by rule).

## utility_pole — winner: arm B (lathe profiles), 2,502 tris, 3.07 x 9.00 x 0.77 m
- Why: same silhouette as arm A but with a foot swell, cast bands in the pole profile, insulators with real
  sheds, a transformer with rolled rims and a domed lid, and a cowl-shaped lamp head with a lit dish underneath.
  Arm C's 90-degree branch arm made it 1.9 m deep and reads odd from the side.
- All three came in above the 500–2,500 band; the winner was brought to 2,502 by lowering lathe/cylinder segment
  counts only (no decimation, no parts removed except a duplicate stain band).
- Not done: the crack lines and pockmarks in the concrete (surfaces.js territory), the second lamp-arm bracket
  strap, and the extra dangling drop wires.

## lantern_string — winner: arm C (stacked open bands), 2,952 tris, 6.01 x 0.88 x 0.34 m
- Why: the reference lanterns are taller than wide with flat tops; the banded egg profile reads that way and
  its rib banding reads as paper, whereas arm A's dark torus hoops read as hard rings and arm B's lathe reads as a
  smooth ball. The twisted three-strand cord reads as rope at distance. Lanterns swing a few degrees off vertical.
- Placement (also in the file header): the module recentres so the LOWEST lantern bottom is at y = 0; the rope
  ends then sit at ~0.88 (authored as y = 3.4 with a 0.35 m sag). The game hangs the group at y = 3.0
  (`userData.hangAt = 3.0`), which puts the rope at ~3.9 m over the road.
- Not done: the brush-stroke kanji on the paper (rule: no text in geometry), the frayed twine wrapping and the
  rain streaks.
