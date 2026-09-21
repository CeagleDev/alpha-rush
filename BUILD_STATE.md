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

## Round 0 complete, 2026-09-20 — ALL 58 ASSETS IN, GATE PASSES CLEAN
node tools/gate.mjs game --seed=7 : 802 m, 92 coins, 14 jumps, 8 rolls, 60 fps median,
468 draws (budget 900), 1,322,458 tris (budget 1.5M), 4.38 MB, 0 x 404, 0 console errors. RESULT PASS.

Fixes this session, each a silent failure that the gate alone would not have caught:
 1. assets.init was never called -> the whole world built EMPTY while the gate passed on 8 draws.
 2. road / expressway deck / ramp were each placed at the wrong height (buried, 5.2 m airborne, sunk).
 3. the 8 Atlas sign sprites + 2 noren were generated but never applied to any sign face.
 4. bakeStatic merged nothing (~185 materials per chunk): vertex-colour tinting per recipe family
    took track draws 1,121 -> 267 and the whole frame 1,187 -> 462.
 5. three dogs sat between the low camera and the hero, masking the road: spread to the lane edges.
 6. gate gained --nohud, because a HUD in the corner identifies our frame in a blind pair.

Claims vs the bar after E4's lighting pass (tools/claims.py, 6 frames vs 20):
  C1 median luma      bar 39.6   build 51.5   still separates (77.5 %) - we are too bright
  C2 p98 / % over 200 bar 224.5 / 3.2   build 215.0 / 3.8   MATCHES (dropped as a claim)
  C3 dark R - B       bar +7.0   build +2.6   MATCHES within noise (was -6.5)
  C4 top-fifth blue   bar 39.6 % build 63.2 % separates 100 % - THE strongest remaining signal
  C5 side/centre edge bar 0.9    build 1.0    MATCHES
  C7 bottom amber     bar 6.1 %  build 6.5 %  MATCHES (was 23.2 % - overshot and corrected)

Critic round 1 running on 4 blind pairs (work/critic1/bar) against 4 bar frames, HUD off.
Stopping rule: 3 critic rounds, then ship and write down what is still wrong.

## Model decision (2026-09-20, user)
Finish this build on Opus — the fix agents and the critics. Fable is to be used as a SECOND CRITIC
later, run on identical pairs with the identical prompt so that any difference in verdict is the
judge and not the build. Note for whoever runs it: rounds 1 and 2 were both judged by Opus, so a
Fable verdict on the round-2 pairs (work/critic2/pairs, key in KEY.json) is the clean A/B.
Round 0's 58 assets, engine modules and gate were built on Fable; every fix since is Opus. That is
not a controlled comparison (different tasks) and should not be reported as one.

## Fable critic round (behaviour), 2026-09-20
Evidence: 4,662-frame screencast + decisions.log (work/fable1/run), consecutive-frame strips and
overview sheets (work/fable1/sheets), tools/clashcheck.mjs in-engine physics audit on seeds 7 and 23
and an unsteered run for the hit/caught/death path (work/fable1/clash7, clash23, nosteer7).
Probe result over 800 m x 2 seeds: 0 runner pass-throughs, 0 sunk/float, 0 lane drift, 0 coins in
obstacles, always a free lane; the DOGS RUN THROUGH OBSTACLES (58 + 83 instances) — no avoidance.
Death path: hit at 17.9 m (speed 9 -> 5.9, pack 2.6 -> 1.23 m), second hit at 36.9 m -> over, dogs run up.
Found in motion, fixed: the runner strobed at ~3 Hz because the road-crossing lantern/noren strings
were placed rotated pi/2 and lay DOWN the lane (six lanterns 1 m apart over the runner) — also the
vertical lantern column seen in every frame. Strings now cross; practicals cluster (cap 2.5x strongest)
and fade over 0.3 s. Jacket exposure steps >12 luma per 6.4 s: 7 -> 0-3.

## PAUSED 2026-09-21 (owner moving; resume on their word)
Batch in REQUESTS.md (7 items). State at pause:
- DONE, unverified in-game: coin yellow + dark recessed field behind the tau (game/src/coins.js, uncommitted).
- STOPPED mid-work, files on disk: 3 runner candidate agents (work/v2/runner/{a,b,c}, brief work/v2/RUNNER_BRIEF.md)
  and the pickups agent (work/v2/pickups, brief work/v2/PICKUPS_BRIEF.md). On resume: relaunch each with
  "continue from what is in your directory", then pick the runner by eye.
- Runner glow diagnosed: jacket albedo 0xe8852a far brighter than the scene; fixed in the new runner's palette.
- NOT STARTED: daytime zone (pattern A, RU, X, RD, D x6, B; lighting blend in lighting.js, no rig.setTime per
  frame because it rebuilds the PMREM), power-up logic + HUD timers, score multiplier + missions + high score,
  moving expressway traffic, camera framing for the 1.56 m runner (camera.js HERO_H), gate + clashcheck, commit.
- New tool: tools/shot.mjs (cheap autopilot screenshots). Baseline frames: work/v2/base/.
