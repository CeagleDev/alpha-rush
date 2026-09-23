# ALPHA RUSH front end — what was built (work/v2/UI_BRIEF.md)

## Files touched
- `game/index.html` — all CSS + markup: HOME (`#home`), death card (`#dead`), pause menu (`#paused`), HUD styles.
  Palette cyan `#22e8ff` / magenta `#ff2d95` / amber `#ffb300` on navy `#0b1020`; chamfered panels via `clip-path`
  custom properties (`--cut`, `--cut-s`); system condensed italic display type (`Avenir Next Condensed` on
  Apple, `Roboto Condensed` / `sans-serif-condensed` on Android, `Arial Narrow` fallback), no web fonts; glow
  is text-shadow / box-shadow only; one slow CSS stripe animation (`stripes`, respects `prefers-reduced-motion`);
  transitions <= 200 ms. All targets >= 48 px; safe-area insets on every edge.
- `game/src/home.js` (NEW) — `ROSTER` export, character carousel (arrows + pointer swipe + tap on a side card),
  five tabs (ACHIEVEMENTS, PLAYERS default, MISSIONS, TASKS, POWER-UPS), header chips (best, bank). Panes are
  re-rendered from progress.js when opened; nothing runs per frame.
- `game/src/progress.js` — extended: single save `ar.save.v1` (nothing migrated from `md.save.v1`) holding
  missions/best (as before) + `bank`, `character`, `power` levels, `daily` tasks, `ach`, run/coin/power-up totals.
  New API: `bank() character() setCharacter() powerLevels() powerCost() upgradePower() daily() achievements()`.
  Emits `daily`, `achievement`, `bank`; listens `quit` (a quit banks the run's coins but does not count as a
  finished run). Writes `state.powerLevel`, `state.bank`, `state.character`.
- `game/src/hud.js` — rebuilt racing HUD: SCORE big + multiplier chip, distance, τ coin counter, PAUSE button
  `#pauseb` (48 px, top-right, the only pointer-enabled element in `#hud`), zone chip, four power-up timer bars
  (drain from the effective duration in `state.powerDur`), speed readout in km/h with a 10-segment bar, pack
  meter, `.perf` line. Toasts kept; achievement / daily-task toasts use the magenta variant. Zone labels now
  include `rooftops` and `torii` ("shrine path").
- `game/src/main.js` — start/pause flow: `home.show()` at READY; `start(opts)` sets `state.character` /
  `state.characterAsset` from `home.selected()` BEFORE emitting `start`, `{restart:true}` serves RESTART from
  the pause menu; new `quit()` (emits `quit`, resets state like a restart, shows HOME; `window.__QUIT__`);
  `setPaused` fills the pause card (score / distance) and syncs the SOUND label; RESUME via button, Esc, P,
  Space, Enter or a tap on the backdrop; `#pauseb` wired after `hud.init`. Telemetry gained `character`, `bank`.
- `game/src/powerups.js` — ONE hook at pickup: `dur = TYPES[type].dur * (1 + 0.2 * (level - 1))`, written to
  `state[T.key]` and `state.powerDur[type]`, emitted in the `powerup` payload.
- `game/src/audio.js` — tiny setters `setMuted(on)` / `isMuted()` (master bus to 0, remembered before unlock)
  and `setPaused(on)` (suspends the context so music holds still with the world).
- Untouched: player.js, anim.js, config.js, chunks.js, track.js, lighting.js, assets/, textures/.
- Cache stamp: every new/changed import carries `?v=202609211652` like the others.

## Presentational only
- The SPEED / JUMP / LUCK bars on the character cards (the runner does not read them).
- The character art is a monogram + stripes + ring panel in the character's colours; `hero_*` assets are not referenced visually.
- Daily tasks are seeded by the local date (FNV hash) from a pool of seven templates; the "finish N runs" task counts deaths only.
- Achievement "Night-Day-Night" unlocks when a `zone` event reports `prev === 'day'` (the day zone was passed through).

## Contract
- `#startb` visible on HOME and starts a run in one tap (gate: "started: touch tap on #startb PASS" on phone,
  "click on #startb PASS" on desktop). `window.__START__()` works (tools/shot.mjs uses it). `#hud` shown in play.
  `?nohud=1` builds nothing in `#hud` (`#pauseb` absent, main.js guards). `window.__GAME__` fields unchanged, two added.
- No new network dependencies; no images except inline SVG / CSS. Added weight: index.html +19.7 KB, home.js
  10.4 KB, progress.js +6.4 KB, hud.js +2.1 KB, main.js +3.9 KB, audio/powerups +1 KB ≈ 44 KB (< 60 KB).

## Gate status (honest)
`node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui_gate` currently FAILS, for reasons outside the files I own:
1. The runner dies at 37 m on the second crate_stack. Bisected with `work/v2/ui_jumpprobe.mjs`: jump apex is
   1.1 m and the crate is still hit, identically with `state.characterAsset` writes suppressed (plain runner),
   and the desktop gate (`work/v2/ui_gate_desktop`) dies at the same spot. The Sep 21 gate (`work/v2/gate`,
   PASS) cleared these same rows at the same lead; since then config.js `JUMP_T` went 0.55 -> 0.40 and
   player.js / anim.js / obstacles.js changed (uncommitted, not mine). The gate's jump lead (0.35·v + 1.5) no
   longer clears a crate_stack with the shorter hang.
2. Five 404s: `src/zones/rooftops.js`, `src/zones/torii.js` (chunks.js, in flight) and the three `hero_*`
   assets probed by player.js at init.
Everything the UI is responsible for passes: start from the real control, no console errors, draws/tris budgets.

## Screenshots (390x844 DPR 1 unless noted)
- `work/v2/ui/baseline_title.png` — the old title screen, for comparison.
- `work/v2/ui/home_players_v3.png`, `home_players_2_v3.png`, `home_players_3_v3.png` — carousel, all three cards (untagged / `_v2` = earlier iterations).
- `work/v2/ui/home_missions_v2.png`, `home_tasks_v2.png`, `home_achievements_v2.png`, `home_powerups_v2.png`, `home_powerups_upgraded.png` — the other tabs.
- `work/v2/ui/hud_v3.png`, `work/v2/ui/d0040.png` (tools/shot.mjs, achievement toast visible), `hud_magnet.png` — in-run HUD.
- `work/v2/ui/pause_v3.png`, `pause_sound_off_v3.png` — pause menu.
- `work/v2/ui/death_v3.png`, `home_after_quit_v3.png` — death card, HOME after quit.
- `work/v2/ui_desktop/*_v3.png` — the same at 1280x720.
- `work/v2/ui_gate/filmstrip.png`, `work/v2/ui_gate_desktop/filmstrip.png` — gate runs.
Scripts: `work/v2/ui_shots.mjs` (all screens), `ui_probe2.mjs` (nohud + upgrade), `ui_probe3.mjs` (pickup duration), `ui_jumpprobe.mjs` (gate bisect).
