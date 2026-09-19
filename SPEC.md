# midnight-dash — lead spec, round 0

Read STYLE.md first. This file is the split: what the game is, what objects exist, who builds
what, and what the gate asserts. Budgets are hard.

## The game
- Third-person chase camera behind a runner who auto-runs along +Z. Three lanes at x = -2, 0, +2.
- Input: touch swipes (left/right = lane, up = jump, down = roll) and keys (arrows / WASD / space).
  Real DOM events only. A start button `#startb` on a title screen; the tap that starts also unlocks audio.
- Speed 9 m/s at start, +0.6 m/s every 150 m, cap 20 m/s. Lane change 0.18 s eased. Jump apex 1.1 m
  in 0.55 s. Roll 0.5 s, hitbox height halves. Stumble on a side clip: -35 % speed, 0.4 s no input.
- Collect coins (+1). Score = coins + metres/10. Hit a blocking obstacle head-on = game over,
  death screen, restart without reload.
- Zones cycle forever, each ~180 m: STREET A (neon back street) → RAMP UP → HIGHWAY (elevated,
  wind, gantries) → RAMP DOWN → STREET B (market/arcade variant) → RAMP UP → … Zone change is a
  chunk, not a fade.
- Phone first: rig tier 'phone' below 700 px wide (no composer, 1 cascade, fewer practicals).

## Track and chunks
- A chunk is 30 m of world: road 6 m + kerbs + 3 m sidewalks + facades, baked per chunk with
  `bakeStatic` at load into a pool (each variant × 2 copies), recycled ahead of the player. Nothing
  is baked during play. Coins and obstacles are dynamic layers: coins one `InstancedMesh`,
  obstacles pooled per type with `keepHierarchy` only for anything animated.
- Variants: street 6, market 6, highway 6, ramp up 1, ramp down 1 = 20 variants.
- `?seed=N` fixes the chunk sequence and obstacle pattern; `?gate=1` also fixes speed ramp
  timing and fires the gate's photos at fixed distances. Default seed is random.
- Far band: ONE merged mesh of distant skyline blocks with lit windows at 120–300 m, no shadows,
  no colliders, placed closer and bigger than intuition says (rust17 #13). Highway zone shows it
  most; street zone shows it down cross-streets.

## Object list (32) — every one a 404 code asset; sizes in STYLE.md
Characters (jointed, `userData.joints`, pivots at joints, ~3–9k tris):
 1 runner (hero orange jacket, big head, headphones)   2 guard pursuer (optional in round 0; slot reserved)
Pickups: 3 coin
Obstacles: 4 low barrier (road-works A-frame w/ blinking lamp)  5 high barrier (overhead gantry crossbar, 1.3 m clearance)
 6 taxi (danger red, roof lamp)  7 delivery van (full block, can be run along the roof — stretch)  8 scooter (parked row, jump)
 9 cone cluster (roll under? no — jump)  10 dumpster  11 concrete divider (highway)  12 construction fence panel
Street furniture: 13 street lamp (sodium)  14 shop-front unit A ramen (lit interior, awning, tube signs as shapes)
 15 shop-front unit B arcade (cyan/magenta panels)  16 shop-front unit C pharmacy (mint cross)  17 vending machine
 18 lantern string (izakaya)  19 utility pole with transformer + cable stubs  20 bike rack with 3 bikes  21 planter box
 22 bench  23 traffic light  24 bollard  25 building facade block A (4 storeys, AC units, balconies)
 26 building facade block B (shutters, fire escape)  27 street road chunk slab (asphalt + kerb + drain, puddle planes)
Highway: 28 deck slab chunk (30 × 6 × 0.8 with edge upstands)  29 guard rail section  30 overhead gantry
 31 pylon lamp (cyan head)  32 ramp chunk (used mirrored for down)
Far band skyline is built by E4 from facade blocks, not a separate asset.

## Atlas jobs (declared in the entry)
A. Bar frames ×4: street run, highway run, ramp transition, death moment. 16:9 AND square. These are the critic's bar.
B. Object references ×32, one per object, STYLE.md suffix verbatim, 1:1, white background.
C. Sign sprites ×8: emissive planes (ramen bowl + invented katakana-like strokes, arcade, pharmacy, karaoke, bar, taxi rank, exit, generic). 512 px, WebP. No real words.
D. Textures (1K WebP, ≤3 sets): wet asphalt, concrete deck, facade brick — albedo/roughness/normal.
E. Sky: one night panorama 2K equirect WebP.
F. Audio: SFX coin, jump, roll, hit, whoosh, near-miss; 1 music loop; 1 street ambience; 1 highway wind.
Every image is opened for the user's go-ahead before geometry is written from it.

## Architecture (files each agent owns)
index.html · src/main.js (boot, loop, telemetry, start) · src/config.js (budgets, seed, tuning)
src/track.js (chunk pool, zones, spawn, recycle, far band) · src/player.js (lanes, jump, roll, stumble, run cycle, joints)
src/camera.js (chase, fov by speed, shake on hit) · src/input.js (swipes via touch events, keys)
src/obstacles.js (pools, collision AABB by lane) · src/coins.js (InstancedMesh, magnet later)
src/lighting.js (rig night + practicals: sodium points on lamps, neon emissives, headlight cones; phone tier)
src/hud.js (score, coins, distance, death screen) · src/audio.js (spatial SFX, music, unlock on tap)
src/chamfer.js (THREE proxy: RoundedBox for boxes with min side ≥ 25 cm, rust17 #24)
assets/*.js + *.expect.json · textures/ · audio/ · assetlib.js · surfaces.js · rig.js (copied, never edited)

## Telemetry (refreshed every frame)
window.__READY__, window.__START__, window.__GAME__ = {
  pos:[x,z], fps (real elapsed), speed, score, over, draws, tris,        // recipe contract
  lane, airborne, rolling, distance, zone, coins, deaths,
  next:{ dist, lane, type, kind:'jump'|'roll'|'block' },                 // the gate steers by this
  heroBox:[sx, sy, w, h]                                                // hero scale in frame
}

## Gate (lives in 404-game-recipe/harness/gate-midnight.mjs; real input only)
- Serves the folder, records 404s and console errors; 390×844 touch viewport + a desktop run.
- Taps `#startb` with a real touch. Steers by `next`: swipe to a free lane for 'block', up for 'jump',
  down for 'roll', decided at fixed DISTANCES (not times). Photos at 60, 150, 300, 450, 600, 800 m.
- Asserts: distance ≥ 600 m, coins > 0, ≥1 jump and ≥1 roll performed, not dead before 400 m,
  peak draws ≤ 900, peak tris ≤ 1.5M, weight < 5 MB, READY < 20 s under 4G. Exit non-zero, name the failure.
- Filmstrip of the run. Run twice on an unchanged build and report the spread before any claim.

## Budgets
900 draws, 1.5M tris peak, < 5 MB transferred, `__READY__` < 20 s at 4 Mbps, phone tier passes jam.mjs.
Anything added must buy its headroom first (rust17 #4).

## Agents, round 0
A1–A5 assets (6–7 objects each: 3 candidates, verify.mjs, pick by eye, expect.json beside each)
E1 track+chunks+far band · E2 player+animation+camera · E3 input+HUD+audio · E4 lighting+sky+textures+perf
G1 gate · I1 integrator (wires, runs gate, ship.mjs --stamp, snapshots rounds/r0/)
Each agent gets STYLE.md, SPEC.md, asset-contract.md, traps.md, and its own work/<agent>/ scratch dir.
