// sodium_lamp — arm C: a different reading. Octagonal column on a squat cast base with a raised
// door frame (as the reference shows), a shorter double-bend arm with a visible bracket and a
// bolted flange joint, and a deeper lamp head with a shallow cowl and a bird spike.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const EM = (hex, i) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(hex), emissiveIntensity: i || 2.4, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 10, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const tube = (pts, r, mat, seg, rad) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), seg || 12, r, rad || 8, false), mat, 0, 0, 0);
  const lights = [];
  const GALV = M(0x9aa0a3, 'metal', 0.62, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.7, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const SODIUM = EM(0xe5b055, 2.6);
  // ---- cast base block, plate, door -------------------------------------------------
  add(B(0.7, 0.06, 0.7), GALVD, 0, 0.03, 0);
  add(B(0.58, 0.05, 0.58), RUSTD, 0, 0.075, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { add(CYL(0.026, 0.026, 0.1, 6), BOLT, sx * 0.28, 0.1, sz * 0.28); add(CYL(0.034, 0.034, 0.02, 6), RUST, sx * 0.28, 0.15, sz * 0.28); }
  add(B(0.42, 0.18, 0.42), GALVD, 0, 0.19, 0);                                       // cast collar
  add(B(0.36, 1.3, 0.36), GALV, 0, 0.93, 0);
  add(B(0.4, 0.1, 0.4), GALVD, 0, 1.63, 0);
  add(B(0.42, 0.1, 0.42), RUST, 0, 0.3, 0);                                           // rust ring at the base
  // raised door frame with two hinge straps, as the reference
  add(B(0.26, 0.72, 0.03), GALVD, 0, 0.95, 0.185);
  add(B(0.2, 0.64, 0.025), GALV, 0, 0.95, 0.2);
  for (const sy of [0.74, 1.16]) { add(B(0.12, 0.07, 0.05), RUST, -0.07, sy, 0.21); add(CYL(0.016, 0.016, 0.06, 6), BOLT, -0.11, sy, 0.235, Math.PI / 2, 0, 0); }
  add(B(0.06, 0.16, 0.05), RUST, 0.08, 0.95, 0.215);
  add(CYL(0.018, 0.018, 0.05, 6), BOLT, 0.08, 0.95, 0.245, Math.PI / 2, 0, 0);
  // ---- octagonal column (an 8-sided cylinder), tapering ----------------------------------
  add(CYL(0.14, 0.17, 4.2, 8), GALV, 0, 3.78, 0);
  add(CYL(0.1, 0.14, 3.6, 8), GALV, 0, 7.68, 0);
  add(CYL(0.175, 0.175, 0.1, 8), GALVD, 0, 1.73, 0);
  add(CYL(0.15, 0.15, 0.12, 8), GALVD, 0, 5.9, 0);                                        // flange joint
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; add(CYL(0.015, 0.015, 0.16, 6), BOLT, Math.cos(a) * 0.14, 5.9, Math.sin(a) * 0.14, 0, 0, 0); }
  add(CYL(0.152, 0.152, 0.05, 8), RUST, 0, 5.97, 0);
  add(B(0.16, 0.36, 0.05), GALVD, 0, 2.6, 0.16);
  add(CYL(0.014, 0.014, 3.0, 6), DARK, 0, 4.2, 0.15);
  // ---- shorter double-bend arm with a bracket -----------------------------------------------
  tube([[0, 9.2, 0], [0, 9.62, 0.08], [0, 9.8, 0.42], [0, 9.86, 0.86], [0, 9.92, 1.3]], 0.06, GALV, 14);
  add(CYL(0.08, 0.08, 0.16, 10), GALVD, 0, 9.24, 0);
  add(CYL(0.083, 0.083, 0.05, 10), RUST, 0, 9.34, 0);
  add(B(0.05, 0.4, 0.05), GALVD, 0, 9.52, 0.28, 0.5, 0, 0);                                  // diagonal stay under the arm
  add(B(0.06, 0.06, 0.24), GALVD, 0, 9.9, 1.36);
  // ---- deeper head with a cowl -----------------------------------------------------------------
  add(B(0.36, 0.2, 0.8), GALV, 0, 9.9, 1.84);
  add(B(0.4, 0.06, 0.86), GALVD, 0, 10.03, 1.84);
  add(B(0.4, 0.05, 0.16), GALVD, 0, 9.98, 1.42);                                                // cowl over the gear tray
  add(B(0.3, 0.12, 0.7), SODIUM, 0, 9.76, 1.86);
  add(B(0.36, 0.04, 0.74), DARK, 0, 9.69, 1.86);
  for (const sx of [-1, 1]) add(B(0.03, 0.12, 0.6), GALVD, sx * 0.185, 9.82, 1.86);
  for (let i = 0; i < 4; i++) add(B(0.2, 0.014, 0.014), GALVD, 0, 10.02, 1.6 + i * 0.16);
  for (let i = 0; i < 3; i++) add(CYL(0.006, 0.006, 0.12, 4), GALVD, -0.08 + i * 0.08, 10.11, 1.84);   // bird spikes
  add(B(0.22, 0.07, 0.03), RUST, -0.05, 9.88, 2.24);
  lights.push({ x: 0, y: 9.64, z: 1.86, color: 0xe5b055, intensity: 1.2, range: 12 });
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
