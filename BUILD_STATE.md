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
- [ ] P0 floor build — separate agent, cold, one pass, no Atlas, in ../midnight-dash-floor/ (running in background)
- [ ] P1 style lock — STYLE.md (one sentence, hex palette, sizes, material names from asset-contract)
- [ ] P2 bar frames via Atlas (street / highway / transition) → open → USER GO-AHEAD → claims written in CLAIMS.md
- [ ] P3 object references via Atlas (~30 objects, one style suffix) → contact sheet → open → USER GO-AHEAD
- [ ] P4 fan-out first pass: asset agents (5-8 objects each, 3 candidates, verify, pick) + engine agents (track/chunks, player+rig, camera, input touch/keys, lighting rig, HUD, audio) + integrator
- [ ] P5 gate: harness/gate-runner.mjs in recipe harness/ (real touch swipes, seeded chunk sequence, photos at fixed distances, filmstrip, budget checks)
- [ ] P6 round 1..3: fresh critic, blind pairs vs bar (pairs.mjs), name the ONE property, fix agents, snapshot to rounds/rN/
- [ ] P7 ship.mjs --stamp, jam.mjs against local serve URL, write NOTES.md (what is still wrong, declarations)

## Resume prompt
"Read midnight-dash/BUILD_STATE.md, then continue from the first unchecked phase. Do not redo checked phases."

## Log
- 2026-09-19 folder created, harness copied, git init. Floor agent launched.
- 2026-09-19 Atlas: 8 bar frames + 8 object refs (batch 1) generated and downloaded to refs/. Awaiting user go-ahead. Style lock + spec committed.
