# A7 — signs, lanterns and banners (8 assets)

Method as briefed: three independent arms per object (A primitives · B lathe/extrude profiles ·
C a different part breakdown or a second reading of the reference), in `cand/<name>/<name>_{a,b,c}.js`.
All 24 were put through the verifier in ONE batched run over `cand/_all/` (one browser launch instead
of eight, to keep the laptop cool): **24/24 clean on the first run** — no parse, ground, centre,
size or blank-side failures, so no re-run was needed. Winners were then chosen from the render
sheet by eye, never by triangle count, and copied to `game/assets/` with an `expect.json` beside each.

Sheet: `cand/_all/_verify/sheet.png` · per-asset renders: `cand/_all/_verify/<name>_<arm>.png`

## Winners

| asset | arm | tris | measured w×h×d (m) | why it won |
|---|---|---|---|---|
| paper_lantern | A primitives | 1,112 | 0.456 × 0.611 × 0.456 | Nine rib bands as open cylinders proud of a squashed sphere: the ribbing actually reads as ribbing. B's lathe wobble shaded to a mush at this size, C's stacked frusta read as two fat bands rather than a ribbed chochin. |
| standing_lightbox | B profiles | 1,128 | 0.622 × 1.501 × 0.498 | The reference's defining feature is the **rounded-corner** frame; B is the only arm that has one (a rounded-rect Shape with a hole, extruded 0.14). A's square pan is too sharp; C's hood strip over the top is an invention the reference does not have. |
| vertical_sign | C second reading | 716 | 0.8 × 2.6 × 0.461 | Models the two things the reference actually shows and the other arms missed: the **perforated shelf bracket** under the box (a channel with a row of holes) and a wall of **two materials** — concrete slab beside a corrugated-tin strip. Red band sits mid-face as in the reference. |
| banner_cluster_low | A primitives | 1,178 | 2.506 × 2.05 × 0.129 | Nine hanging strips of unequal length per banner give a genuinely irregular torn hem; B's extruded tear came out evenly scalloped and C's was too subtle to read. A also has the sewn fabric tabs over the rope that the reference shows. |
| awning_strut_low | B profiles | 2,622 | 2.6 × 1.45 × 0.26 | Two TubeGeometry **helices** (red, and white trailing half a turn) make the tape genuinely spiral round the pipe, which is what the reference shows. A's alternating bands read as stripes, C's clustered bands as separate wraps. |
| menu_board | A primitives | 496 | 0.602 × 1.012 × 0.448 | Closest proportions to the 0.6 × 1.0 brief (B's hinge bar pushed it to 0.64 wide) and the vertical corrugated-tin kick panel sits at the right height under a plain black board face. C's horizontal slats and silvered stiles drifted from the reference. |
| traffic_mirror | B profiles | 1,240 | 0.909 × 3.5 × 0.453 | The housing is one LatheGeometry that dishes back and curls into a rolled rim, with a partial-lathe flared hood over the top — the reference's chunky orange visor. C's hood is a flat plate that reads as a shelf; A's curl is thin. |
| post_box | B profiles | 1,088 | 0.524 × 1.42 × 0.524 | One lathe for plinth → barrel → cornice → dome → finial. A rotational object is exactly what the sweep arm is for, and B's overhanging cornice under a round dome matches the reference; C's cone cap is too pointed, A's transition too stepped. |

## Contract compliance

- `export default function (THREE) { … return group }`, metres, base y = 0, centred x/z, front +Z,
  `MeshStandardMaterial` flat colours, no textures, no imports, no vertex arrays or base64.
- Materials named from the contract list (`metal`, `timber`, `fabric`, `plaster`, `stone`); emissive
  parts are near-black `0x110f12` base + palette emissive at 1.1–3.0 intensity and left unnamed,
  per STYLE.md. The one other unnamed material is the traffic mirror's face (metalness 1.0,
  roughness 0.15), unnamed by the brief so the env reflects in it.
- `userData.lights` (own space, offset applied after recentring, exactly as `game/assets/wall_lightbox.js`
  does it): paper_lantern 1 warm entry range 3; standing_lightbox and vertical_sign 2 entries each
  (one per lit face), intensity 1.2–1.4.
- `userData.obstacle = { kind:'roll', lanes:1 }` on banner_cluster_low and awning_strut_low, both
  ≤ 0.26 m deep along Z. `userData.mounts`: `'back'` on vertical_sign, `'front'` on menu_board
  (the board face IS a flat thing) — both declared to the verifier and printed on its report line.
- The three STYLE.md signatures on every object: wear (rust runs, faded/repainted panels, mud bands,
  chipped paint, dented corners, torn hems), a `0x110f12` grounding band at the foot, and no razor-thin
  trim under 3 cm.

## Notes and limits

- **banner_cluster_low geometry convention** (also in the file header): base y = 0 is the LOWEST hem
  thread and the rope sits at the top of the asset, ~2.05 m up. The game hangs it so the hems clear
  at 1.3 m, which puts the rope at roughly 3.3 m. Total cloth 1.9 m + rope.
- No strokes or glyphs anywhere in geometry. Sign faces are plain emissive quads with UVs; the
  banners' cloth material is named `fabric` so the game can drop a stroke sprite onto it.
- The mirror face renders BLACK in the verifier sheet. That is correct and expected: metalness 1.0
  with no environment map in the still-render harness has nothing to reflect. It will read as a
  mirror in the game, which has an env.
- traffic_mirror measures 0.91 m wide against a 0.8 m mirror disc — the extra is the hood flare
  standing proud of the rim, so `expect.json` states the asset's true bounds rather than the disc's.
  Same for post_box: the barrel is 0.43 m, the rusted plinth flares to 0.52 m.
- Not done: nothing from the brief was dropped. The only thing I could not do within the contract is
  give the lantern paper real translucency — `transparent` on an emissive face is what surfaces.js
  uses as a skip signal, so the paper is an opaque emissive shell with a brighter core sphere behind it.
