// parked_sedan — arm A: primitives. Three-box 1980s compact sedan from boxes: lower body, bonnet,
// cowl, boot, pillars, rotated glass panels (windscreen rotation.x NEGATIVE so its top leans back),
// cylinder wheels, chrome bumpers, round emissive headlights. Front +Z. 1.7 x 1.5 x 4.4.
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
  // ---- lower body, sills, grounding band --------------------------------------
  add(B(1.62, 0.5, 4.2), PAINT, 0, 0.56, 0);
  add(B(1.64, 0.1, 3.0), RUST, 0, 0.33, 0);                      // rust sills
  add(B(1.64, 0.06, 3.2), RUB, 0, 0.26, 0);                       // grounding band
  add(B(1.62, 0.05, 4.2), RUB, 0, 0.29, 0);
  for (const s of [-1, 1]) {                                      // wheel arch lips (dark, proud)
    for (const z of [1.4, -1.35]) add(B(0.05, 0.16, 0.78), RUSTD, s * 0.81, 0.62, z);
    add(B(0.02, 0.32, 0.9), s > 0 ? FADED : PAINT, s * 0.815, 0.62, 0.05);          // front door skin (one faded)
    add(B(0.02, 0.32, 0.8), PAINT, s * 0.815, 0.62, -0.85);                            // rear door skin
    add(B(0.02, 0.34, 0.02), GRILL, s * 0.82, 0.62, -0.42);                             // door seams
    add(B(0.02, 0.34, 0.02), GRILL, s * 0.82, 0.62, 0.52); add(B(0.02, 0.34, 0.02), GRILL, s * 0.82, 0.62, -1.27);
    add(B(0.02, 0.03, 0.12), CHROME, s * 0.83, 0.72, -0.28); add(B(0.02, 0.03, 0.12), CHROME, s * 0.83, 0.72, -1.1);  // handles
    add(B(0.02, 0.02, 3.4), CHROME, s * 0.83, 0.5, 0);                                  // side trim strip
    add(B(0.03, 0.18, 0.4), RUST, s * 0.815, 0.4, -1.7);                                // rust bloom on rear quarter
    add(B(0.02, 0.1, 0.3), RUSTD, s * 0.815, 0.8, 1.6);                                 // front wing rust
  }
  add(B(0.3, 0.06, 0.02), RUSTD, 0.45, 0.62, -0.4);                                     // dent shadow line (+X rear door)
  // ---- bonnet, cowl, boot ------------------------------------------------------
  add(B(1.5, 0.08, 1.35), PAINT, 0, 0.8, 1.42, 0.04, 0, 0);
  add(B(0.02, 0.005, 1.2), RUSTD, 0.3, 0.845, 1.42, 0.04, 0, 0); add(B(0.02, 0.005, 1.2), RUSTD, -0.3, 0.845, 1.42, 0.04, 0, 0);  // bonnet creases
  add(B(1.56, 0.1, 0.16), PAINT, 0, 0.84, 0.72);                                        // cowl
  for (const s of [-1, 1]) add(B(0.02, 0.01, 0.4), GRILL, s * 0.2, 0.9, 0.7, 0, s * 0.4, 0);  // wipers
  add(B(1.5, 0.08, 0.95), PAINT, 0, 0.85, -1.66, -0.04, 0, 0);                          // boot lid
  add(B(1.56, 0.1, 0.16), PAINT, 0, 0.84, -1.2);
  add(B(0.6, 0.35, 0.02), RUST, 0.2, 0.5, -2.09);                                      // rust on rear valance
  // ---- cabin: interior mass, pillars, roof, glass ---------------------------------
  add(B(1.36, 0.42, 1.8), DARKI, 0, 1.05, -0.25);                                     // seats / interior mass
  add(B(1.3, 0.16, 0.5), DARKI, 0, 0.98, 0.45);                                       // dash
  add(new THREE.TorusGeometry(0.17, 0.02, 6, 14), GRILL, 0.42, 1.1, 0.35, -0.5, 0, 0); // steering wheel
  add(B(1.42, 0.06, 1.06), VINYL, 0, 1.42, -0.25);                                     // vinyl roof
  add(B(1.46, 0.04, 1.1), PAINT, 0, 1.39, -0.25);
  add(B(0.3, 0.02, 0.2), RUSTD, 0.5, 1.45, -0.7);                                     // torn vinyl showing rust
  for (const s of [-1, 1]) add(B(0.03, 0.02, 1.06), CHROME, s * 0.73, 1.44, -0.25);   // rain gutters
  const wsA = -Math.atan2(0.44, 0.54), rwA = Math.atan2(0.44, 0.52);
  add(B(1.34, 0.72, 0.02), GLASS, 0, 1.13, 0.5, wsA, 0, 0);                            // windscreen (top leans back)
  add(B(1.34, 0.7, 0.02), GLASS, 0, 1.14, -1.0, rwA, 0, 0);                            // rear glass
  for (const s of [-1, 1]) {
    add(B(0.06, 0.74, 0.08), PAINT, s * 0.7, 1.13, 0.5, wsA, 0, 0);                    // A pillar
    add(B(0.06, 0.72, 0.08), PAINT, s * 0.7, 1.14, -1.0, rwA, 0, 0);                   // C pillar
    add(B(0.05, 0.5, 0.06), PAINT, s * 0.72, 1.13, -0.42);                             // B pillar
    add(B(0.02, 0.44, 0.62), GLASS, s * 0.72, 1.13, -0.08);                            // front door glass
    add(B(0.02, 0.44, 0.52), GLASS, s * 0.72, 1.13, -0.74);                            // rear door glass
    add(B(0.05, 0.03, 1.5), PAINT, s * 0.73, 0.9, -0.3);                               // belt line
    add(B(0.04, 0.05, 0.05), GRILL, s * 0.76, 0.98, 0.62);                             // mirror stalk
    add(B(0.14, 0.09, 0.05), s > 0 ? PAINT : RUSTD, s * 0.8, 1.0, 0.6);              // mirror head
  }
  // ---- front: grille, headlights, bumper -------------------------------------------
  add(B(1.56, 0.26, 0.08), PAINT, 0, 0.64, 2.08);
  add(B(1.0, 0.22, 0.04), GRILL, 0, 0.63, 2.12);
  for (let i = 0; i < 5; i++) add(B(1.0, 0.015, 0.02), CHROME, 0, 0.55 + i * 0.04, 2.135);
  for (const s of [-1, 1]) {
    add(new THREE.TorusGeometry(0.1, 0.012, 6, 16), CHROME, s * 0.58, 0.64, 2.125);
    add(CYL(0.09, 0.09, 0.03, 16), HEAD, s * 0.58, 0.64, 2.125, Math.PI / 2, 0, 0);
    lights.push({ x: s * 0.58, y: 0.64, z: 2.3, color: 0xf1d899, intensity: 1.0, range: 6 });
    add(B(0.12, 0.08, 0.02), AMBER, s * 0.7, 0.48, 2.13);                              // indicator
    add(B(0.3, 0.14, 0.02), TAIL, s * 0.6, 0.64, -2.11);                               // tail lights
    lights.push({ x: s * 0.6, y: 0.64, z: -2.25, color: 0xb8302a, intensity: 0.5, range: 3 });
    add(B(0.34, 0.18, 0.02), CHROME, s * 0.6, 0.64, -2.1);
    add(B(0.06, 0.16, 0.08), RUB, s * 0.7, 0.42, 2.2); add(B(0.06, 0.16, 0.08), RUB, s * 0.7, 0.42, -2.2);   // bumper end caps
  }
  add(B(1.66, 0.12, 0.1), CHROME, 0, 0.42, 2.19);                                       // front bumper
  add(B(1.66, 0.12, 0.1), CHROME, 0, 0.42, -2.19);                                      // rear bumper
  add(B(0.44, 0.22, 0.03), PLATE, 0, 0.62, 2.14); add(B(0.36, 0.18, 0.03), PLATE, 0, 0.44, -2.22);   // plain plates
  add(B(1.0, 0.05, 0.04), RUSTD, 0, 0.35, 2.21);                                        // rust under bumper
  add(CYL(0.025, 0.025, 0.3, 8), RUSTD, -0.5, 0.24, -2.1, 0, 0, 0);                    // exhaust
  add(CYL(0.005, 0.005, 0.5, 4), CHROME, -0.6, 1.1, 0.85);                             // aerial
  // ---- wheels ----------------------------------------------------------------------
  const wheel = (x, z) => {
    add(CYL(0.29, 0.29, 0.18, 18), RUB, x, 0.29, z, 0, 0, Math.PI / 2);
    add(CYL(0.19, 0.19, 0.19, 14), STEELW, x, 0.29, z, 0, 0, Math.PI / 2);
    add(CYL(0.07, 0.07, 0.2, 10), CHROME, x, 0.29, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; add(CYL(0.015, 0.015, 0.2, 5), GRILL, x, 0.29 + Math.cos(a) * 0.12, z + Math.sin(a) * 0.12, 0, 0, Math.PI / 2); }
  };
  for (const s of [-1, 1]) { wheel(s * 0.72, 1.4); wheel(s * 0.72, -1.35); }
  add(B(1.3, 0.3, 3.0), RUB, 0, 0.3, 0);                                                // underbody
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
