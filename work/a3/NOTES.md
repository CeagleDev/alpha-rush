# A3 notes — street props (noren_string, wall_lightbox, vending_machine, crate_stack, kei_van)

Three candidates per object under work/a3/cand/<name>/ (a = primitives, b = profiles/extrude/lathe,
c = a different part breakdown). One verifier run per object; sheets in each `_verify/sheet.png`.
No re-runs were needed: every winner passed parse / ground / centre first time.

## noren_string → C (1,338 tris)
Winner: the split-noren reading — five banners butted 2 cm apart on a sagging 6 m rope, doubled-over
top sleeves, edge seams, a black grime band and hanging threads at the hem, outer banners swung out.
Chosen over A (banners gapped 4 cm, loops) and B (extruded jagged fray strip) because the close-butted
panels read as one curtain like the reference, and the side views show the most depth.
Base y = 0 is the lowest hem; rope ends at y ≈ 1.33, so the game places the group at ≈ 3.2 − 1.33 = 1.87
to hang the rope at 3.2 m (userData.hangAt = 3.2). Banner faces are single PlaneGeometry quads, material
`fabric`, for the later stroke sprite. The verifier warned "left/right face empty" on all three: a 6 m rope
is legitimately nothing from the ends, so the winner declares `userData.mounts = ['left','right']`
(the rope ties off to the shophouses either side). Could not do: rope twist (tri budget), cloth curl.

## wall_lightbox → B (464 tris)
Winner: picture-frame Shape extruded 13 cm, rounded red lozenge band (matches the reference's rounded
red strip), corrugated zigzag back skin, L-section wall channel, TubeGeometry conduit looping from the
junction box. A and C were cleaner boxes but the lozenge and ribbed back carried it. mounts = 'back',
one warm light 0.35 m in front of the face. Dimension labels in the reference ignored as instructed.
Measured depth 0.172 (bracket + ribs behind the 0.13 pan) against 0.15 expected, inside tolerance.

## vending_machine → B (3,092 tris)
Winner: plan Shape with rounded front corners swept up, lathe tube + end caps, lathe feet, lathe cans with
a rim, L-section shelves, bent-plate flap. The only candidate clean on all four sides (A's and C's sides
were flagged "nearly featureless"). Cool front light at the display, warm light at the top tube;
`obstacle = {kind:'block', lanes:1}`. Tris are at the top of the 600–3,000 band (21 lathe cans); A at 1,552
would be the cheap fallback. Could not do: the reference's dense poster litter (kept to a few colour
patches — no text is allowed).

## crate_stack → A (2,400 tris)
Winner: primitives lattice — corner posts, top/bottom/mid rails, 5 vertical slats per long side, hand-hole
gap on the ends, six bottles in the top crate, four crates offset and slightly turned, white/yellow/white/
yellow with dirt as colour variation and a chipped post. B (extruded panels with holes) read like window
frames, C (solid skirt + bars) too heavy. Bottom rail of the lowest crate is the black grounding band.
`obstacle = {kind:'jump', lanes:1}`. Total height 1.25 m. Bottle segments trimmed to 6 to sit inside the band.

## kei_van → B (5,596 tris)
Winner: one side-elevation Shape (two absarc wheel arches, flat nose, raked screen line, rounded roof
corners) extruded across 1.46 m, rounded-rect glass extrusions, lathe wheels with dished steel rims,
lathe headlight buckets, C-channel bumper with a dent. A (stacked boxes) and C (cab + cargo modules, spare
wheel, flares) both read, but B's arches and roof radius give the truest silhouette from every side.
No maker's badge: the nose plate pad is blank. Sliding-door seam + runner on both sides, rear double doors
with emissive red tail-lights, amber indicators (0xbf7c42 emissive — hero orange is reserved), glass per
STYLE.md, roof rack of 8-seg tubes. lights: two warm headlights + two dim red tails.
Width measures 1.70 m with the mirrors (body 1.46), inside the 25 % tolerance on 1.5.
Could not do: wheel-arch cut in the sill for arms A/C (boxes only), interior seats.
