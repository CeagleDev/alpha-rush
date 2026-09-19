// parked_sedan — arm B: profiles. The lower body is the side elevation drawn as a Shape (wheel
// arches as arcs) extruded across X; the glasshouse is a second, narrower extrusion in dark glass
// with the pillars laid on as strips; bumpers are rounded-rect profiles swept along X; tyres and
// headlights are lathes. Front +Z. 1.7 x 1.5 x 4.4.
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
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 8, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  // a profile drawn in (u = world z, v = world y), swept along X: rotation.y = -PI/2 sends local +x to world +z
  const sweepX = (shape, width, mat, y, cs) => add(ex(shape, width, cs), mat, 0, y || 0, 0, 0, -Math.PI / 2, 0);
  // ---- lower body: side elevation with wheel arches --------------------------------
  const body = new THREE.Shape();
  body.moveTo(-2.15, 0.31); body.lineTo(-1.7, 0.31);
  body.absarc(-1.35, 0.31, 0.35, Math.PI, 0, true);
  body.lineTo(1.05, 0.31);
  body.absarc(1.4, 0.31, 0.35, Math.PI, 0, true);
  body.lineTo(2.15, 0.31); body.lineTo(2.2, 0.5); body.lineTo(2.17, 0.78); body.lineTo(0.78, 0.86); body.lineTo(0.72, 0.9);
  body.lineTo(-1.18, 0.9); body.lineTo(-1.24, 0.86); body.lineTo(-2.12, 0.84); body.lineTo(-2.2, 0.6); body.closePath();
  sweepX(body, 1.62, PAINT);
  // rust sill strip and grounding band as slim extrusions under the sills
  sweepX(new THREE.Shape([new THREE.Vector2(-1.55, 0.28), new THREE.Vector2(1.0, 0.28), new THREE.Vector2(1.0, 0.4), new THREE.Vector2(-1.55, 0.4)]), 1.65, RUST);
  sweepX(new THREE.Shape([new THREE.Vector2(-1.6, 0.24), new THREE.Vector2(1.05, 0.24), new THREE.Vector2(1.05, 0.3), new THREE.Vector2(-1.6, 0.3)]), 1.66, RUB);
  add(B(1.3, 0.24, 3.4), RUB, 0, 0.32, 0);                                              // underbody
  // ---- glasshouse: profile in dark glass, pillars and belt as strips -------------------
  const cab = new THREE.Shape([new THREE.Vector2(0.74, 0.88), new THREE.Vector2(0.28, 1.4), new THREE.Vector2(-0.76, 1.42), new THREE.Vector2(-1.22, 0.88)]);
  sweepX(cab, 1.42, GLASS);
  add(B(1.34, 0.4, 1.9), DARKI, 0, 1.08, -0.24);                                        // interior mass behind the glass
  add(new THREE.TorusGeometry(0.17, 0.02, 6, 14), GRILL, 0.42, 1.1, 0.35, -0.5, 0, 0);
  add(B(1.42, 0.06, 1.06), VINYL, 0, 1.44, -0.24);                                       // vinyl roof cap
  add(B(0.3, 0.02, 0.24), RUSTD, -0.45, 1.47, 0.1);                                      // peeled vinyl patch
  for (const s of [-1, 1]) add(B(0.03, 0.02, 1.08), CHROME, s * 0.72, 1.45, -0.24);
  const wsA = -Math.atan2(0.46, 0.52), rwA = Math.atan2(0.46, 0.54);
  for (const s of [-1, 1]) {
    add(B(0.06, 0.72, 0.07), PAINT, s * 0.69, 1.14, 0.51, wsA, 0, 0);                    // A pillar
    add(B(0.06, 0.74, 0.07), PAINT, s * 0.69, 1.15, -0.99, rwA, 0, 0);                   // C pillar
    add(B(0.05, 0.52, 0.06), PAINT, s * 0.715, 1.13, -0.42);                             // B pillar
    add(B(0.05, 0.04, 1.6), PAINT, s * 0.715, 0.9, -0.28);                               // belt
    add(B(0.02, 0.44, 0.04), GRILL, s * 0.735, 0.62, -0.42); add(B(0.02, 0.44, 0.04), GRILL, s * 0.735, 0.62, 0.5); add(B(0.02, 0.44, 0.04), GRILL, s * 0.735, 0.62, -1.24);  // door seams
    add(B(0.02, 0.32, 0.86), s < 0 ? FADED : PAINT, s * 0.815, 0.62, -0.85);            // one faded rear door
    add(B(0.02, 0.03, 0.12), CHROME, s * 0.825, 0.74, -0.25); add(B(0.02, 0.03, 0.12), CHROME, s * 0.825, 0.74, -1.08);
    add(B(0.02, 0.02, 3.5), CHROME, s * 0.815, 0.52, 0);
    add(B(0.03, 0.16, 0.5), RUST, s * 0.815, 0.44, 1.75);                                 // rust on front wing
    add(B(0.03, 0.2, 0.34), RUSTD, s * 0.815, 0.42, -1.75);
    add(B(0.04, 0.05, 0.05), GRILL, s * 0.75, 0.98, 0.64);
    add(B(0.14, 0.09, 0.05), s > 0 ? RUSTD : PAINT, s * 0.79, 1.0, 0.62);                // mirrors
  }
  add(B(0.02, 0.005, 1.3), RUSTD, 0.32, 0.86, 1.45, 0.055, 0, 0); add(B(0.02, 0.005, 1.3), RUSTD, -0.32, 0.86, 1.45, 0.055, 0, 0);  // bonnet creases
  add(B(1.5, 0.01, 0.06), GRILL, 0, 0.865, 0.76);                                          // bonnet shut line
  add(B(1.5, 0.01, 0.06), GRILL, 0, 0.865, -1.2);                                          // boot shut line
  for (const s of [-1, 1]) add(B(0.02, 0.01, 0.4), GRILL, s * 0.2, 0.9, 0.72, 0, s * 0.4, 0);
  // ---- bumpers: rounded-rect profile swept along X ---------------------------------------
  const bump = new THREE.Shape(); bump.absarc(0, 0, 0.06, 0, Math.PI * 2, false);
  const bumpGeo = ex(bump, 1.66, 6);
  const bumpFlat = (z) => { add(bumpGeo, CHROME, 0, 0.42, z, 0, Math.PI / 2, 0); add(B(1.66, 0.06, 0.12), CHROME, 0, 0.42, z); };
  bumpFlat(2.19); bumpFlat(-2.19);
  for (const s of [-1, 1]) { add(B(0.08, 0.16, 0.1), RUB, s * 0.72, 0.42, 2.2); add(B(0.08, 0.16, 0.1), RUB, s * 0.72, 0.42, -2.2); }
  // ---- front fascia -----------------------------------------------------------------------
  add(B(1.0, 0.22, 0.04), GRILL, 0, 0.63, 2.2);
  for (let i = 0; i < 5; i++) add(B(1.0, 0.015, 0.02), CHROME, 0, 0.55 + i * 0.04, 2.215);
  const lampGeo = new THREE.LatheGeometry(V2([[0, 0], [0.085, 0], [0.09, 0.02], [0.1, 0.02], [0.105, 0.035], [0.1, 0.045]]), 16);
  for (const s of [-1, 1]) {
    add(lampGeo, CHROME, s * 0.58, 0.64, 2.17, Math.PI / 2, 0, 0);
    add(CYL(0.085, 0.085, 0.02, 16), HEAD, s * 0.58, 0.64, 2.2, Math.PI / 2, 0, 0);
    lights.push({ x: s * 0.58, y: 0.64, z: 2.35, color: 0xf1d899, intensity: 1.0, range: 6 });
    add(B(0.12, 0.08, 0.02), AMBER, s * 0.7, 0.48, 2.2);
    add(B(0.34, 0.18, 0.02), CHROME, s * 0.6, 0.64, -2.19);
    add(B(0.3, 0.14, 0.02), TAIL, s * 0.6, 0.64, -2.2);
    lights.push({ x: s * 0.6, y: 0.64, z: -2.35, color: 0xb8302a, intensity: 0.5, range: 3 });
  }
  add(B(0.44, 0.22, 0.03), PLATE, 0, 0.62, 2.21); add(B(0.36, 0.18, 0.03), PLATE, 0, 0.44, -2.23);
  add(B(0.6, 0.3, 0.02), RUST, -0.3, 0.5, -2.2);
  add(CYL(0.025, 0.025, 0.3, 8), RUSTD, -0.5, 0.26, -2.1);
  add(CYL(0.005, 0.005, 0.5, 4), CHROME, -0.6, 1.12, 0.85);
  // ---- wheels: lathed tyre + dished steel rim --------------------------------------------
  const tyre = new THREE.LatheGeometry(V2([[0.19, -0.09], [0.27, -0.09], [0.29, -0.05], [0.29, 0.05], [0.27, 0.09], [0.19, 0.09]]), 18);
  const rim = new THREE.LatheGeometry(V2([[0, 0.03], [0.07, 0.04], [0.09, 0.0], [0.16, 0.0], [0.19, 0.06], [0.19, -0.09], [0.0, -0.09]]), 14);
  const wheel = (x, z) => {
    add(tyre, RUB, x, 0.29, z, 0, 0, Math.PI / 2);
    add(rim, STEELW, x, 0.29, z, 0, 0, Math.sign(x) * Math.PI / 2);
    add(CYL(0.06, 0.06, 0.04, 10), CHROME, x + Math.sign(x) * 0.08, 0.29, z, 0, 0, Math.PI / 2);
  };
  for (const s of [-1, 1]) { wheel(s * 0.72, 1.4); wheel(s * 0.72, -1.35); }
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
