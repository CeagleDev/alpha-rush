// tin_awning — arm A: primitives. Corrugated tin awning 5.0 w x 1.2 d: three overlapping
// sheets (rust / weathered / galvanised) as slabs with the corrugation as thin ridge boxes,
// sagging in the middle, a rolled pipe hem at the wall, a timber batten it hangs from, two
// angled steel struts and a purlin. Seen from below, so the sheets are double-sided.
// MOUNTING: userData.mounts = 'back'. Base y=0 is the strut FEET (the wall fixings); the
// sheet tops out at about 1.0 m. The game mounts this at 3.0 m on the shophouse wall.
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
  const sheetA = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3, ...DS });      // rust
  const sheetB = M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3, ...DS });     // weathered tin in lamplight
  const sheetC = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, ...DS });      // galvanised
  const ridge = M(0x5a3a26, 'metal', { roughness: 0.9, metalness: 0.3, ...DS });
  const ridge2 = M(0x8a8f8f, 'metal', { roughness: 0.8, metalness: 0.3, ...DS });
  const paint = M(0xbfb6a0, 'metal', { roughness: 0.92, metalness: 0.3 });             // faded painted patch
  const tar = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.3 });
  const steel = M(0x4a3a30, 'metal', { roughness: 0.9, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // sheet plane: back edge (z=-0.58) at y=1.00, front edge (z=+0.60) at y=0.78
  const YB = 1.00, YF = 0.78, ZB = -0.58, ZF = 0.60;
  const A = Math.atan2(YB - YF, ZF - ZB);                     // positive rotation.x drops the front
  const YC = (YB + YF) / 2, ZC = (ZB + ZF) / 2, DEP = Math.hypot(YB - YF, ZF - ZB);
  // a point on the sheet: x across, u up off the sheet, t along the slope (-DEP/2 back .. +DEP/2 front)
  const on = (x, u, t, sag = 0) => [x, YC + u * Math.cos(A) - t * Math.sin(A) - sag, ZC + u * Math.sin(A) + t * Math.cos(A)];
  const sagAt = (x) => 0.035 * (1 - (x / 2.5) ** 2);

  // --- three sheets, overlapping, each sagged a little more toward the middle ---------------
  const sheets = [[-1.68, sheetA], [0.0, sheetB], [1.68, sheetC]];
  for (const [x, m] of sheets) {
    box(1.72, 0.02, DEP, on(x, 0, 0, sagAt(x)), m, [A, 0, 0]);
  }
  // corrugation ridges across all three, colour following the sheet under them
  for (let i = 0; i <= 41; i++) {
    const x = -2.46 + i * 0.12;
    const m = x < -0.84 ? ridge : (x < 0.84 ? (i % 3 ? sheetB : ridge) : ridge2);
    box(0.045, 0.025, DEP - 0.02, on(x, 0.02, 0, sagAt(x)), m, [A, 0, 0]);
  }
  // wear: painted patches, tar repairs, a rust bloom, a dent (a slightly dropped strip)
  box(0.55, 0.006, 0.40, on(-0.9, 0.035, -0.15, sagAt(-0.9)), paint, [A, 0, 0]);
  box(0.30, 0.006, 0.25, on(0.75, 0.035, 0.25, sagAt(0.75)), paint, [A, 0, 0]);
  box(0.40, 0.006, 0.18, on(1.5, 0.035, -0.35, sagAt(1.5)), tar, [A, 0, 0]);
  box(0.25, 0.006, 0.50, on(-0.1, 0.035, 0.1, sagAt(-0.1)), sheetA, [A, 0, 0]);
  box(0.36, 0.02, 0.30, on(1.9, -0.012, 0.3, sagAt(1.9)), sheetA, [A + 0.06, 0, 0.03]);   // a dented panel hanging low
  // front lip and the pipe hem at the back the sheet rolls over
  box(5.0, 0.05, 0.03, on(0, 0, DEP / 2 - 0.015, 0.02), tar, [A, 0, 0]);
  cyl(0.035, 0.035, 5.0, 8, on(0, 0.0, -DEP / 2 + 0.02, 0.0), steel, [0, 0, Math.PI / 2]);

  // --- batten on the wall, bolts --------------------------------------------------------------
  box(5.0, 0.20, 0.08, [0, YB - 0.04, -0.60 + 0.04], timber);
  box(5.0, 0.04, 0.085, [0, YB - 0.12, -0.60 + 0.04], timber2);                              // dark band along the batten
  for (const x of [-2.2, -1.1, 0, 1.1, 2.2]) cyl(0.012, 0.012, 0.02, 6, [x, YB - 0.03, -0.51], rustDk, [Math.PI / 2, 0, 0]);
  for (const x of [-1.7, 1.7]) box(0.10, 0.06, 0.08, on(x, -0.05, -DEP / 2 + 0.08), rustDk, [A, 0, 0]);   // sheet-to-batten clips

  // --- struts and purlin --------------------------------------------------------------------------
  const purl = on(0, -0.045, 0.25, 0.02);
  box(4.9, 0.035, 0.035, purl, ridge2, [A, 0, 0]);
  for (const x of [-1.75, 1.75]) {
    const top = on(x, -0.06, 0.25, sagAt(x));
    rod([x, 0.03, -0.57], top, 0.02, steel);
    box(0.09, 0.04, 0.08, [x, 0.02, -0.56], dark);                                          // foot: dark grounding stub on the wall
    box(0.11, 0.03, 0.07, [x, 0.045, -0.555], rustDk);
    for (const sx of [-1, 1]) cyl(0.008, 0.008, 0.02, 6, [x + sx * 0.035, 0.05, -0.52], rustDk, [Math.PI / 2, 0, 0]);
    box(0.06, 0.05, 0.05, top, rustDk, [A, 0, 0]);                                           // strut head bracket
    cyl(0.026, 0.026, 0.06, 6, [x, 0.55, -0.57 + 0.52 * (0.55 / (top[1] - 0.03)) * 0 + (top[2] + 0.57) * (0.52 / (top[1] - 0.03))], steel, [0, 0, 0]); // a bolted splice sleeve on the strut
  }

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
