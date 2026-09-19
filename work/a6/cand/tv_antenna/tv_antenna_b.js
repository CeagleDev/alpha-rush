// tv_antenna — arm B: profiles. The mast is a LatheGeometry with a flared foot collar and
// a capped top, the dish is a shallow lathed paraboloid, the booms are extruded square
// sections and every guy wire is a TubeGeometry along a three-point curve so it sags.
// Elements stay 6-sided rods. 2.5 m tall. Base y=0 at the mast foot plate.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const lathe = (pts, seg, mat, p, r) => put(new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), seg), mat, p, r);
  const tube = (pts, rad, mat, tseg, rseg = 4) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2]))), tseg, rad, rseg, false), mat);
  const sq = (s) => { const sh = new THREE.Shape(); sh.moveTo(-s, -s); sh.lineTo(s, -s); sh.lineTo(s, s); sh.lineTo(-s, s); sh.lineTo(-s, -s); return sh; };
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), mat, p, r);

  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide });
  const galvDk = M(0x6f7477, 'metal', { roughness: 0.75, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const rustEl = M(0x7a4a2e, 'metal', { roughness: 0.9, metalness: 0.3 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- mast: one lathe, plate to cap ----------------------------------------------------
  lathe([[0, 0], [0.16, 0], [0.16, 0.03], [0.06, 0.03], [0.05, 0.12], [0.026, 0.14], [0.024, 2.46], [0.03, 2.47], [0.03, 2.50], [0, 2.50]], 8, galv, [0, 0, 0]);
  box(0.32, 0.03, 0.32, [0, 0.03, 0], dark);                                    // grounding band under the plate
  cyl(0.06, 0.06, 0.03, 8, [0, 0.14, 0], rust);                                 // rusted collar line

  // --- element arrays on extruded square booms -----------------------------------------
  const arrays = [[1.55, 5, 0.80, 1.6], [1.95, 4, 0.60, 1.2], [2.30, 3, 0.45, 0.9]];
  for (const [y, n, bh, L0] of arrays) {
    ext(sq(0.012), bh * 2, rustEl, [0, y, -bh]);
    box(0.07, 0.08, 0.06, [0, y, 0], rust);
    for (let i = 0; i < n; i++) {
      const z = -bh + 0.05 + i * ((bh * 2 - 0.10) / (n - 1));
      const L = L0 - i * (L0 * 0.35 / (n - 1));
      cyl(0.008, 0.008, L, 6, [0, y + 0.014, z], i % 2 ? rustEl : galvDk, [0, 0, Math.PI / 2]);
      box(0.03, 0.03, 0.03, [0, y, z], rustDk);
    }
  }
  // --- dish: a shallow lathed paraboloid on an arm -------------------------------------
  ext(sq(0.012), 0.30, galvDk, [0.0, 2.08, 0], [0, Math.PI / 2, 0]);
  const pts = []; for (let i = 0; i <= 5; i++) { const r = i * 0.04; pts.push([r, 0.03 - r * r * 1.1]); }
  lathe(pts.reverse(), 12, galv, [0.36, 2.08, 0.02], [0.95, 0.25, 0]);
  cyl(0.008, 0.008, 0.22, 6, [0.36, 2.06, 0.18], galvDk, [1.2, 0, 0]);
  box(0.03, 0.03, 0.05, [0.36, 2.01, 0.27], galvDk);
  box(0.05, 0.08, 0.05, [0.30, 2.08, 0], rust);

  // --- junction box on a timber plate; cables as tubes ----------------------------------
  box(0.26, 0.34, 0.03, [0, 0.95, 0.03], timber);
  box(0.18, 0.24, 0.09, [0, 0.95, 0.09], galvDk);
  box(0.16, 0.05, 0.005, [0, 0.86, 0.137], rust);
  tube([[0.03, 1.08, 0.06], [0.05, 1.40, 0.05], [0.02, 1.80, 0.04], [0.04, 2.08, 0.03]], 0.007, cable, 12);
  tube([[-0.04, 0.83, 0.06], [-0.05, 0.50, 0.05], [-0.02, 0.20, 0.06], [-0.10, 0.02, 0.10]], 0.007, cable, 10);
  for (const y of [0.55, 1.40, 1.85]) box(0.03, 0.02, 0.03, [0.02, y, 0.04], rustDk);

  // --- guy wires with sag, from a collar at 2.0 m ---------------------------------------
  cyl(0.032, 0.032, 0.03, 8, [0, 2.00, 0], rust);
  for (let k = 0; k < 3; k++) {
    const a = k * (Math.PI * 2 / 3) + 0.4;
    const ax = Math.cos(a) * 0.95, az = Math.sin(a) * 0.95;
    tube([[0, 2.0, 0], [ax * 0.5, 0.98, az * 0.5], [ax, 0.06, az]], 0.004, galvDk, 10, 4);
    box(0.05, 0.03, 0.05, [ax, 0.015, az], rustDk);
    cyl(0.01, 0.01, 0.08, 6, [ax, 0.06, az], galvDk);
  }

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
