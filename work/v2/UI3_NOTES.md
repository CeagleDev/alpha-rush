# ALPHA RUSH front end, pass 3 — the RUNNERS page rebuilt (work/v2/UI3_BRIEF.md)

## Files touched (only the three I own; hud.js untouched)
- `game/index.html` — PLAYERS pane rebuilt as the SHOWCASE. `.show` (#h-car) is a flex:1 box with negative side
  margins so it runs edge to edge; inside it, behind the canvas: `.glow` (radial gradient from the hero's --c1 /
  --c2 theme, set by home.js), `.beam` (a skewed light shaft in --c2) and `.floor` (an elliptical pool under the
  feet); `<canvas id="h-turntable">` is `inset: 0` of that box (transparent, pointer-events none — showcase.js
  reads its CSS size every frame); the `.pager` ("SELECT YOUR RUNNER 1 / 3") top-left, the two `.arrow`s at the
  canvas's vertical middle over its edges, the `.dots` over its bottom. Under it `.hinfo`: NAME (clamp 40-58 px,
  glow in --c2), title (--c2, letter-spaced), story (3 lines, clamped). Then the WARDROBE row `.ward`
  (`[hidden]` = no row): `.outfits` = three `.ofit` chips (name + "outfit n"; the current one cyan and showing
  the current palette's name), `.swatches` = four round `.sw` buttons (48 px targets, a 36 px disc painted with
  the palette's three colours as a 135° 3-stripe, the current one ringed cyan with a white centre dot). RUN
  (`#startb`) unchanged in place; `#loadline` shrunk to 12 px. Header compacted (one-line wordmark, smaller
  chips). The `.locs` strip CSS stays (it renders in the ACHIEVEMENTS tab now) plus a `.lochead` caption.
  Removed: everything for the card carousel (.card / .art / .mono / .stats / .segs / .loadout / .track).
  Desktop (`min-aspect-ratio: 4/3`) block: smaller name, 2-line story, tighter wardrobe.
- `game/src/home.js` — ROSTER trimmed to id / name / title / asset / story / colour theme (stats, monogram,
  turf, favourite gone). `select()` paints the theme vars on #h-car and #h-info, writes name / title / story,
  the pager, the dots, `data-hero` / `data-asset` on the canvas, `state.character` / `state.characterAsset`,
  then restores that hero's wardrobe. WARDROBE: `loadOutfits(r)` = `import(\`../assets/${asset}.js?v=…\`)`
  (cached per hero; the module's OUTFITS table is normalised — ids, names, 3 hex swatches — and anything
  malformed or missing yields null = no row). `validWard()` falls back to the first outfit / first palette for
  unknown ids. `writeWard()` writes `state.outfit` / `state.palette` (ids, or null when the hero has no
  OUTFITS), `data-outfit` / `data-palette` on the canvas, and persists through `progress.setWardrobe`.
  `pick()` handles a chip / swatch tap (changing outfit resets to that outfit's first palette). Events:
  'select' {id, asset, outfit, palette} on hero change; 'wardrobe' {id, asset, outfit, palette} on every
  wardrobe change (showcase.js can rebuild on it, or watch state). Swipe anywhere on the showcase; a tap on
  its left / right 30 % steps; arrows as before. New export `wardrobe()`. `renderLocs()` now targets `#h-locs`
  inside the ACHIEVEMENTS pane (rendered at the top of it with a "Locations · n / 5 found" caption).
- `game/src/progress.js` — `wardrobe(charId)` → {outfit, palette} | null, `setWardrobe(charId, outfit, palette)`
  (persisted as `save.wardrobe[charId]`, stored at once); fresh saves and merged old saves get `wardrobe: {}`;
  at init `state.outfit` / `state.palette` are seeded from the saved character's wardrobe (home.js re-writes
  them on select); `summary()` gains `wardrobe`. Nothing else in the economy changed.

## Contract
- `#startb` in place (390x844: y 689-753, 366x64), one real touch tap starts (probe: running / #hud on / #home
  off after the tap; the 'start' listener saw `{ch, outfit, palette}` on state). `window.__START__` untouched.
  `#hud` / `#paused` / `#dead` / `#home` ids unchanged; no network deps; inline SVG only; every import keeps
  `?v=202609240703` (the dynamic hero import carries it too).
- Fits without scrolling at 390x844 (pane / hbody overflow 0): header 56, canvas 396-414 px (47-49 % of the
  height), name / title / story, wardrobe 93 px, RUN, tabs; also 1280x720 (canvas 328 px = 46 %, overflow 0).
- `#h-turntable` box = the whole `.show` box (0,56 390x396 at 390x844; 360,58 560x328 at 1280x720).
- Degrades: with the current hero modules (no OUTFITS yet) the row is hidden, state.outfit / palette are null,
  the canvas grows to 60 % (screenshots `*_nostub_v1.png`).

## Verification (how the wardrobe was exercised before the hero modules export OUTFITS)
`work/v2/ui3_shots.mjs --stub=<scratchpad>/stub_outfits.mjs` intercepts ONLY the stamped URL home.js imports
(`/assets/hero_<id>.js?v=…`) and serves the real module with an `export const OUTFITS = […]` (HERO_API shape,
3 outfits x 4 palettes per hero) prepended; game/assets was never edited and the asset loader (unstamped URL)
still built the real heroes. Without `--stub` the script checks the "no row" path.

## Gate
`node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui3_gate`: RESULT PASS (started by a real touch tap on
#startb, 29 steering decisions, 802 m, no death, 87 coins, 13 jumps / 6 rolls, peak draws 514, peak tris 1.45 M,
0 404s, 0 errors). Log: `work/v2/ui3_gate.log`, filmstrip `work/v2/ui3_gate/filmstrip.png`.

## Screenshots (390x844 DPR 2 unless noted)
- `work/v2/ui3/players_1_v2.png`, `players_2_v2.png`, `players_3_v2.png` — Kaito / Yuzu / Raiden with the stub
  OUTFITS (3 chips + 4 swatches, first of each current)
- `work/v2/ui3/players_outfit2_swatch3_v2.png` — after tapping outfit 2 then swatch 3 (chip 2 cyan and naming the
  palette, swatch 3 ringed); `players_reload_v2.png` — the same after a full reload (persisted)
- `work/v2/ui3/players_*_real_v3.png`, `players_outfit2_swatch3_real_v3.png`, `players_reload_real_v3.png` — the
  DELIVERED `work/v2/heroes2/oni/hero_oni.js` served on the stamped URL (real OUTFITS: Neon Mechanic / Street Oni /
  Rider; after taps `state.outfit = 'street'`, `state.palette = 'teal_drift'`, saved and restored; the 'start'
  listener saw them). NOTE `--hero=oni` started on Raiden, so `players_1_real_v3` is Raiden, `_2` Kaito, `_3` Yuzu.
- `work/v2/ui3/players_1_nostub_v2.png` (DPR 1) — the current game/assets modules (no OUTFITS): no wardrobe row,
  the hero canvas takes the space (59 %), RUN keeps its 8 px gap under the story
- `work/v2/ui3/achievements_v2.png`, `achievements_revealed_v2.png` — the LOCATIONS strip at the top of ACHIEVEMENTS
  (locked "??? at 1,020 m" / gold "TRAIN YARD · new" after a 'reveal')
- `work/v2/ui3_desktop/*_v2.png` — 1280x720 (canvas 46 %, 2-line story, everything fits)
Scripts: `work/v2/ui3_shots.mjs` (`--stub=` / `--real=work/v2/heroes2` / `--hero=` / `--vp=` / `--dpr=`; probes the
canvas box, overflow, state, dataset, chips, swatches, save.wardrobe, the 'start' state).

## Iterations
v1: first layout — showcase 47-49 % of 844, wardrobe row 93 px, RUN at y 689, no overflow; the story ran straight
into RUN when the row was hidden (no-OUTFITS boot). v2: 8 px gap moved from the row to `.startw` so it holds
either way; dots lifted off the floor ring; a theme-coloured slash after the pager. v3: exercised against the
real delivered oni module (ids like `neon_orange` / `teal_drift`, names up to "Neon Mechanic" fit the chips);
the kitsune delivery was still mid-write during my runs (`Unexpected end of input`) and correctly produced NO row.

## Honest notes
- The live hero in the canvas does not yet change clothes when a chip / swatch is tapped: showcase.js and the
  asset loader's `variant` pass-through are other agents' work; my side writes state.outfit / state.palette,
  data-outfit / data-palette on the canvas and emits 'wardrobe' {id, asset, outfit, palette}.
- With today's game/assets heroes (no OUTFITS) the players page shows no wardrobe row at all — by design.
- Presentational only: the glow / beam / floor behind the canvas (colour theme from ROSTER), the pager slash.
- The old carousel probes in `work/v2/ui2_probe.mjs` (h-track alignment) are obsolete.
- Weight this pass: index.html +1.4 KB, home.js +5.7 KB, progress.js +1.6 KB (net +8.7 KB; the card CSS/markup came out).
