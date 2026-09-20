// scooter — WINNER (arm A: primitives). Step-through delivery scooter from boxes and cylinders: leg shield,
// floor pan, tank spine, seat, engine block, cargo box on a rack, wire front basket from thin bars,
// round headlamp cylinder, spoked wheels (torus + cylinders), side stand. Front +Z. 0.7 x 1.1 x 1.9.
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
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const bar = (a, b, r, mat, s, parent) => {
    const A = V3(a), Bv = V3(b), d = new THREE.Vector3().subVectors(Bv, A), L = d.length();
    const m = new THREE.Mesh(CYL(r, r, L, s || 7), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    (parent || g).add(m); return m;
  };
  const lights = [];
  // faded, desaturated 0x40559f; the cream panels are the worn factory second colour
  const BLUE = M(0x4a5683, 'metal', 0.85, 0.1);
  const BLUED = M(0x3b4568, 'metal', 0.88, 0.1);
  const CREAM = M(0xbfb5a2, 'metal', 0.88, 0.05);
  const CREAMD = M(0xa1957f, 'metal', 0.9, 0.05);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const CHROME = M(0x8a8d90, 'metal', 0.5, 0.3);
  const WIRE = M(0x9a9ea3, 'metal', 0.6, 0.3);
  const ENG = M(0x5f6468, 'metal', 0.7, 0.3);
  const RUB = M(0x110f12, 'metal', 0.95, 0);
  const SEAT = M(0x231718, 'fabric', 0.9);
  const AMBER = M(0xbf7c42, 'metal', 0.5, 0.1);
  const HEAD = EM(0xf1d899, 2.4);
  const TAIL = EM(0xb8302a, 1.8);
  // ---- wheels (axle along X) --------------------------------------------------------
  const wheel = (z, r) => {
    const w = new THREE.Group(); w.position.set(0, r, z); w.rotation.y = Math.PI / 2; g.add(w);
    add(new THREE.TorusGeometry(r - 0.03, 0.034, 5, 18), RUB, 0, 0, 0, 0, 0, 0, w);         // tyre
    add(new THREE.TorusGeometry(r - 0.075, 0.016, 4, 16), CHROME, 0, 0, 0, 0, 0, 0, w);      // rim
    add(CYL(0.045, 0.045, 0.1, 8), ENG, 0, 0, 0, Math.PI / 2, 0, 0, w);                      // hub / brake drum
    for (let i = 0; i < 9; i++) add(CYL(0.0035, 0.0035, (r - 0.08) * 2, 4, true), WIRE, 0, 0, 0, 0, 0, (i / 9) * Math.PI, w);
  };
  wheel(0.62, 0.23); wheel(-0.6, 0.23);
  // ---- front end: fork, mudguard, legshield -------------------------------------------
  for (const s of [-1, 1]) bar([s * 0.06, 0.23, 0.62], [s * 0.055, 0.66, 0.5], 0.018, CHROME);
  add(CYL(0.03, 0.03, 0.26, 8), CHROME, 0, 0.7, 0.48, 0.25, 0, 0);                            // steering stem
  add(new THREE.TorusGeometry(0.28, 0.022, 4, 14, Math.PI * 0.75), BLUE, 0, 0.23, 0.62, 0, Math.PI / 2, -0.5);   // front mudguard
  add(B(0.2, 0.03, 0.16), BLUED, 0, 0.45, 0.72, -0.3, 0, 0);
  add(B(0.36, 0.44, 0.06), CREAM, 0, 0.56, 0.4, 0.12, 0, 0);                                   // leg shield
  add(B(0.3, 0.06, 0.05), CREAMD, 0, 0.77, 0.37);                                              // shield top rail
  for (const s of [-1, 1]) add(B(0.06, 0.4, 0.06), BLUE, s * 0.19, 0.56, 0.4, 0.12, 0, 0);     // shield edges
  add(B(0.2, 0.14, 0.02), RUST, 0.06, 0.4, 0.44, 0.12, 0, 0);                                  // rust bloom on the shield
  // ---- floor pan, spine, seat ------------------------------------------------------------
  add(B(0.34, 0.05, 0.56), CREAMD, 0, 0.3, 0.16);                                               // floorboard
  for (const s of [-1, 1]) add(B(0.03, 0.09, 0.5), BLUED, s * 0.17, 0.27, 0.16);                // floor edges
  add(B(0.22, 0.22, 0.5), BLUE, 0, 0.5, -0.16);                                                 // tank spine
  add(B(0.26, 0.1, 0.44), BLUED, 0, 0.62, -0.18);
  add(CYL(0.035, 0.035, 0.06, 8), CHROME, 0, 0.68, -0.02);                                      // fuel cap
  add(B(0.3, 0.09, 0.42), SEAT, 0, 0.74, -0.3);                                                 // saddle
  add(B(0.32, 0.04, 0.44), RUB, 0, 0.7, -0.3);
  add(B(0.12, 0.05, 0.1), SEAT, 0, 0.75, -0.04);
  // ---- engine, exhaust, stand ---------------------------------------------------------------
  add(B(0.24, 0.2, 0.28), ENG, 0.02, 0.34, -0.3);
  add(CYL(0.07, 0.07, 0.16, 8), ENG, 0.02, 0.44, -0.2, 0.9, 0, 0);                              // cylinder
  for (let i = 0; i < 4; i++) add(CYL(0.085, 0.085, 0.012, 8), ENG, 0.02, 0.4 + i * 0.03, -0.24 + i * 0.022, 0.9, 0, 0);
  add(CYL(0.035, 0.035, 0.5, 8), RUSTD, 0.15, 0.24, -0.34, 0.1, 0.25, 0);                        // exhaust
  add(CYL(0.045, 0.045, 0.16, 8), RUST, 0.18, 0.26, -0.64, 0.1, 0.25, 0);
  add(B(0.2, 0.06, 0.1), ENG, 0, 0.26, -0.44);
  for (const s of [-1, 1]) { add(B(0.03, 0.03, 0.14), ENG, s * 0.2, 0.33, -0.16, 0, 0, 0); add(B(0.09, 0.03, 0.14), RUB, s * 0.24, 0.33, -0.16); }  // pillion pegs
  bar([-0.1, 0.28, -0.34], [-0.2, 0.0, -0.44], 0.014, RUSTD);                                    // side stand
  add(B(0.06, 0.02, 0.1), RUSTD, -0.2, 0.012, -0.44);
  // ---- handlebar, headlamp, mirrors ------------------------------------------------------------
  add(B(0.22, 0.14, 0.14), BLUE, 0, 0.86, 0.44);                                                  // bar cowl
  add(CYL(0.09, 0.085, 0.09, 14), CHROME, 0, 0.8, 0.52, Math.PI / 2, 0, 0);                       // headlamp shell
  add(CYL(0.08, 0.08, 0.02, 14), HEAD, 0, 0.8, 0.575, Math.PI / 2, 0, 0);
  lights.push({ x: 0, y: 0.8, z: 0.7, color: 0xf1d899, intensity: 0.9, range: 6 });
  for (const s of [-1, 1]) {
    bar([0, 0.9, 0.44], [s * 0.26, 0.92, 0.38], 0.014, CHROME);
    add(CYL(0.016, 0.016, 0.1, 7), RUB, s * 0.28, 0.92, 0.36, 0, -s * 0.5, 0);                     // grips
    bar([s * 0.14, 0.93, 0.41], [s * 0.16, 1.02, 0.36], 0.008, CHROME, 5);                          // mirror stalks
    add(B(0.1, 0.07, 0.015), CHROME, s * 0.17, 1.05, 0.35, 0, s * 0.35, 0);                          // mirror heads
    add(CYL(0.03, 0.03, 0.04, 8), AMBER, s * 0.16, 0.84, 0.5, Math.PI / 2, 0, 0);                    // indicators
  }
  // ---- rear rack and cargo box ---------------------------------------------------------------------
  for (const s of [-1, 1]) { bar([s * 0.12, 0.72, -0.5], [s * 0.1, 0.5, -0.66], 0.012, CHROME); add(B(0.02, 0.02, 0.3), CHROME, s * 0.12, 0.72, -0.62); }
  add(B(0.28, 0.02, 0.3), CHROME, 0, 0.72, -0.62);
  add(B(0.4, 0.3, 0.38), CREAM, 0, 0.89, -0.62);                                                    // cargo box
  add(B(0.42, 0.05, 0.4), CREAMD, 0, 1.03, -0.62);                                                  // lid
  add(B(0.42, 0.03, 0.4), RUSTD, 0, 0.99, -0.62);                                                   // lid seam
  for (const s of [-1, 1]) { add(B(0.02, 0.26, 0.04), RUST, s * 0.2, 0.88, -0.45); add(B(0.05, 0.04, 0.02), CHROME, s * 0.1, 0.88, -0.81); }
  add(B(0.3, 0.12, 0.02), CREAMD, 0, 0.86, -0.81);
  add(B(0.14, 0.08, 0.02), TAIL, 0, 0.72, -0.8);
  lights.push({ x: 0, y: 0.72, z: -0.88, color: 0xb8302a, intensity: 0.4, range: 2.5 });
  // ---- front wire basket (a few bars, not a mesh) -------------------------------------------------------
  const bw = 0.3, bd = 0.22, by0 = 0.56, by1 = 0.78, bz = 0.78;
  for (const y of [by0, by1]) { add(B(bw, 0.008, 0.008), WIRE, 0, y, bz + bd / 2); add(B(bw, 0.008, 0.008), WIRE, 0, y, bz - bd / 2); add(B(0.008, 0.008, bd), WIRE, bw / 2, y, bz); add(B(0.008, 0.008, bd), WIRE, -bw / 2, y, bz); }
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(B(0.008, by1 - by0, 0.008), WIRE, s * bw / 2, (by0 + by1) / 2, bz + t * bd / 2);
  for (let i = 1; i < 3; i++) { const y = by0 + i * (by1 - by0) / 3; add(B(bw, 0.005, 0.005), WIRE, 0, y, bz + bd / 2); add(B(0.005, 0.005, bd), WIRE, bw / 2, y, bz); add(B(0.005, 0.005, bd), WIRE, -bw / 2, y, bz); }
  for (let i = 1; i < 4; i++) add(B(0.005, by1 - by0, 0.005), WIRE, -bw / 2 + i * bw / 4, (by0 + by1) / 2, bz + bd / 2);
  for (let i = 1; i < 3; i++) add(B(bw, 0.005, 0.005), WIRE, 0, by0, bz - bd / 2 + i * bd / 3);
  bar([0, 0.56, 0.7], [0, 0.6, 0.45], 0.007, CHROME, 5); bar([0, 0.78, 0.7], [0, 0.82, 0.46], 0.007, CHROME, 5);
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
