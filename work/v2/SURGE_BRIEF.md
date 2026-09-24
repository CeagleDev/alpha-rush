# Brief: the Alpha Surge pickup asset

One 404-recipe asset module (read ../404-game-recipe/docs/asset-contract.md and the four existing
game/assets/pickup_*.js for the house style): `pickup_surge.js` + `pickup_surge.expect.json`.
A floating emblem 0.6 m tall: a bold lower-case Greek alpha "α" built from a thick extruded Shape with a
bevelled edge (stroke ~0.11 m, chunky, readable from both faces), in polished gold (material name 'gold',
metalness 0.85, roughness 0.3), pierced diagonally by a lightning bolt built from a bevelled extruded Shape
in cyan enamel 0x22e8ff with emissive 0x22e8ff at 0.6 on the bolt only, both sitting on a thin dark ring
(torus 0.32 m radius, 0.03 m tube, 0x1a1e2a metal) so it reads as a badge. Base at y = 0, centred, front +Z,
reads from every angle (mirror the alpha on the back face so it is not reversed). <= 3,000 triangles.
Deliver into work/v2/pickups_surge/ (create it), verify with
`node ../404-game-recipe/harness/verify.mjs work/v2/pickups_surge --size=480` until clean, LOOK at the render
with Read and iterate twice. Laptop on battery; nothing else heavy.
