# A6 — alley buildings, AC/roof/wall fittings

Eight objects, three independent candidates each (24 modules) in `cand/<name>/<name>_{a,b,c}.js`.
Arms: **a** = primitives, **b** = profiles (Extrude/Lathe/Tube sweeps), **c** = a different reading
of the reference (different part breakdown, different roof or different shopfront state).

Verified in four batched runs (`cand/_batch1.._batch4`, symlinks to the candidates, `--size=420`),
24/24 clean on the first pass — no parse, ground, centre or blank-side failures anywhere. One
further run over the eight delivered files (`cand/_final`, symlinks to `game/assets`) to check them
against their `expect.json` sizes: 8/8 clean. Sheets are in each `_verify/sheet.png`; per-asset
five-view strips next to them.

## Winners

| file | winner | tris | size (m) | why |
|---|---|---|---|---|
| shophouse_c.js | arm B (profiles) | 5,656 | 5.49 x 7.03 x 6.24 | Only arm where the roller shutter reads as a shutter: the curtain is a ribbed profile extruded across the opening, so the slats catch light instead of reading as a flat grey panel (arm A). Openings are recesses cut into one extruded shell, which keeps the reveals dark and deep. Arm C (half-open shutter over a recessed shopfront, mono-pitch roof) was the most interesting object but the least like the reference, and its shopfront reads as a black hole at game distance. |
| shophouse_d.js | arm B (profiles) | 6,252 | 5.57 x 7.05 x 6.08 | Best roof by a distance: pantile courses swept up four hip slopes with a real short ridge, against arm A's pyramid whose moss courses read as painted stripes. The corner reads correctly from the three-quarter view — two lit faces, lantern on the arris, balcony over the awning. Arm C (jettied upper floor on posts, gable to the street) has the boldest silhouette but a gable end where the reference has a hip, and brown-on-brown ground floor. |
| tin_awning.js | arm B (profiles) | 1,064 | 5.00 x 1.04 x 1.21 | Real corrugation — a zigzag profile extruded down the slope, with the sag written into the vertices afterwards, so the sheet sags continuously and the eave shows a sawtooth edge. Arms A and C fake the ridges with boxes/half-cylinders and sag in steps. Also the cheapest in draw calls (32 meshes). |
| ac_duct_cluster.js | arm A (primitives) | 2,388 | 2.21 x 1.63 x 0.45 | Arms A and B are the same composition (two units side by side, as the reference has them) and were near-identical by eye; B's swept pipework was marginally tidier but cost 4,040 tris against A's 3,352 for a prop that repeats along the street. Took A and trimmed segment counts only (tube 20->12, rib toruses 7->5 at 3x6, fan discs 14->10) to 2,388, inside the 500-2,500 brief. Arm C stacks the units on a rack — good object, wrong reading. |
| rooftop_water_tank.js | arm A (primitives) | 1,824 | 1.93 x 2.82 x 1.93 | The reference's tank is defined by its ribbed conical lid, rolled rim and three hoop bands, and only arm A has them; arm B's single lathe gives a smooth domed lid that loses the character, arm C's flat lid with a manhole is a different tank. Hopper bottom, leg pipe and rust runs all read from four sides. |
| tv_antenna.js | arm B (profiles) | 1,500 | 1.70 x 2.50 x 1.77 | Same yagi stack as arm A but the mast is a lathe with a flared foot and the guy wires are tube sweeps with real sag, which is what the reference's wires do. Arm C's crossed VHF/UHF arrays are closer to the reference's clutter but its guy ring reads as a hoop lying on the ground. Exactly on the 1,500 ceiling. |
| electrical_box.js | arm A (primitives) | 952 | 1.02 x 1.35 x 0.41 | A and B were a visual tie (same box, same conduit runs); B's swept elbows are slightly smoother but cost 1,544 tris against 952. Arm C's double-leaf door under a deep hood is a different cabinet from the reference's single door. |
| fire_ext_box.js | arm A (primitives) | 742 | 0.60 x 1.00 x 0.30 | Red cabinet, glazed door, extinguisher visible behind it, hinges right / handle left as the reference. Arm B's lathed extinguisher has a rounder shoulder but 1,024 tris; arm C recesses the door behind a proud rim and the pane goes muddy, hiding the cylinder that is the whole point of the object. |

## Notes, and what I could not do

- **Every file**: metres, base y=0, centred x/z, front +Z, `MeshStandardMaterial` flat colours,
  every material named from the contract list except emissive faces and glass (deliberately
  unnamed so `surfaces.js` skips them), no imports, no textures, no vertex arrays or base64
  (longest numeric array in the pack is 9 values), plain `BoxGeometry` so the loader can chamfer.
- **Signatures**: wear as colour/geometry variation everywhere (rust runs, faded panels, tar
  patches, moss on tiles, dented sheets, a dirt band at knee height); a `0x110f12` grounding band
  in the bottom 3-7 cm of every object; nothing thinner than 3 cm that the chamfer could eat.
- **shophouse_d** publishes `userData.lights`: two cream lightbox lamps (0xd8ae70, intensity 2.4,
  range 7.5) sitting just proud of each lit face, and the corner lantern (0xd8552a, 2.8, 6.0).
  The coordinates are shifted by the same offset as the recentre at the end of the module, so they
  are in the asset's own space as ASSETS.md requires. shophouse_c's lightbox is unlit per the
  brief, so it carries no lights entry.
- **`userData.mounts = 'back'`** on tin_awning, ac_duct_cluster, electrical_box and fire_ext_box.
  The other four are modelled on all sides and declare nothing.
- **tin_awning mounting**: base y=0 is the strut feet (the wall fixings), the sheet tops out at
  ~1.0 m, and the game is expected to mount the group at 3.0 m. Said so in the file header.
- **Wall-fragment sizes**: electrical_box and fire_ext_box are specified as a 0.6 x 0.9 x 0.25
  cabinet and a 0.7 x 0.35 x 0.2 cabinet, but the brief also asks for a short wall fragment behind
  them, and the verifier measures the whole group. Their `expect.json` therefore states the
  fragment's size (1.0 x 1.35 x 0.4 and 0.6 x 1.0 x 0.3); the cabinets themselves are built to
  the stated sizes inside them.
- **Triangle bands**: electrical_box (952) and fire_ext_box (742 — inside) are measured against a
  150-800 band that does not really allow for the wall fragment the same brief asks for;
  electrical_box is 19% over and I left it rather than thin the fragment into a bare panel.
  Everything else is inside its band.
- **Shophouse footprints** come out 5.49-5.57 m wide against the 5.0 m unit, because the 0.6 m
  eaves and (on the corner unit) the wrap-around awning are measured too. The walls themselves are
  4.6-5.0 m, so units still sit 6 m apart on the verge line; the overhangs are what the eye reads
  as a dense alley. Within the 0.25 tolerance in `expect.json`.
- Not done: no Atlas work was needed here (references were already in refs/objects/), and nothing
  was committed to git.
