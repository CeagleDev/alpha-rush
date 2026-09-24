# ALPHA RUSH front end, pass 2 — what was built (work/v2/UI2_BRIEF.md)

## Files touched (only the four I own)
- `game/index.html` — all CSS + markup. Depth system: `.pc` (glow wrapper, box-shadow glow behind) > `.pe` (1 px
  chamfered gradient edge) > `.pi` (navy->deeper-navy gradient fill, 1 px inner highlight, 12 %-opacity accent
  stripes in the corner). Buttons `.abtn` bevel (top light / bottom dark gradient + inset highlight + 3 px inset
  base), `.bw` glow wrapper, `:active` press state (translateY 2 px + brighten). `.field` = two drifting diagonal
  stripe layers (transform-only `drift` animation, `will-change: transform`) + a radial vignette on every screen
  (home, pause, death). `.phead` headers carry an accent underline slash (cyan / magenta / dim, skewed).
  New markup: `<canvas id="h-turntable">` inside `#h-car`, `#h-locs` strip, icons in the header chips / death
  stats / pause menu buttons / RUN. Death card says ALPHA. Cache stamp on the main.js script unchanged.
- `game/src/home.js` — `ICON` (inline SVG set: tabs, missions, tasks, achievements, locations, stats, dog, and the
  five power-up emblems: horseshoe magnet, omamori pouch with bow, x2 starburst badge, winged sneaker, alpha +
  lightning-bolt emblem), `POWER_UI` (five entries incl. `surge`, colours, durations, copy), `ROSTER` (+ `glow`,
  `turf`, `fav`). Panes: MISSIONS (mult hex badge, 4 stat tiles, three icon cards with animated bars — width
  transition from 0 on render — reward line "Complete all three -> multiplier x{n+1}", multiplier ladder
  x(n-1)..x(n+4), next-set preview strip from `progress.nextMissions()`), TASKS (countdown to reset, today's pot,
  earned, three icon cards with descriptions + gold reward chips in Alpha, bank note, tomorrow's tasks from
  `progress.dailyPreview()`), ACHIEVEMENTS (12 icon badges, unlocked = cyan/magenta hex + glow + "paid" chip,
  locked = dim/desaturated + padlock + "+100" chip), POWER-UPS (five big cards: emblem panel, LV tag, name,
  duration at level -> next, description, five pips, UPGRADE with the cost in Alpha, disabled when the bank is
  short, MAX at level 5). PLAYERS: cards fill the carousel height; art = 46 % of the card (the monogram fallback,
  z-index under the canvas); per-character colour theme on glow / accents / stat segs / loadout chips; LOCATIONS
  strip below (Yokocho, Expressway, Morning Market, Rooftops, Shrine Path + "??? · at 1,200 m" that becomes the
  revealed name with a gold NEW tag when `progress.revealed()` includes 'train'). Emits `select` {id, asset} and
  stamps `data-hero` / `data-asset` on the canvas on every selection.
- `game/src/hud.js` — imports `ICON` / `POWER_UI` from home.js. Score punches (`.punch`, scale 1.15 -> 1, 120 ms)
  on every 'coin'; streak chip "x{n} ALPHA STREAK" from 5 in a row (a 1.5 s gap ends it); multiplier chip
  `.flare` on change; zone label now sits in the distance line; five active power-up badges (emblem in a
  draining SVG ring, seconds left under it, fed from `state.powerDur`); zone BANNER ("NOW ENTERING · X", 1.6 s
  slide-through on every 'zone' event except rampUp / rampDown) and the gold reveal banner ("NEW LOCATION
  REVEALED · {label}"); distance MILESTONE flash every 500 m; speed GAUGE (220-degree SVG arc, cyan -> magenta,
  km/h inside); pack meter with the dog icon; ALPHA counter with the tau mark. SURGE: while `state.surgeT > 0`
  `#hud.surge` shows a 7 px cyan/magenta shimmering energy bar across the top, an "ALPHA SURGE" tag and a
  pulsing screen-edge glow (CSS only). Death-card missions list carries icons. `?nohud=1` still builds nothing.
- `game/src/progress.js` — strings: "Collect N Alpha", "Collect {n} Alpha today", 'Alpha Haul' (100 Alpha in
  one run), 'Banker' (1,000 Alpha in total). `POWER_KEYS` + 'surge' (fresh saves and merged old saves get
  `power.surge = 1`; upgrades like the others, 200*n). `revealed()` / `revealName(id)` / `reveal(id, label)`
  persisted in `save.revealed` ({id: label}); listens 'reveal' {id, label}. `nextMissions()`, `dailyPreview()`
  (pure `genDaily(date)` so the daily cache is untouched). `summary()` gains `revealed`. An achievement now
  pays `ACH_PAY` = 100 Alpha into the bank on unlock and the 'achievement' event carries `pay` — so the
  reward chips on the ACHIEVEMENTS page are real, not decoration (this is the one economy change; nothing new
  is persisted for it, it flows through `bank`).
- Persisted beyond pass 1: only `revealed` and `power.surge`. Snapshots of the pass-1 files: `work/v2/_*.p1.*`.

## Presentational only
- Character stat bars and the HOME TURF / FAVOURITE loadout chips on the cards (flavour; the runner reads none of it).
- The multiplier ladder and "next set" / "tomorrow" strips are read-only previews computed from progress.js.
- The surge HUD state was verified by writing `state.surgeT` / `magnetT` / `x2T` from the probe; the game does not
  emit 'reveal' or set `surgeT` yet (SURGE_BRIEF / zone work in flight), so those paths are exercised by simulation.

## Contract
- `#startb` visible on HOME, one real touch tap starts (gate: "touch tap on #startb PASS"); `window.__START__()`
  works; `#hud` shown in play; `#pauseb` 48 px; `#paused` / `#dead` / `#home` ids unchanged; `?nohud=1` builds
  nothing (probe: 0 children, no #pauseb). No network deps; inline SVG only. Every import keeps `?v=202609240459`.
- Added weight this pass: index.html +23.9 KB, home.js +12.7 KB, hud.js +4.7 KB, progress.js +2.0 KB (≈ 43 KB).
- `#h-turntable` box == the active card's `.art` box (probe: dx/dy/dw/dh = 0 at 390x844), transparent, pointer-events none.
- HUD bands at 390x844: top block 1-17 %, badges 11-17 %, gauge 90-100 %, pack 94-97 %; banners at 24 % / 30 %
  are the only things that cross the centre lane above the runner and they last ≤ 1.6 s.

## Gate (honest)
`node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui2_gate`: every judged line PASSES (started by real tap,
29 steering decisions, 802 m, no death, 87 coins, 13 jumps / 6 rolls, peak draws 500, peak tris 1.29 M, 0 errors)
EXCEPT `404s: 1 FAIL — /src/zones/train.js` which chunks.js (not mine, the train zone in flight) imports. The
RESULT line is therefore FAIL until that module lands; nothing in my four files causes it.

## Screenshots (390x844 DPR 1 unless noted; `_v1` / `_v2` are the earlier iterations, `_v3` final)
- `work/v2/ui2/home_players_v3.png`, `home_players_2_v3.png`, `home_players_3_v3.png`, `home_players_revealed_v3.png`
- `work/v2/ui2/home_missions_v3.png`, `home_tasks_v3.png`, `home_achievements_v3.png`, `home_powerups_v3.png`,
  `home_powerups_bottom_v3.png` (Surge card), `home_powerups_upgraded_v3.png`
- `work/v2/ui2/hud_v3.png`, `hud_banner_streak_v3.png` (zone banner + streak), `hud_surge_reveal_v3.png` (surge bar,
  edge glow, three badges, gold reveal banner), `hud_powerup_v3.png` (real magnet pickup, `?pfirst=0&pgap=1&pprob=1`)
- `work/v2/ui2/pause_v3.png`, `pause_sound_off_v3.png`, `death_v3.png`, `home_after_quit_v3.png`
- `work/v2/ui2_desktop/*_v3.png` — the same at 1280x720
- `work/v2/ui2_gate/filmstrip.png` — the gate run
Scripts: `work/v2/ui2_shots.mjs` (all screens, `--vp=` for desktop), `work/v2/ui2_probe.mjs` (nohud, punch / flare /
milestone / streak / surge classes, badge rings, banner rules, turntable alignment, reveal persistence).

## Iterations
v1 -> v2: arrows moved to the art area's centre (they crossed the name), card gap filled with the loadout chips,
location labels wrap to two lines, missions got the multiplier ladder, tasks got countdown / pot / earned tiles,
descriptions, bank note and tomorrow's preview, surge bar thickened + "ALPHA SURGE" tag. v2 -> v3: desktop pass
checked (story clamps to 2 lines in landscape), no further changes needed.
