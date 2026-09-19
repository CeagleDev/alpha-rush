// parked_sedan — arm C: a different reading. Boxier, more upright 80s glasshouse (steeper
// windscreen), fender flares as separate masses, a saggy stance on a soft rear-left tyre, bonnet
// ajar, a dented rear door, quarter windows. Wheels are cylinders with a ring of slot cut-outs
// suggested by dark boxes. Front +Z. 1.7 x 1.5 x 4.4.
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
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const lights = [];
  // paint and trim
  const PAINT = M(0x7a2a26, 'metal', 0.8, 0.1);
  const FADED = M(0x8a3a35, 'metal', 0.9, 0.05);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const CHROME = M(0x9a9ea3, 'metal', 0.55, 0.3);
  const STEELW = M(0x5a5a5c, 'metal', 0.7, 0.3);
  const VINYL = M(0xd9cbb0, 'fabric', 0.92);
  const RUB = M(0x110f12, 'metal', 0.95, 0);
  const DARKI = M(0x231718, 'fabric', 0.95);
  const GRILL = M(0x1a1a1c, 'metal', 0.8, 0.2);
  const PLATE = M(0xd8d2c4, 'metal', 0.6, 0.2);
  const AMBER = M(0xbf7c42, 'metal', 0.5, 0.1);
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x1e2226, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.9, forceSinglePass: true });
  const HEAD = EM(0xf1d899, 2.4);
  const TAIL = EM(0xb8302a, 2.0);
  const body = new THREE.Group(); g.add(body); body.rotation.x = -0.012;                // rear sits lower
  const A = (geo, mat, x, y, z, rx, ry, rz) => add(geo, mat, x, y, z, rx, ry, rz, body);
  // ---- masses ---------------------------------------------------------------------
  A(B(1.5, 0.48, 4.1), PAINT, 0, 0.58, 0);                                             // core
  for (const s of [-1, 1]) {
    A(B(0.1, 0.3, 1.2), PAINT, s * 0.77, 0.66, 1.45);                                  // front flares
    A(B(0.1, 0.3, 1.2), s > 0 ? RUST : PAINT, s * 0.77, 0.66, -1.4);                    // rear flares (one rusted through)
    A(B(0.06, 0.36, 1.0), s < 0 ? FADED : PAINT, s * 0.77, 0.62, 0.05);                 // front doors
    A(B(0.06, 0.36, 0.86), PAINT, s * 0.77, 0.62, -0.85);                                // rear doors
    if (s > 0) A(B(0.05, 0.2, 0.5), RUSTD, 0.79, 0.55, -0.8);                            // dent, sunk dark
    A(B(0.02, 0.03, 0.12), CHROME, s * 0.81, 0.74, -0.25); A(B(0.02, 0.03, 0.12), CHROME, s * 0.81, 0.74, -1.08);
    A(B(0.02, 0.4, 0.03), GRILL, s * 0.805, 0.62, -0.42); A(B(0.02, 0.4, 0.03), GRILL, s * 0.805, 0.62, 0.53); A(B(0.02, 0.4, 0.03), GRILL, s * 0.805, 0.62, -1.28);
    A(B(0.03, 0.09, 3.1), RUST, s * 0.77, 0.36, 0);                                      // rust sills
  }
  A(B(1.56, 0.06, 3.3), RUB, 0, 0.31, 0);                                                // grounding band
  A(B(1.3, 0.24, 3.4), RUB, 0, 0.38, 0);
  // bonnet ajar at the front (front edge lifted: rotation.x NEGATIVE raises +z)
  A(B(1.44, 0.07, 1.3), PAINT, 0, 0.84, 1.42, -0.06, 0, 0);
  A(B(1.44, 0.03, 0.06), RUSTD, 0, 0.9, 1.4);
  A(B(1.5, 0.12, 0.2), PAINT, 0, 0.84, 0.74);                                             // cowl
  for (const s of [-1, 1]) A(B(0.02, 0.01, 0.4), GRILL, s * 0.2, 0.91, 0.74, 0, s * 0.35, 0);
  A(B(1.44, 0.08, 0.9), PAINT, 0, 0.86, -1.66);                                           // boot
  A(B(1.5, 0.12, 0.2), PAINT, 0, 0.84, -1.2);
  A(B(0.5, 0.02, 0.3), RUSTD, -0.4, 0.905, -1.8);                                          // rust on boot lid
  // ---- upright glasshouse -----------------------------------------------------------
  A(B(1.34, 0.4, 1.9), DARKI, 0, 1.08, -0.25);
  A(B(1.2, 0.14, 0.4), DARKI, 0, 1.0, 0.4);
  A(new THREE.TorusGeometry(0.17, 0.02, 6, 14), GRILL, 0.42, 1.1, 0.35, -0.5, 0, 0);
  A(B(1.44, 0.05, 1.2), PAINT, 0, 1.39, -0.3);
  A(B(1.4, 0.06, 1.16), VINYL, 0, 1.43, -0.3);
  A(B(0.26, 0.02, 0.3), RUSTD, 0.5, 1.46, -0.8);                                          // torn vinyl
  for (const s of [-1, 1]) A(B(0.03, 0.02, 1.16), CHROME, s * 0.71, 1.44, -0.3);
  const wsA = -Math.atan2(0.36, 0.52), rwA = Math.atan2(0.38, 0.52);
  A(B(1.32, 0.66, 0.02), GLASS, 0, 1.13, 0.5, wsA, 0, 0);
  A(B(1.32, 0.66, 0.02), GLASS, 0, 1.14, -1.06, rwA, 0, 0);
  for (const s of [-1, 1]) {
    A(B(0.06, 0.68, 0.07), PAINT, s * 0.68, 1.13, 0.5, wsA, 0, 0);
    A(B(0.06, 0.68, 0.07), PAINT, s * 0.68, 1.14, -1.06, rwA, 0, 0);
    A(B(0.05, 0.52, 0.06), PAINT, s * 0.7, 1.13, -0.4);
    A(B(0.05, 0.52, 0.06), PAINT, s * 0.7, 1.13, -0.95);                                   // quarter-window post
    A(B(0.02, 0.46, 0.7), GLASS, s * 0.7, 1.13, 0.0);
    A(B(0.02, 0.46, 0.46), GLASS, s * 0.7, 1.13, -0.68);
    A(B(0.02, 0.4, 0.22), GLASS, s * 0.7, 1.12, -1.08);                                    // quarter light
    A(B(0.05, 0.04, 1.7), PAINT, s * 0.7, 0.9, -0.3);
    A(B(0.04, 0.05, 0.05), GRILL, s * 0.73, 0.98, 0.64);
    A(B(0.14, 0.09, 0.05), s > 0 ? PAINT : RUSTD, s * 0.78, 1.0, 0.62);
  }
  // ---- front and rear -----------------------------------------------------------------
  A(B(1.52, 0.28, 0.1), PAINT, 0, 0.64, 2.05);
  A(B(0.9, 0.2, 0.04), GRILL, 0, 0.64, 2.11);
  for (let i = 0; i < 4; i++) A(B(0.02, 0.2, 0.02), CHROME, -0.36 + i * 0.24, 0.64, 2.125);   // vertical grille bars
  A(B(1.0, 0.02, 0.02), CHROME, 0, 0.75, 2.125);
  for (const s of [-1, 1]) {
    A(new THREE.TorusGeometry(0.1, 0.012, 6, 16), CHROME, s * 0.58, 0.64, 2.115);
    A(CYL(0.09, 0.09, 0.03, 16), HEAD, s * 0.58, 0.64, 2.115, Math.PI / 2, 0, 0);
    lights.push({ x: s * 0.58, y: 0.64, z: 2.3, color: 0xf1d899, intensity: 1.0, range: 6 });
    A(B(0.14, 0.08, 0.02), AMBER, s * 0.68, 0.46, 2.12);
    A(B(0.4, 0.16, 0.03), CHROME, s * 0.55, 0.64, -2.09);
    A(B(0.36, 0.12, 0.02), TAIL, s * 0.55, 0.64, -2.11);
    lights.push({ x: s * 0.55, y: 0.64, z: -2.25, color: 0xb8302a, intensity: 0.5, range: 3 });
    A(B(0.08, 0.14, 0.08), RUB, s * 0.72, 0.4, 2.18); A(B(0.08, 0.14, 0.08), RUB, s * 0.72, 0.4, -2.18);
  }
  A(B(1.62, 0.1, 0.1), CHROME, 0, 0.4, 2.18); A(B(1.62, 0.1, 0.1), CHROME, 0, 0.4, -2.18);
  A(B(0.6, 0.03, 0.12), RUST, 0.3, 0.33, 2.15);
  A(B(0.44, 0.22, 0.03), PLATE, 0, 0.62, 2.14); A(B(0.36, 0.18, 0.03), PLATE, 0, 0.44, -2.21);
  A(CYL(0.025, 0.025, 0.3, 8), RUSTD, -0.5, 0.26, -2.1);
  A(CYL(0.005, 0.005, 0.5, 4), CHROME, 0.6, 1.12, 0.9);
  // ---- wheels: one soft tyre (rear left), slotted steel rims --------------------------
  const wheel = (x, z, soft) => {
    const w = new THREE.Group(); w.position.set(x, soft ? 0.25 : 0.29, z); body.add(w);
    const t = add(CYL(0.29, 0.29, 0.17, 18), RUB, 0, 0, 0, 0, 0, Math.PI / 2, w); if (soft) t.scale.set(1, 0.86, 1.06);
    add(CYL(0.19, 0.19, 0.18, 14), STEELW, 0, 0, 0, 0, 0, Math.PI / 2, w);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(B(0.19, 0.05, 0.03), GRILL, 0, Math.cos(a) * 0.13, Math.sin(a) * 0.13, a, 0, 0, w); }
    add(CYL(0.06, 0.06, 0.2, 10), CHROME, 0, 0, 0, 0, 0, Math.PI / 2, w);
  };
  wheel(0.7, 1.4, false); wheel(-0.7, 1.4, false); wheel(0.7, -1.35, false); wheel(-0.7, -1.35, true);
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
