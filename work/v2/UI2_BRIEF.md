# Brief: Alpha Rush front end, pass 2 (depth, icons, "Alpha", richer pages, exciting HUD)

Owner's words after seeing pass 1: "The UI shapes still look flat. Make it more interesting and fill the page
especially in the mission and powerup pages. A well built and interesting game UI. The UI in the runner page
should feel more exciting. Everything should be well bold and built and colourful and engaging to the eye. The
powerup pages should have unique icons not just text. Use the word 'Alpha' instead of coins."

You own: game/index.html, game/src/home.js, game/src/hud.js, game/src/progress.js (text + the new fields
below). Do NOT touch anything else. Read work/v2/UI_BRIEF.md (pass 1, still the contract: ids #startb #hud
#pauseb #paused #dead #home, `window.__START__`, `?nohud=1`, no network deps, inline SVG only) and
work/v2/UI_NOTES.md, then the current files. Keep the cache-stamp suffix every import already carries.

## Must-do list
1. "ALPHA" everywhere the UI says coins: the counter, the bank, missions ("Collect 40 Alpha"), tasks, death
   card, upgrade costs ("200 Alpha"). The tau SVG stays as the Alpha mark. Rename in progress.js strings too.
2. DEPTH. No flat single-colour panels: layered chamfered cards with a 1 px inner highlight and an outer
   glow, gradient fills (navy -> deeper navy, accent stripes at 12 % opacity), a diagonal speed-stripe field
   behind the content that slowly drifts (CSS animation, GPU-cheap), a soft vignette. Buttons: bevel + glow +
   press state. Headers with an accent underline slash. Icons everywhere a label was.
3. POWER-UPS page: five big cards that FILL the page (scroll if needed): magnet, charm, x2, super jump, and
   ALPHA SURGE (new: "Alpha Surge - become unstoppable: fly above the street, smash through everything, pull
   in every Alpha, 8 s"). Each card: a UNIQUE inline SVG icon in its own colour (draw them: a horseshoe magnet,
   an omamori charm pouch with bow, a bold x2 badge, a winged sneaker, a lightning-bolt alpha 'α' emblem), the
   duration at the current level, five level pips, the upgrade cost in Alpha, an UPGRADE button with a
   disabled state when the bank is short. Level 5 shows MAX. Surge upgrades like the others (key 'surge').
4. MISSIONS page: three mission cards with icons (coin stack, distance flag, jump/slide/power icons), animated
   progress bars (fill transition), the reward line "Complete all three -> multiplier x{n+1}", a multiplier
   badge, the set number, and a "next set preview" strip. Fill the page.
5. TASKS and ACHIEVEMENTS: same treatment: icons, reward chips in Alpha, unlocked badges glow, locked ones
   are dim with a padlock glyph.
6. PLAYERS page: the character card art area becomes a `<canvas id="h-turntable">` (full card art width,
   ~46 % of card height, transparent background) that a separate module (src/showcase.js, NOT yours) will
   render the live 3D hero into. Keep the monogram BEHIND it as a fallback (z-index under). Keep name, title,
   story, stat bars; add a character colour theme per card (ronin indigo/red, kitsune white/vermilion, oni
   orange/cyan) applied to the card's glow and accents. Below the carousel add a LOCATIONS strip: five small
   tiles (Yokocho, Expressway, Morning Market, Rooftops, Shrine Path) and a sixth LOCKED tile "??? - revealed at
   1,200 m" that unlocks (name from progress) when `progress.revealed()` includes 'train'; progress.js gets
   `revealed()` / `reveal(id)` persisted, and listens for a 'reveal' event {id, label} from the game.
7. HUD (in run) - "more exciting": score numerals that punch (scale 1.15 -> 1, 120 ms) on every Alpha; a
   pickup streak counter ("x12 ALPHA STREAK") that appears after 5 in a row; a speed GAUGE (arc or segmented
   ring) with the km/h in it; a ZONE BANNER that slides in for 1.6 s on every 'zone' event ("NOW ENTERING ·
   ROOFTOPS") and a special gold one for 'reveal' ("NEW LOCATION REVEALED · {label}"); active power-up badges
   with the same SVG icons and draining rings; multiplier chip flares when it changes; a distance milestone
   flash every 500 m; the pack meter with a dog icon. Keep it readable at 390 px: nothing over the centre lane
   above the runner's head band (screen y 35-70 %) except the short banners.
8. SURGE state: when `state.surgeT > 0`, the HUD shows a full-width thin cyan/magenta energy bar at the top
   and a subtle screen-edge glow (CSS only).
Persist nothing new beyond `revealed` and the surge level. All new text in the game's voice: short, bold, upper-case labels.

## Verify (laptop on battery: small viewport, one browser, close it)
- `node tools/gate.mjs game --phone --seed=7 --out=work/v2/ui2_gate` must PASS.
- Reuse/extend work/v2/ui_shots.mjs to screenshot every home tab, HUD (with a power-up active: use
  `?pfirst=0&pgap=1&pprob=1`), pause, death at 390x844; LOOK at each with Read and iterate at least three times.
  Also one desktop 1280x720 pass. Write work/v2/UI2_NOTES.md. Final message: screenshot paths + 5 honest lines.
