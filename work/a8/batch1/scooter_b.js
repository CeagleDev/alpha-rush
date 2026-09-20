// scooter — arm B: profiles. The leg shield and body spine are one side-elevation Shape extruded
// across X, the cargo box is a rounded-rect profile swept along X, tyres/rims/headlamp/engine barrel
// are lathes, the mudguards are partial lathes and the fork is a tube on a curve. Front +Z.
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
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 6, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  // profile drawn in (u = world z, v = world y) and swept along X
  const sweepX = (shape, width, mat, cs) => add(ex(shape, width, cs), mat, 0, 0, 0, 0, -Math.PI / 2, 0);
  const tube = (pts, r, mat, seg) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), seg || 8, r, 6, false), mat, 0, 0, 0);
  // ---- wheels: lathed tyre + rim ---------------------------------------------------------
  const tyre = new THREE.LatheGeometry(V2([[0.15, -0.045], [0.2, -0.05], [0.23, -0.028], [0.23, 0.028], [0.2, 0.05], [0.15, 0.045]]), 14);
  const rimG = new THREE.LatheGeometry(V2([[0.05, -0.04], [0.09, -0.045], [0.155, -0.035], [0.155, 0.035], [0.09, 0.045], [0.05, 0.04]]), 12);
  const wheel = (z) => {
    const w = new THREE.Group(); w.position.set(0, 0.23, z); w.rotation.z = Math.PI / 2; g.add(w);
    add(tyre, RUB, 0, 0, 0, 0, 0, 0, w); add(rimG, CHROME, 0, 0, 0, 0, 0, 0, w);
    add(CYL(0.05, 0.05, 0.11, 8), ENG, 0, 0, 0, 0, 0, 0, w);
    for (let i = 0; i < 9; i++) add(CYL(0.0035, 0.0035, 0.3, 4, true), WIRE, 0, 0, 0, (i / 9) * Math.PI, 0, Math.PI / 2, w);
  };
  wheel(0.62); wheel(-0.6);
  // ---- body: one side elevation (leg shield -> floor -> spine -> seat base) ----------------
  const side = new THREE.Shape();
  side.moveTo(0.58, 0.32); side.lineTo(0.62, 0.52); side.lineTo(0.6, 0.78); side.lineTo(0.46, 0.82);
  side.lineTo(0.4, 0.56); side.lineTo(0.36, 0.34); side.lineTo(-0.02, 0.3); side.lineTo(-0.06, 0.42);
  side.lineTo(-0.1, 0.62); side.lineTo(-0.42, 0.68); side.lineTo(-0.52, 0.6); side.lineTo(-0.5, 0.42);
  side.lineTo(-0.2, 0.3); side.lineTo(0.3, 0.28); side.closePath();
  sweepX(side, 0.3, BLUE);
  sweepX(new THREE.Shape([new THREE.Vector2(0.62, 0.54), new THREE.Vector2(0.6, 0.78), new THREE.Vector2(0.47, 0.8), new THREE.Vector2(0.42, 0.56)]), 0.33, CREAM);  // cream shield face
  sweepX(new THREE.Shape([new THREE.Vector2(-0.1, 0.42), new THREE.Vector2(-0.4, 0.5), new THREE.Vector2(-0.42, 0.34), new THREE.Vector2(-0.12, 0.3)]), 0.34, CREAMD); // cream side panel
  add(B(0.36, 0.04, 0.5), CREAMD, 0, 0.32, 0.14);                                            // floorboard tread
  for (let i = 0; i < 5; i++) add(B(0.34, 0.012, 0.02), RUSTD, 0, 0.345, -0.02 + i * 0.09);
  add(B(0.22, 0.12, 0.04), RUST, 0.08, 0.46, 0.6, 0.15, 0, 0);                                 // rust on the shield
  add(B(0.3, 0.1, 0.44), SEAT, 0, 0.76, -0.28);                                                // saddle
  add(B(0.32, 0.04, 0.46), RUB, 0, 0.71, -0.28);
  add(CYL(0.035, 0.035, 0.05, 8), CHROME, 0, 0.7, -0.04);
  // ---- fork, mudguards, stem --------------------------------------------------------------------
  for (const s of [-1, 1]) tube([[s * 0.065, 0.23, 0.62], [s * 0.06, 0.45, 0.58], [s * 0.055, 0.68, 0.5]], 0.018, CHROME, 6);
  add(CYL(0.03, 0.03, 0.24, 8), CHROME, 0, 0.72, 0.48, 0.25, 0, 0);
  const mg = new THREE.LatheGeometry(V2([[0.25, -0.05], [0.27, -0.035], [0.27, 0.035], [0.25, 0.05]]), 14, 0, Math.PI * 0.85);
  const guardAt = (z, roll, mat) => { const w = new THREE.Group(); w.position.set(0, 0.23, z); w.rotation.z = Math.PI / 2; g.add(w);
    const m = new THREE.Mesh(mg, mat); m.rotation.y = roll; w.add(m); return m; };
  guardAt(0.62, Math.PI * 0.72, BLUE); guardAt(-0.6, Math.PI * 1.0, BLUED);
  // ---- engine: lathed barrel with fins, exhaust ---------------------------------------------------
  add(B(0.22, 0.18, 0.26), ENG, 0.02, 0.33, -0.3);
  const barrel = new THREE.LatheGeometry(V2([[0, 0], [0.06, 0.0], [0.06, 0.02], [0.085, 0.03], [0.06, 0.04], [0.06, 0.06], [0.085, 0.07], [0.06, 0.08], [0.06, 0.1], [0.085, 0.11], [0.06, 0.12], [0.05, 0.16], [0, 0.16]]), 10);
  add(barrel, ENG, 0.02, 0.4, -0.22, 1.0, 0, 0);
  add(CYL(0.035, 0.035, 0.46, 8), RUSTD, 0.15, 0.24, -0.36, 0.08, 0.22, 0);
  add(new THREE.LatheGeometry(V2([[0, 0], [0.05, 0.01], [0.05, 0.14], [0.03, 0.15], [0, 0.15]]), 10), RUST, 0.19, 0.26, -0.66, Math.PI / 2 + 0.08, 0.22, 0);
  for (const s of [-1, 1]) { add(B(0.04, 0.03, 0.12), ENG, s * 0.19, 0.33, -0.16); add(B(0.1, 0.03, 0.12), RUB, s * 0.25, 0.33, -0.16); }
  bar([-0.1, 0.28, -0.34], [-0.2, 0.0, -0.44], 0.014, RUSTD);
  add(B(0.07, 0.02, 0.1), RUSTD, -0.2, 0.012, -0.44);
  // ---- handlebar and headlamp (lathed shell) ---------------------------------------------------------
  add(B(0.22, 0.13, 0.13), BLUE, 0, 0.88, 0.44);
  const shell = new THREE.LatheGeometry(V2([[0, 0], [0.055, 0.0], [0.085, 0.03], [0.09, 0.07], [0.082, 0.085], [0, 0.085]]), 12);
  add(shell, CHROME, 0, 0.82, 0.48, Math.PI / 2, 0, 0);
  add(CYL(0.078, 0.078, 0.015, 12), HEAD, 0, 0.82, 0.572, Math.PI / 2, 0, 0);
  lights.push({ x: 0, y: 0.82, z: 0.7, color: 0xf1d899, intensity: 0.9, range: 6 });
  tube([[-0.28, 0.93, 0.36], [-0.14, 0.92, 0.42], [0, 0.92, 0.43], [0.14, 0.92, 0.42], [0.28, 0.93, 0.36]], 0.014, CHROME, 12);
  for (const s of [-1, 1]) {
    add(CYL(0.016, 0.016, 0.1, 7), RUB, s * 0.29, 0.93, 0.35, 0, -s * 0.55, 0);
    bar([s * 0.15, 0.93, 0.41], [s * 0.17, 1.02, 0.36], 0.008, CHROME, 5);
    add(B(0.1, 0.07, 0.015), CHROME, s * 0.18, 1.05, 0.35, 0, s * 0.35, 0);
    add(new THREE.LatheGeometry(V2([[0, 0], [0.028, 0.005], [0.03, 0.035], [0.02, 0.045], [0, 0.045]]), 8), AMBER, s * 0.17, 0.86, 0.5, Math.PI / 2, 0, 0);
  }
  // ---- cargo box: rounded-rect profile swept along X ------------------------------------------------------
  const boxP = new THREE.Shape();
  boxP.moveTo(-0.16, 0.74); boxP.lineTo(0.16, 0.74); boxP.lineTo(0.18, 0.78); boxP.lineTo(0.18, 1.0);
  boxP.lineTo(0.14, 1.04); boxP.lineTo(-0.14, 1.04); boxP.lineTo(-0.18, 1.0); boxP.lineTo(-0.18, 0.78); boxP.closePath();
  add(ex(boxP, 0.4), CREAM, 0, 0, -0.62);
  add(B(0.42, 0.04, 0.38), CREAMD, 0, 1.03, -0.62);
  add(B(0.43, 0.025, 0.36), RUSTD, 0, 0.99, -0.62);
  for (const s of [-1, 1]) { add(B(0.02, 0.22, 0.05), RUST, s * 0.2, 0.88, -0.5); add(B(0.05, 0.04, 0.03), CHROME, s * 0.1, 0.87, -0.81); }
  add(B(0.24, 0.1, 0.03), CREAMD, 0, 0.85, -0.81);
  for (const s of [-1, 1]) { bar([s * 0.12, 0.74, -0.48], [s * 0.1, 0.5, -0.62], 0.012, CHROME); add(B(0.02, 0.02, 0.3), CHROME, s * 0.14, 0.73, -0.62); }
  add(B(0.14, 0.07, 0.02), TAIL, 0, 0.73, -0.8);
  lights.push({ x: 0, y: 0.73, z: -0.88, color: 0xb8302a, intensity: 0.4, range: 2.5 });
  // ---- front basket: rounded-rect wire rims and a few bars --------------------------------------------------
  const rim = (y) => tube([[-0.15, y, 0.66], [-0.15, y, 0.9], [0.15, y, 0.9], [0.15, y, 0.66], [-0.15, y, 0.66]], 0.006, WIRE, 14);
  rim(0.56); rim(0.78);
  for (const s of [-1, 1]) for (const t of [0.66, 0.9]) add(B(0.008, 0.22, 0.008), WIRE, s * 0.15, 0.67, t);
  for (let i = 1; i < 3; i++) { const y = 0.56 + i * 0.073; add(B(0.3, 0.005, 0.005), WIRE, 0, y, 0.9); add(B(0.005, 0.005, 0.24), WIRE, 0.15, y, 0.78); add(B(0.005, 0.005, 0.24), WIRE, -0.15, y, 0.78); }
  for (let i = 1; i < 4; i++) add(B(0.005, 0.22, 0.005), WIRE, -0.15 + i * 0.075, 0.67, 0.9);
  for (let i = 1; i < 3; i++) add(B(0.3, 0.005, 0.005), WIRE, 0, 0.56, 0.66 + i * 0.08);
  bar([0, 0.56, 0.68], [0, 0.62, 0.5], 0.007, CHROME, 5); bar([0, 0.78, 0.68], [0, 0.84, 0.48], 0.007, CHROME, 5);
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
