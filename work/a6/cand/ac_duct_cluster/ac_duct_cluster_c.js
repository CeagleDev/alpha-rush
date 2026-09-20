// ac_duct_cluster — arm C: a different reading. The two units are stacked one above the
// other on a single welded shelf rack at the left, a rigid square galvanised duct runs from
// the top unit across the wall to the right with mitred elbows, a drain hose drips from the
// lower unit, a plastic meter box and the cable coil sit on the right, and the fragment is
// tin sheet in a timber frame rather than planks. 2.0 w x 1.6 h x 0.5 d.
// Mounts on its back; base y=0 is the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tin2 = M(0x6f7477, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const white = M(0xb9b3a4, 'metal', { roughness: 0.85, metalness: 0.3 });
  const white2 = M(0xc2b89f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const whiteDirty = M(0x8f8a7c, 'metal', { roughness: 0.9, metalness: 0.3 });
  const fanDk = M(0x2a2a2a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const grille = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const grey = M(0x656a6e, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const lag = M(0x8a8378, 'fabric', { roughness: 0.95 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- fragment: tin sheets in a timber frame ---------------------------------------------
  box(2.0, 1.55, 0.03, [0, 0.825, -0.045], tin2);
  for (let i = 0; i < 30; i++) box(0.03, 1.45, 0.02, [-0.95 + i * 0.0655, 0.80, -0.02], i % 7 === 3 ? tinRust : (i % 5 === 1 ? tin2 : tin));
  box(2.0, 0.05, 0.06, [0, 0.025, -0.03], dark);
  for (const y of [0.09, 0.78, 1.52]) box(2.0, 0.08, 0.06, [0, y, -0.03], timber);
  for (const x of [-0.96, 0.0, 0.96]) box(0.08, 1.55, 0.06, [x, 0.825, -0.03], timber2);
  box(2.08, 0.05, 0.18, [0, 1.60, 0.03], timber2);
  box(0.50, 0.30, 0.008, [0.45, 0.50, 0.004], tinRust);                                   // a rusted sheet

  // --- shelf rack on the left: two shelves, two uprights, diagonal ties ---------------------
  const RX = -0.55, D = 0.28;
  for (const sx of [-1, 1]) box(0.05, 1.30, 0.05, [RX + sx * 0.42, 0.72, 0.03], rust);
  for (const y of [0.42, 1.02]) {
    for (const sx of [-1, 1]) box(0.05, 0.05, D + 0.10, [RX + sx * 0.42, y, (D + 0.10) / 2 + 0.005], rustDk);
    box(0.90, 0.04, 0.05, [RX, y, D + 0.08], rust);
    for (const sx of [-1, 1]) box(0.03, 0.42, 0.02, [RX + sx * 0.42, y - 0.18, 0.18], rust, [Math.atan2(0.3, 0.3), 0, 0]);
  }
  // --- two stacked units ----------------------------------------------------------------------------
  const unit = (x, y, bodyMat, w) => {
    const F = 0.06 + D;
    box(w, 0.52, D, [x, y, 0.06 + D / 2], bodyMat);
    box(w, 0.05, D + 0.01, [x, y - 0.235, 0.06 + D / 2], whiteDirty);
    const fx = x - w / 2 + 0.28;
    cyl(0.19, 0.19, 0.02, 14, [fx, y, F - 0.005], fanDk, [Math.PI / 2, 0, 0]);
    cyl(0.04, 0.04, 0.03, 8, [fx, y, F + 0.005], white2, [Math.PI / 2, 0, 0]);
    put(new THREE.TorusGeometry(0.19, 0.012, 4, 14), grille, [fx, y, F + 0.008]);
    for (let k = 0; k < 4; k++) box(0.38, 0.012, 0.01, [fx, y, F + 0.008], grille, [0, 0, k * Math.PI / 4]);
    box(w * 0.30, 0.34, 0.006, [x + w / 2 - w * 0.19, y + 0.02, F + 0.003], whiteDirty);
    for (let k = 0; k < 6; k++) box(w * 0.26, 0.012, 0.012, [x + w / 2 - w * 0.19, y - 0.13 + k * 0.05, F + 0.008], grille);
    for (let k = 0; k < 5; k++) box(0.012, 0.42, 0.012, [x + w / 2 + 0.006, y, 0.06 + 0.05 + k * 0.045], grille);
    box(0.10, 0.10, 0.06, [x + w / 2 - 0.08, y - 0.18, 0.06 + D + 0.02], grey);
    box(0.07, 0.04, 0.004, [x - w / 2 + 0.08, y + 0.20, F + 0.002], rust);
    box(0.20, 0.03, 0.004, [x + 0.1, y - 0.25, F + 0.002], rust);
  };
  unit(RX, 0.70, white, 0.78);
  unit(RX, 1.30, white2, 0.78);

  // --- rigid square duct from the top unit across to the right, mitred elbows ------------------
  const DZ = 0.16, DS = 0.11;
  box(DS, DS, DS, [RX + 0.45, 1.30, DZ], galv);
  box(0.9, DS, DS, [RX + 0.95, 1.30, DZ], galv, [0, 0, 0]);
  box(DS, DS, DS, [0.90, 1.30, DZ], galv, [0, 0, Math.PI / 4]);                            // mitre
  box(DS, 0.55, DS, [0.90, 1.00, DZ], galv);
  box(DS + 0.02, 0.03, DS + 0.02, [0.90, 0.75, DZ], grey);                                  // flange
  for (const x of [-0.05, 0.40]) { box(DS + 0.02, 0.03, DS + 0.02, [x, 1.30, DZ], grey); box(0.06, 0.04, 0.08, [x, 1.30 + DS / 2 + 0.02, DZ - 0.02], rustDk); }
  cyl(0.05, 0.05, 0.10, 8, [0.90, 0.68, DZ], grey);                                        // outlet stub

  // --- lagged line and drain hose from the lower unit ----------------------------------------------
  cyl(0.035, 0.035, 0.30, 8, [RX + 0.30, 0.30, 0.20], lag);
  put(new THREE.TorusGeometry(0.07, 0.035, 5, 8, Math.PI / 2), lag, [RX + 0.23, 0.15, 0.20], [0, 0, 0]);
  cyl(0.035, 0.035, 0.80, 8, [RX - 0.24, 0.08, 0.20], lag, [0, 0, Math.PI / 2]);
  for (const x of [RX - 0.5, RX - 0.1]) box(0.09, 0.03, 0.10, [x, 0.08, 0.10], rustDk);
  cyl(0.012, 0.012, 0.42, 5, [RX + 0.40, 0.25, 0.25], grey, [0.1, 0, 0.35]);               // drain hose
  cyl(0.012, 0.012, 0.22, 5, [RX + 0.34, 0.06, 0.18], grey, [0.1, 0, -0.6]);

  // --- meter box and cable coil on the right ---------------------------------------------------------
  box(0.20, 0.26, 0.10, [0.55, 1.05, 0.11], grey);
  box(0.14, 0.08, 0.006, [0.55, 1.10, 0.163], cable);
  box(0.22, 0.03, 0.12, [0.55, 1.19, 0.10], grey);
  box(0.06, 0.05, 0.004, [0.48, 0.96, 0.162], rust);
  for (let k = 0; k < 3; k++) put(new THREE.TorusGeometry(0.09, 0.008, 4, 12), cable, [0.55, 0.60 - k * 0.02, 0.10 + k * 0.012], [0.1 * k, 0.1, 0]);
  cyl(0.008, 0.008, 0.28, 5, [0.55, 0.85, 0.08], cable, [0.05, 0, 0.04]);
  cyl(0.008, 0.008, 0.30, 5, [0.55, 1.36, 0.08], cable, [-0.06, 0, 0.03]);
  cyl(0.008, 0.008, 0.5, 5, [0.10, 1.53, 0.08], cable, [0, 0, Math.PI / 2 - 0.05]);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
