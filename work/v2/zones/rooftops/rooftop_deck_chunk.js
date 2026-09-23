// rooftop_deck_chunk — the rooftops zone's 30 m ground chunk, built from the approved board
// (refs/alpha/env_rooftops.png): a continuous flat tar-and-gravel roof 6 m wide with a worn dashed
// line, 1.5 m x 0.9 m parapet ledges each side (props stand on their tops), and the building it sits
// on: 6 m of stained concrete wall with lit apartment windows, AC boxes and downpipes going down to
// street level on both outer faces. Beyond a 2.5 m alley gap each side stand three neighbouring
// blocks per side at different heights (some below the roof, one above it) with windows facing the
// road, so the roof reads as one of a cluster rather than a slab in space; the far skyline is the
// game's job.
//
// ORIGIN. The asset contract and the verifier want the lowest point at y = 0, so this is authored
// base-at-street: the street plane is y = 0, the ROOF SURFACE IS AT LOCAL 6.02 (base 6.00), the
// ledge tops at 6.92. zone.js places it at y = -(DECK_Y + ROAD_SURF) = -6.02 so the surface lands on
// the chunk's y = 0 plane exactly like the expressway deck (placed at -DECK_Y). Neighbour tops, base
// space, +x side: z -15..-5 → 4.6, -5..5 → 7.6, 5..15 → 3.8; -x side: 7.2, 4.2, 5.0 (the table is
// repeated in zone.js as NEIGHBOUR). mounts front/back: the z ends butt against the next chunk.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, o = {}) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0, ...o }); s.name = name; return s; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z, ry) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (ry) o.rotation.y = ry; g.add(o); return o; };
  const C = (rt, rb, h, seg, m, x, y, z, rx, rz) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); if (rx || rz) o.rotation.set(rx || 0, 0, rz || 0); g.add(o); return o; };

  // roof: a TINT ON THE ASPHALT MAP (see alley_road_chunk.js) — tar and gravel, wet, a hair cool
  const TAR    = mat(0x74767a, 'ground', 0.30);
  const TAR2   = mat(0x67696d, 'ground', 0.30);      // older patches
  const TAR3   = mat(0x7e8084, 'ground', 0.30);      // fresh repair, gravel scattered
  const GRAVEL = mat(0x8a8a86, 'ground', 0.55);      // dry gravel margin along the ledge feet
  const PUDDLE = mat(0x636567, 'ground', 0.05);
  const LINE   = mat(0x8d8f92, 'ground', 0.35);      // worn dashed line (the board has one)
  const SEAM   = mat(0x3a3a3c, 'ground', 0.30);
  const CONC   = mat(0x9a958a, 'plaster', 0.90);     // rendered concrete, off-white gone grey
  const CONC2  = mat(0x847f75, 'plaster', 0.90);
  const CONC3  = mat(0x6f6a62, 'stone', 0.88);       // coping, parapet
  const STAIN  = mat(0x4a4a4c, 'plaster', 0.92);
  const GRIME  = mat(0x37201b, 'plaster', 0.92);
  const BLACK  = mat(0x110f12, 'stone', 0.95);
  const STREET = mat(0x2a2a2e, 'ground', 0.30);
  const STEEL  = mat(0x5b6167, 'metal', 0.70, 0.3);
  const RUST   = mat(0x6e4128, 'metal', 0.90, 0.2);
  const RUSTD  = mat(0x37201b, 'metal', 0.95, 0.2);
  const GALV   = mat(0x8a8f8f, 'metal', 0.72, 0.3);
  const FRAME  = mat(0x4a4a4c, 'metal', 0.75, 0.3);
  const GLASS  = mat(0x1d3150, 'metal', 0.35, 0.2);  // an unlit window: dusk sky in the pane
  // lit panes. NOT the lightbox creams (chunks.js swaps those emissives for sign sprites): a warm
  // tungsten and the palette's fluorescent white, over near-black so surfaces.js leaves them alone.
  const WARM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe3c58c), emissiveIntensity: 1.6, roughness: 0.35 });
  const WARM2 = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xc9a06a), emissiveIntensity: 1.2, roughness: 0.35 });
  const COOL = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x9accf2), emissiveIntensity: 1.5, roughness: 0.35 });
  const LIGHTS = [];

  const TOP = 6.0, SURF = TOP + 0.02;
  // --- the street far below, the building, its outer faces ------------------------------
  B(21.2, 0.06, 30, STREET, 0, 0.03, 0);
  B(9.0, TOP, 30, CONC, 0, TOP / 2, 0);
  for (const sx of [-1, 1]) {
    B(0.04, 0.10, 30, BLACK, sx * 4.51, 0.05, 0);                            // grounding band
    B(0.03, 0.35, 30, STAIN, sx * 4.51, 0.5, 0);                             // splash-back grime
    B(0.03, 0.12, 30, STAIN, sx * 4.51, 3.0, 0);                             // floor line
    B(0.06, 0.25, 30.0, CONC3, sx * 4.53, TOP - 0.12, 0);                    // eaves band
  }
  // --- roof surface: tar, patches, seams, puddles, gravel margins, the worn dashed line ---
  B(9.0, 0.02, 30, TAR, 0, TOP + 0.01, 0);
  for (let i = 0; i < 7; i++) B(1.0 + hash(i, 1) * 1.8, 0.004, 1.5 + hash(i, 2) * 3.5, i % 3 ? TAR2 : TAR3, -2.3 + hash(i, 3) * 4.6, SURF + 0.002, -13 + hash(i, 4) * 26, (hash(i, 5) - 0.5) * 0.3);
  for (let i = 0; i < 5; i++) B(0.03, 0.003, 4 + hash(i, 6) * 4, SEAM, -2.4 + hash(i, 7) * 4.8, SURF + 0.0015, -12 + hash(i, 8) * 24, (hash(i, 9) - 0.5) * 0.4);
  for (const [x, z, w, d] of [[-1.4, -6, 1.6, 1.1], [1.1, 4, 1.2, 2.2], [-0.4, 11.5, 2.0, 1.0]]) B(w, 0.003, d, PUDDLE, x, SURF + 0.002, z, 0.3);
  for (let i = 0; i < 12; i++) B(0.11, 0.003, 1.4, LINE, 0.02 * (hash(i, 12) - 0.5), SURF + 0.0025, -13.75 + i * 2.5);
  for (const sx of [-1, 1]) { B(0.45, 0.012, 30, GRAVEL, sx * 2.78, SURF + 0.005, 0); B(0.6, 0.006, 30, TAR2, sx * 3.3, SURF + 0.003, 0); }
  // --- parapet ledges 1.5 x 0.9 with a coping, seams, grounding band, stain runs -----------
  for (const sx of [-1, 1]) {
    const x = sx * 3.75;
    B(1.5, 0.9, 30, CONC2, x, TOP + 0.45, 0);
    B(1.58, 0.06, 30, CONC3, x, TOP + 0.93, 0);                               // coping
    B(0.03, 0.06, 30, BLACK, sx * 3.0 - sx * 0.015, TOP + 0.05, 0);         // grounding band, inner face
    for (let k = 0; k < 6; k++) B(1.52, 0.9, 0.025, SEAM, x, TOP + 0.45, -12.5 + k * 5);   // panel joints
    for (let i = 0; i < 5; i++) B(0.012, 0.35 + hash(i, sx) * 0.4, 0.08 + hash(i, 13) * 0.2, STAIN, sx * 2.99, TOP + 0.45 + hash(i, 14) * 0.2, -13 + hash(i, sx * 7) * 26);
    for (let i = 0; i < 3; i++) B(0.4 + hash(i, 15) * 0.6, 0.008, 0.6 + hash(i, 16), GRIME, x + (hash(i, 17) - 0.5) * 0.6, TOP + 0.965, -12 + hash(i, 18) * 24);   // muck on the coping
    B(1.5, 0.08, 0.5, RUST, x, TOP + 0.94 + 0.04, 7.3);                      // an old rusted plate left on the ledge
    // conduit along the ledge top with saddle clips, and two roof drains at the ledge foot
    C(0.035, 0.035, 30, 6, GALV, sx * 3.35, TOP + 0.96 + 0.035, 0, Math.PI / 2, 0);
    for (let k = 0; k < 4; k++) B(0.10, 0.05, 0.05, RUSTD, sx * 3.35, TOP + 0.96 + 0.02, -12 + k * 8);
    for (const z of [-8.5, 10.5]) { B(0.32, 0.012, 0.32, STEEL, sx * 2.8, SURF + 0.006, z); for (let k = 0; k < 6; k++) B(0.26, 0.006, 0.02, BLACK, sx * 2.8, SURF + 0.013, z - 0.12 + k * 0.05); B(0.5, 0.004, 0.7, PUDDLE, sx * 2.6, SURF + 0.003, z + 0.2); }
  }
  // --- windows on the building's outer faces (two storeys), AC boxes, balconies, downpipes ----
  const WIN = (x, y, z, facing, lit, w = 1.1, h = 1.2, sill = true) => {
    // facing: +1 the pane looks toward +x, -1 toward -x; the frame is 3 cm proud, the pane 5 cm
    B(0.06, h + 0.12, w + 0.12, FRAME, x + facing * 0.03, y, z);
    B(0.02, h, w, lit, x + facing * 0.06, y, z);
    if (sill) B(0.03, 0.05, w + 0.12, CONC3, x + facing * 0.04, y - h / 2 - 0.09, z);   // sill (the near faces only: budget)
    if (lit === WARM || lit === COOL) LIGHTS.push({ x: x + facing * 0.5, y, z, color: lit === COOL ? 0x9accf2 : 0xe3c58c, intensity: 0.35, range: 4.0, _face: true });
  };
  const litOf = (i, j) => { const r = hash(i, j); return r < 0.42 ? WARM : r < 0.55 ? WARM2 : r < 0.66 ? COOL : GLASS; };
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 12; k++) {
      const z = -13.75 + k * 2.5;
      WIN(sx * 4.5, 1.7, z, sx, litOf(k, sx * 3));
      WIN(sx * 4.5, 4.5, z, sx, litOf(k, sx * 5));
      if (hash(k, sx * 11) < 0.35) {                                           // an outdoor AC box under the window
        B(0.32, 0.55, 0.75, GALV, sx * 4.68, 3.35, z + 0.2); B(0.02, 0.45, 0.62, FRAME, sx * 4.85, 3.35, z + 0.2);
      }
      if (hash(k, sx * 13) < 0.3) {                                            // a small balcony on the upper floor
        B(0.7, 0.10, 1.9, CONC3, sx * 4.85, 3.9, z);
        B(0.03, 0.9, 1.9, FRAME, sx * 5.2, 4.4, z); B(0.7, 0.03, 0.03, FRAME, sx * 4.85, 4.85, z - 0.95); B(0.7, 0.03, 0.03, FRAME, sx * 4.85, 4.85, z + 0.95);
      }
    }
    for (const z of [-9.4, 6.2]) { C(0.05, 0.05, TOP - 0.1, 6, sx < 0 ? RUST : GALV, sx * 4.58, TOP / 2, z); B(0.10, 0.05, 0.14, RUST, sx * 4.56, 2.9, z); B(0.10, 0.05, 0.14, RUST, sx * 4.56, 5.6, z); }
    for (let i = 0; i < 4; i++) B(0.012, 1.2 + hash(i, sx * 17) * 2.0, 0.08, STAIN, sx * 4.505, TOP - 0.9 - hash(i, 19), -12 + hash(i, sx * 23) * 24);
  }
  // --- neighbouring blocks across the alley gap, three per side, windows facing the road ------
  const NB = { 1: [[-15, -5, 4.6], [-5, 5, 7.6], [5, 15, 3.8]], '-1': [[-15, -5, 7.2], [-5, 5, 4.2], [5, 15, 5.0]] };
  for (const sx of [-1, 1]) {
    const blocks = NB[sx];
    blocks.forEach(([z0, z1, top], bi) => {
      const zc = (z0 + z1) / 2, len = z1 - z0 - 0.3, xf = sx * 7.0;          // 0.3 m slots between buildings
      const wall = bi === 1 ? CONC2 : CONC;
      B(3.0, top, len, wall, sx * 8.5, top / 2, zc);
      B(0.04, 0.12, len, BLACK, sx * 6.99, 0.06, zc);                          // grounding band
      B(0.2, 0.3, len, CONC3, sx * 7.1, top + 0.15, zc);                       // parapet lip on the road edge
      B(3.0, 0.3, 0.2, CONC3, sx * 8.5, top + 0.15, z0 + 0.25); B(3.0, 0.3, 0.2, CONC3, sx * 8.5, top + 0.15, z1 - 0.25);
      B(2.8, 0.01, len - 0.4, TAR2, sx * 8.5, top + 0.005, zc);                // its own tar roof
      for (let r = 0, y = 1.6; y + 0.8 < top; r++, y += 2.9) {
        for (let k = 0; k < 4; k++) {
          const z = z0 + 1.25 + k * 2.5;
          WIN(xf, y, z, -sx, litOf(k + bi * 4, sx * (31 + r)), 1.0, 1.1, false);
          if (r === 0 && hash(k, bi + sx * 41) < 0.3) { B(0.3, 0.5, 0.7, GALV, xf - sx * 0.16, y - 1.0, z); B(0.34, 0.04, 0.74, RUST, xf - sx * 0.17, y - 1.27, z); }
        }
      }
      for (let i = 0; i < 3; i++) B(0.012, 0.8 + hash(i, bi * 7 + sx) * 1.6, 0.1, STAIN, xf - sx * 0.006, top - 1.0 - hash(i, 9) * 0.5, z0 + 1 + hash(i, bi * 3) * (len - 2));
      C(0.05, 0.05, top - 0.1, 6, RUST, xf - sx * 0.08, top / 2, z1 - 0.9);   // downpipe at the corner
      B(0.03, top, 0.06, STAIN, xf - sx * 0.005, top / 2, z1 - 0.9 - sx * 0.1);
    });
  }
  // practical entries: a few of the lit windows nearest the road, at the roof's height band — the
  // pool is small, so most panes are emissive only. Two per side on the tall neighbour, one per side
  // on the ledge-side upper storey.
  const picked = LIGHTS.filter((l) => Math.abs(l.x) > 6.5 && l.y > 5.5).slice(0, 2).concat(LIGHTS.filter((l) => Math.abs(l.x) > 6.5 && l.y > 5.5).filter((l) => l.x < 0).slice(0, 2));
  const lights = picked.map((l) => ({ x: l.x, y: l.y, z: l.z, color: l.color, intensity: 0.6, range: 6.0 }));

  g.userData.chunk = 'rooftops';
  g.userData.mounts = ['front', 'back'];
  // --- place (the six lines) ------------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
