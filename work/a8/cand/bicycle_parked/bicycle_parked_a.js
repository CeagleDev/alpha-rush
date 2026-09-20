// bicycle_parked — arm A: primitives. Straight cylinder tubes between frame points, torus tyres
// and rims with cylinder spokes, a wire basket from thin boxes, box rack, box chain guard,
// dynamo lamp, single-leg kickstand with the bike leaning onto it. Front +Z. 0.6 x 1.05 x 1.8.
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
  // ---- wheels (axle along X) ----------------------------------------------------
  const wheel = (z) => {
    const w = new THREE.Group(); w.position.set(0, 0.33, z); w.rotation.y = Math.PI / 2; bike.add(w);
    add(new THREE.TorusGeometry(0.31, 0.022, 6, 24), RUB, 0, 0, 0, 0, 0, 0, w);
    add(new THREE.TorusGeometry(0.285, 0.011, 5, 24), CHROME, 0, 0, 0, 0, 0, 0, w);
    add(CYL(0.03, 0.03, 0.08, 8), RUST, 0, 0, 0, Math.PI / 2, 0, 0, w);
    for (let i = 0; i < 16; i++) add(CYL(0.003, 0.003, 0.56, 4, true), WIRE, 0, 0, 0, 0, 0, (i / 16) * Math.PI, w);
  };
  wheel(0.53); wheel(-0.52);
  // ---- frame: straight tubes ------------------------------------------------------
  const RA = [0, 0.33, -0.52], FA = [0, 0.33, 0.53], BB = [0, 0.3, -0.1], SC = [0, 0.85, -0.22], HB = [0, 0.62, 0.42], HT = [0, 0.9, 0.35];
  bar(HB, [0, 0.4, 0.15], 0.016, FRAME); bar([0, 0.4, 0.15], BB, 0.016, FRAME);                // step-through down tube (two straights)
  bar(HT, [0, 0.72, 0.1], 0.014, FRAME2); bar([0, 0.72, 0.1], [0, 0.6, -0.19], 0.014, FRAME2); // upper tube
  bar(BB, SC, 0.016, FRAME);                                                                    // seat tube
  bar(HB, HT, 0.022, FRAME);                                                                    // head tube
  for (const s of [-1, 1]) {
    bar([s * 0.045, 0.3, -0.1], [s * 0.045, 0.33, -0.52], 0.01, FRAME);                        // chainstays
    bar([s * 0.04, 0.85, -0.22], [s * 0.045, 0.33, -0.52], 0.01, FRAME2);                      // seat stays
    bar([s * 0.04, 0.62, 0.42], [s * 0.045, 0.33, 0.53], 0.011, FRAME);                        // fork legs
    add(B(0.02, 0.05, 0.02), RUST, s * 0.05, 0.33, -0.52);                                     // dropouts
  }
  add(CYL(0.02, 0.02, 0.09, 8), RUST, 0, 0.3, -0.1, 0, 0, Math.PI / 2);                       // bottom bracket
  add(CYL(0.03, 0.03, 0.06, 8), RUST, 0, 0.6, 0.43);                                          // fork crown
  add(CYL(0.02, 0.02, 0.1, 6), RUST, 0, 0.45, 0.27, 0.6, 0, 0);                                // rust sleeve on the down tube
  add(CYL(0.018, 0.018, 0.08, 6), RUST, 0, 0.55, -0.16, 0.2, 0, 0);
  // ---- steering: stem, swept bar, grips, levers, bell ----------------------------------
  bar(HT, [0, 0.98, 0.33], 0.012, CHROME);
  bar([0, 0.98, 0.33], [0, 0.99, 0.25], 0.012, CHROME);
  for (const s of [-1, 1]) {
    bar([0, 0.99, 0.25], [s * 0.2, 0.99, 0.3], 0.011, CHROME);
    bar([s * 0.2, 0.99, 0.3], [s * 0.27, 0.99, 0.2], 0.011, CHROME);
    add(CYL(0.016, 0.016, 0.11, 7), LEATHER, s * 0.245, 0.99, 0.235, 0, -s * 0.95, 0);          // grips
    bar([s * 0.19, 0.985, 0.31], [s * 0.15, 0.96, 0.38], 0.005, CHROME, 5);                    // brake levers
  }
  add(CYL(0.02, 0.02, 0.015, 8), CHROME, 0.1, 1.0, 0.28);                                       // bell
  // ---- saddle, seat post ---------------------------------------------------------------
  bar(SC, [0, 0.98, -0.25], 0.012, CHROME);
  add(B(0.15, 0.05, 0.25), LEATHER, 0, 1.01, -0.27);
  const nose = add(new THREE.SphereGeometry(0.045, 8, 6), LEATHER, 0, 1.0, -0.15); nose.scale.set(1, 0.7, 1.4);
  for (const s of [-1, 1]) add(CYL(0.02, 0.02, 0.04, 6), CHROME, s * 0.05, 0.965, -0.36);         // springs
  // ---- mudguards (torus arcs) ------------------------------------------------------------
  add(new THREE.TorusGeometry(0.34, 0.018, 4, 18, Math.PI * 1.05), RUST, 0, 0.33, 0.53, 0, Math.PI / 2, -0.1);
  add(new THREE.TorusGeometry(0.34, 0.018, 4, 18, Math.PI * 1.2), RUST, 0, 0.33, -0.52, 0, Math.PI / 2, -0.25);
  add(B(0.03, 0.05, 0.02), RUB, 0, 0.62, -0.87);                                                   // rear reflector
  // ---- chain guard, chainring, cranks, pedals -------------------------------------------------
  add(B(0.015, 0.14, 0.46), GUARD, 0.055, 0.32, -0.31, 0.06, 0, 0);
  add(CYL(0.09, 0.09, 0.008, 16), RUST, 0.06, 0.3, -0.1, 0, 0, Math.PI / 2);
  add(CYL(0.04, 0.04, 0.02, 10), RUST, 0.05, 0.33, -0.52, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    add(B(0.015, 0.17, 0.03), CHROME, s * 0.08, 0.3 + s * 0.07, -0.1 + s * 0.04, 0.5, 0, 0);
    add(B(0.06, 0.02, 0.08), RUB, s * 0.13, 0.3 + s * 0.15, -0.1 + s * 0.08);
  }
  // ---- rear rack with rope ------------------------------------------------------------------
  for (const s of [-1, 1]) {
    add(B(0.012, 0.012, 0.36), CHROME, s * 0.07, 0.74, -0.58);
    bar([s * 0.07, 0.74, -0.42], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5);
    bar([s * 0.07, 0.74, -0.74], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5);
  }
  for (let i = 0; i < 4; i++) add(B(0.15, 0.01, 0.012), CHROME, 0, 0.74, -0.44 - i * 0.09);
  for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.075, 0.006, 4, 10), ROPE, 0, 0.74, -0.48 - i * 0.1, 0, 0, 0);
  // ---- wire basket: rims, corner posts and a few bars (not a mesh) -----------------------------
  const bw = 0.34, bd = 0.32, bx = 0, by0 = 0.72, by1 = 0.96, bz = 0.66;
  for (const y of [by0, by1]) {
    add(B(bw, 0.008, 0.008), WIRE, bx, y, bz + bd / 2); add(B(bw, 0.008, 0.008), WIRE, bx, y, bz - bd / 2);
    add(B(0.008, 0.008, bd), WIRE, bx + bw / 2, y, bz); add(B(0.008, 0.008, bd), WIRE, bx - bw / 2, y, bz);
  }
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(B(0.008, by1 - by0, 0.008), WIRE, bx + s * bw / 2, (by0 + by1) / 2, bz + t * bd / 2);
  for (let i = 1; i < 4; i++) { const y = by0 + i * (by1 - by0) / 4;                                   // horizontal wires
    add(B(bw, 0.005, 0.005), WIRE, bx, y, bz + bd / 2); add(B(bw, 0.005, 0.005), WIRE, bx, y, bz - bd / 2);
    add(B(0.005, 0.005, bd), WIRE, bx + bw / 2, y, bz); add(B(0.005, 0.005, bd), WIRE, bx - bw / 2, y, bz); }
  for (let i = 1; i < 5; i++) add(B(0.005, by1 - by0, 0.005), WIRE, bx - bw / 2 + i * bw / 5, (by0 + by1) / 2, bz + bd / 2); // front verticals
  for (let i = 1; i < 4; i++) add(B(bw, 0.005, 0.005), WIRE, bx, by0, bz - bd / 2 + i * bd / 4);            // floor wires
  bar([0, 0.72, 0.5], [0, 0.62, 0.43], 0.006, CHROME, 5); bar([0, 0.96, 0.5], [0, 0.95, 0.33], 0.006, CHROME, 5);  // basket stays
  // ---- dynamo lamp on the fork crown, dynamo bottle on the fork leg --------------------------------
  add(CYL(0.035, 0.03, 0.09, 10), CHROME, 0, 0.66, 0.6, Math.PI / 2, 0, 0);
  add(CYL(0.032, 0.032, 0.01, 10), M(0xd8ae70, 'metal', 0.4, 0.2), 0, 0.66, 0.65, Math.PI / 2, 0, 0);
  bar([0, 0.62, 0.45], [0, 0.66, 0.56], 0.005, CHROME, 5);
  add(CYL(0.018, 0.018, 0.08, 8), CHROME, 0.06, 0.5, 0.5, 0.5, 0, 0);
  // ---- kickstand (single leg on -X), bike leans onto it ---------------------------------------------
  bar([-0.04, 0.3, -0.16], [-0.16, 0.0, -0.3], 0.008, RUSTD);
  bike.rotation.z = 0.1;
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
