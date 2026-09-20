// bicycle_parked — arm B: profiles. Frame tubes as TubeGeometry along curves (loop-frame down
// tube and upper tube), lathed tyres and hubs, mudguards as partial lathes, chain guard as an
// extruded teardrop, saddle lathe, double-leg centre stand (upright). Front +Z. 0.6 x 1.05 x 1.8.
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
  const tube = (pts, r, mat, seg) => { const c2 = new THREE.CatmullRomCurve3(pts.map(V3)); return add(new THREE.TubeGeometry(c2, seg || 10, r, 7, false), mat, 0, 0, 0); };
  const ex = (shape, depth) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  // ---- wheels: lathed tyre (with sidewall) and rim, spokes ---------------------------------
  const tyreGeo = new THREE.LatheGeometry(V2([[0.28, -0.012], [0.3, -0.022], [0.31, -0.012], [0.31, 0.012], [0.3, 0.022], [0.28, 0.012]]), 24);
  const rimGeo = new THREE.LatheGeometry(V2([[0.27, -0.012], [0.285, -0.012], [0.285, 0.012], [0.27, 0.012]]), 24);
  const hubGeo = new THREE.LatheGeometry(V2([[0, -0.05], [0.03, -0.05], [0.02, -0.02], [0.02, 0.02], [0.03, 0.05], [0, 0.05]]), 10);
  const wheel = (z) => {
    const w = new THREE.Group(); w.position.set(0, 0.33, z); w.rotation.z = Math.PI / 2; bike.add(w);   // lathe axis -> X
    add(tyreGeo, RUB, 0, 0, 0, 0, 0, 0, w); add(rimGeo, CHROME, 0, 0, 0, 0, 0, 0, w); add(hubGeo, RUST, 0, 0, 0, 0, 0, 0, w);
    for (let i = 0; i < 16; i++) add(CYL(0.003, 0.003, 0.55, 4, true), WIRE, 0, 0, 0, (i / 16) * Math.PI, 0, Math.PI / 2, w);
  };
  wheel(0.53); wheel(-0.52);
  // ---- frame: curved tubes --------------------------------------------------------------------
  tube([[0, 0.66, 0.42], [0, 0.5, 0.3], [0, 0.36, 0.1], [0, 0.3, -0.1]], 0.016, FRAME);                 // loop down tube
  tube([[0, 0.9, 0.35], [0, 0.78, 0.15], [0, 0.66, -0.05], [0, 0.58, -0.19]], 0.014, FRAME2);           // upper tube
  bar([0, 0.3, -0.1], [0, 0.85, -0.22], 0.016, FRAME);                                                  // seat tube
  bar([0, 0.6, 0.43], [0, 0.92, 0.34], 0.022, FRAME);                                                    // head tube
  for (const s of [-1, 1]) {
    bar([s * 0.045, 0.3, -0.1], [s * 0.045, 0.33, -0.52], 0.01, FRAME);
    bar([s * 0.04, 0.85, -0.22], [s * 0.045, 0.33, -0.52], 0.01, FRAME2);
    tube([[s * 0.04, 0.6, 0.43], [s * 0.045, 0.45, 0.5], [s * 0.045, 0.33, 0.53]], 0.011, FRAME, 6);    // raked fork
    add(B(0.02, 0.05, 0.02), RUST, s * 0.05, 0.33, -0.52);
  }
  add(CYL(0.02, 0.02, 0.09, 8), RUST, 0, 0.3, -0.1, 0, 0, Math.PI / 2);
  add(CYL(0.03, 0.03, 0.05, 8), RUST, 0, 0.6, 0.43);
  add(new THREE.TorusGeometry(0.018, 0.006, 4, 10), RUST, 0, 0.5, 0.3, 0.9, 0, 0);                        // rust ring on the loop tube
  add(new THREE.TorusGeometry(0.018, 0.006, 4, 10), RUST, 0, 0.66, -0.05, 0.9, 0, 0);
  // ---- steering ----------------------------------------------------------------------------------
  tube([[0, 0.92, 0.34], [0, 1.0, 0.32], [0, 1.0, 0.26]], 0.012, CHROME, 6);
  tube([[-0.27, 0.99, 0.18], [-0.2, 1.0, 0.3], [0, 1.0, 0.26], [0.2, 1.0, 0.3], [0.27, 0.99, 0.18]], 0.011, CHROME, 14);
  for (const s of [-1, 1]) {
    add(CYL(0.016, 0.016, 0.11, 7), LEATHER, s * 0.245, 0.995, 0.235, 0, -s * 0.95, 0);
    bar([s * 0.19, 0.99, 0.31], [s * 0.15, 0.96, 0.38], 0.005, CHROME, 5);
  }
  add(new THREE.LatheGeometry(V2([[0, 0], [0.02, 0], [0.022, 0.008], [0.012, 0.014], [0, 0.016]]), 10), CHROME, 0.1, 1.01, 0.28);   // bell
  // ---- saddle: lathe, scaled into a saddle plan --------------------------------------------------
  bar([0, 0.85, -0.22], [0, 0.98, -0.25], 0.012, CHROME);
  const sad = add(new THREE.LatheGeometry(V2([[0, 0], [0.09, 0], [0.1, 0.02], [0.08, 0.045], [0.0, 0.05]]), 12), LEATHER, 0, 0.98, -0.25); sad.scale.set(0.8, 1, 1.5);
  for (const s of [-1, 1]) add(CYL(0.02, 0.02, 0.04, 6), CHROME, s * 0.05, 0.965, -0.36);
  // ---- mudguards: partial lathes (tyre-hugging channel) ------------------------------------------------
  const mgGeo = new THREE.LatheGeometry(V2([[0.335, -0.03], [0.35, -0.02], [0.35, 0.02], [0.335, 0.03]]), 16, 0, Math.PI * 1.1);
  // the lathe spins about Y, so hang it in a group turned to put that axis along X, then roll the
  // open arc over the top of the tyre inside the group (no multi-axis Euler to get the wrong way round)
  const guardAt = (z, roll) => {
    const w = new THREE.Group(); w.position.set(0, 0.33, z); w.rotation.z = Math.PI / 2; bike.add(w);
    const m = new THREE.Mesh(mgGeo, RUST); m.rotation.y = roll; w.add(m); return m;
  };
  guardAt(0.53, Math.PI * 0.75); guardAt(-0.52, Math.PI * 0.95);
  add(B(0.03, 0.05, 0.02), RUB, 0, 0.62, -0.87);
  // ---- chain guard: extruded teardrop; chainring, cranks, pedals -----------------------------------------
  const guard = new THREE.Shape(); guard.absarc(-0.1, 0.3, 0.11, Math.PI * 0.5, Math.PI * 1.5, false); guard.lineTo(-0.56, 0.31); guard.lineTo(-0.56, 0.36); guard.closePath();
  add(ex(guard, 0.02), GUARD, 0.06, 0, 0, 0, -Math.PI / 2, 0);   // profile +u -> world +z, so it runs back to the hub
  add(CYL(0.04, 0.04, 0.02, 10), RUST, 0.05, 0.33, -0.52, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    add(B(0.015, 0.17, 0.03), CHROME, s * 0.085, 0.3 + s * 0.07, -0.1 + s * 0.04, 0.5, 0, 0);
    add(B(0.06, 0.02, 0.08), RUB, s * 0.135, 0.3 + s * 0.15, -0.1 + s * 0.08);
  }
  // ---- rear rack with rope wraps -----------------------------------------------------------------------
  tube([[-0.07, 0.74, -0.4], [-0.07, 0.74, -0.76], [0.07, 0.74, -0.76], [0.07, 0.74, -0.4]], 0.006, CHROME, 12);
  for (const s of [-1, 1]) { bar([s * 0.07, 0.74, -0.44], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5); bar([s * 0.07, 0.74, -0.72], [s * 0.045, 0.33, -0.52], 0.006, CHROME, 5); }
  for (let i = 0; i < 3; i++) add(B(0.15, 0.01, 0.012), CHROME, 0, 0.74, -0.48 - i * 0.1);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.075, 0.007, 4, 10), ROPE, 0, 0.74, -0.46 - i * 0.08);
  // ---- basket: rims as rounded-rect tubes, bars ---------------------------------------------------------
  const rim = (y) => tube([[-0.17, y, 0.5], [-0.17, y, 0.82], [0.17, y, 0.82], [0.17, y, 0.5], [-0.17, y, 0.5]], 0.005, WIRE, 16);
  rim(0.72); rim(0.96);
  for (const s of [-1, 1]) for (const t of [0.5, 0.82]) add(B(0.008, 0.24, 0.008), WIRE, s * 0.17, 0.84, t);
  for (let i = 1; i < 4; i++) { const y = 0.72 + i * 0.06; add(B(0.34, 0.005, 0.005), WIRE, 0, y, 0.82); add(B(0.34, 0.005, 0.005), WIRE, 0, y, 0.5); add(B(0.005, 0.005, 0.32), WIRE, 0.17, y, 0.66); add(B(0.005, 0.005, 0.32), WIRE, -0.17, y, 0.66); }
  for (let i = 1; i < 5; i++) add(B(0.005, 0.24, 0.005), WIRE, -0.17 + i * 0.068, 0.84, 0.82);
  for (let i = 1; i < 4; i++) add(B(0.34, 0.005, 0.005), WIRE, 0, 0.72, 0.5 + i * 0.08);
  bar([0, 0.72, 0.5], [0, 0.62, 0.43], 0.006, CHROME, 5); bar([0, 0.96, 0.5], [0, 0.95, 0.33], 0.006, CHROME, 5);
  // ---- dynamo lamp (lathe) ---------------------------------------------------------------------------------
  const lamp = add(new THREE.LatheGeometry(V2([[0, 0], [0.025, 0], [0.035, 0.05], [0.036, 0.09], [0.03, 0.095], [0, 0.095]]), 10), CHROME, 0, 0.66, 0.56); lamp.rotation.x = Math.PI / 2;
  add(CYL(0.03, 0.03, 0.006, 10), M(0xd8ae70, 'metal', 0.4, 0.2), 0, 0.66, 0.652, Math.PI / 2, 0, 0);
  bar([0, 0.62, 0.45], [0, 0.66, 0.56], 0.005, CHROME, 5);
  add(CYL(0.018, 0.018, 0.08, 8), CHROME, 0.06, 0.5, 0.5, 0.5, 0, 0);
  // ---- centre stand: two legs down to the ground, bike upright -----------------------------------------------
  for (const s of [-1, 1]) bar([s * 0.045, 0.3, -0.16], [s * 0.12, 0.0, -0.3], 0.008, RUSTD);
  add(B(0.24, 0.012, 0.012), RUSTD, 0, 0.012, -0.3);
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
