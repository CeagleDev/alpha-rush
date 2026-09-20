// bicycle_parked — arm C: a different reading. Heavier utility frame with twin parallel top tubes,
// a deeper basket with diagonal bracing wires, sprung saddle on coil springs, rack with bungee
// loops, a chain lock hanging off the rack, spokes in two crossed sets, kickstand lean to +X.
// Front +Z. 0.6 x 1.05 x 1.8.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const bike = new THREE.Group(); g.add(bike);
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || bike).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  // a straight tube between two points [x,y,z]
  const bar = (a, b, r, mat, s) => {
    const A = V3(a), Bv = V3(b), d = new THREE.Vector3().subVectors(Bv, A), L = d.length();
    const m = new THREE.Mesh(CYL(r, r, L, s || 7), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    bike.add(m); return m;
  };
  const FRAME = M(0x4f5a6a, 'metal', 0.8, 0.2);
  const FRAME2 = M(0x5a6472, 'metal', 0.8, 0.2);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const CHROME = M(0x8a8d90, 'metal', 0.5, 0.3);
  const WIRE = M(0x9a9ea3, 'metal', 0.6, 0.3);
  const RUB = M(0x110f12, 'metal', 0.95, 0);
  const LEATHER = M(0x6c4028, 'fabric', 0.85);
  const ROPE = M(0xbfae8a, 'fabric', 0.95);
  const GUARD = M(0x8b6141, 'metal', 0.9, 0.1);
  const wheel = (z, rust) => {
    const w = new THREE.Group(); w.position.set(0, 0.33, z); w.rotation.y = Math.PI / 2; bike.add(w);
    add(new THREE.TorusGeometry(0.31, 0.024, 6, 24), RUB, 0, 0, 0, 0, 0, 0, w);
    add(new THREE.TorusGeometry(0.285, 0.011, 5, 24), rust ? RUST : CHROME, 0, 0, 0, 0, 0, 0, w);
    add(CYL(0.032, 0.032, 0.09, 8), RUST, 0, 0, 0, Math.PI / 2, 0, 0, w);
    for (let i = 0; i < 10; i++) { add(CYL(0.003, 0.003, 0.55, 4, true), WIRE, 0.02, 0, 0, 0, 0, (i / 10) * Math.PI + 0.15, w); add(CYL(0.003, 0.003, 0.55, 4, true), WIRE, -0.02, 0, 0, 0, 0, (i / 10) * Math.PI - 0.15, w); }
  };
  wheel(0.53, false); wheel(-0.52, true);
  // ---- frame: twin top tubes, straight down tube, tall head -------------------------------
  const RA = [0, 0.33, -0.52], BB = [0, 0.3, -0.1], SC = [0, 0.86, -0.22], HB = [0, 0.6, 0.43], HT = [0, 0.94, 0.34];
  bar(HB, BB, 0.017, FRAME);
  for (const s of [-1, 1]) bar([s * 0.02, 0.9, 0.35], [s * 0.02, 0.62, -0.2], 0.011, FRAME2);        // twin top tubes
  bar(BB, SC, 0.016, FRAME); bar(HB, HT, 0.023, FRAME);
  for (const s of [-1, 1]) {
    bar([s * 0.045, 0.3, -0.1], RA.map((q, i) => i === 0 ? s * 0.045 : q), 0.01, FRAME);
    bar([s * 0.04, 0.86, -0.22], [s * 0.045, 0.33, -0.52], 0.01, FRAME2);
    bar([s * 0.04, 0.6, 0.43], [s * 0.045, 0.33, 0.53], 0.011, FRAME);
    add(B(0.02, 0.05, 0.02), RUST, s * 0.05, 0.33, -0.52);
  }
  add(CYL(0.02, 0.02, 0.09, 8), RUST, 0, 0.3, -0.1, 0, 0, Math.PI / 2);
  add(CYL(0.03, 0.03, 0.06, 8), RUST, 0, 0.58, 0.43);
  add(CYL(0.02, 0.02, 0.14, 6), RUST, 0, 0.42, 0.12, 0.72, 0, 0);                                  // rust run on the down tube
  add(CYL(0.019, 0.019, 0.1, 6), RUST, 0, 0.7, -0.17, 0, 0, 0);
  // ---- steering: upright bars, grips, bell -----------------------------------------------------
  bar(HT, [0, 1.02, 0.33], 0.012, CHROME); bar([0, 1.02, 0.33], [0, 1.02, 0.26], 0.012, CHROME);
  for (const s of [-1, 1]) {
    bar([0, 1.02, 0.26], [s * 0.22, 1.03, 0.3], 0.011, CHROME); bar([s * 0.22, 1.03, 0.3], [s * 0.26, 1.03, 0.2], 0.011, CHROME);
    add(CYL(0.016, 0.016, 0.11, 7), RUB, s * 0.245, 1.03, 0.245, 0, -s * 1.1, 0);
    bar([s * 0.19, 1.025, 0.31], [s * 0.14, 0.99, 0.38], 0.005, CHROME, 5);
  }
  add(CYL(0.022, 0.022, 0.015, 8), RUST, -0.1, 1.04, 0.28);
  // ---- sprung saddle ---------------------------------------------------------------------------------
  bar(SC, [0, 0.96, -0.25], 0.012, CHROME);
  add(B(0.17, 0.05, 0.22), LEATHER, 0, 1.02, -0.3);
  const nose = add(new THREE.SphereGeometry(0.05, 8, 6), LEATHER, 0, 1.01, -0.18); nose.scale.set(0.9, 0.7, 1.6);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.02, 0.005, 4, 8), CHROME, s * 0.06, 0.965 + i * 0.012, -0.38, Math.PI / 2, 0, 0);
  // ---- mudguards with a mud flap --------------------------------------------------------------------------
  add(new THREE.TorusGeometry(0.34, 0.018, 4, 18, Math.PI * 1.0), RUST, 0, 0.33, 0.53, 0, Math.PI / 2, -0.05);
  add(new THREE.TorusGeometry(0.34, 0.018, 4, 18, Math.PI * 1.25), RUST, 0, 0.33, -0.52, 0, Math.PI / 2, -0.3);
  add(B(0.06, 0.08, 0.01), RUB, 0, 0.26, 0.86);
  add(B(0.03, 0.05, 0.02), RUB, 0, 0.62, -0.87);
  // ---- drive ---------------------------------------------------------------------------------------------
  add(B(0.015, 0.16, 0.48), RUSTD, 0.055, 0.32, -0.31, 0.06, 0, 0);
  add(B(0.012, 0.06, 0.4), GUARD, 0.065, 0.36, -0.28, 0.06, 0, 0);
  add(CYL(0.09, 0.09, 0.008, 16), RUST, 0.06, 0.3, -0.1, 0, 0, Math.PI / 2);
  add(CYL(0.04, 0.04, 0.02, 10), RUST, 0.05, 0.33, -0.52, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) { add(B(0.015, 0.17, 0.03), CHROME, s * 0.08, 0.3 - s * 0.07, -0.1 - s * 0.04, -0.5, 0, 0); add(B(0.06, 0.02, 0.08), RUB, s * 0.13, 0.3 - s * 0.15, -0.1 - s * 0.08); }
  // ---- rack with bungee loops and a hanging chain lock ---------------------------------------------------------
  for (const s of [-1, 1]) { add(B(0.012, 0.012, 0.38), CHROME, s * 0.08, 0.74, -0.58); bar([s * 0.08, 0.74, -0.42], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5); bar([s * 0.08, 0.74, -0.76], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5); }
  for (let i = 0; i < 5; i++) add(B(0.17, 0.01, 0.012), CHROME, 0, 0.74, -0.42 - i * 0.085);
  add(new THREE.TorusGeometry(0.07, 0.008, 4, 12, Math.PI), M(0x40559f, 'fabric', 0.9), 0, 0.74, -0.55, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.07, 0.008, 4, 12, Math.PI), M(0x40559f, 'fabric', 0.9), 0, 0.74, -0.68, 0, Math.PI / 2, 0);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.02, 0.006, 4, 8), RUSTD, 0.09, 0.66 - i * 0.03, -0.6, 0, i % 2 ? Math.PI / 2 : 0, 0);
  // ---- deep basket with diagonal braces ---------------------------------------------------------------------------
  const bw = 0.36, bd = 0.3, by0 = 0.68, by1 = 0.97, bz = 0.67;
  for (const y of [by0, by1]) { add(B(bw, 0.008, 0.008), WIRE, 0, y, bz + bd / 2); add(B(bw, 0.008, 0.008), WIRE, 0, y, bz - bd / 2); add(B(0.008, 0.008, bd), WIRE, bw / 2, y, bz); add(B(0.008, 0.008, bd), WIRE, -bw / 2, y, bz); }
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(B(0.008, by1 - by0, 0.008), WIRE, s * bw / 2, (by0 + by1) / 2, bz + t * bd / 2);
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(B(0.005, 0.41, 0.005), WIRE, s * bw / 2, (by0 + by1) / 2, bz, s * t * 0.8, 0, 0);          // diagonal braces on the sides
  for (const t of [-1, 1]) add(B(0.005, 0.46, 0.005), WIRE, 0, (by0 + by1) / 2, bz + t * bd / 2, 0, 0, t * 0.9);                               // diagonal on front/back
  for (let i = 1; i < 3; i++) { const y = by0 + i * 0.1; add(B(bw, 0.005, 0.005), WIRE, 0, y, bz + bd / 2); add(B(bw, 0.005, 0.005), WIRE, 0, y, bz - bd / 2); add(B(0.005, 0.005, bd), WIRE, bw / 2, y, bz); add(B(0.005, 0.005, bd), WIRE, -bw / 2, y, bz); }
  for (let i = 1; i < 4; i++) add(B(bw, 0.005, 0.005), WIRE, 0, by0, bz - bd / 2 + i * bd / 4);
  bar([0, 0.68, 0.52], [0, 0.6, 0.44], 0.006, CHROME, 5); bar([0, 0.97, 0.52], [0, 0.97, 0.33], 0.006, CHROME, 5);
  // ---- lamp on the mudguard, bottle dynamo ------------------------------------------------------------------------
  add(CYL(0.035, 0.03, 0.09, 10), CHROME, 0, 0.7, 0.62, Math.PI / 2, 0, 0);
  add(CYL(0.032, 0.032, 0.01, 10), M(0xd8ae70, 'metal', 0.4, 0.2), 0, 0.7, 0.67, Math.PI / 2, 0, 0);
  bar([0, 0.66, 0.6], [0, 0.6, 0.55], 0.005, CHROME, 5);
  add(CYL(0.018, 0.018, 0.08, 8), RUST, -0.06, 0.5, 0.5, 0.5, 0, 0);
  // ---- kickstand on +X, lean to +X ------------------------------------------------------------------------------------
  bar([0.04, 0.3, -0.16], [0.16, 0.0, -0.3], 0.008, RUSTD);
  bike.rotation.z = -0.1;
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = [];
  return g;
}
