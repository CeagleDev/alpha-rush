# Engine architecture — module interfaces (every engine agent codes to this; main.js is the only file that imports everything)

All files under game/. Plain ES modules, Three.js from the CDN pinned to the version assetlib.js imports. No bundler, no build.

## Boot (E3 owns index.html, src/main.js, src/config.js)
index.html: full-viewport canvas, title overlay with `<button id="startb">`, HUD root `#hud`, death overlay `#dead` with `#restartb`.
main.js: creates renderer/scene/camera, `rig = createRig(THREE, renderer, scene, {hour: 19.4, azimuth: 250, tier})`, builds `ctx`,
calls every module's `init(ctx)` (async, awaited in order: textures, lighting, track, player, pack, camera, input, hud, audio),
sets `window.__READY__ = true`, wires `#startb` (real click/touch) → `start()`, then the loop:
`input → player → pack → track → camera → lighting → hud → audio → telemetry → rig.render(camera, dt)`.

## ctx (shared, created by main.js)
ctx = { THREE, scene, camera, renderer, rig, config, state, assets, textures, events }
- config: src/config.js exports the constants below (E3 writes; nobody else edits): LANE_W 2, LANES 3, LANE_X [-2,0,2], CHUNK_LEN 30,
  SPEED0 9, SPEED_STEP 0.6, SPEED_STEP_M 150, SPEED_MAX 20, JUMP_H 1.1, JUMP_T 0.55, ROLL_T 0.5, LANE_T 0.18, PACK_DIST 5,
  DRAW_BUDGET 900, TRI_BUDGET 1500000, PHONE_MAX_W 700, SEED (from ?seed, default random), GATE (?gate=1).
- state (a plain object everyone reads, the owner listed writes): running, over (main) · distance, speed, z (player: z = distance;
  the world moves in −Z? NO — the player moves in +Z and chunks recycle ahead; camera follows) · lane, laneX, x, y, airborne, rolling,
  stumbleT (player) · zone: 'alleyA'|'rampUp'|'expressway'|'rampDown'|'alleyB' (track) · score, coins (coins) · jumps, rolls (player) ·
  deaths (main) · next: {dist, lane, kind, lanes:[b,b,b]} and coinLane (obstacles) · packDist (pack) · heroBox (camera) · rng (main,
  seeded mulberry32) · time.
- assets: `await assets.get(name, opts)` → loads `./assets/${name}.js` through ASSET() from assetlib.js with `{surfaces:true, ...opts}`,
  caches prototypes, applies chamfer proxy at build time and Atlas textures by material name (textures.js) after surfaces. Returns a fresh
  instance each call (ASSET clones). `assets.lights(group)` → the asset's userData.lights transformed into the group's space.
- events: tiny emitter: 'start', 'coin', 'jump', 'roll', 'hit', 'stumble', 'death', 'zone' (payloads documented in each module header).

## Modules and owners
| file | owner | exports | responsibility |
|---|---|---|---|
| src/textures.js | E4 | init, apply(group) | loads textures/*.webp lazily; maps by material.name → recipe set (asphalt→ground, tin→metal, plank→timber, deck→stone); procedural fallback if a file is missing; never blocks READY |
| src/chamfer.js | E4 | wrapTHREE(THREE) | Proxy over THREE: BoxGeometry with min side ≥ 0.25 m → RoundedBoxGeometry(1.5 cm, 2 segs) |
| src/lighting.js | E4 | init, update | rig at dusk (hour 19.4) + sky panorama (textures/sky.webp) on a dome + practical point lights pooled from `assets.lights` of nearby placed assets (phone N=6, desktop N=14, nearest-first, hysteresis) + emissive-only beyond; ground coupling check (a puddle plane under every sign) |
| src/perf.js | E4 | init, update | phone tier switch by width/devicePixelRatio, pixel ratio cap 2, far-band LOD, reports draws/tris |
| src/track.js | E1 | init, update, chunkAt(z) | chunk pool (20 variants × 2), seeded sequence [A×6, RU, X×6, RD, B×6]…, bakeStatic per chunk at init, recycle ahead of player, cross-streets, far band, sets state.zone, emits 'zone' |
| src/chunks.js | E1 | recipes | one function per variant returning a Group of placed assets (uses ASSETS.md recipes) |
| src/obstacles.js | E1 | init, update, hit(playerAABB) | seeded rows every 12–18 m per chunk, kinds by zone, always ≥ 1 free lane, pooled instances, computes state.next (nearest row ahead with lanes mask) |
| src/coins.js | E1 | init, update | one InstancedMesh of tau_coin, lines/arcs in free lanes, magnet radius 0.9 m, spin, emits 'coin', sets state.coinLane |
| src/player.js | E2 | init, update | lanes/jump/roll/stumble state machine, AABB (0.6 × 1.7 × 0.5; roll halves height), collision via obstacles.hit → 'hit'/'death', run cycle on runner joints (stride from speed), jump/roll poses, foot IK-lite on ramps (pitch hips) |
| src/pack.js | E2 | init, update | three dogs bounding behind at PACK_DIST (+ closes 2 m per hit, resets 1 m/s), lane weaving, bark timer → 'bark' event, catch → 'death' |
| src/camera.js | E2 | init, update | chase: portrait framing (hero box 28–38 % of height), fov 62 → 70 by speed, lag, shake on hit, pitch on ramps, computes state.heroBox |
| src/input.js | E3 | init, update | touch swipes (≥ 40 px, < 300 ms; real touch events on the canvas) + keys; queues one action; exposes input.consume() |
| src/hud.js | E3 | init, update | score/coins/distance, zone tag, death screen with restart (no reload), all DOM, hidden by `?nohud=1` |
| src/audio.js | E3 | init, update | WebAudio; unlock on the start tap; audio/*.webm or .mp3; spatial pan for the pack; music loop; procedural fallback beeps if a file is missing |
| src/main.js | E3 | — | boot, ctx, loop, telemetry (`window.__GAME__` every frame per tools/GATE_CONTRACT.md — check that file before finishing), start/restart |

## Rules
- Nobody edits another owner's file. Shared needs go in ctx/state/events as listed; if you need a new field, add it to your module's
  header comment AND to state with a default in your init, never in config.js.
- No asset is built from primitives inside engine code. Placeholders during development: a named Box with `userData.placeholder=true`
  that the integrator can grep for; every placeholder must be gone by integration.
- Test each module with a fixture page under work/<agent>/ that imports only your module plus stubs; keep browser runs short.
- Telemetry `fps` from real elapsed time; `pos` = [x, z] in metres; `draws/tris` from renderer.info after rig.render.

## Addendum (2026-09-19, before fan-out)
- src/assets.js is owned by E4 (with textures.js and chamfer.js): `get(name, opts)`, `lights(group)`, prototype cache, and a
  PLACEHOLDER fallback — when `./assets/<name>.js` is missing it returns a named Box sized from ASSETS.md/STYLE.md with
  `userData.placeholder = true` and logs one line, so E1/E2 can build and test before the assets land. Other agents stub it in fixtures.
- tools/GATE_CONTRACT.md is authoritative for `window.__GAME__` (adds next.id, next.lanes as per-lane null|'jump'|'roll'|'block',
  next.len, coin:{dist,lane}, jumps, rolls). A roll row longer than 0.5·speed metres cannot be rolled under: E1 must not build one.
