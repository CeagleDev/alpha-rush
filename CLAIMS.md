# Claims — what is true of the bar (refs/bar-video/, 20 portrait frames of "dog pack fin.mov")

Numbers below come from 8 frames resampled to 90×160 with a 14-cluster k-means (2026-09-19). The
critic's measurement script must recompute them on all 20 frames at a fixed width, at the SAME
aspect (portrait 9:16 — the phone gate already is), with the HUD band excluded, and report a median
and a spread over two gate runs before any claim is believed. Keep a claim only if the bar and the
floor fall on different sides of it on ≥ 70 % of frames.

| # | claim (statement a machine can check) | bar value | gameable by |
|---|---|---|---|
| C1 | The frame is dark: median luma ≈ 42 | 41.7 | underexposing everything — pair with C2 |
| C2 | But it has real brights: p98 luma ≈ 194 and 1.5–2 % of pixels above 200, and those pixels are lit sign faces and lanterns, not sky | p98 193.9, 1.75 % | a white HUD or a bright sky — exclude HUD, check the bright pixels sit on sign geometry |
| C3 | The shade is WARM: the dominant dark cluster has R − B ≥ 8 (brown-black `0x231718`, not blue-black) | R−B = 11 | a global warm tint — pair with C4 |
| C4 | The sky is COOL: in the top fifth, a blue class with B − R ≥ 60 covers ≥ 20 % | `0x1d406f` 24 %, `0x1d3150` 23 % | painting a blue rectangle — the critic checks it is sky, above the eaves |
| C5 | The sides are crammed: edge density in the left and right thirds is at least EQUAL to the centre third (measured 0.9 on the bar — the wet road's litter and reflections put edges in the centre too, so the original ≥ 2× claim was wrong); the floor measured 0.3 | 0.9 ±0.1 | noise textures — the critic checks the edges are objects |
| C6 | Cables cross the top third: ≥ 3 dark thin catenary lines | eye: every frame | stripes drawn on the sky |
| C7 | The road reflects the signs: the bottom quarter contains an amber class (luma > 100, R > B + 40) covering 4–8 %, positioned below a lit sign | `0xa16f43` 6 % | painting the road orange — position test |
| C8 | Hero scale: the hero's screen box is 22–40 % of frame height | dogs in video 15–25 %; ours is a standing human, so 28–38 % | camera so close the world disappears — pair with C5 |

Eye checks that never get a number: speed is visible (motion streaks on litter/coins, camera bob); ≥ 6 lit sign
faces in frame; lanterns in frame; litter on the road; the pack is visible behind the runner.

## Measured 2026-09-19 with tools/claims.py (20 bar frames, 540 px wide, 8 % HUD band excluded; floor = 2 playtest frames)
| statistic | bar median ± IQR/2 | floor | separates? |
|---|---|---|---|
| C1 median luma | 39.6 ± 3.2 | 12.0 | yes — the floor is far too dark |
| C2 p98 luma / % over 200 | 224.5 ± 12.6 / 3.2 ± 0.9 | 85 / 0.7 | yes |
| C3 dark cluster R − B (warm shade) | +7.0 ± 6.7 | −5.6 (blue shade) | yes |
| C4 top-fifth blue share | 39.6 ± 13.4 % | 0 % | yes — the floor shows no sky |
| C5 side / centre edge density | 0.9 ± 0.1 | 0.3 | yes |
| C7 bottom-quarter amber share | 6.1 ± 2.7 % | 0 % | yes — no wet-road reflections in the floor |
Run: `python3 tools/claims.py bar=refs/bar-video floor=<frames> build=<frames> --sep=bar,build`. Two samples before you believe a column.

## Aspect ratio: measure at the bar's shape or not at all (learned the hard way, 2026-09-20)
The same build measured on the phone gate (390x844, 1:2.16) and at the bar's own shape (810x1440,
9:16) disagrees badly, because every band here is a FRACTION of the frame and so covers a different
amount of world at each aspect:

| statistic | at 390x844 | at 810x1440 | bar (810x1440) |
|---|---|---|---|
| C1 median luma | 36.9 | 59.5 | 39.6 |
| C7 bottom-quarter amber | 6.5 % | 17.7 % | 6.1 % |

The 390x844 reading said C1 and C7 both matched the bar; at the bar's own shape both separate. The
wider 9:16 frame simply shows more road in its bottom quarter. So: ALWAYS capture the measurement
pass with `node tools/gate.mjs game --seed=7 --nohud --viewport=810x1440`, quote the capture size
with every figure, and never compare two numbers taken at different shapes. The filmstrip a critic
judges for PLAY still uses the phone viewport, because that is the shape people play.
