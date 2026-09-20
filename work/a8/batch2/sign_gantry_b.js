// sign_gantry — arm B: profiles. The chords and posts are real sections: an L angle and a square
// tube drawn as Shapes and extruded along their own runs; the boards are an extruded frame with a
// hole (the white border) filled by a plain green panel; base plates are extruded with bolt holes;
// the lamp bodies are lathes. Height 7.5 m, board bottom edge 5.35 m, 8 m span.
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
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  // bevel off: a bevel grows the profile outward and hangs it below its own base
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 6, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  const ang = (w, t) => poly([[0, 0], [w, 0], [w, t], [t, t], [t, w], [0, w]]);        // L angle section
  const tub = (w, t) => poly([[0, 0], [w, 0], [w, w], [0, w]], [[[t, t], [w - t, t], [w - t, w - t], [t, w - t]]]);
  const POSTX = 3.9, TRUSS_Y = 6.55, TRUSS_H = 1.0, TRUSS_D = 0.7, SPAN = POSTX * 2;
  const angGeoX = ex(ang(0.12, 0.016), SPAN);                                           // chord run along its own +z, turned to X
  const legGeo = ex(tub(0.1, 0.012), 5.6);
  // ---- posts ---------------------------------------------------------------------------
  for (const sx of [-1, 1]) {
    const px = sx * POSTX;
    add(ex(poly([[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
      [[[-0.4, -0.4], [-0.3, -0.4], [-0.3, -0.3], [-0.4, -0.3]], [[0.3, -0.4], [0.4, -0.4], [0.4, -0.3], [0.3, -0.3]],
       [[-0.4, 0.3], [-0.3, 0.3], [-0.3, 0.4], [-0.4, 0.4]], [[0.3, 0.3], [0.4, 0.3], [0.4, 0.4], [0.3, 0.4]]]), 0.07), GALVD, px, 0.035, 0, -Math.PI / 2, 0, 0);
    add(B(0.84, 0.1, 0.84), RUSTD, px, 0.1, 0);
    for (const ax of [-1, 1]) for (const az of [-1, 1]) {
      add(CYL(0.03, 0.03, 0.16, 6), BOLT, px + ax * 0.35, 0.16, az * 0.35);
      add(legGeo, GALV, px + ax * 0.24 - 0.05, 2.9, az * 0.24 - 0.05, -Math.PI / 2, 0, 0);   // tube legs, sweep up +Y
      add(B(0.13, 0.42, 0.13), STEEL, px + ax * 0.28, 0.3, az * 0.28);
    }
    add(B(0.64, 0.46, 0.64), RUST, px, 0.4, 0);
    for (let i = 0; i < 4; i++) {
      const y = 0.95 + i * 1.3;
      for (const sz of [-1, 1]) add(ex(ang(0.07, 0.01), 0.48), GALVD, px, y, sz * 0.24, 0, Math.PI / 2, 0);
      for (const axx of [-1, 1]) add(ex(ang(0.07, 0.01), 0.48), GALVD, px + axx * 0.24, y, 0);
      if (i < 3) { const a = Math.PI / 2 - Math.atan2(1.3, 0.48);
        for (const sz of [-1, 1]) add(ex(ang(0.06, 0.009), 1.39), GALVD, px, y + 0.65, sz * 0.24, 0, Math.PI / 2, (i % 2 ? a : -a));
      }
    }
    add(ex(poly([[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]]), 0.09), GALVD, px, 6.05, 0, -Math.PI / 2, 0, 0);
    add(B(0.26, 1.0, 0.07), RUST, px + 0.22, 2.4, 0.26);
  }
  // ---- crossbeam from angle chords ---------------------------------------------------------
  for (const sy of [-1, 1]) for (const sz of [-1, 1])
    add(angGeoX, GALV, 0, TRUSS_Y + sy * (TRUSS_H / 2) - 0.06, sz * (TRUSS_D / 2) - 0.06, 0, Math.PI / 2, sy > 0 ? Math.PI : 0);
  for (let i = 0; i <= 6; i++) {
    const x = -POSTX + i * (SPAN / 6);
    for (const sz of [-1, 1]) add(ex(ang(0.06, 0.009), TRUSS_H), GALVD, x, TRUSS_Y, sz * TRUSS_D / 2, -Math.PI / 2, 0, 0);
    if (i < 6) { const a = Math.atan2(SPAN / 6, TRUSS_H);
      for (const sz of [-1, 1]) add(ex(ang(0.055, 0.008), Math.hypot(SPAN / 6, TRUSS_H)), GALVD, x + SPAN / 12, TRUSS_Y, sz * TRUSS_D / 2, -Math.PI / 2, 0, (i % 2 ? -a : a));
    }
  }
  for (let i = 0; i <= 4; i++) { const x = -POSTX + i * (SPAN / 4); for (const sy of [-1, 1]) add(ex(ang(0.055, 0.008), TRUSS_D), GALVD, x, TRUSS_Y + sy * TRUSS_H / 2, 0); }
  add(B(SPAN, 0.1, 0.1), RUST, 0, TRUSS_Y + TRUSS_H / 2 + 0.03, -TRUSS_D / 2);
  // ---- boards: extruded frame (white) with a plain green panel inside -----------------------------
  const BW = 3.3, BH = 1.85, BY = 5.35 + BH / 2, BZ = 0.42;
  for (const sx of [-1, 1]) {
    const cx = sx * (BW / 2 + 0.12);
    add(ex(poly([[-BW / 2, -BH / 2], [BW / 2, -BH / 2], [BW / 2, BH / 2], [-BW / 2, BH / 2]],
      [[[-BW / 2 + 0.1, -BH / 2 + 0.1], [BW / 2 - 0.1, -BH / 2 + 0.1], [BW / 2 - 0.1, BH / 2 - 0.1], [-BW / 2 + 0.1, BH / 2 - 0.1]]]), 0.06), WHITE, cx, BY, BZ + 0.03);
    add(B(BW - 0.16, BH - 0.16, 0.05), GREEN, cx, BY, BZ);                                // plain green face
    add(B(BW + 0.06, BH + 0.06, 0.05), GREEND, cx, BY, BZ - 0.05);
    add(B(0.55, 0.4, 0.03), GREEND, cx + sx * 0.85, BY - 0.4, BZ + 0.03);
    add(B(0.18, 0.55, 0.03), RUST, cx - sx * 1.15, BY + 0.15, BZ + 0.03);
    for (const by of [BY - BH / 2 - 0.1, BY + BH / 2 + 0.1]) add(ex(ang(0.09, 0.012), BW), GALVD, cx, by, BZ - 0.3, 0, Math.PI / 2, 0);
  }
  // ---- lamps: lathed bodies on drop brackets ------------------------------------------------------
  const lampBody = new THREE.LatheGeometry(V2([[0, 0], [0.09, 0.01], [0.13, 0.06], [0.13, 0.15], [0.1, 0.2], [0, 0.21]]), 10);
  for (let i = 0; i < 4; i++) {
    const x = -3.0 + i * 2.0;
    add(B(0.24, 0.22, 0.2), GALVD, x, 5.2, 0.34);
    add(lampBody, GALVD, x, 5.14, 0.4, Math.PI, 0, 0);
    add(CYL(0.1, 0.1, 0.025, 10), LAMP, x, 4.94, 0.4);
    add(B(0.06, 0.18, 0.06), STEEL, x, 5.34, 0.28);
    add(B(0.09, 0.07, 0.05), RUST, x + 0.09, 5.2, 0.44);
    lights.push({ x, y: 4.88, z: 0.44, color: 0xe5b055, intensity: 0.7, range: 6 });
  }
  // ---- walkway behind -------------------------------------------------------------------------------
  const WZ = -0.62;
  add(B(SPAN, 0.05, 0.75), STEEL, 0, 5.1, WZ);
  for (let i = 0; i < 12; i++) add(B(0.03, 0.06, 0.75), GALVD, -POSTX + 0.3 + i * 0.63, 5.13, WZ);
  add(ex(ang(0.08, 0.01), SPAN), GALVD, 0, 5.05, WZ - 0.38, 0, Math.PI / 2, 0);
  for (let i = 0; i <= 6; i++) add(ex(tub(0.06, 0.008), 1.05), GALVD, -POSTX + i * (SPAN / 6), 5.62, WZ - 0.34, -Math.PI / 2, 0, 0);
  for (const y of [6.15, 5.72]) add(CYL(0.028, 0.028, SPAN, 8), GALV, 0, y, WZ - 0.34, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) for (const y of [6.15, 5.72]) add(CYL(0.028, 0.028, 0.6, 8), GALV, sx * POSTX, y, WZ - 0.04, Math.PI / 2, 0, 0);
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
