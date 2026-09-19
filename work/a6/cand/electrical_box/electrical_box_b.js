// electrical_box — arm B: profiles. The cabinet is an extruded rounded-rectangle shell
// (outer ring for the walls, a plate for the back), the door is an extruded rounded
// rectangle, the rain hood an extruded L-section, and every conduit is a TubeGeometry
// swept along a curve so the elbows are real bends. Wall fragment is an extruded
// plank profile with grooves between boards. 0.60 x 0.90 x 0.25 box on a 1.0 x 1.3 fragment.
// Mounts on its back; base y=0 at the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const rrect = (w, h, rad) => { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad);
    s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s; };
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4 }), mat, p, r);
  const tube = (pts, rad, mat, seg = 6) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])), false, 'catmullrom', 0.2), pts.length * 3, rad, seg, false), mat);

  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const render = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const steel = M(0x7d8286, 'metal', { roughness: 0.78, metalness: 0.3, side: THREE.DoubleSide });
  const steelDk = M(0x656a6e, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const tag = M(0xd8ae70, 'metal', { roughness: 0.85 });

  // --- wall fragment: one extruded profile, boards with V grooves between them ------
  {
    const s = new THREE.Shape(); const W = 0.5, N = 5, bh = 1.25 / N;
    s.moveTo(-W, 0.05); s.lineTo(W, 0.05);
    for (let i = 0; i < N; i++) { const y0 = 0.05 + i * bh; s.lineTo(W, y0 + bh - 0.015); s.lineTo(W - 0.012, y0 + bh - 0.008); s.lineTo(W, y0 + bh); }
    s.lineTo(-W, 1.30);
    for (let i = N - 1; i >= 0; i--) { const y0 = 0.05 + i * bh; s.lineTo(-W, y0 + 0.015); s.lineTo(-W + 0.012, y0 + 0.008); s.lineTo(-W, y0); }
    s.lineTo(-W, 0.05);
    ext(s, 0.06, timber, [0, 0, -0.06]);
    box(1.0, 0.05, 0.06, [0, 0.025, -0.03], dark);                          // grounding band
    box(1.0, 0.03, 0.06, [0, 0.66, -0.028], timber2);                       // a darker board joint
    // corrugated tin patch to the right: a sine-ish zigzag profile extruded down the wall
    const z = new THREE.Shape(); z.moveTo(0, 0);
    for (let i = 0; i <= 12; i++) z.lineTo(i * 0.02, (i % 2 ? 0.012 : 0));
    z.lineTo(0.24, -0.008); z.lineTo(0, -0.008); z.lineTo(0, 0);
    ext(z, 0.55, tin, [0.26, 0.85, 0.01], [Math.PI / 2, 0, 0]);
    box(0.24, 0.55, 0.01, [0.38, 0.575, 0.005], render);
    box(1.02, 0.04, 0.14, [0, 1.28, 0.04], timber2);                        // drip board
  }

  // --- cabinet: extruded rounded-rect ring for the walls + a back plate + a door -------
  const BW = 0.6, BH = 0.9, BD = 0.25, BY = 0.62;
  {
    const outer = rrect(BW, BH, 0.03); const inner = rrect(BW - 0.03, BH - 0.03, 0.02);
    outer.holes.push(inner);
    ext(outer, BD, steel, [0, BY, 0.0]);
    box(BW - 0.02, BH - 0.02, 0.02, [0, BY, 0.02], steelDk);               // back plate
    ext(rrect(0.53, 0.82, 0.025), 0.02, steel, [0.02, BY, BD]);            // door leaf
    // hood: an L-section extruded across the top
    const L = new THREE.Shape(); L.moveTo(0, 0); L.lineTo(0.29, 0); L.lineTo(0.29, -0.03); L.lineTo(0.02, -0.03); L.lineTo(0.02, -0.06); L.lineTo(0, -0.06); L.lineTo(0, 0);
    ext(L, BW + 0.04, steelDk, [BW / 2 + 0.02, BY + BH / 2 + 0.03, 0], [0, -Math.PI / 2, 0]);
  }
  const F = BD + 0.02;                                                     // door face plane
  box(0.006, 0.82, 0.03, [-0.245, BY, F - 0.01], dark);                    // hinge seam
  box(0.006, 0.82, 0.03, [0.285, BY, F - 0.01], dark);                     // shut line
  for (const y of [BY + 0.31, BY, BY - 0.31]) put(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), rust, [-0.25, y, F + 0.004]);
  // handle: a swept tube on two lugs
  tube([[0.24, BY - 0.08, F], [0.24, BY - 0.07, F + 0.04], [0.24, BY + 0.07, F + 0.04], [0.24, BY + 0.08, F]], 0.011, galv);
  put(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8), rustDk, [0.17, BY - 0.15, F + 0.01], [Math.PI / 2, 0, 0]);   // key cylinder
  box(0.08, 0.10, 0.006, [0.10, BY + 0.28, F + 0.003], tag);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) put(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 6), rustDk, [sx * 0.27, BY + sy * 0.42, F + 0.002], [Math.PI / 2, 0, 0]);
  for (const [x, y, h] of [[-0.25, BY - 0.42, 0.14], [0.20, BY - 0.44, 0.08], [-0.02, BY + 0.32, 0.20]]) box(0.024, h, 0.004, [x, y - h / 2, F + 0.002], rust);
  box(0.6, 0.06, 0.004, [0, BY - BH / 2 + 0.03, F - 0.018], rustDk);

  // --- conduits, swept -----------------------------------------------------------
  const CR = 0.022, ZC = BD / 2;
  tube([[-0.15, BY + BH / 2, ZC], [-0.15, BY + BH / 2 + 0.16, ZC], [-0.15, BY + BH / 2 + 0.22, ZC - 0.02]], CR, galv, 6);
  tube([[0.12, BY + BH / 2, ZC], [0.12, BY + BH / 2 + 0.08, ZC], [0.16, BY + BH / 2 + 0.14, ZC], [0.24, BY + BH / 2 + 0.16, ZC], [0.46, BY + BH / 2 + 0.16, ZC]], CR, galv, 6);
  tube([[0.05, BY - BH / 2, ZC], [0.05, BY - BH / 2 - 0.10, ZC], [0.02, BY - BH / 2 - 0.16, ZC - 0.02], [-0.06, BY - BH / 2 - 0.18, ZC - 0.03], [-0.46, BY - BH / 2 - 0.18, ZC - 0.03]], CR, galv, 6);
  for (const p of [[-0.15, BY + BH / 2 + 0.02, ZC], [0.12, BY + BH / 2 + 0.02, ZC], [0.05, BY - BH / 2 - 0.02, ZC]]) put(new THREE.CylinderGeometry(CR + 0.007, CR + 0.007, 0.03, 8), rust, p);
  put(new THREE.CylinderGeometry(CR + 0.007, CR + 0.007, 0.04, 8), rust, [0.36, BY + BH / 2 + 0.16, ZC], [0, 0, Math.PI / 2]);
  box(0.03, 0.06, 0.03, [-0.30, BY - BH / 2 - 0.18, ZC - 0.07], rust);
  box(0.03, 0.06, 0.03, [-0.12, BY - BH / 2 - 0.18, ZC - 0.07], rust);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
