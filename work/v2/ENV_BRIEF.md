# Brief: a new zone for Alpha Rush (assets + a chunk recipe file)

The game runs 30 m chunks along +Z, road centred on x = 0, three lanes at x = -2, 0, +2, running surface at
chunk-local y = 0. Read `game/src/chunks.js` end to end first (Builder, put(), faceRoad, finish(), the alley()
recipe is the pattern to follow), `game/src/obstacles.js` (KINDS, how JUMP/ROLL/BLOCK hitboxes are built: a
jump item <= ~1.2 m tall, a roll item's bar/board at 1.3 m with its legs OUTSIDE the lane or authored
base-at-hem, a block item ~1.6-2.2 m), `../404-game-recipe/docs/asset-contract.md`, `ASSETS.md` (how the
existing assets are described), and `STYLE.md`. Look at `refs/objects/*.png` for the house style of the
existing assets and at the existing `game/assets/*.js` for construction quality (deformed primitives, lathes,
bevelled extrusions; no textures, no imports; materials named from plaster|stone|timber|tile|metal|fabric|
foliage|ground; emissive only on light sources with `userData.lights` entries like the existing lantern/sign
assets so lighting.js lights the road from them).

Your APPROVED reference is one Atlas concept board (path given in your prompt). Read it with the Read tool at the
start and before every look-and-fix pass. Every object you model must be something visible in that board, built
so it reads from every angle (the verifier checks four sides).

Deliver into your directory:
1. Assets: one `<name>.js` + `<name>.expect.json` per object (list in your prompt), verified clean with
   `node ../404-game-recipe/harness/verify.mjs <your dir> --size=480` from the midnight-dash root; LOOK at each
   render and iterate at least twice.
2. `zone.js`: an ES module `export const ZONE = { id, label, obstacles: { jump: [...], roll: [...], block: [...] },
   height: 0 | 6, lightsMood: 'warm'|'neon' }` and `export async function build(ctx, variant, H)` where H is
   `{ Builder, pick, range, shuffle, faceRoad, finish, ROAD_SURF }` re-exported from chunks.js (the integrator
   will wire it). It must place: the 30 m ground/road chunk asset at (0, -ROAD_SURF, 15) (author its carriageway
   0.02 above its base like alley_road_chunk), the side dressing on BOTH sides outside |x| >= 3.05 with >= 14
   props per side, the overhead/enclosure elements, and return `H.finish(ctx, B, litterCount)`. Six variants
   (variant.id `T0..T5` or `R0..R5`, odd ones carry one distinctive feature) so the run never repeats exactly.
   Nothing you place may intersect the lanes (|x| < 3) below 2.4 m except the obstacles, which the game places
   itself from your ZONE.obstacles lists.
3. `NOTES.md`: asset list with sizes/tris, what the six variants differ in, known weaknesses.
Budget: the whole chunk under 120k triangles before the coarse bake; each asset <= 6k.
Laptop on battery: verify only, no servers, do not run the game.
Final message: directory, asset table (name, tris, size), 5-line honest self-assessment versus the board.
