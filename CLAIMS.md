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
| C5 | The sides are crammed: interior edge density in the left and right thirds ≥ 2× the centre third | eye: every frame | noise textures — the critic checks the edges are objects |
| C6 | Cables cross the top third: ≥ 3 dark thin catenary lines | eye: every frame | stripes drawn on the sky |
| C7 | The road reflects the signs: the bottom quarter contains an amber class (luma > 100, R > B + 40) covering 4–8 %, positioned below a lit sign | `0xa16f43` 6 % | painting the road orange — position test |
| C8 | Hero scale: the hero's screen box is 22–40 % of frame height | dogs in video 15–25 %; ours is a standing human, so 28–38 % | camera so close the world disappears — pair with C5 |

Eye checks that never get a number: speed is visible (motion streaks on litter/coins, camera bob); ≥ 6 lit sign
faces in frame; lanterns in frame; litter on the road; the pack is visible behind the runner.
