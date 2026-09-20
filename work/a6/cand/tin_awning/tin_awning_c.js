// tin_awning — arm C: a different reading. The roof is four short sheets lapped one over
// the next (each a slab with rounded half-cylinder ridges rather than boxes), each at its
// own slight tilt so the run reads patched and sagging; the struts are flat bars with
// gusset plates, a diagonal tie between them, and the batten carries a rolled pipe the
// back edge of the sheet hooks over. 5.0 w x 1.2 d, double-sided for the view from below.
// MOUNTING: userData.mounts = 'back'. Base y=0 is the strut FEET on the wall; the sheet
// tops out at about 1.0 m. The game mounts this at 3.0 m on the shophouse wall.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const rod = (a, b, rad, mat, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, seg), mat); m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m; };

  const DS = { side: THREE.DoubleSide };
  const tints = [M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3, ...DS }), M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3, ...DS }),
    M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, ...DS }), M(0x5a3a26, 'metal', { roughness: 0.9, metalness: 0.3, ...DS })];
  const paint = M(0xbfb6a0, 'metal', { roughness: 0.92, metalness: 0.3 });
  const tar = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.3 });
  const steel = M(0x4a3a30, 'metal', { roughness: 0.9, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  const YB = 1.00, YF = 0.78, ZB = -0.58, ZF = 0.60;
  const A = Math.atan2(YB - YF, ZF - ZB);
  const YC = (YB + YF) / 2, ZC = (ZB + ZF) / 2, DEP = Math.hypot(YB - YF, ZF - ZB);
  const on = (x, u, t, sag = 0) => [x, YC + u * Math.cos(A) - t * Math.sin(A) - sag, ZC + u * Math.sin(A) + t * Math.cos(A)];
  const sagAt = (x) => 0.035 * (1 - (x / 2.5) ** 2);

  // --- four lapped sheets, each with half-round ridges, each at its own tilt -----------------
  const ridgeGeo = new THREE.CylinderGeometry(0.022, 0.022, DEP - 0.04, 6, 1, true, -Math.PI / 2, Math.PI);
  const W = 1.34;
  for (let s = 0; s < 4; s++) {
    const x = -2.5 + W / 2 + s * 1.22;                        // laps 0.12 over the next
    const mat = tints[s % 4], tilt = (s % 2 ? 0.02 : -0.015), dz = (s % 2 ? 0.03 : 0);
    const lift = s * 0.006;                                   // each sheet laps over the previous
    const sheetPos = on(x, lift, dz, sagAt(x));
    box(W, 0.015, DEP - 0.02, sheetPos, mat, [A + tilt, 0, 0]);
    for (let i = 0; i < 11; i++) {
      const rx = x - W / 2 + 0.08 + i * 0.118;
      const m = new THREE.Mesh(ridgeGeo, i % 4 === 1 ? tints[(s + 1) % 4] : mat);
      const p = on(rx, lift + 0.008, dz, sagAt(rx));
      m.position.set(p[0], p[1], p[2]); m.rotation.set(Math.PI / 2 + A + tilt, 0, 0); g.add(m);
    }
  }
  // wear: paint, tar, a rust bloom, one ridge missing shows as a dark gap patch
  box(0.50, 0.006, 0.35, on(-1.3, 0.04, -0.2, sagAt(-1.3)), paint, [A, 0, 0]);
  box(0.30, 0.006, 0.28, on(0.9, 0.04, 0.2, sagAt(0.9)), paint, [A, 0, 0]);
  box(0.45, 0.006, 0.20, on(1.8, 0.04, -0.3, sagAt(1.8)), tar, [A, 0, 0]);
  box(0.20, 0.006, 0.6, on(-0.3, 0.04, 0.0, sagAt(-0.3)), tints[0], [A, 0, 0]);
  // front lip, and the rolled pipe on the batten the back edge hooks over
  box(5.0, 0.05, 0.03, on(0, 0, DEP / 2 - 0.015, 0.02), tar, [A, 0, 0]);
  cyl(0.04, 0.04, 5.0, 8, [0, YB + 0.01, -0.53], steel, [0, 0, Math.PI / 2]);
  box(5.0, 0.20, 0.08, [0, YB - 0.10, -0.56], timber);
  box(5.0, 0.04, 0.085, [0, YB - 0.16, -0.56], timber2);
  for (const x of [-2.2, -1.1, 0, 1.1, 2.2]) cyl(0.012, 0.012, 0.02, 6, [x, YB - 0.06, -0.51], rustDk, [Math.PI / 2, 0, 0]);
  for (const x of [-2.0, -0.7, 0.7, 2.0]) box(0.06, 0.06, 0.05, [x, YB + 0.01, -0.50], rustDk);   // pipe saddles

  // --- flat-bar struts with gussets, a diagonal tie, purlin --------------------------------------
  box(4.9, 0.035, 0.035, on(0, -0.045, 0.22, 0.02), steel, [A, 0, 0]);
  const tops = [];
  for (const x of [-1.75, 1.75]) {
    const top = on(x, -0.06, 0.22, sagAt(x)); tops.push(top);
    const Av = new THREE.Vector3(x, 0.03, -0.57), Bv = new THREE.Vector3(...top); const d = Bv.clone().sub(Av);
    const bar = box(0.05, d.length(), 0.02, [0, 0, 0], steel);
    bar.position.copy(Av).add(Bv).multiplyScalar(0.5); bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    // gusset: a triangular plate at the wall foot
    const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(0, 0.22); tri.lineTo(0.16, 0); tri.lineTo(0, 0);
    put(new THREE.ExtrudeGeometry(tri, { depth: 0.02, bevelEnabled: false }), rustDk, [x + 0.01, 0.03, -0.57], [0, Math.PI / 2, 0]);
    box(0.09, 0.04, 0.08, [x, 0.02, -0.56], dark);                                          // foot plate, dark
    for (const sx of [-1, 1]) cyl(0.008, 0.008, 0.02, 6, [x + sx * 0.035, 0.05, -0.52], rustDk, [Math.PI / 2, 0, 0]);
    box(0.07, 0.05, 0.05, top, rustDk, [A, 0, 0]);
  }
  rod([tops[0][0], tops[0][1], tops[0][2]], [1.75, 0.03, -0.57], 0.012, rustDk);            // diagonal tie

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
