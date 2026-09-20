// sign_gantry — arm C: a different reading. A deep single box truss carried on two tapered lattice
// towers that splay outward at the foot, the two boards hung from the truss face on drop links with
// a shared lamp bar beneath them, and the walkway cantilevered behind on visible brackets.
// Height 7.5 m, board bottom edge 5.4 m, 8 m span.
export default function (THREE) {
  const g = new THREE.Group();
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
  const lights = [];
  const GALV = M(0x9aa0a3, 'metal', 0.62, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.72, 0.3);
  const STEEL = M(0x6a7073, 'metal', 0.75, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const GREEN = M(0x2f6b3a, 'metal', 0.85, 0.05);
  const GREEND = M(0x265731, 'metal', 0.88, 0.05);
  const WHITE = M(0xd8d2c4, 'metal', 0.8, 0.05);
  const LAMP = EM(0xe5b055, 2.2);
  const POSTX = 3.85, TRUSS_Y = 6.7, TRUSS_H = 0.86, TRUSS_D = 0.9, SPAN = POSTX * 2;
  // ---- tapered towers: legs splay from 0.72 at the foot to 0.34 at the top -------------------
  for (const sx of [-1, 1]) {
    const px = sx * POSTX;
    add(B(1.1, 0.08, 1.1), GALVD, px, 0.04, 0);
    add(B(0.92, 0.12, 0.92), RUSTD, px, 0.11, 0);
    for (const ax of [-1, 1]) for (const az of [-1, 1]) {
      add(CYL(0.034, 0.034, 0.16, 6), BOLT, px + ax * 0.42, 0.17, az * 0.42);
      // a splayed leg: a long box leaned in by the taper angle
      const lean = Math.atan2(0.38, 6.0);
      add(B(0.1, 6.05, 0.1), GALV, px + ax * 0.53, 3.05, az * 0.53, az * lean, 0, -ax * lean);
    }
    add(B(0.8, 0.5, 0.8), RUST, px, 0.42, 0);
    for (let i = 0; i < 7; i++) {
      const y = 0.7 + i * 0.88, w = 0.72 - (y / 6.0) * 0.38;
      for (const sz of [-1, 1]) add(B(w * 2, 0.05, 0.05), GALVD, px, y, sz * w);
      for (const ax of [-1, 1]) add(B(0.05, 0.05, w * 2), GALVD, px + ax * w, y, 0);
      if (i < 6) { const a = Math.PI / 2 - Math.atan2(0.88, w * 1.6);
        for (const sz of [-1, 1]) add(B(0.045, w * 2.1, 0.045), GALVD, px, y + 0.44, sz * w, 0, 0, i % 2 ? a : -a);
        for (const ax of [-1, 1]) add(B(0.045, w * 2.1, 0.045), GALVD, px + ax * w, y + 0.44, 0, i % 2 ? -a : a, 0, 0);
      }
    }
    add(B(0.78, 0.12, 0.78), GALVD, px, 6.18, 0);
    add(B(0.34, 1.1, 0.07), RUST, px - 0.25, 2.6, 0.3);
  }
  // ---- deep box truss: heavy top and bottom chords, K bracing on the faces ------------------------
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) add(B(SPAN + 0.5, 0.13, 0.13), GALV, 0, TRUSS_Y + sy * TRUSS_H / 2, sz * TRUSS_D / 2);
  for (let i = 0; i <= 6; i++) {
    const x = -POSTX + i * (SPAN / 6);
    for (const sz of [-1, 1]) add(B(0.07, TRUSS_H, 0.07), GALVD, x, TRUSS_Y, sz * TRUSS_D / 2);
    if (i < 6) {                                                                   // K bracing: two half-diagonals per bay
      const halfx = SPAN / 12, a = Math.atan2(halfx, TRUSS_H / 2), L = Math.hypot(halfx, TRUSS_H / 2);
      for (const sz of [-1, 1]) {
        add(B(0.05, L, 0.05), GALVD, x + halfx / 2, TRUSS_Y + TRUSS_H / 4, sz * TRUSS_D / 2, 0, 0, -a);
        add(B(0.05, L, 0.05), GALVD, x + halfx / 2, TRUSS_Y - TRUSS_H / 4, sz * TRUSS_D / 2, 0, 0, a);
        add(B(0.05, L, 0.05), GALVD, x + halfx * 1.5, TRUSS_Y + TRUSS_H / 4, sz * TRUSS_D / 2, 0, 0, a);
        add(B(0.05, L, 0.05), GALVD, x + halfx * 1.5, TRUSS_Y - TRUSS_H / 4, sz * TRUSS_D / 2, 0, 0, -a);
      }
    }
  }
  for (let i = 0; i <= 6; i++) { const x = -POSTX + i * (SPAN / 6); for (const sy of [-1, 1]) add(B(0.06, 0.06, TRUSS_D), GALVD, x, TRUSS_Y + sy * TRUSS_H / 2, 0); }
  add(B(SPAN + 0.5, 0.14, 0.05), RUST, 0, TRUSS_Y + TRUSS_H / 2 + 0.02, TRUSS_D / 2 + 0.07);
  // ---- boards hung on drop links from the truss ------------------------------------------------------
  const BW = 3.35, BH = 1.7, BY = 5.4 + BH / 2, BZ = 0.56;
  for (const sx of [-1, 1]) {
    const cx = sx * (BW / 2 + 0.1);
    for (const lx of [-1, 1]) { add(B(0.07, 0.62, 0.07), STEEL, cx + lx * (BW / 2 - 0.4), BY + BH / 2 + 0.3, BZ - 0.06); add(B(0.16, 0.12, 0.1), STEEL, cx + lx * (BW / 2 - 0.4), BY + BH / 2 + 0.6, BZ - 0.06); }
    add(B(BW, BH, 0.06), GREEN, cx, BY, BZ);
    add(B(BW + 0.12, 0.1, 0.08), WHITE, cx, BY + BH / 2, BZ + 0.02);
    add(B(BW + 0.12, 0.1, 0.08), WHITE, cx, BY - BH / 2, BZ + 0.02);
    add(B(0.1, BH + 0.12, 0.08), WHITE, cx - BW / 2, BY, BZ + 0.02);
    add(B(0.1, BH + 0.12, 0.08), WHITE, cx + BW / 2, BY, BZ + 0.02);
    add(B(BW + 0.14, BH + 0.14, 0.04), GREEND, cx, BY, BZ - 0.06);
    add(B(0.6, 0.45, 0.03), GREEND, cx - sx * 0.8, BY + 0.3, BZ + 0.035);
    add(B(0.22, 0.6, 0.03), RUST, cx + sx * 1.25, BY - 0.2, BZ + 0.035);
    for (let i = 0; i < 3; i++) add(B(0.08, 0.08, 0.36), STEEL, cx - BW / 2 + 0.3 + i * (BW - 0.6) / 2, BY, BZ - 0.22);
  }
  // ---- one lamp bar carrying five lamps under the boards ------------------------------------------------
  add(B(SPAN - 0.6, 0.09, 0.09), STEEL, 0, 5.24, 0.5);
  for (let i = 0; i < 5; i++) {
    const x = -3.2 + i * 1.6;
    add(B(0.05, 0.22, 0.05), STEEL, x, 5.12, 0.5);
    add(B(0.3, 0.16, 0.26), GALVD, x, 4.96, 0.52);
    add(CYL(0.13, 0.15, 0.14, 10), GALVD, x, 4.86, 0.54, Math.PI / 2, 0, 0);
    add(CYL(0.12, 0.12, 0.03, 10), LAMP, x, 4.8, 0.56);
    add(B(0.12, 0.05, 0.04), RUST, x - 0.1, 4.96, 0.63);
    lights.push({ x, y: 4.74, z: 0.58, color: 0xe5b055, intensity: 0.7, range: 6 });
  }
  // ---- walkway cantilevered behind on brackets -----------------------------------------------------------
  const WZ = -0.78;
  for (let i = 0; i <= 8; i++) { const x = -POSTX + i * (SPAN / 8); add(B(0.07, 0.07, 0.8), STEEL, x, 5.1, WZ + 0.1); add(B(0.06, 0.5, 0.06), STEEL, x, 5.3, WZ - 0.24, 0.6, 0, 0); }
  add(B(SPAN, 0.05, 0.8), STEEL, 0, 5.14, WZ);
  for (let i = 0; i < 18; i++) add(B(0.035, 0.06, 0.8), GALVD, -POSTX + 0.22 + i * 0.43, 5.17, WZ);
  add(B(SPAN, 0.08, 0.05), GALVD, 0, 5.1, WZ - 0.4);
  for (let i = 0; i <= 6; i++) add(B(0.055, 1.1, 0.055), GALVD, -POSTX + i * (SPAN / 6), 5.7, WZ - 0.38);
  add(B(SPAN, 0.06, 0.06), GALV, 0, 6.22, WZ - 0.38);
  add(B(SPAN, 0.05, 0.05), GALV, 0, 5.78, WZ - 0.38);
  for (const sx of [-1, 1]) { add(B(0.06, 0.06, 0.66), GALV, sx * POSTX, 6.22, WZ - 0.06); add(B(0.05, 0.05, 0.66), GALV, sx * POSTX, 5.78, WZ - 0.06); }
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
