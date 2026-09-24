# Hero module API (outfits + colourways) — the contract every hero asset and the UI share

A hero module `game/assets/hero_<id>.js` exports THREE things:

```js
export const OUTFITS = [                      // exactly 3 per hero, first = the reference outfit
  { id: 'ronin', name: 'The Last Ronin', desc: 'one line, in the game's voice',
    palettes: [                                // exactly 4 per outfit, first = the reference colours
      { id: 'indigo', name: 'Indigo Dusk', swatch: ['#2b3a5a', '#b33a2a', '#e8dcc0'] },   // 3 hex: primary, secondary, accent, for the UI chips
      ...
    ] },
  ...
];
export function build(THREE, { outfit, palette } = {}) { /* returns the Group with userData.joints */ }
export default function (THREE) { return build(THREE, { outfit: OUTFITS[0].id, palette: OUTFITS[0].palettes[0].id }); }
```

Rules:
- `build` must accept unknown/undefined ids and fall back to the first outfit / first palette.
- A palette changes ONLY material colours (the same geometry); an outfit changes geometry (different garments,
  headwear, accessories) and has its own 4 palettes. Skin, eyes, hair stay as authored (hair may take the accent
  in ONE palette if it suits the design).
- Same joint contract as before (hips, spine, chest, neck, head, l/r_shoulder, l/r_elbow, l/r_hip, l/r_knee,
  l/r_ankle; limbs hang down local -Y; jointHints copied), 1.56 m, base y = 0, front +Z, the vertex-measured
  recentring block. No imports, textures, vertexColors. Emissive only on lights the design has (<= 0.8).
- The loader calls `build` through a wrapper with a chamfer-capable THREE; nothing else changes.
- Triangle budget per OUTFIT: <= 26,000; meshes before merge <= 160. The game merges per joint.

The game reads the choice from `state.character`, `state.outfit`, `state.palette` (home.js writes them; progress.js
persists them per character as `save.wardrobe[charId] = {outfit, palette}`), and calls
`ctx.assets.get('hero_<id>', { keepHierarchy: true, variant: { outfit, palette } })`.
