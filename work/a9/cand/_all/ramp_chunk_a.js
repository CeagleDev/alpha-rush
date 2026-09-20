// ramp_chunk — arm A: assembled from primitives.
// The running surface is a thin box rotated to the 1:5 grade (rotation.x is
// NEGATIVE so the +Z end rises), sitting on a stepped stack of concrete blocks
// that fills the wedge beneath it; parapets are rotated boxes, piers are boxes.
// Base y = 0 at the low end, surface y = 0.2 * (z + 15): 0 at z = -15, 6 at z = +15.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD  = mat(0x231718, 'ground', 0.18);
  const PATCH = mat(0x2a1c1b, 'ground', 0.18);
  const LANE  = mat(0xcfc7b4, 'ground', 0.35);
  const CONC  = mat(0x8a8378, 'stone', 0.85);
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);
  const CONC3 = mat(0x6f6a62, 'stone', 0.88);
  const STAIN = mat(0x37201b, 'stone', 0.92);
  const BLACK = mat(0x110f12, 'stone', 0.95);
  const TIN   = mat(0x8b6141, 'metal', 0.85, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const TH = Math.atan(0.2), C = Math.cos(TH), S = Math.sin(TH);
  const B = (w, h, d, m, x, y, z, rx) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };
  const yAt = (z) => 0.2 * (z + 15);

  // --- the sloped slab: starts at z = -14.7 so its low bottom corner sits at y ~ 0 ----
  const L = (30 - 0.3) / C, T = 0.06;
  const zc = (15 - 14.7) / 2, yc = yAt(zc) - (T / 2) * C;
  B(6.0, T, L, ROAD, 0, yc, zc + (T / 2) * S, -TH);
  B(6.0, 0.03, 0.5, CONC2, 0, 0.015, -14.75);                            // threshold apron at the foot
  // patches and lane line on the slope: tilted thin boxes
  for (let i = 0; i < 5; i++) { const z = -11 + i * 5 + hash(i, 1) * 2; B(1.0 + hash(i, 2) * 1.4, 0.003, 2.0, PATCH, -1.8 + hash(i, 3) * 3.6, yAt(z) + 0.0015 * C, z, -TH); }
  for (let i = 0; i < 6; i++) { const z = -12.5 + i * 5; B(0.12, 0.003, 2.4, LANE, 0, yAt(z) + 0.002, z, -TH); }
  // --- the wedge beneath: stepped concrete blocks 1.5 m long -------------------
  for (let i = 0; i < 20; i++) {
    const z0 = -15 + i * 1.5, z1 = z0 + 1.5, h = Math.max(0, yAt(z0) - 0.04);
    if (h < 0.05) continue;
    B(6.0, h, 1.5, i % 2 ? CONC3 : CONC2, 0, h / 2, (z0 + z1) / 2);
  }
  // --- parapets: rotated boxes 0.5 m tall, 0.25 thick ---------------------------
  for (const sx of [-1, 1]) {
    const x = sx * 3.125;
    B(0.25, 0.5, 30 / C, CONC, x, 3.0 + 0.25 * C, 0.25 * S, -TH);
    B(0.29, 0.06, 30 / C, CONC3, x, 3.0 + 0.5 * C, 0.5 * S, -TH);          // coping
    for (let i = 0; i < 4; i++) { const z = -12 + i * 8 + hash(i, sx) * 3; B(0.012, 0.3, 0.12, STAIN, x - sx * 0.13, yAt(z) + 0.25, z, -TH); }
    // corrugated tin cladding on the wedge face: alternating panels
    for (let i = 0; i < 9; i++) {
      const z = -11.5 + i * 2.6, h = yAt(z) - 0.1; if (h < 0.4) continue;
      B(0.04, h * 0.85, 2.3, i % 3 === 1 ? RUST : TIN, sx * 3.03, h * 0.5, z);
      for (let s = 0; s < 3; s++) B(0.06, h * 0.85, 0.04, RUST, sx * 3.04, h * 0.5, z - 0.9 + s * 0.9);
    }
  }
  // --- piers at 10 m spacing, standing proud of the wedge as pilasters ------------
  for (const z of [-5, 5, 13]) {
    const h = yAt(z) - 0.06;
    for (const sx of [-1, 1]) { B(0.7, h, 1.0, CONC2, sx * 3.55, h / 2, z); B(0.74, 0.08, 1.04, BLACK, sx * 3.55, 0.04, z); B(0.71, 0.5, 0.3, STAIN, sx * 3.55, h - 0.4, z + 0.36); }
    B(7.4, 0.5, 1.0, CONC2, 0, h - 0.25, z);                                // crosshead through the wedge
  }
  B(6.0, 0.05, 30, BLACK, 0, 0.025, 0);                                     // grounding band along the foot

  g.userData.chunk = 'ramp';
  g.userData.rise = 6;
  g.userData.mounts = ['front', 'back'];

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
