// expressway_deck — arm A: assembled from primitives.
// A 30 m elevated deck on three full-height piers. Base y = 0 is the PIER FEET
// (street level); the deck underside is at y = 5.2, the wet asphalt running
// surface at y = 6.0, 1.0 m concrete upstands to y = 7.0 and 3 m translucent
// sound panels in steel frames to y = 10.0. Place the chunk at y = 0.
// Clear road 6.0 m between the upstands (deck slab 6.6 m overall).
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD  = mat(0x231718, 'ground', 0.18);
  const PATCH = mat(0x1d1314, 'ground', 0.18);
  const LANE  = mat(0xcfc7b4, 'ground', 0.35);
  const CONC  = mat(0x8a8378, 'stone', 0.85);     // sodium-lit concrete
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);     // concrete in shade (undersides, piers)
  const CONC3 = mat(0x6f6a62, 'stone', 0.88);
  const STAIN = mat(0x37201b, 'stone', 0.92);     // rust runs, water stains
  const BLACK = mat(0x110f12, 'stone', 0.95);     // grounding band
  const STEEL = mat(0x5b6167, 'metal', 0.70, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x8e949a, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  GLASS.name = 'metal';
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };

  const D0 = 5.2, TOP = 6.0;
  // --- deck slab ---------------------------------------------------------------
  B(6.6, 0.78, 30, CONC3, 0, D0 + 0.39, 0);                 // concrete deck body
  B(6.0, 0.02, 30, ROAD, 0, TOP - 0.01, 0);                 // wet asphalt wearing course
  for (let i = 0; i < 6; i++) B(1.2 + hash(i, 1) * 1.6, 0.003, 2 + hash(i, 2) * 4, PATCH, -2 + hash(i, 3) * 4, TOP + 0.0015, -12 + hash(i, 4) * 24);
  for (const x of [-1, 1]) for (let i = 0; i < 6; i++) B(0.12, 0.003, 2.4, LANE, x, TOP + 0.002, -12.5 + i * 5);   // dashed lane lines
  // edge beams and a drip groove under the cantilever
  for (const sx of [-1, 1]) { B(0.4, 0.5, 30, CONC2, sx * 3.1, D0 + 0.25, 0); B(0.06, 0.04, 30, BLACK, sx * 2.9, D0 - 0.02, 0); }
  // longitudinal girders under the deck so it reads from below
  for (const x of [-2.1, -0.7, 0.7, 2.1]) B(0.3, 0.45, 29.6, CONC2, x, D0 - 0.225, 0);
  // transverse diaphragms
  for (let i = 0; i < 5; i++) B(5.4, 0.4, 0.25, CONC2, 0, D0 - 0.2, -12 + i * 6);

  // --- upstands ----------------------------------------------------------------
  for (const sx of [-1, 1]) {
    B(0.3, 1.0, 30, CONC, sx * 3.15, TOP + 0.5, 0);
    B(0.34, 0.08, 30, CONC3, sx * 3.15, TOP + 1.0, 0);                   // coping
    B(0.32, 0.05, 30, BLACK, sx * 3.15, TOP + 0.025, 0);                 // grime at the foot
    // rust streaks down the inner face and the outer deck side
    for (let i = 0; i < 5; i++) {
      B(0.012, 0.5 + hash(i, sx) * 0.4, 0.08, STAIN, sx * 2.995, TOP + 0.4, -12 + hash(i, sx * 3) * 24);
      B(0.012, 0.5 + hash(i, sx * 9) * 0.3, 0.14, STAIN, sx * 3.305, D0 + 0.45, -13 + hash(i, sx * 5) * 26);
    }
  }
  // drainage scuppers through the outer face, every 10 m
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), RUST);
    s.rotation.z = Math.PI / 2; s.position.set(sx * 3.35, D0 + 0.15, -10 + i * 10); g.add(s);
    B(0.02, 0.7, 0.2, STAIN, sx * 3.31, D0 - 0.2, -10 + i * 10);       // the run below it
  }

  // --- sound panels in steel frames ------------------------------------------
  for (const sx of [-1, 1]) {
    const x = sx * 3.15;
    for (let i = 0; i < 7; i++) B(0.12, 3.0, 0.12, STEEL, x, TOP + 1.0 + 1.5, -15 + i * 5);    // posts every 5 m
    B(0.14, 0.08, 30, STEEL, x, TOP + 4.0, 0);                                                  // top rail
    B(0.14, 0.06, 30, STEEL, x, TOP + 1.1, 0);                                                  // bottom rail
    for (let i = 0; i < 6; i++) {
      const z = -12.5 + i * 5;
      if (sx === 1 && i === 3) { B(0.03, 1.2, 4.8, RUST, x, TOP + 1.7, z); continue; }          // one panel replaced with tin, upper half missing
      B(0.03, 2.8, 4.84, GLASS, x, TOP + 2.5, z);
      B(0.04, 0.05, 4.84, STEEL, x, TOP + 2.5, z);                                              // mid rail
    }
    B(0.13, 0.6, 30, STEEL, x, TOP + 1.3, 0).material = RUST;                                   // rusted skirt where the frame meets the coping
  }

  // --- piers ---------------------------------------------------------------------
  for (const z of [-10, 0, 10]) {
    B(5.4, 0.7, 1.2, CONC2, 0, D0 - 0.35, z);                 // crosshead
    B(1.6, 0.3, 1.5, CONC3, 0, D0 - 0.85, z);                 // haunch
    B(1.3, 4.4, 1.5, CONC2, 0, 2.2, z);                       // column
    B(1.34, 0.08, 1.54, BLACK, 0, 0.04, z);                   // grounding band
    B(1.31, 1.2, 0.25, STAIN, 0, 3.3, z + 0.65);             // stain band at the top of the column, front
    B(0.25, 0.9, 1.51, STAIN, 0.55, 2.6, z);                  // and a run down one side
  }
  g.userData.chunk = 'expressway';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
