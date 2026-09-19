# midnight-dash — lead spec v2 (yokocho direction)

Read STYLE.md, then CLAIMS.md. This is the split: the game, the objects, who builds what, what the gate asserts.
Shipped folder is game/ (relative paths only). tools/ holds the gate. refs/ is never shipped.

## The game
- Third-person chase camera behind a human runner (hero orange jacket) who auto-runs along +Z through a Showa-era
  Tokyo yokocho at blue dusk; a pack of three dogs chases 4–7 m behind (the pursuer — a hit lets them catch up;
  two hits in 5 s and they get you). Three lanes at x = -2, 0, +2.
- Input: touch swipes (left/right lane, up jump, down roll) and keys (arrows / WASD / space). Real DOM events only.
  Start button `#startb` on a title screen; that tap also unlocks audio.
- Speed 9 m/s at start, +0.6 m/s per 150 m, cap 20 m/s. Lane change 0.18 s eased. Jump apex 1.1 m in 0.55 s.
  Roll 0.5 s, hitbox height halves. Side clip = stumble: −35 % speed, 0.4 s no input, pack closes in.
- Coins (+1) with the τ embossed. Score = coins + metres/10. Head-on block = caught → death screen → restart in place.
- Zones cycle forever, ~180 m each: ALLEY A (ramen/bar yokocho) → RAMP UP → EXPRESSWAY (Shuto-style, sodium lamps,
  sound walls, sign gantries, far skyline) → RAMP DOWN → ALLEY B (market/shuttered variant, more crates and carts) → …
- Phone first: rig tier 'phone' below 700 px wide; the phone run IS the measurement run (portrait = the bar's aspect).

## Track and chunks
- A chunk is 30 m: road 6 m + 1.5 m cluttered verges + shophouse units right at the verge, cable spans and
  lantern/banner strings overhead, baked per chunk with `bakeStatic` at load into a pool (each variant × 2), recycled
  ahead of the player. Nothing bakes during play. Coins: one `InstancedMesh`. Obstacles: pooled per type. Litter:
  one `InstancedMesh` of small planes per chunk. Dogs and runner: `keepHierarchy`, merged per joint.
- Variants: alley A 6, alley B 6, expressway 6, ramp up 1, ramp down 1 = 20. `?seed=N` fixes the sequence;
  `?gate=1` also fixes speed-ramp timing so photos at fixed distances are repeatable.
- Far band: ONE merged mesh of skyline blocks with lit windows at 120–300 m, no shadows, no colliders; seen down
  cross-streets in the alley, everywhere on the expressway. Alley cross-streets every other chunk, 4 m wide, ending in
  a lit sign cluster (depth cue, and where C4's sky shows).
- Practicals: every emitting asset publishes `userData.lights = [{x,y,z,color,intensity,range}]`; the level places
  real point lights for the nearest N (phone N=6, desktop N=14) and emissive-only beyond. Sky: Atlas 2K panorama,
  dusk blue with stars, replacing the rig's analytic sky (rig keeps haze + tone curve).

## Object list (38) — every one a 404 code asset; sizes and colours in STYLE.md
Characters: 1 runner (jointed) · 2 shiba dog · 3 white spitz dog · 4 brown mutt dog (all jointed, bounding gait)
Pickup: 5 τ coin (glyph from refs/logo/tao_symbol.png as an extruded Shape, geometry only)
Obstacles: 6 beer-crate stack (jump) · 7 cooler box + bin (jump) · 8 fallen bicycle (jump) · 9 low banner cluster, 1.3 m clearance (roll)
 · 10 awning strut / scaffold pole at 1.3 m (roll) · 11 kei delivery van (block) · 12 yatai noodle cart (block) · 13 vending machine (block in lane, prop on verge)
 · 14 concrete divider (expressway block) · 15 road-works barrier (expressway jump) · 16 low gantry board at 1.3 m (expressway roll)
Alley: 17 shophouse A ramen (timber, lanterns, lit interior) · 18 shophouse B bar (tin cladding, lightbox cluster) · 19 shophouse C shuttered (AC units, ducts, pipes)
 · 20 shophouse D corner (two lit faces, for cross-streets) · 21 utility pole (transformer, insulators) · 22 cable-bundle span (30 m catenaries, TubeGeometry)
 · 23 paper lantern single · 24 lantern string ×6 · 25 noren banner string ×5 · 26 wall lightbox (sprite face) · 27 standing lightbox
 · 28 tin awning with struts · 29 AC unit + duct cluster · 30 litter set (paper, cups, cans — small, for instancing) · 31 bins + bags cluster
 · 32 alley road chunk slab (wet asphalt, gutters, manhole, puddle planes) · 33 parked sedan
Expressway: 34 deck slab with upstands + sound panels · 35 sodium lamp 10 m · 36 sign gantry, green boards · 37 guard rail 4 m · 38 ramp chunk (mirrored for down)
Detail set (batch 4, +20, per user: 'make the street as detailed as possible'): bicycle_parked, scooter, beer_keg, gas_cylinders,
 umbrella_stand, laundry_line, menu_board, plant_pots, cardboard_boxes, ashtray_stand, traffic_mirror, road_cones, post_box, electrical_box,
 vertical_sign, stool_table_set, rooftop_water_tank, tv_antenna, fire_ext_box, drink_cases. Total 58 assets. Names in ASSETS.md.
Far band skyline is built by E4 from shophouse/facade masses, not a separate asset.

## Atlas jobs (declared in the entry)
A. Bar: refs/bar-video/ (20 frames from the user's video). Secondary: refs/bar_v1_atlas/.
B. Object references ×38, STYLE.md suffix verbatim, 1:1. Batch 1 = 12 style-definers → user go-ahead → batches 2–3.
C. Sign sprites ×8 (512 px WebP): lightbox faces with abstract kana-like strokes, ramen, bar, karaoke, pharmacy, generic ×3, plus 2 noren stroke sprites. No real words.
D. Textures (1K WebP, albedo/roughness/normal): wet asphalt, corrugated tin, timber plank, concrete deck. ≤ 4 sets.
E. Sky: one 2K equirect dusk panorama with stars, WebP.
F. Audio: SFX coin, jump, roll, hit, dog bark ×2, whoosh; 1 music loop (lo-fi city); alley ambience (chatter, sizzle, rain drip); expressway wind.
Every image is opened for the user's go-ahead before geometry is written from it. Texture budget ≤ 2.5 MB.

## Architecture (files each agent owns; all under game/)
index.html · src/main.js (boot, loop, telemetry, start, audio unlock) · src/config.js (budgets, seed, tuning)
src/track.js (chunk pool, zones, spawn, recycle, far band, cross-streets) · src/player.js (lanes, jump, roll, stumble, run cycle)
src/pack.js (three dogs: bounding gait, follow distance, catch logic) · src/camera.js (chase, fov by speed, shake, portrait framing)
src/input.js (swipes via touch events, keys) · src/obstacles.js (pools, AABB by lane, `next` telemetry) · src/coins.js (InstancedMesh, τ)
src/lighting.js (rig night + practicals from userData.lights, sky panorama, phone tier) · src/hud.js · src/audio.js
src/chamfer.js (THREE proxy: RoundedBox for boxes with min side ≥ 25 cm) · src/textures.js (WebP loader, KTX-free, applies Atlas maps by material name)
assets/*.js + *.expect.json · textures/ · audio/ · assetlib.js · surfaces.js · rig.js (copied, never edited)

## Telemetry — the base contract plus what the gate needs (tools/GATE_CONTRACT.md is authoritative once G1 writes it)
window.__READY__, window.__START__, window.__GAME__ = {
  pos:[x,z], fps (real elapsed), speed, score, over, draws, tris,
  lane, airborne, rolling, distance, zone, coins, deaths, jumps, rolls,
  next:{ dist, lane, kind:'jump'|'roll'|'block', lanes:[bool,bool,bool] },   // blocked mask for the next obstacle row
  coinLane, heroBox:[sx, sy, w, h], packDist
}

## Gate — tools/gate.mjs (G1). Real touch, distance-based steering, photos at 60/150/300/450/600/800 m, filmstrip,
asserts distance ≥ 600, coins > 0, ≥ 1 jump and ≥ 1 roll, alive at 400 m, draws ≤ 900, tris ≤ 1.5M, --4g: READY < 20 s, < 5 MB.

## Budgets
900 draws, 1.5M tris peak, < 5 MB transferred (≤ 2.5 MB textures + ≤ 1 MB audio + code), `__READY__` < 20 s at 4 Mbps.
Anything added buys its headroom first.

## Agents, round 0
A1–A6 assets (6–7 objects each: 3 candidates, verify.mjs, pick by eye, expect.json beside each)
E1 track+chunks+far band+cross-streets · E2 runner+pack+camera · E3 input+HUD+audio · E4 lighting+sky+textures+practicals+perf
G1 gate (running) · I1 integrator (wires, runs gate, ship.mjs --stamp, snapshots rounds/r0/)
Each agent gets STYLE.md, SPEC.md, CLAIMS.md, asset-contract.md, traps.md, and its own work/<agent>/ scratch dir.
