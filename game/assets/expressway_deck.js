// expressway_deck — arm C: a different reading of the reference.
// The reference shows a grimy urban viaduct: a ribbed box girder seen from below,
// twin-column piers with a crossbeam, and sound walls that are mixed - white
// translucent panels above, corrugated tin and boarded patches below, one panel
// gone. This arm builds that: the deck is webs + flanges + instanced ribs, the
// piers are paired columns, and the walls are a per-bay mix of glass, tin and gap.
// Base y = 0 is the pier feet; deck underside 5.2, running surface 6.0, upstand
// top 7.0, panel top 10.0. Place at y = 0. Clear road 6.0 m (slab 6.6 m overall).
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  // ROUND 3 — see alley_road_chunk.js. These 'ground' colours are a TINT ON THE ASPHALT MAP
  // (chunks.js bakes them into a vertex attribute against a white shared material), and the map is
  // now a real albedo rather than an already-lit night photo, so the near-black road colour that
  // used to live here multiplied the deck down to an albedo of 1.3e-4. Light tints, carrying only
  // the patch variation; 0x6e7072 x the map puts the deck at 0.016 linear, neutral in every
  // channel (see alley_road_chunk.js for why the tint itself is a hair cool).
  // The expressway deck and the ramps are the OUTDOOR, exposed road: no awnings, no signs
  // overhead, one sodium lamp every 15 m. At the alley's roughness (0.18) that lamp returned a
  // single hard mirror streak down the deck, thin enough to alias — measured on the round-3
  // frames it was 92 % of the road band's entire Laplacian energy in the two expressway frames
  // (1213 and 1216 against the reference's 70-311, while the alley frames sat at 130-450). At
  // 0.45 the same lamp gives a broad wet sheen instead of a mirror. All three ground materials
  // move together so they stay in ONE roughness bucket and chunks.js still merges them to one
  // draw; the alley keeps its 0.18, because its wet sheen is the one thing round 2 got credit for.
  // The deck's and the ramps' albedo is a little lower than the alley's (0.016 against 0.019):
  // this is the exposed, outdoor road, lit from 8 m by a 220-candela sodium lamp with nothing
  // between, and at the alley value a lamp put the deck's near-field p75 at 102 against the
  // reference's 28-31 and it read as pale beige concrete rather than asphalt. The deck and the
  // two ramps share one value on purpose — they are a continuous surface and a step between them
  // would show at the join as a tonal edge with no cause.
  const ROAD  = mat(0x6e7072, 'ground', 0.45);
  const PATCH = mat(0x67696b, 'ground', 0.45);
  const LANE  = mat(0x7d7f82, 'ground', 0.45);
  const CONC  = mat(0x8a8378, 'stone', 0.85);
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);
  const CONC3 = mat(0x6f6a62, 'stone', 0.88);
  const STAIN = mat(0x37201b, 'stone', 0.92);
  const BLACK = mat(0x110f12, 'stone', 0.95);
  const STEEL = mat(0x5b6167, 'metal', 0.70, 0.3);
  const TIN   = mat(0x8b6141, 'metal', 0.85, 0.3);
  const TIN2  = mat(0x37201b, 'metal', 0.90, 0.2);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.35, transparent: true, opacity: 0.9, forceSinglePass: true });
  GLASS.name = 'metal';
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const instance = (geo, material, list) => {
    const im = new THREE.InstancedMesh(geo, material, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((t, i) => { const r = t.r || [0, 0, 0], s = t.s || [1, 1, 1]; e.set(r[0], r[1], r[2]); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(t.p[0], t.p[1], t.p[2]), q, new THREE.Vector3(s[0], s[1], s[2])); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true; g.add(im); return im;
  };

  const D0 = 5.2, TOP = 6.0;
  // --- box girder: top flange, two webs, bottom flange, ribs ---------------------
  B(6.6, 0.25, 30, CONC3, 0, TOP - 0.145, 0);                    // top flange (deck plate)
  B(6.0, 0.02, 30, ROAD, 0, TOP - 0.01, 0);                      // wearing course
  for (const sx of [-1, 1]) B(0.3, 0.55, 30, CONC2, sx * 2.0, D0 + 0.275, 0);   // webs
  B(4.3, 0.15, 30, CONC2, 0, D0 + 0.075, 0);                     // bottom flange
  for (const sx of [-1, 1]) B(0.6, 0.35, 30, CONC2, sx * 3.0, TOP - 0.45, 0);   // edge cantilever fascia
  const ribs = []; for (let i = 0; i < 15; i++) ribs.push({ p: [0, TOP - 0.45, -14 + i * 2] });
  instance(new THREE.BoxGeometry(3.7, 0.35, 0.16), CONC2, ribs);                  // transverse ribs between the webs
  B(6.6, 0.04, 30, BLACK, 0, D0 + 0.53, 0);                      // shadow line under the cantilever... (drip)
  for (let i = 0; i < 6; i++) B(1.2 + hash(i, 1) * 1.6, 0.003, 2 + hash(i, 2) * 4, PATCH, -2 + hash(i, 3) * 4, TOP + 0.0015, -12 + hash(i, 4) * 24);
  for (const x of [-1, 1]) for (let i = 0; i < 6; i++) B(0.12, 0.003, 2.4, LANE, x, TOP + 0.002, -12.5 + i * 5);

  // --- upstands with a coping and a cable tray on the outside --------------------
  for (const sx of [-1, 1]) {
    B(0.3, 1.0, 30, CONC, sx * 3.15, TOP + 0.5, 0);
    B(0.36, 0.08, 30, CONC3, sx * 3.15, TOP + 1.0, 0);
    B(0.32, 0.05, 30, BLACK, sx * 3.15, TOP + 0.025, 0);
    B(0.16, 0.12, 30, STEEL, sx * 3.42, TOP - 0.1, 0);              // cable tray
    for (let i = 0; i < 6; i++) B(0.012, 0.35 + hash(i, sx) * 0.5, 0.10, STAIN, sx * 2.995, TOP + 0.45, -13 + hash(i, sx * 3) * 26);
    for (let i = 0; i < 4; i++) B(0.012, 0.3 + hash(i, sx * 9) * 0.3, 0.18, STAIN, sx * 3.306, TOP - 0.45, -13 + hash(i, sx * 5) * 26);
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), RUST);
      s.rotation.z = Math.PI / 2; s.position.set(sx * 3.3, TOP - 0.35, -10 + i * 10); g.add(s);
    }
  }

  // --- sound wall: a per-bay mix ------------------------------------------------
  // bay kinds: 0 glass, 1 glass with a tin lower third, 2 tin, 3 missing (frame only)
  const kinds = [[0, 1, 0, 0, 2, 0], [1, 0, 3, 0, 0, 1]];
  for (const sx of [-1, 1]) {
    const x = sx * 3.15;
    for (let i = 0; i < 6; i++) B(0.12, 3.0, 0.12, STEEL, x, TOP + 2.5, -15 + i * 5);   // 6 posts, z -15..10: the next chunk supplies the one at +15
    B(0.14, 0.08, 30, STEEL, x, TOP + 4.0, 0);
    B(0.14, 0.06, 30, RUST, x, TOP + 1.07, 0);
    for (let i = 0; i < 6; i++) {
      const z = -12.5 + i * 5, k = kinds[sx === 1 ? 1 : 0][i];
      if (k === 0) { B(0.03, 2.8, 4.84, GLASS, x, TOP + 2.5, z); B(0.04, 0.05, 4.84, STEEL, x, TOP + 2.5, z); }
      else if (k === 1) { B(0.03, 1.8, 4.84, GLASS, x, TOP + 3.0, z); B(0.05, 1.0, 4.84, TIN, x, TOP + 1.6, z); for (let s = 0; s < 6; s++) B(0.06, 1.0, 0.04, TIN2, x, TOP + 1.6, z - 2.0 + s * 0.8); }
      else if (k === 2) { B(0.05, 2.8, 4.84, TIN, x, TOP + 2.5, z); for (let s = 0; s < 7; s++) B(0.06, 2.8, 0.04, TIN2, x, TOP + 2.5, z - 2.1 + s * 0.7); B(0.06, 0.6, 1.6, RUST, x, TOP + 1.5, z + 0.8); }
      else { B(0.04, 0.05, 4.84, STEEL, x, TOP + 2.5, z); B(0.03, 0.4, 1.2, GLASS, x, TOP + 3.8, z - 1.8); }   // missing panel: a shard hangs in the corner
    }
  }

  // --- twin-column piers with a crossbeam ---------------------------------------
  for (const z of [-10, 0, 10]) {
    B(6.0, 0.6, 1.0, CONC2, 0, D0 - 0.3, z);                          // crossbeam
    for (const sx of [-1, 1]) {
      B(0.9, 4.6, 0.9, CONC2, sx * 2.0, 2.3, z);
      B(0.94, 0.08, 0.94, BLACK, sx * 2.0, 0.04, z);
      B(0.91, 0.9, 0.3, STAIN, sx * 2.0, 4.0, z + 0.32);
    }
    B(3.2, 0.4, 0.5, CONC3, 0, 2.6, z);                               // tie beam between the columns
    B(0.4, 0.6, 0.4, RUST, 2.55, 3.4, z);                             // a rusted sign box on one column
  }
  g.userData.chunk = 'expressway';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mt) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mt)); };
    if (n.isInstancedMesh) { for (let k = 0; k < n.count; k++) { n.getMatrixAt(k, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
