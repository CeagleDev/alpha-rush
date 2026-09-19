// electrical_box — arm C: a different reading. The cabinet is a double-leaf unit standing
// off the wall on two rails, under a deep rain hood, with a louvred vent in the lower leaf
// and pipe clips on the conduits. The fragment is a rendered-concrete wall with a brick
// reveal and a timber ledger at the top. 0.60 x 0.90 x 0.25 box, fragment 1.0 x 1.3.
// Mounts on its back; base y=0 is the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const render = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const render2 = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const brick = M(0x6b3a2c, 'stone', { roughness: 0.95 });
  const brick2 = M(0x7d4a36, 'stone', { roughness: 0.95 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const steel = M(0x7d8286, 'metal', { roughness: 0.78, metalness: 0.3 });
  const steel2 = M(0x878c8f, 'metal', { roughness: 0.78, metalness: 0.3 });
  const steelDk = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const tag = M(0xd8ae70, 'metal', { roughness: 0.85 });

  // --- fragment: rendered wall, a patch fallen off showing brick, a timber ledger -----
  box(1.0, 1.25, 0.06, [0, 0.675, -0.03], render);
  box(1.0, 0.05, 0.06, [0, 0.025, -0.03], dark);
  box(0.30, 0.35, 0.03, [-0.33, 0.35, -0.045], render2);                 // the recess where render fell off
  for (let r = 0; r < 4; r++) for (let cI = 0; cI < 2; cI++) {
    box(0.13, 0.065, 0.02, [-0.40 + cI * 0.145 + (r % 2) * 0.03, 0.22 + r * 0.085, -0.02], (r + cI) % 2 ? brick : brick2);
  }
  box(0.30, 0.30, 0.004, [0.32, 0.95, 0.002], render2);                   // damp stain
  box(1.02, 0.06, 0.10, [0, 1.27, 0.02], timber);                          // ledger
  for (const x of [-0.42, 0.42]) cyl(0.008, 0.008, 0.02, 6, [x, 1.27, 0.075], rustDk, [Math.PI / 2, 0, 0]);

  // --- stand-off rails and the cabinet ---------------------------------------------
  const BW = 0.6, BH = 0.9, BD = 0.22, BY = 0.62;
  for (const y of [BY + 0.35, BY - 0.35]) box(BW + 0.06, 0.04, 0.03, [0, y, 0.015], rustDk);
  const Z0 = 0.03;
  box(BW, BH, BD, [0, BY, Z0 + BD / 2], steel);
  const F = Z0 + BD;                                                       // face plane
  // two door leaves, the left one 0.24 wide with the vent, the right 0.30 with the handle
  box(0.25, 0.82, 0.018, [-0.155, BY, F + 0.009], steel2);
  box(0.30, 0.82, 0.018, [0.13, BY, F + 0.009], steel);
  box(0.006, 0.82, 0.03, [-0.02, BY, F + 0.005], dark);                    // meeting seam
  box(0.006, 0.82, 0.03, [-0.285, BY, F + 0.005], dark);
  box(0.006, 0.82, 0.03, [0.285, BY, F + 0.005], dark);
  box(0.58, 0.006, 0.03, [0, BY + 0.41, F + 0.005], dark);
  box(0.58, 0.006, 0.03, [0, BY - 0.41, F + 0.005], dark);
  for (const sx of [-1, 1]) for (const y of [BY + 0.30, BY - 0.30]) cyl(0.011, 0.011, 0.07, 6, [sx * 0.29, y, F + 0.02], rust);   // hinges both sides
  // louvred vent, lower left leaf
  for (let i = 0; i < 6; i++) { const bl = box(0.16, 0.022, 0.03, [-0.155, BY - 0.36 + i * 0.035, F + 0.026], steelDk); bl.rotation.x = 0.6; }
  box(0.19, 0.24, 0.006, [-0.155, BY - 0.27, F + 0.02], steelDk);
  // handle, latch, key, label
  box(0.02, 0.14, 0.02, [0.22, BY, F + 0.045], galv);
  for (const y of [BY + 0.06, BY - 0.06]) box(0.02, 0.02, 0.03, [0.22, y, F + 0.03], galv);
  box(0.06, 0.03, 0.02, [0.02, BY - 0.10, F + 0.026], galv);
  cyl(0.012, 0.012, 0.03, 6, [0.02, BY - 0.10, F + 0.03], rustDk, [Math.PI / 2, 0, 0]);
  box(0.09, 0.09, 0.006, [0.15, BY + 0.30, F + 0.02], tag);
  // rain hood: a deep top with a drip edge and two side cheeks
  box(BW + 0.08, 0.035, BD + 0.10, [0, BY + BH / 2 + 0.03, Z0 + (BD + 0.10) / 2 - 0.02], steelDk);
  box(BW + 0.08, 0.03, 0.03, [0, BY + BH / 2 + 0.005, Z0 + BD + 0.065], steelDk);
  for (const sx of [-1, 1]) box(0.03, 0.10, BD + 0.06, [sx * (BW / 2 + 0.025), BY + BH / 2 - 0.035, Z0 + (BD + 0.06) / 2], steelDk);
  // wear: rust from the hood drip line, from both hinge stacks, a dirt band at the base
  for (const [x, y, h] of [[-0.29, BY - 0.42, 0.13], [0.29, BY - 0.42, 0.10], [-0.10, BY + 0.42, 0.22], [0.26, BY + 0.42, 0.10]]) box(0.022, h, 0.004, [x, y - h / 2, F + 0.02], rust);
  box(0.6, 0.05, 0.004, [0, BY - BH / 2 + 0.025, F + 0.001], rustDk);

  // --- conduits with pipe clips -----------------------------------------------------
  const CR = 0.022, ZC = Z0 + BD / 2;
  cyl(CR, CR, 0.24, 8, [-0.10, BY + BH / 2 + 0.16, ZC], galv);
  cyl(CR, CR, 0.24, 8, [0.06, BY + BH / 2 + 0.16, ZC], galv);
  for (const x of [-0.10, 0.06]) { cyl(CR + 0.007, CR + 0.007, 0.03, 8, [x, BY + BH / 2 + 0.05, ZC], rust); box(0.07, 0.03, 0.05, [x, BY + BH / 2 + 0.22, ZC - 0.02], rust); }
  cyl(CR, CR, 0.16, 8, [0.18, BY - BH / 2 - 0.08, ZC], galv);
  put(new THREE.TorusGeometry(0.05, CR, 6, 8, Math.PI / 2), galv, [0.13, BY - BH / 2 - 0.16, ZC], [0, 0, -Math.PI]);
  cyl(CR, CR, 0.50, 8, [-0.12, BY - BH / 2 - 0.21, ZC], galv, [0, 0, Math.PI / 2]);
  for (const x of [-0.32, -0.08]) box(0.03, 0.07, 0.05, [x, BY - BH / 2 - 0.21, ZC - 0.03], rust);
  cyl(CR + 0.007, CR + 0.007, 0.04, 8, [-0.22, BY - BH / 2 - 0.21, ZC], rust, [0, 0, Math.PI / 2]);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
