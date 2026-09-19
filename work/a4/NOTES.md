# A4 — tau_coin notes

## Delivered
- game/assets/tau_coin.js (LatheGeometry body; winner of the two candidates in work/a4/cand/)
- game/assets/tau_coin.expect.json  {"width":0.6,"height":0.6,"depth":0.07,"tolerance":0.25}
- work/a4/trace_check.png — logo | traced outline with command end points | traced fill | diff
- work/a4/trace.py — the tracer (re-runnable: `python3 work/a4/trace.py [rdp_eps] [fit_tol]`)
- work/a4/cand/_verify/sheet.png — the verifier sheet for both candidates (one run)

## Tracing method (refs/logo/tao_symbol.png, 298x309 RGBA)
1. Mask = alpha > 127 (7,126 glyph pixels, bbox 144x155 px, no holes: background flood fill reaches everything).
2. Moore-neighbour boundary walk on the mask (8-connected, pixel centres) -> 592 boundary points.
3. Each point pushed 0.35 px along its outward normal, because pixel-centre tracing sits inside the
   true alpha = 0.5 edge (calibrated on the diff: 0 px offset lost ~180 px of glyph, 0.5 px overshot).
4. Ramer-Douglas-Peucker at 0.9 px -> 26 corner candidates.
5. Greedy merge of consecutive spans into least-squares quadratic Beziers while the max deviation from
   the raw boundary stays <= 0.55 px; a span whose control point lies within 0.5 px of the chord is a lineTo.
6. Scaled so the glyph is 0.330 m tall (55 % of the 0.6 m face), 0.307 m wide, centred; y flipped; 4 dp.

## Numbers
- Shape commands: 22 (1 moveTo, 9 lineTo, 12 quadraticCurveTo) + closePath. No holes.
- Fit: max 0.55 px (= 1.2 mm on the coin) from the pixel boundary. Area disagreement at 3x supersampling:
  574 px logo-only, 854 px trace-only, of 63,932 — a sub-pixel edge fringe only, ~2 % of the glyph area.
- Triangles: 2,056 (verifier). 34 meshes before the loader merges by material (body, field, 30 ribs, 2 glyphs).
- Measured 0.600 x 0.603 x 0.078 m: the 30 reeding ribs stand 1.5 mm off the rim (height 0.603), the glyph
  tops sit at +/-38.8 mm (depth 0.078 against the 0.070 body — the 6 mm glyph relief on both faces).
- Materials: `metal` gold 0xd8ae70 metalness 0.85 roughness 0.35; `metal` tarnish 0xa67c46 in the recess.
- userData.pickup = 'coin'; no userData.lights.

## Not exact / deviations
- The outline is a curve fit, not the pixel staircase: within 0.55 px everywhere, so edges are smooth
  where the logo is anti-aliased. The bar's underside left of the stem is emitted as one shallow quadratic
  (0.6 mm bow) rather than a line.
- Recess: the spec said "5 mm inside the rim"; built as an 8 mm bevel + 5 mm flat land, then a 2.5 mm
  step down to the field (recess radius 0.287 m).
- The gold reads a little flat in the verifier's plain lighting because the glyph is the same material as the
  face; surfaces.js's `metal` recipe and the level's practicals give it the highlight/tarnish contrast.
- Candidate B (cylinder + torus rim) also passed clean (2,368 tris) but its rounded doughnut rim reads less
  like the reference's bevelled, reeded coin; not shipped.
