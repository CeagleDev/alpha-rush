# midnight-dash — the locked style

> Chunky stylised low-poly night-city props with softly rounded edges and clean flat colours, a
> rain-washed Tokyo/Seoul back street rendered in deep blue-black concrete lit by warm sodium
> lamps and cool magenta-cyan neon, finished matte with wet glossy accents, and no printed text in
> any geometry — signage in geometry is lit shape and silhouette only.

Every generating agent gets this file whole. Reuse the sentence verbatim. Do not restate the
material list from memory.

## Palette (exact hex, and where each belongs)

| role | hex | where it belongs |
|---|---|---|
| night base | `0x0b0f1e` | asphalt, sky zenith, the dark skirt band at the base of every object |
| wet concrete shadow | `0x1a2238` | building masses in shade, underpasses, tunnel walls |
| facade mid | `0x2f3a55` | building facades, shutters, highway pier faces |
| cool concrete | `0x8a94a6` | highway deck, jersey dividers, kerbs, guard-rail posts |
| near-white | `0xf2f4f7` | lane markings, headlights, sign faces (unlit), rail tops |
| magenta neon | `0xff2d95` | primary signage glow, shop-front tubes, hero accent stripe |
| cyan neon | `0x00e5ff` | secondary signage, highway lamp heads, vending machine glow |
| sodium warm | `0xffb347` | street lamps, shop interiors seen through glass, lanterns |
| coin gold | `0xffd23f` | coins, hazard chevrons, taxi roof light |
| danger red | `0xff4b3e` | taxi bodies, road-works barriers, brake lights, warning strips |
| mint neon | `0x2bd97b` | pharmacy crosses, exit lamps, a few sign accents |
| violet under-glow | `0x7c4dff` | highway underside, pier bases, distant skyline windows |
| dark timber | `0x3b2a22` | izakaya fronts, awning frames, crate stacks, bench slats |
| hero orange | `0xff8a00` | the runner's jacket only — nothing else in the world is this colour |

Standing rule (critic checks it every round): **two colour temperatures in every frame** — warm
sodium `0xffb347` against cool neon `0x00e5ff`/`0xff2d95`. A frame with one temperature fails.

## Fixed decisions
- Metres. Lane width **2.0 m**, three lanes = 6.0 m road. Track chunk **30 m** long.
- Runner **1.70 m** tall, stylised: big head, short legs, chunky hands. Pursuer (guard) 1.85 m, dog 0.6 m.
- Coin **0.6 m** diameter, 0.08 m thick, hovers at 1.0 m; rings/stacks spaced 1.5 m along a lane.
- Low barrier (jump over) **1.0 m** tall, 1.8 m wide. High barrier (slide under) **2.2 m** tall with **1.3 m** clearance beneath.
- Taxi 4.4 × 1.7 × 1.5 m. Delivery van 5.2 × 2.0 × 2.3 m. Scooter 1.9 × 0.7 × 1.1 m.
- Street lamp 6.0 m. Vending machine 1.0 × 0.8 × 1.83 m. Shop-front storey unit 6.0 w × 4.0 h × 3.0 d. Building facade block 8.0 w × 13.0 h × 6.0 d (four storeys).
- Highway: guard-rail section 4.0 m, overhead gantry 8.0 m span at 5.5 m, concrete divider 3.0 × 1.0 h, pylon 12.0 m, deck slab 30 × 6 × 0.8 m.
- Base at y = 0, centred on x and z, front faces +Z. Runner and vehicles face +Z (the direction of travel).
- Flat colours with sensible roughness; surfaces are applied at load time by surfaces.js.
- Material names from the contract's list only: `plaster` | `stone` | `timber` | `tile` | `metal` | `fabric` | `foliage` | `ground`.
- Emissive parts (neon tubes, lamp heads, screens, tail-lights): base `color: 0x0b0f1e` (near-black — surfaces.js leaves anything under 0.16 luminance untextured, and this is the only way to opt out), `emissive: <palette hex>`, `emissiveIntensity` 2.0–3.5, roughness 0.3. Do NOT name them; there is no 'glass' recipe.
- Glass: `transparent: true, opacity: 0.9, forceSinglePass: true` — surfaces.js skips it, and the flag stops the double draw. Use sparingly: every transparent material costs a second pass.
- Wet-gloss accents: roughness **0.25** on wet asphalt patches, taxi paint, rail tops, puddle planes. Everything else roughness 0.7–0.9.
- No glyphs in geometry. Signage in geometry = tube shapes, boxes, discs, chevrons. Legible-looking signage comes ONLY from Atlas sprite textures on emissive planes (declared files), using invented shop names and abstract katakana/hangul-like strokes — never real words, brands or logos.

## Three signatures every object over 0.6 m carries
1. **Rounded edges**: the loader's chamfer proxy rounds every box edge ≥ 25 cm by 1.5 cm; assets do not need to do this themselves, but must not fight it (no razor-thin boxes as trim — use ≥ 3 cm).
2. **One lit or wet accent**: at least one part that is emissive (neon, lamp, screen, tail-light) or wet-gloss (roughness 0.25). A prop with neither reads as cardboard at night.
3. **A grounding band**: the bottom 3–8 cm is `0x0b0f1e` (skirt, sill, tyre contact, plinth) so the object sits into the wet ground instead of standing on it.

## Triangle bands by class (verify.mjs warns outside 150–60,000; these are our budgets)
- small prop (cone, crate, sign, coin): 150 – 1,500
- street furniture (lamp, vending machine, bench, bike): 500 – 3,000
- vehicle: 2,000 – 8,000
- facade / shop-front / gantry / chunk slab: 1,000 – 6,000
- character (jointed): 3,000 – 9,000; joints named on `userData.joints`, pivots at the joint

## Reference-image prompt suffix (Atlas, every object, verbatim)
"…, a single stylised low-poly game prop with chunky proportions and softly rounded edges, clean
flat colours, night-city palette of deep blue-black, cool grey concrete, magenta and cyan neon and
warm amber, centred and filling the frame, plain white background, three-quarter view from
slightly above, soft even studio lighting, no cast shadow, no text, no logos, nothing cropped,
square 1:1."
