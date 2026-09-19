# midnight-dash — the locked style (v2, from "dog pack fin.mov")

> A dense, near-photoreal Showa-era Tokyo yokocho at blue dusk: weathered timber and corrugated-tin
> two-storey shophouses under a tangle of overhead cables, lit almost entirely by their own warm
> lightbox signs and paper lanterns, wet dark asphalt throwing amber reflections, every surface
> worn, stained and crammed with crates, bins, machines and litter — and no invented text: signage
> is lit shape in geometry, and abstract kana-like strokes only ever in sprite textures.

Every generating agent gets this file whole. Reuse the sentence verbatim. Do not restate the
material list from memory. The bar is refs/bar-video/ (20 portrait frames of the video).

## Palette (sampled from the video; exact hex, and where each belongs)

| role | hex | where it belongs |
|---|---|---|
| blackest shade | `0x110f12` | under eaves, cable silhouettes, doorway interiors, tyre contact |
| warm dark shade | `0x231718` | THE dominant colour: walls in shade, far road, undersides — shade is brown, never blue |
| dark timber / rust | `0x37201b` | posts, beams, rust runs, old tin in shade |
| mid timber | `0x4f2d21` | door frames, plank walls, crate slats, cart bodies |
| lit timber | `0x6c4028` | awning undersides, eaves, timber in lamplight |
| weathered plank / cardboard | `0x8b6141` | cardboard, faded plank, tin in lamplight, cart tops |
| lamplit surface | `0xbf7c42` | walls under a lantern, asphalt under a lightbox, lit tin |
| lightbox cream | `0xd8ae70` | lit sign faces (emissive), wet-road reflections of them |
| lightbox yellow | `0xe5b055` / `0xf1d899` | emissive sign faces, lantern glow core |
| paper white | `0xeee2c8` | paper lanterns lit, white plastic crates, menu boards |
| crate yellow | `0xf8e845` | yellow beer crates, hazard accents, one sign in ten |
| lantern red | `0xb8302a` | red lanterns (unlit body), noren, shop-front trim, tail-lights |
| dusk sky | `0x1d406f` | sky zenith band; the ONLY large cool area in frame |
| sky at horizon | `0x1d3150` | sky low, far-street haze |
| blue shade | `0x212841` | the far end of the street, distant facades |
| blue sign | `0x40559f` | one cool sign in eight, fluorescent tube housings |
| fluorescent white | `0x9accf2` | vending machine face, a rare cool lightbox |
| green sign | `0xa7e761` | one green sign in ten (pharmacy cross, bar sign) |
| hero orange | `0xe8852a` | the runner's hooded jacket only — nothing else is this colour |
| shiba fur | `0xc98a45` | dog 1; dog 2 `0xe6ddd0` white; dog 3 `0x3a2a22` dark brown |

Standing rule (critic checks it every round): **two colour temperatures in every frame** — the warm
brown shade and amber lightboxes against the blue dusk sky at the top. No blue sky visible → the
frame must carry a cool sign or fluorescent instead. Bar statistics: median luma ≈ 42, p98 ≈ 194,
1.5–2 % of pixels above luma 200 and they are sign faces and lanterns, not sky.

## Fixed decisions
- Metres. Lane width **2.0 m**, three lanes = 6.0 m road; the video's alley is ~3 m wide, so the crammed
  feel comes from **1.5 m verges piled with clutter** and shophouses standing right at the verge line.
- Chunk **30 m**. Verge clutter density: ≥ 12 props per 30 m per side. Overhead: ≥ 3 cable spans and
  ≥ 1 lantern or banner string crossing the road per chunk.
- Runner **1.72 m**, realistic proportions, slim, hooded orange jacket, dark trousers, white trainers.
  Dogs: shiba 0.55 m at the shoulder, spitz 0.50 m, brown mutt 0.60 m. The pack runs 4–7 m behind.
- Coin **0.6 m** diameter, 0.07 m thick, the Bittensor τ embossed 6 mm proud on BOTH faces, built from
  refs/logo/tao_symbol.png as an extruded Shape (geometry, never a texture), hovers at 1.0 m.
- Shophouse unit: **5.0 w × 7.0 h × 6.0 d**, two storeys, ground floor 3.2 m, tin awning at 3.0 m,
  tiled or tin roof with 0.6 m eaves, upper floor 2.8 m with a balcony rail or sliding windows.
- Lantern 0.45 m dia. Lantern string 6 × 0.35 m on a 6 m rope at 3.4 m. Noren banner 0.5 × 1.2 m,
  five on a rope at 3.2 m. Roll obstacle: a banner cluster hung to **1.3 m** clearance.
- Wall lightbox 0.9 × 0.6 × 0.15 m. Standing lightbox 0.6 × 1.5 m. Vending machine 1.0 × 0.8 × 1.83.
  Beer crate 0.5 × 0.35 × 0.3 (stacks of 2–4). Cooler box 0.6 × 0.4 × 0.4. Bin 0.6 dia × 0.9.
- Utility pole 9 m, three cross-arms, one transformer drum, six insulators. Cables sag 0.6 m over a 12 m
  span; lowest cable ≥ 4.5 m over the road.
- Kei delivery van 3.4 × 1.5 × 1.9 (block). Yatai noodle cart 2.4 × 1.2 × 2.1 (block). Sedan 4.4 × 1.7 × 1.5.
- Expressway (highway zone): deck 30 × 6 × 0.8 with 1.0 m concrete upstands and 3 m translucent sound
  panels, sodium lamps 10 m (warm `0xe5b055`), sign gantry 8 m span with green boards (lit shape), guard
  rail 4 m sections. Concrete `0x4a4a4c` in shade, `0x8a8378` in sodium light.
- Base at y = 0, centred on x and z, front faces +Z. Runner, dogs and vehicles face +Z.
- Material names from the contract's list only: `plaster` | `stone` | `timber` | `tile` | `metal` | `fabric` | `foliage` | `ground`.
  Name every material. Timber and tin dominate; `metal` for tin, poles, machines; `timber` for wood; `fabric` for
  noren, lantern paper (lit lanterns are emissive, see below); `plaster` for rendered walls; `ground` for road.
- Emissive parts (sign faces, lantern cores, fluorescents, vending faces, tail-lights): base `color: 0x110f12`
  (near-black — surfaces.js leaves anything under 0.16 luminance untextured, which is the only opt-out),
  `emissive: <palette hex>`, `emissiveIntensity` 1.8–3.0, roughness 0.35. Do NOT name them.
- Glass: `transparent: true, opacity: 0.9, forceSinglePass: true`, used sparingly (sliding windows, vending fronts).
- Wet: road and verge slabs roughness **0.18** with a `ground` name; rig practicals reflect in them. Everything
  else roughness 0.75–0.95. Metalness 0 except tin/steel 0.3.
- Atlas texture files are ALLOWED (jam rules) and used on: road asphalt (1K), tin cladding (1K), timber plank (1K),
  concrete deck (1K), lightbox sign faces (8 sprites 512 px), noren strokes (2 sprites), sky panorama (2K). Budget
  ≤ 2.5 MB of textures total, WebP. Everything else is surfaces.js procedural.

## Three signatures every object over 0.6 m carries
1. **Wear**: a rust run, a stain band, a faded panel, a dented edge or a chipped corner — as geometry or colour
   variation, at least one per object. Nothing is new.
2. **A grounding band**: the bottom 3–8 cm is `0x110f12` so it sits into the wet road, plus a `userData.lights`
   entry for anything that emits, so the level can place a real point light there.
3. **Rounded edges** via the loader's chamfer proxy (boxes ≥ 25 cm get a 1.5 cm radius); do not fight it with
   razor-thin trim (≥ 3 cm).

## Triangle bands by class
small prop 150–1,500 · furniture/machine 500–3,000 · vehicle 2,000–8,000 · shophouse unit 3,000–9,000 ·
chunk slab 500–2,000 · character (jointed, pivots at joints, `userData.joints`) 4,000–10,000 · dog 2,500–6,000.

## Reference-image prompt suffix (Atlas, every object, verbatim)
"…, a single game prop rendered in a dense near-photoreal style, weathered and worn Showa-era Tokyo
back-alley materials — aged timber, corrugated tin, faded paint, grime, a wet sheen — centred and
filling the frame, plain white background, three-quarter view from slightly above, soft even studio
lighting, no cast shadow, no legible text (abstract brush strokes only), no logos, nothing cropped,
square 1:1."
