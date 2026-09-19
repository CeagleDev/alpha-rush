// electrical_box — arm A: primitives. Grey steel distribution box 0.60 x 0.90 x 0.25 on a
// short plank-and-tin wall fragment 1.00 x 1.30. Hinged door seam, two conduits in at the
// top with elbows, one out the bottom into a junction, rust runs under the door.
// Mounts flush on its back. Base y=0 is the fragment's bottom edge (dark grounding band).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const plank = [M(0x4f2d21, 'timber', { roughness: 0.92 }), M(0x37201b, 'timber', { roughness: 0.92 }), M(0x6c4028, 'timber', { roughness: 0.9 })];
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const render = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const steel = M(0x7d8286, 'metal', { roughness: 0.78, metalness: 0.3 });
  const steelDk = M(0x656a6e, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const tag = M(0xd8ae70, 'metal', { roughness: 0.85 });

  // --- wall fragment: five horizontal planks, a corrugated tin patch, a render patch ---
  const FW = 1.0, FH = 1.3, FD = 0.06;
  for (let i = 0; i < 5; i++) {
    const y = 0.05 + 0.125 + i * 0.25;
    box(FW, 0.245, FD, [0, y, -FD / 2 - 0.125 + 0.125], plank[i % 3]);
  }
  box(FW, 0.05, FD, [0, 0.025, 0], dark);                              // grounding band
  box(0.22, 0.6, 0.02, [0.38, 0.55, 0.035], render);                   // render patch behind tin
  for (let i = 0; i < 6; i++) box(0.03, 0.55, 0.02, [0.29 + i * 0.036, 0.55, 0.045], i % 3 === 2 ? tinRust : tin);
  box(1.02, 0.04, 0.14, [0, 1.28, 0.04], plank[1]);                     // top drip board

  // --- the box body ----------------------------------------------------------
  const BW = 0.6, BH = 0.9, BD = 0.25, BY = 0.62, BZ = 0.03 + BD / 2;
  box(BW, BH, BD, [0, BY, BZ], steel);
  box(BW + 0.04, 0.03, BD + 0.02, [0, BY + BH / 2 + 0.015, BZ + 0.01], steelDk);   // rain lip
  // door leaf, proud, with the hinge seam on the left and the shut line all round
  box(0.52, 0.80, 0.02, [0.02, BY, BZ + BD / 2 + 0.01], steel);
  box(0.005, 0.80, 0.03, [-0.245, BY, BZ + BD / 2 + 0.008], dark);          // hinge seam
  box(0.005, 0.80, 0.03, [0.285, BY, BZ + BD / 2 + 0.008], dark);           // shut line
  box(0.53, 0.005, 0.03, [0.02, BY + 0.40, BZ + BD / 2 + 0.008], dark);
  box(0.53, 0.005, 0.03, [0.02, BY - 0.40, BZ + BD / 2 + 0.008], dark);
  for (const y of [BY + 0.30, BY, BY - 0.30]) cyl(0.012, 0.012, 0.07, 6, [-0.25, y, BZ + BD / 2 + 0.02], rust);   // hinges
  // handle: a bar on two stand-offs, a padlock latch below
  for (const y of [BY + 0.06, BY - 0.06]) box(0.02, 0.02, 0.03, [0.24, y, BZ + BD / 2 + 0.035], galv);
  box(0.025, 0.16, 0.02, [0.24, BY, BZ + BD / 2 + 0.055], galv);
  box(0.05, 0.03, 0.02, [0.17, BY - 0.14, BZ + BD / 2 + 0.03], galv);
  cyl(0.012, 0.012, 0.03, 6, [0.17, BY - 0.14, BZ + BD / 2 + 0.03], rustDk, [Math.PI / 2, 0, 0]);
  // label plate
  box(0.08, 0.10, 0.006, [0.10, BY + 0.28, BZ + BD / 2 + 0.023], tag);
  // corner bolts
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(0.008, 0.008, 0.01, 6, [sx * 0.27, BY + sy * 0.42, BZ + BD / 2 + 0.005], rustDk, [Math.PI / 2, 0, 0]);
  // rust runs: from the hinges and under the door, and one from the top lip
  for (const [x, y, h] of [[-0.25, BY - 0.42, 0.12], [-0.18, BY - 0.46, 0.06], [0.22, BY - 0.44, 0.09], [-0.05, BY + 0.30, 0.18]]) {
    box(0.025, h, 0.004, [x, y - h / 2, BZ + BD / 2 + 0.022], rust);
  }
  box(0.6, 0.06, 0.004, [0, BY - BH / 2 + 0.03, BZ + BD / 2 + 0.003], rustDk);   // dirt line along the bottom edge

  // --- conduits ---------------------------------------------------------------
  const CR = 0.022;
  // two in at the top: one straight down from above, one elbowing in from the right
  cyl(CR, CR, 0.22, 8, [-0.15, BY + BH / 2 + 0.11, BZ], galv);
  cyl(CR + 0.006, CR + 0.006, 0.03, 8, [-0.15, BY + BH / 2 + 0.02, BZ], rust);      // gland
  cyl(CR, CR, 0.10, 8, [0.12, BY + BH / 2 + 0.05, BZ], galv);
  put(new THREE.TorusGeometry(0.05, CR, 6, 8, Math.PI / 2), galv, [0.17, BY + BH / 2 + 0.10, BZ], [0, 0, Math.PI / 2]);
  cyl(CR, CR, 0.26, 8, [0.30, BY + BH / 2 + 0.15, BZ], galv, [0, 0, Math.PI / 2]);
  cyl(CR + 0.006, CR + 0.006, 0.03, 8, [0.12, BY + BH / 2 + 0.02, BZ], rust);
  cyl(CR + 0.006, CR + 0.006, 0.04, 8, [0.34, BY + BH / 2 + 0.15, BZ], rust, [0, 0, Math.PI / 2]);   // coupler
  // one out the bottom to a junction on the wall, then off to the left
  cyl(CR, CR, 0.14, 8, [0.05, BY - BH / 2 - 0.07, BZ], galv);
  box(0.12, 0.10, 0.10, [0.05, BY - BH / 2 - 0.17, BZ - 0.02], steelDk);
  cyl(CR, CR, 0.45, 8, [-0.23, BY - BH / 2 - 0.17, BZ - 0.02], galv, [0, 0, Math.PI / 2]);
  for (const x of [-0.30, -0.10]) box(0.03, 0.06, 0.03, [x, BY - BH / 2 - 0.17, BZ - 0.06], rust);   // clips

  g.userData.mounts = 'back';

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
