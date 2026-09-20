// guard_rail — arm A: primitives. The W beam read as stacked boxes: two forward ribs, a recessed
// centre valley and a web behind, on three box posts with base plates. 4.0 m long, 0.75 m tall,
// rail face +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const GALV = M(0x9aa0a3, 'metal', 0.6, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.72, 0.3);
  const SCUFF = M(0xb4b8ba, 'metal', 0.45, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const MOSS = M(0x4a5a3a, 'metal', 0.95, 0.02);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const REFL = M(0xd8d2c4, 'metal', 0.4, 0.2);
  const L = 4.0, RY = 0.575;
  // ---- rail: ribs and valley as boxes -------------------------------------------------
  add(B(L, 0.31, 0.03), GALVD, 0, RY, 0.0);                                   // web
  for (const sy of [-1, 1]) {
    add(B(L, 0.1, 0.05), GALV, 0, RY + sy * 0.105, 0.05);                     // forward ribs
    add(B(L, 0.045, 0.05), GALVD, 0, RY + sy * 0.155, 0.03);                  // lipped edges
    add(B(L, 0.05, 0.03), GALVD, 0, RY + sy * 0.05, 0.03);                    // rib flanks into the valley
  }
  add(B(L, 0.06, 0.02), GALVD, 0, RY, 0.015);                                  // centre valley face
  // scuffs, a crease and a rust run along the beam
  add(B(1.2, 0.05, 0.02), SCUFF, -0.7, RY + 0.1, 0.078);
  add(B(0.8, 0.035, 0.02), SCUFF, 1.1, RY - 0.1, 0.078);
  add(B(0.5, 0.26, 0.02), SCUFF, 0.15, RY, 0.072, 0, 0, 0.08);                // dented panel, tilted
  add(B(L, 0.03, 0.02), RUST, 0, RY - 0.15, 0.06);
  add(B(0.6, 0.12, 0.02), RUST, -1.5, RY + 0.06, 0.07);
  // ---- ends: wrapped terminals ------------------------------------------------------------
  for (const sx of [-1, 1]) {
    add(B(0.14, 0.34, 0.14), RUSTD, sx * (L / 2 - 0.07), RY, 0.03);
    add(B(0.1, 0.36, 0.02), RUST, sx * (L / 2 - 0.05), RY, 0.1);
    for (const sy of [-1, 1]) add(CYL(0.014, 0.014, 0.04, 6), BOLT, sx * (L / 2 - 0.07), RY + sy * 0.1, 0.11, Math.PI / 2, 0, 0);
  }
  // ---- three posts with base plates ----------------------------------------------------------
  for (const px of [-1.55, 0, 1.55]) {
    add(B(0.12, 0.62, 0.12), GALV, px, 0.31, -0.08);                            // post
    add(B(0.13, 0.3, 0.13), RUST, px, 0.2, -0.08);                              // rust up the post
    add(B(0.14, 0.09, 0.14), MOSS, px, 0.1, -0.08);                             // moss at the foot
    add(B(0.26, 0.02, 0.26), GALVD, px, 0.01, -0.08);                           // base plate
    add(B(0.27, 0.03, 0.27), DARK, px, 0.03, -0.08);                            // grounding band
    for (const ax of [-1, 1]) for (const az of [-1, 1]) add(CYL(0.014, 0.014, 0.05, 6), BOLT, px + ax * 0.09, 0.04, -0.08 + az * 0.09);
    add(B(0.16, 0.16, 0.06), GALVD, px, RY, -0.02);                              // spacer block behind the rail
    add(CYL(0.018, 0.018, 0.05, 6), BOLT, px, RY, 0.09, Math.PI / 2, 0, 0);      // bolt head through the valley
  }
  // ---- reflector ------------------------------------------------------------------------------
  add(B(0.09, 0.11, 0.03), GALVD, 1.05, RY + 0.02, 0.085);
  add(B(0.06, 0.08, 0.02), REFL, 1.05, RY + 0.02, 0.1);
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
