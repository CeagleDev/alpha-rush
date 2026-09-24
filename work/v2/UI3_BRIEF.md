# Brief: the RUNNERS page, rebuilt (front end pass 3)

Owner: "The runners page is still poorly built. I want the characters to wave at the player, not just a turntable
of a figurine. Each player has the same capabilities, so remove the speed/jump/luck skills. Let the player's build
be the full screen with their name and story under. That's all. Add options to change their clothing and the colour
of the clothing, in the character selection screen: 3 outfits each, each with colour options."

You own game/index.html, game/src/home.js, game/src/progress.js (and hud.js only if you must). Read
work/v2/HERO_API.md (the outfit/palette contract), work/v2/UI2_NOTES.md, then the current files. Keep every id
and contract from work/v2/UI_BRIEF.md (#startb starts a run in one tap, window.__START__, #hud, #paused, #dead,
#home; no network deps; inline SVG only; the ?v= stamp on imports).

## The PLAYERS tab becomes the SHOWCASE
- The hero fills the screen: `<canvas id="h-turntable">` covers the whole area between the header and the
  bottom controls (edge to edge, transparent; src/showcase.js - NOT yours - renders the live hero into it, facing
  the player, waving and idling; it reads the canvas size every frame, so just lay it out). Behind it: the
  character's colour theme as a soft radial glow + the drifting stripe field. Keep the left/right arrows (big,
  at the canvas's vertical middle, over the canvas edges) and swipe/tap to change hero; a 1/3 pager.
- Under the hero: NAME (huge), title, the story (3 lines). NOTHING else: no stat bars, no loadout chips, no
  "runner 01" tag, no monogram.
- WARDROBE row (above the RUN button, compact, thumb-sized): three OUTFIT chips (the outfit names from the
  hero module's OUTFITS; the current one highlighted) and, under them, four round COLOUR swatches for the
  current outfit (each swatch painted with the palette's three hex colours as a 3-stripe diagonal; current one
  ringed). Tapping either updates the choice instantly (the live hero rebuilds in the canvas within ~1 s).
- Reading OUTFITS: import the hero modules dynamically from '../assets/hero_<id>.js' + the stamp
  (`import(\`../assets/${asset}.js${MODULE_V}\`)`) and read `OUTFITS`; if a module has none, show no wardrobe row.
- The choice is written to `state.outfit` and `state.palette` (ids) whenever it changes and on hero change
  (restore that hero's saved wardrobe), and persisted by progress.js as `save.wardrobe[charId] = {outfit,
  palette}` (new API: wardrobe(charId) / setWardrobe(charId, outfit, palette)). main.js reads nothing new: player.js
  reads state.outfit/state.palette itself at 'start'.
- The LOCATIONS strip moves to the ACHIEVEMENTS tab (top of it), so the players page stays clean.
- The RUN button stays exactly where it is (#startb). Everything must fit 390x844 without scrolling: header (compact),
  hero canvas (~48 % of the height), name/title/story, wardrobe row, RUN, tab bar. Also check 1280x720 desktop.

Verify with a puppeteer script (390x844 DPR 2, one browser, close it): screenshot the players page for each hero
and after tapping outfit 2 + swatch 3, and after a reload (persistence). LOOK at every screenshot with Read and
iterate at least three times. `node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui3_gate` must PASS.
Write work/v2/UI3_NOTES.md. Final message: screenshot paths + 5 honest lines.
