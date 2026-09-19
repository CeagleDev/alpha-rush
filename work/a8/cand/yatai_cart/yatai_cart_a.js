// yatai_cart — arm A: primitives. Timber cabinet on two spoked wheels (torus + cylinder spokes),
// tiled gable canopy from cylinder rows, red/white curtain from thin boxes, steel counter with a
// pot and bowl stacks, two lit red lanterns at the counter-side canopy corners, cream lightbox.
// Long axis (pull direction) along Z, handle at +Z; counter side is +X. 1.2 w x 2.1 h x 2.4 d.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const EM = (hex, i) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(hex), emissiveIntensity: i || 2.2, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 12, 1, !!open);
  const bar = (a, b, r, mat, s) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]), Bv = new THREE.Vector3(b[0], b[1], b[2]);
    const d = new THREE.Vector3().subVectors(Bv, A), L = d.length();
    const m = new THREE.Mesh(CYL(r, r, L, s || 6), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.add(m); return m;
  };
  const lights = [];

  const TIM = M(0x4f2d21, 'timber', 0.9);
  const TIMD = M(0x37201b, 'timber', 0.92);
  const TIML = M(0x6c4028, 'timber', 0.88);
  const PLANK = M(0x8b6141, 'timber', 0.9);
  const RUST = M(0x6e4128, 'metal', 0.92, 0.1);
  const STEEL = M(0x8a8d90, 'metal', 0.5, 0.3);
  const IRON = M(0x3a3a3c, 'metal', 0.7, 0.3);
  const TILE = M(0x3a3b3d, 'stone', 0.9);
  const TILEM = M(0x4a4d48, 'stone', 0.9);
  const RED = M(0xb8302a, 'fabric', 0.9, 0, { side: DS });
  const WHITE = M(0xeee2c8, 'fabric', 0.9, 0, { side: DS });
  const BOWL = M(0xeee2c8, 'plaster', 0.6, 0, { side: DS });
  const BOWLB = M(0x40559f, 'plaster', 0.6, 0, { side: DS });
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const LBOX = EM(0xd8ae70, 2.4);
  const LANT = EM(0xd8482a, 2.0);

  // ---- wheels: torus rim, cylinder spokes, hub; axle along X -----------------
  const wheel = (x, y, z, R) => {
    const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = Math.PI / 2; g.add(w);
    add(new THREE.TorusGeometry(R, 0.03, 8, 24), DARK, 0, 0, 0, 0, 0, 0, w);            // steel tyre, grounding-dark
    add(new THREE.TorusGeometry(R - 0.045, 0.018, 6, 24), IRON, 0, 0, 0, 0, 0, 0, w);   // rim
    add(CYL(0.05, 0.05, 0.09, 10), RUST, 0, 0, 0, Math.PI / 2, 0, 0, w);                // hub
    for (let i = 0; i < 12; i++) add(CYL(0.007, 0.007, (R - 0.05) * 2, 5), IRON, 0, 0, 0, 0, 0, (i / 12) * Math.PI, w);
  };
  wheel(0.53, 0.4, -0.3, 0.38); wheel(-0.53, 0.4, -0.3, 0.38);
  add(CYL(0.02, 0.02, 1.14, 8), IRON, 0, 0.4, -0.3, 0, 0, Math.PI / 2);                 // axle
  for (const s of [-1, 1]) add(B(0.05, 0.12, 0.08), IRON, s * 0.44, 0.44, -0.3);        // axle hangers

  // ---- cabinet body ---------------------------------------------------------
  add(B(0.92, 0.5, 1.4), TIM, 0, 0.72, -0.15);
  for (const s of [-1, 1]) {
    add(B(0.03, 0.05, 1.42), TIMD, s * 0.465, 0.52, -0.15);                              // battens
    add(B(0.03, 0.05, 1.42), TIMD, s * 0.465, 0.93, -0.15);
    for (let i = 0; i < 4; i++) add(B(0.025, 0.42, 0.04), TIMD, s * 0.465, 0.72, -0.8 + i * 0.44);
  }
  add(B(0.02, 0.24, 0.9), RUST, -0.47, 0.66, 0.05);                                      // rusty tin patch (-X side)
  for (let i = 0; i < 7; i++) add(B(0.012, 0.24, 0.02), RUST, -0.481, 0.66, -0.35 + i * 0.13);
  add(B(0.94, 0.03, 0.55), TIMD, 0, 0.62, -0.55);                                        // stain band + chipped corner
  add(B(0.06, 0.06, 0.06), TIMD, 0.44, 0.49, 0.53);
  add(B(0.3, 0.16, 0.02), PLANK, 0.2, 0.8, 0.56);                                        // faded panel on +Z end
  // ---- counter --------------------------------------------------------------
  add(B(1.12, 0.04, 1.5), STEEL, 0.05, 0.99, -0.15);
  add(B(0.05, 0.16, 1.3), STEEL, -0.5, 1.08, -0.15);                                     // back splash
  add(B(1.1, 0.02, 0.02), IRON, 0.05, 0.97, 0.6);                                        // counter lip
  add(B(0.36, 0.02, 0.36), DARK, -0.1, 1.015, 0.15);                                     // burner ring plate
  // pot (lathe) + lid + handles
  const potPts = [[0, 0], [0.12, 0], [0.13, 0.05], [0.13, 0.2], [0.125, 0.22]].map(p => new THREE.Vector2(p[0], p[1]));
  add(new THREE.LatheGeometry(potPts, 14), STEEL, -0.1, 1.02, 0.15);
  add(CYL(0.135, 0.11, 0.03, 14), STEEL, -0.1, 1.24, 0.15);
  add(CYL(0.02, 0.02, 0.04, 8), IRON, -0.1, 1.27, 0.15);
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.03, 0.007, 5, 10, Math.PI), IRON, -0.1 + s * 0.14, 1.2, 0.15, 0, s * Math.PI / 2, 0);
  // bowl stacks (open lathes, DoubleSide)
  const bowlPts = [[0.02, 0], [0.05, 0.005], [0.068, 0.03], [0.07, 0.045]].map(p => new THREE.Vector2(p[0], p[1]));
  const bowlGeo = new THREE.LatheGeometry(bowlPts, 8);
  const stacks = [[0.3, -0.6, 4], [0.32, -0.42, 3], [0.15, -0.55, 5], [0.35, 0.35, 4], [0.2, 0.5, 3], [0.38, 0.55, 2]];
  stacks.forEach(([x, z, n], k) => { for (let i = 0; i < n; i++) add(bowlGeo, (i + k) % 3 === 0 ? BOWLB : BOWL, x, 1.01 + i * 0.022, z); });
  add(CYL(0.015, 0.015, 0.3, 6), TIML, 0.3, 1.16, 0.0, 0, 0, 0.5);                       // a ladle across the counter

  // ---- posts + canopy frame ---------------------------------------------------
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(CYL(0.025, 0.025, 0.86, 8), IRON, s * 0.42, 1.44, -0.15 + t * 0.62);
  for (const s of [-1, 1]) add(B(0.06, 0.06, 1.82), TIMD, s * 0.58, 1.86, -0.1);          // eave beams
  for (const t of [-1, 1]) add(B(1.2, 0.05, 0.05), TIMD, 0, 1.86, -0.1 + t * 0.9);
  add(B(0.06, 0.08, 1.82), TIMD, 0, 2.02, -0.1);                                          // ridge beam
  // roof slopes (boxes) + tile rows (cylinders along Z)
  const pitch = Math.atan2(0.2, 0.6);
  for (const s of [-1, 1]) {
    add(B(0.66, 0.03, 1.82), TIML, s * 0.31, 1.97, -0.1, 0, 0, -s * pitch);
    for (let i = 0; i < 5; i++) {
      const u = 0.04 + i * 0.13;
      add(CYL(0.032, 0.032, 1.84, 7), i % 2 ? TILEM : TILE, s * (0.62 - u), 1.9 + u * 0.33 + 0.02, -0.1, Math.PI / 2, 0, 0);
    }
    add(B(0.66, 0.02, 0.06), TILE, s * 0.31, 2.0, 0.81, 0, 0, -s * pitch);                 // eave tile edge
    add(B(0.66, 0.02, 0.06), TILE, s * 0.31, 2.0, -1.01, 0, 0, -s * pitch);
  }
  add(CYL(0.05, 0.05, 1.86, 8), TILE, 0, 2.06, -0.1, Math.PI / 2, 0, 0);                   // ridge tile (top 2.11)
  // ---- lightbox (+X, under eaves) and plank sign on -X ------------------------
  add(B(0.05, 0.36, 0.96), TIMD, 0.44, 1.66, -0.15);
  add(B(0.03, 0.3, 0.9), LBOX, 0.475, 1.66, -0.15);
  lights.push({ x: 0.62, y: 1.66, z: -0.15, color: 0xd8ae70, intensity: 0.9, range: 3.5 });
  add(B(0.04, 0.3, 0.9), PLANK, -0.44, 1.66, -0.15);
  add(B(0.02, 0.1, 0.5), TIMD, -0.46, 1.66, -0.15);
  // ---- curtains (thin alternating boxes) --------------------------------------
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) {
    const z = -0.1 - 0.72 + i * 0.13;
    add(B(0.02, 0.3, 0.125), i % 2 ? WHITE : RED, s * 0.6, 1.7, z);
  }
  for (const t of [-1, 1]) for (let i = 0; i < 8; i++) add(B(0.14, 0.3, 0.02), i % 2 ? RED : WHITE, -0.49 + i * 0.14, 1.7, -0.1 + t * 0.9);
  // ---- lanterns at the +X canopy corners --------------------------------------
  for (const t of [-1, 1]) {
    const z = -0.1 + t * 0.95, x = 0.6;
    add(CYL(0.006, 0.006, 0.08, 5), IRON, x, 1.82, z);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.77, z);
    const l = add(new THREE.SphereGeometry(0.13, 12, 10), LANT, x, 1.6, z); l.scale.set(1, 1.35, 1);
    for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.12 - Math.abs(i - 1.5) * 0.02, 0.006, 4, 10), DARK, x, 1.52 + i * 0.055, z, Math.PI / 2, 0, 0);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.43, z);
    lights.push({ x, y: 1.6, z, color: 0xe0482a, intensity: 0.8, range: 3 });
  }
  // ---- pull handle at +Z with a caster leg --------------------------------------
  for (const s of [-1, 1]) {
    bar([s * 0.3, 0.6, 0.55], [s * 0.25, 0.5, 1.36], 0.02, IRON, 7);
    bar([s * 0.3, 0.6, 0.55], [s * 0.3, 0.5, 0.55], 0.02, IRON, 6);
  }
  add(CYL(0.02, 0.02, 0.54, 7), IRON, 0, 0.5, 1.36, 0, 0, Math.PI / 2);                    // grip bar
  bar([0, 0.5, 1.2], [0, 0.1, 1.1], 0.018, IRON, 6);                                         // caster leg
  bar([0, 0.5, 1.2], [0, 0.5, 0.55], 0.012, IRON, 6);                                        // brace
  add(CYL(0.07, 0.07, 0.04, 12), DARK, 0, 0.07, 1.1, 0, 0, Math.PI / 2);                    // caster wheel
  add(B(0.06, 0.08, 0.02), IRON, 0, 0.1, 1.08);

  // ---- centre, base at y=0, lights into asset space ------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  g.userData.obstacle = { kind: 'block', lanes: 1 };
  return g;
}
