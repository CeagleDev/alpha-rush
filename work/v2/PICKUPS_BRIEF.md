# Brief: four power-up pickup assets (midnight-dash)

The game is adding Subway-Surfers style power-ups. You build the four pickup models as 404-recipe
asset modules. Read first: `../404-game-recipe/docs/asset-contract.md`, `STYLE.md`, and look at
`game/assets/tau_coin.js` for house style. Geometry must be CODE (jam rule): no textures, no files.

Each pickup floats and spins about Y at hip height in a lane, is seen from ~6-25 m away on a phone at
night and in daylight, so it needs a BOLD, instantly readable silhouette about 0.55-0.65 m tall,
chunky forms, rounded/bevelled edges, 2-3 colours. It must read from every angle (it spins).
No emissive (the game adds its own glow ring). Smooth shading, bevels, <= 2,500 triangles each.

1. `pickup_magnet.js` - classic horseshoe magnet, red body (0xb3261e) with bare steel tips (metal
   0xb9bec4, metalness 0.8, roughness 0.3), standing upright with the tips UP, thick tube section
   (~0.09 m radius), 0.55 m tall. Half-torus + two straight legs + tip caps, with a thin darker band
   where the paint ends.
2. `pickup_omamori.js` - a Japanese omamori protective charm (this is the one-hit SHIELD):
   a flat padded brocade pouch, 0.34 m wide x 0.50 m tall x 0.07 m thick with clipped top corners,
   deep red 0x9e2a2b with a gold border stitch and a gold centre panel (0xc9a227, metal, roughness 0.35),
   a white cord tied in a bow knot at the top with two loops and a hanging loop above. Both faces detailed.
3. `pickup_x2.js` - a score-multiplier token: a thick gold disc (0.5 m diameter, 0.07 m thick, bevelled
   rim, material name 'gold' exactly as tau_coin.js does it so the game can apply its gold texture)
   carrying a raised bold "x2" built from extruded Shapes on BOTH faces (readable, mirrored correctly
   on the back face so it reads x2 from both sides), in deep blue enamel 0x1d406f.
4. `pickup_sneakers.js` - super sneakers (high jump): ONE chunky high-top trainer, 0.5 m long,
   toe pointing +Z, tilted heel-down 15 degrees, bright teal 0x1f9e8f upper, white thick midsole
   0xe6ddd0, dark outsole, white toe cap, two small white wings at the heel (3 feather shapes each side).

Contract for all: metres, base at y = 0, centred x/z, front +Z, MeshStandardMaterial, material names
only from plaster|stone|timber|tile|metal|fabric|foliage|ground (exception: 'gold' on the x2 disc as
tau_coin.js does), end with the vertex-measured recentring block, plus an `<name>.expect.json`
`{ "width":..,"height":..,"depth":..,"tolerance":0.25 }`.

Deliver into `work/v2/pickups/` (create it; write nowhere else). Run
`node ../404-game-recipe/harness/verify.mjs work/v2/pickups --size=480` from the midnight-dash root
until all four are clean, LOOK at each `_verify/<name>.png` with the Read tool and iterate on what
you see (two look-and-fix passes minimum). If the verifier flags a legitimately flat side, fix the
model rather than declaring mounts - these spin. Laptop is on battery: nothing else heavy.
Final message: per asset, triangle count, size, and a one-line honest self-assessment.
