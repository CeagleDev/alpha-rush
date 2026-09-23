# Brief: a playable hero for Alpha Rush (one of three)

You build ONE hero character asset from an APPROVED Atlas reference image (the owner signed it off; match it).
The current runner `game/assets/runner.js` (candidate C in work/v2/runner/c) is the technical model to copy:
same joint contract, same construction style (deformed primitives, organic cloth volumes, NO boxes), same
recentring block. Read it first, then `../404-game-recipe/docs/asset-contract.md`, then `work/v2/RUNNER_BRIEF.md`
(sections "Hard contract", "Proportions", "Realism" all still apply; height 1.56 m; <= 16,000 triangles,
<= 110 meshes before merge because these costumes carry more parts).

The reference is a design SPEC: costume pieces, colour blocking, silhouette, hair, accessories - match them.
Use the Read tool on the reference image at the start and again before each look-and-fix pass. The hero is
seen mostly FROM BEHIND and slightly above by a chase camera, at night under warm lamps and by day in sun:
spend the detail on the back, shoulders, head, and legs. No emissive except where the design has a light (the
oni's cyan lines / boot vents may be emissive 0.8 max on a near-black base). Materials named from
plaster|stone|timber|tile|metal|fabric|foliage|ground (skin unnamed). No vertexColors, no textures, no imports.

Colours: real garment albedos in the street's range (this game's lamps are strong): keep the brightest cloth
around 0xb8571f-level luminance; whites as 0xbdb8ad; blacks 0x1a1819-0x26272b. Hue must match the reference.

Loose parts that must NOT break the animation: anything hanging (cape, tail, ponytail, talismans, cords) is
parented to the nearest joint (chest for a cape/ponytail, hips for a tail/belt cords) so it moves with the body,
and must not intersect the legs in the mid-stride pose.

Deliver into your directory: `<name>.js`, `<name>.expect.json` ({width, height:1.56, depth, tolerance:0.25}),
`posed/<name>.js` (the mid-stride pose from RUNNER_BRIEF step 3), `NOTES.md`. Verify with
`node ../404-game-recipe/harness/verify.mjs <your dir> --size=560` from the midnight-dash root until clean;
LOOK at `_verify/<name>.png` and the posed render and iterate by eye at least four times against the reference.
Laptop on battery: nothing else heavy, no servers, do not run the game.
Final message: path, triangle count, and a 5-line honest self-assessment versus the reference.
