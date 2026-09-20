# midnight-dash — build state (checkpoint file; read this first on resume)

Endless runner (Subway Surfers / Tom Gold Run / Sonic Dash inspired). Neon Tokyo/Seoul night
street → elevated highway → back to street or a third zone, cycling. Three zones on one shared
prop chassis. Built with 404-game-recipe + Atlas MCP + the RUST 17 lessons
(../rust17_improvements_beyond_recipe.md).

## Locked decisions (2026-09-19)
- Folder: this one, outside the recipe repo. Harness copies: assetlib.js, surfaces.js, rig.js (import with ./).
- Scale: FULL recipe — floor build (control) + fan-out first pass + 3 fresh-critic rounds. Stopping rule: 3 rounds, then ship + write what is still wrong.
- Jam: undecided; build so entry stays possible. Commit locally at milestones. NOT pushed. Deadline if entering: 25 Sep 23:59 UTC. Public repo + gh auth login needed from user.
- Jam rules (game.404.xyz / 404-Repo/404-game-jam): geometry must be code (ship.mjs flags >64 numeric literals / base64). Textures, skies, sprites, sound MAY be files (Atlas) — declare in entry. Budgets: <10 MB transferred, __READY__ <20 s on 4G (4 Mbps ↓ 1 Mbps ↑ 60 ms, CPU 2x slow), 900 draws, 1.5M tris, ≥1 m moved on 390x844 real touch. No trademarks. Real budget for weight: ~5 MB.
- Atlas role: object references, bar/scene frames, sky, neon sign sprites, hero textures (1K WebP), SFX/music. Every Atlas image is opened with `open` and shown to the user for a go-ahead BEFORE geometry is built from it.
- Geometry path B (agents write it), 3 candidates per reference, verify.mjs, pick by eye.
- User is on a laptop on battery: keep headless browser runs small (tiny viewport, no loops).

## Phases
- [x] P0 floor build DONE (../midnight-dash-floor, commit 402b8a9) — separate agent, cold, one pass, no Atlas, in ../midnight-dash-floor/ (running in background)
- [x] P1 style lock DONE (STYLE.md v2 from the video) — STYLE.md (one sentence, hex palette, sizes, material names from asset-contract)
- [x] P2 bar frames DONE (refs/bar-video, 20 frames) + CLAIMS.md measured, tools/claims.py via Atlas (street / highway / transition) → open → USER GO-AHEAD → claims written in CLAIMS.md
- [x] P3 object references DONE (58, all approved) via Atlas (~30 objects, one style suffix) → contact sheet → open → USER GO-AHEAD
- [x] P4 fan-out first pass (in progress): asset agents (5-8 objects each, 3 candidates, verify, pick) + engine agents (track/chunks, player+rig, camera, input touch/keys, lighting rig, HUD, audio) + integrator
- [x] P5 gate DONE (tools/gate.mjs + GATE_CONTRACT.md): harness/gate-runner.mjs in recipe harness/ (real touch swipes, seeded chunk sequence, photos at fixed distances, filmstrip, budget checks)
- [ ] P6 round 1..3: fresh critic, blind pairs vs bar (pairs.mjs), name the ONE property, fix agents, snapshot to rounds/rN/
- [ ] P7 ship.mjs --stamp, jam.mjs against local serve URL, write NOTES.md (what is still wrong, declarations)

## Resume prompt
"Read midnight-dash/BUILD_STATE.md, then continue from the first unchecked phase. Do not redo checked phases."

## Log
- 2026-09-19 folder created, harness copied, git init. Floor agent launched.
- 2026-09-19 Atlas: 8 bar frames + 8 object refs (batch 1) generated and downloaded to refs/. Awaiting user go-ahead. Style lock + spec committed.
- 2026-09-19 DIRECTION CHANGE: user supplied "dog pack fin.mov" (Showa yokocho alley, near-photoreal, portrait) as the look. Bar = 20 frames in refs/bar-video/. Old refs snapshotted to refs/objects_v1_lowpoly + refs/bar_v1_atlas. Hero = human runner chased by dog pack. Highway kept. Coin gets TAO tau embossed as geometry (refs/logo). Shipped folder is now game/; tools/ holds the gate.
- 2026-09-19 Floor build done in ../midnight-dash-floor (22 assets, 60 fps, 480 draws, commit 402b8a9). Gate agent G1 launched.
- 2026-09-19 Refs: batch 1 (12) APPROVED; batch 2 (13) + batch 4 (20 detail) downloaded, batch 3 (13) pending re-download (project was unpublished). G1 gate DONE (tools/gate.mjs, GATE_CONTRACT.md). FAN-OUT LAUNCHED: A1 runner+shiba, A2 shophouse_a/b+utility_pole+lantern_string, A3 noren+wall_lightbox+vending+crate_stack+kei_van, A4 tau_coin (traced from logo), E1 track/chunks/obstacles/coins/farband, E2 player/pack/camera/anim, E3 index/main/config/input/hud/audio, E4 assets/textures/chamfer/lighting/perf. Remaining assets (batches 2-4, 46 objects) await user go-ahead then A5-A10.
- 2026-09-19 Batches 2-4 (46) APPROVED. A5-A10 launched (all 58 assets in flight). A4 tau_coin DONE (22 Shape commands traced from logo, 2,056 tris); user wants the worn-gold FINISH of the Atlas reference → Atlas PBR "gold" set + coin materials renamed `gold`/`gold_tarnish`, E4 maps them. Atlas jobs running: 5 PBR sets (gold, asphalt, tin, plank, deck) in project 55d1; sky + 8 sign sprites + 2 noren in project fcc7.
- 2026-09-19 RATE LIMIT hit (session cap, reset 19:30 Lagos): A2,A3,A5-A10,E1,E2,E4 terminated mid-run; A1 (runner, shiba), A4 (coin), E3 (index/main/config/input/hud/audio) DONE. Partial files on disk. Resumed all 11 via SendMessage on user "resume". Coin materials renamed gold/gold_tarnish for the Atlas gold PBR set. Atlas: 15 PBR maps + sky + 8 signs + 2 noren generated.

## Round 0 status (2026-09-20)
Engine: ALL 19 modules in game/src (E1 track/chunks/obstacles/coins/farband, E2 player/pack/camera/anim,
E3 index/main/config/input/hud/audio, E4 assets/textures/chamfer/lighting/perf).
Assets: 13/58 delivered. In flight: A5 (7), A6 (8), A7 (8), A8 (6), A9 (6), A10 (10) = 45 more; E4 finishing.
Textures: 26 files, 2.29 MB (5 PBR sets incl. gold for the coin, dusk sky, 8 sign faces, 2 noren).
Camera locked: 1.3 m high, 3.8 deg down, hero 29 % of portrait frame, pack at 2.6 m visible 85 % of frames.
Claims measured against the bar: all seven separate bar from floor 100 % (the floor is weak, so use the
previous round as the second control from round 1 on).
Next after the asset agents land: integrator wires it, one gate run, snapshot rounds/r0/, then critic round 1.

## Integration reading, 2026-09-20 (first real gate run on the assembled game)
BUG FOUND AND FIXED: main.js's INIT_ORDER never called assets.init, so every assets.get() threw
"assets.init(ctx) first" and every chunk, character and obstacle built EMPTY. The gate PASSED on
that world (8 draws, 60 fps, 0 errors) because an empty level is fast — docs/traps.md's exact
failure. tools/diag.mjs now prints the scene graph so this is visible, not inferred.
After the fix: 787 meshes, and the gate measures a real world.

Gate, seed 7, phone 390x844, real touch: 801 m, 94 coins, 14 jumps, 8 rolls, 60 fps median,
peak 865 draws (budget 900), 1,038,968 tris (budget 1.5M), 3.40 MB, 0 console errors.
Only failure: 36 x 404 for assets not yet delivered — clears as the agents land.

BUDGET IS THE LIVE RISK: 849-865 draws and 1.04M tris were measured with 23 of 58 assets still
cheap placeholder boxes. E4 has been asked to buy headroom (far-band swap, a coarser second
per-block bake, phone tier) before the remaining assets land.

Filmstrip observations (round 0, 35/58 assets): the alley reads — shophouses both sides, lanterns,
cables, wet road with reflections, runner and shiba in frame at hero 29 %. The large pale boxes
near the camera are the placeholder dog_spitz and dog_mutt (A5 will replace them). Expressway and
ramp zones are nearly empty pending A9's deck/ramp and A8's steel.
