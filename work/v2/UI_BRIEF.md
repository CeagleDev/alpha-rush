# Brief: Alpha Rush front-end (home screen, tabs, pause menu, racing HUD)

The game (folder `game/`, served at http://localhost:8080/__game__/game/ by an already-running server; DO NOT
start another) is being renamed from MIDNIGHT DASH to **ALPHA RUSH**. Owner's words: "the UI should look like a
proper racing game. Everything should be unique on the game front (reference UI of other games). This would later
be optimized to play as a webgame on mobile. Rebuild the UI to be more exciting. No pause button: include it, Esc
to pause, with the typical controls that appear in pause menus. The game should first load onto a screen where we
select out of three characters. That screen has tabs at the bottom: achievements, players, missions, tasks, powerups."

Read first: game/index.html, game/src/main.js (start/restart/pause flow, `state`, `events`, `window.__GAME__`),
game/src/hud.js, game/src/progress.js (score, multiplier, missions, save), game/src/powerups.js (TYPES),
tools/GATE_CONTRACT.md (the automated gate presses `#startb` and expects `#hud`; keep those ids working:
`#startb` must start a run from the home screen in ONE tap, and `window.__START__()` must too).

## Files you own
index.html (all CSS + markup), src/hud.js, src/home.js (NEW), src/progress.js (extend), the start/pause flow in
src/main.js. Do NOT touch player.js, anim.js, config.js, chunks.js, track.js, lighting.js, assets/, textures/.
Keep the cache-stamp convention: every relative import in src carries the same `?v=...` suffix the others have.

## Look
Mobile-first portrait (390x844 is the reference size), must also work at desktop 16:9. A RACING-GAME front end:
angular chamfered panels (clip-path), italic condensed display type (Google Fonts are NOT allowed - no network
deps beyond the three CDN already used; use system fonts with heavy weight + italic + letter-spacing, or CSS
transforms/skew for the racing feel), diagonal speed stripes, a strong accent palette that breaks from the old
cream/amber: primary electric cyan `#22e8ff`, hot magenta `#ff2d95`, warning amber `#ffb300`, deep navy ground
`#0b1020`, near-white `#eef3ff`. Big numbers. Glow via text-shadow/box-shadow only (cheap on phones). Motion:
short CSS transitions (<= 200 ms), a subtle animated stripe, nothing that runs every frame in JS. Everything
touch-sized (>= 48 px targets), safe-area insets respected (the :root variables already exist).

## Screens
1. HOME (id `home`, shown at load in place of the old #title). Top: ALPHA RUSH wordmark, best score, coin total
   (from progress.js save: add a persistent `bank` of coins earned across runs). Middle: a CHARACTER SELECT
   carousel of three cards (left/right arrows + swipe + tap): name, one-line title, three-line story, a stat row
   (speed / jump / luck as 5-segment bars, purely presentational for now), a big SELECT / RUN button (`#startb`).
   Roster (export from home.js as `ROSTER` so player.js can read `state.character`):
     - id `ronin`,   name KAITO,  title "The Last Ronin",  asset `hero_ronin`,  story: a masterless swordsman who
       sold his armour and kept the blade; he runs the night streets to outpace the debt collectors' dogs.
     - id `kitsune`, name YUZU,   title "Shrine Courier",  asset `hero_kitsune`, story: a fox-spirit messenger who
       carries talismans between shrines; the pack is hunting the bells on her belt.
     - id `oni`,     name RAIDEN, title "Neon Oni",        asset `hero_oni`, story: a rooftop mechanic who built his
       own jet-boots and stole the wrong scooter; now every dog in the ward wants him.
   Selection is saved (localStorage) and written to `state.character = id` and `state.characterAsset = asset`
   BEFORE 'start' is emitted. Card art: render a 3D turntable of the character in a small offscreen canvas is NOT
   required; use a large stylised monogram/silhouette panel per character in their colour (ronin indigo/red,
   kitsune white/vermilion, oni orange/cyan). The assets `hero_*` do not exist yet; do not reference them visually.
   Bottom: a TAB BAR with five tabs: ACHIEVEMENTS, PLAYERS, MISSIONS, TASKS, POWER-UPS. PLAYERS is the character
   select (default). Each other tab replaces the middle panel:
     - MISSIONS: the current set of three from progress.summary() with progress bars, the multiplier, sets done.
     - TASKS: three DAILY tasks (seeded by the date; e.g. "Collect 150 coins today", "Slide 20 times", "Grab 3
       power-ups"), each paying 50-150 coins to the bank when done; progress persisted; resets daily.
     - ACHIEVEMENTS: a grid of 12 badges (locked/unlocked) - first run, 500 m, 1 km, 2 km, 100 coins, 1,000 coins
       total, 10 power-ups, survive a stumble, x5 multiplier, all three characters used, 5 runs, night-day-night
       (pass through the day zone). Persist. Unlock toast in-run.
     - POWER-UPS: the four (magnet, charm, x2, super jump) with description, current level 1-5 and an UPGRADE
       button that spends bank coins (level n costs 200*n) to lengthen the duration +20 % per level. Wire the
       duration: write `state.powerLevel = {magnet:n,...}` and have powerups.js multiply its TYPES[type].dur by
       (1 + 0.2*(level-1)) when a pickup is taken (small, clearly-commented change in powerups.js is allowed for
       this one hook).
   Implement all the persistence in progress.js (single save object, versioned key `ar.save.v1`; migrate nothing).
2. HUD (in run): rebuild as a racing HUD: score big with the multiplier chip, distance, coin counter with the tau
   icon (keep the SVG), a speed readout (km/h from state.speed), the power-up timer bars, the pack meter, and a
   PAUSE button top-right (`#pauseb`, 48 px). Keep `#hud` as the root and the `.perf` line. Keep toasts.
3. PAUSE (id `paused`): opened by the button, Esc, or P; also on tab-hide/blur as now (main.js setPaused).
   Menu: RESUME (also Esc/tap outside), RESTART, SOUND on/off (audio.js has setMuted or similar - check; if not,
   toggle via ctx.modules.audio and add a tiny setter there), HOME (ends the run: emits 'death'-free quit - add a
   `quit()` in main.js that stops the run, resets state like restart, and shows HOME). Show current score/distance
   on the pause card. The world must hold still while paused (main.js already does dt=0).
4. DEATH card (id `dead`): restyle to match, with score, distance, coins, best, missions, and two buttons:
   RUN AGAIN (`#restartb`) and HOME.

## Contract you must keep
- `#startb` visible on HOME and starting a run in one real tap; `window.__START__()` works; `#hud` shown in play;
  `window.__GAME__` fields unchanged (you may add fields). `?nohud=1` still hides the HUD.
- No new network dependencies. No images except inline SVG/CSS. Total added weight < 60 KB.
- Verify with `node tools/shot.mjs --out=work/v2/ui --at=40 --vp=390x844 --q=seed=7` (it boots, presses start
  via __START__, and screenshots) AND with `node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui_gate`
  (must PASS). For the home/pause/death screens write a small puppeteer script in work/v2/ that screenshots each
  (390x844, DPR 1) - LOOK at every screenshot with the Read tool and iterate at least three times on what you see.
  Laptop on battery: small viewports, one browser at a time, close it when done.
- Write work/v2/UI_NOTES.md: what you built, what is presentational only, screenshots list.
Final message: paths of the screenshots and a 5-line honest self-assessment.
