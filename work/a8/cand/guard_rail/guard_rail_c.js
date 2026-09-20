// guard_rail — arm C: a different reading of the reference. The same extruded W section, but
// deeper and carried on heavy timber-dark end blocks that wrap the beam, with the posts set as
// wide flanged I sections on big plates, two reflectors, a splice plate at the centre post, and
// the whole beam visibly kinked where something hit it. 4.0 m, 0.75 m tall, face +Z.
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
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  const ex = (shape, depth) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  const sweepX = (shape, len, mat, y, z, rz) => add(ex(shape, len), mat, 0, y || 0, z || 0, 0, -Math.PI / 2, rz || 0);
  const RY = 0.575, T = 0.032;
  // deeper W: 9 cm of relief instead of 7.5
  const w = [
    [0.0, -0.16], [0.07, -0.118], [0.09, -0.058], [0.025, -0.02], [0.025, 0.02], [0.09, 0.058], [0.07, 0.118], [0.0, 0.16],
    [-T, 0.16], [0.07 - T, 0.118], [0.09 - T, 0.058], [0.025 - T, 0.02], [0.025 - T, -0.02], [0.09 - T, -0.058], [0.07 - T, -0.118], [-T, -0.16],
  ];
  // two runs that meet at the centre post, the right-hand one kinked back by a knock
  const beam = poly(w);
  add(ex(beam, 2.0), GALV, -1.0, RY, 0, 0, -Math.PI / 2, 0);
  const hit = add(ex(beam, 2.0), GALV, 1.02, RY, -0.015, 0, -Math.PI / 2, 0); hit.rotation.set(0, -Math.PI / 2 + 0.02, 0.012);
  sweepX(poly([[0.07, -0.125], [0.092, -0.05], [0.092, -0.035], [0.07, -0.11]]), 1.6, SCUFF, RY, -0.9);
  sweepX(poly([[0.07, 0.11], [0.092, 0.035], [0.092, 0.05], [0.07, 0.125]]), 1.1, SCUFF, RY, 1.0);
  sweepX(poly([[0.055, -0.165], [0.092, -0.125], [0.092, -0.1], [0.055, -0.14]]), 3.9, RUST, RY, 0);
  add(B(0.42, 0.26, 0.03), SCUFF, 1.35, RY, 0.082, 0, 0.1, 0.1);
  // ---- heavy wrapped end blocks -----------------------------------------------------------------
  for (const sx of [-1, 1]) {
    add(B(0.2, 0.42, 0.2), RUSTD, sx * 1.95, RY, 0.01);
    add(B(0.22, 0.1, 0.22), RUST, sx * 1.95, RY + 0.16, 0.01);
    add(B(0.22, 0.1, 0.22), RUST, sx * 1.95, RY - 0.16, 0.01);
    for (const sy of [-1, 1]) { add(CYL(0.016, 0.016, 0.05, 6), BOLT, sx * 1.95, RY + sy * 0.12, 0.12, Math.PI / 2, 0, 0); add(CYL(0.016, 0.016, 0.05, 6), BOLT, sx * 1.99, RY + sy * 0.12, -0.1, Math.PI / 2, 0, 0); }
  }
  // ---- posts: wide flanged I section on big plates -------------------------------------------------
  const ibeam = poly([[0, 0], [0.16, 0], [0.16, 0.028], [0.096, 0.028], [0.096, 0.112], [0.16, 0.112], [0.16, 0.14], [0, 0.14], [0, 0.112], [0.064, 0.112], [0.064, 0.028], [0, 0.028]]);
  for (const px of [-1.6, 0, 1.6]) {
    add(ex(ibeam, 0.6), GALV, px - 0.08, 0.3, -0.14, -Math.PI / 2, 0, 0);
    add(B(0.17, 0.3, 0.15), RUST, px, 0.2, -0.09);
    add(B(0.18, 0.1, 0.16), MOSS, px, 0.1, -0.09);
    add(B(0.34, 0.025, 0.32), GALVD, px, 0.012, -0.09);
    add(B(0.35, 0.035, 0.33), DARK, px, 0.035, -0.09);
    for (const ax of [-1, 1]) for (const az of [-1, 1]) { add(CYL(0.016, 0.016, 0.06, 6), BOLT, px + ax * 0.12, 0.045, -0.09 + az * 0.11); add(CYL(0.022, 0.022, 0.02, 6), RUST, px + ax * 0.12, 0.08, -0.09 + az * 0.11); }
    add(B(0.2, 0.2, 0.08), GALVD, px, RY, -0.04);
    add(CYL(0.022, 0.022, 0.05, 6), BOLT, px, RY, 0.095, Math.PI / 2, 0, 0);
  }
  // ---- splice plate at the centre post, two reflectors ------------------------------------------------
  add(B(0.22, 0.34, 0.03), GALVD, 0, RY, 0.06);
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) add(CYL(0.014, 0.014, 0.04, 6), BOLT, sx * 0.07, RY + sy * 0.12, 0.09, Math.PI / 2, 0, 0);
  for (const rx of [-1.15, 1.15]) { add(B(0.11, 0.13, 0.035), GALVD, rx, RY + 0.02, 0.09); add(B(0.07, 0.09, 0.02), REFL, rx, RY + 0.02, 0.112); }
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
