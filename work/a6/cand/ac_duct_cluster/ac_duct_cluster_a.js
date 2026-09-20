// ac_duct_cluster — arm A: primitives. Two dirty-white AC outdoor units on rusty L-brackets
// side by side on a plank wall fragment 2.0 w x 1.6 h, insulated pipes dropping to a
// horizontal run with elbows, a flexible duct swept on a curve from the left unit up and
// over to a wall pipe, a grey junction box and a coil of cable on the right, a louvred vent
// low down. 0.5 m deep overall. Mounts on its back; base y=0 is the fragment's dark band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const planks = [M(0x4f2d21, 'timber', { roughness: 0.92 }), M(0x37201b, 'timber', { roughness: 0.92 }), M(0x6c4028, 'timber', { roughness: 0.9 })];
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const white = M(0xb9b3a4, 'metal', { roughness: 0.85, metalness: 0.3 });
  const white2 = M(0xc2b89f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const whiteDirty = M(0x8f8a7c, 'metal', { roughness: 0.9, metalness: 0.3 });
  const fanDk = M(0x2a2a2a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const grille = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const grey = M(0x656a6e, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const lag = M(0x8a8378, 'fabric', { roughness: 0.95 });            // pipe lagging
  const duct = M(0x9a9388, 'metal', { roughness: 0.9, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- fragment ------------------------------------------------------------------------
  for (let i = 0; i < 6; i++) box(2.0, 0.255, 0.06, [0, 0.05 + 0.1275 + i * 0.255, -0.03], planks[i % 3]);
  box(2.0, 0.05, 0.06, [0, 0.025, -0.03], dark);
  box(2.08, 0.05, 0.18, [0, 1.60, 0.03], planks[1]);                                   // drip board
  for (let i = 0; i < 10; i++) box(0.03, 0.55, 0.02, [-0.20 + i * 0.045, 0.40, 0.01], i % 4 === 1 ? tinRust : tin);   // tin patch
  box(0.46, 0.55, 0.01, [0.0, 0.40, -0.002], tin);
  box(0.30, 0.20, 0.03, [0.55, 0.30, 0.015], grey);                                      // vent
  for (let i = 0; i < 4; i++) { const bl = box(0.26, 0.02, 0.03, [0.55, 0.23 + i * 0.045, 0.03], galv); bl.rotation.x = 0.6; }

  // --- two units on brackets --------------------------------------------------------------
  const unit = (x, y, bodyMat, w) => {
    const D = 0.28, F = 0.06 + D;
    box(w, 0.55, D, [x, y, 0.06 + D / 2], bodyMat);
    box(w, 0.06, D + 0.01, [x, y - 0.245, 0.06 + D / 2], whiteDirty);                     // dirty base band
    cyl(0.20, 0.20, 0.02, 14, [x - w / 2 + 0.30, y, F - 0.005], fanDk, [Math.PI / 2, 0, 0]);
    cyl(0.045, 0.045, 0.03, 8, [x - w / 2 + 0.30, y, F + 0.005], white2, [Math.PI / 2, 0, 0]);
    put(new THREE.TorusGeometry(0.20, 0.012, 4, 14), grille, [x - w / 2 + 0.30, y, F + 0.008]);
    put(new THREE.TorusGeometry(0.11, 0.008, 4, 12), grille, [x - w / 2 + 0.30, y, F + 0.008]);
    for (let k = 0; k < 4; k++) box(0.40, 0.012, 0.01, [x - w / 2 + 0.30, y, F + 0.008], grille, [0, 0, k * Math.PI / 4]);
    box(w * 0.32, 0.36, 0.006, [x + w / 2 - w * 0.2, y + 0.02, F + 0.003], whiteDirty);    // side panel, grimier
    for (let k = 0; k < 6; k++) box(w * 0.28, 0.012, 0.012, [x + w / 2 - w * 0.2, y - 0.14 + k * 0.05, F + 0.008], grille);   // louvres
    for (let k = 0; k < 5; k++) box(0.012, 0.44, 0.012, [x + w / 2 + 0.006, y, 0.06 + 0.05 + k * 0.045], grille);   // side coil grille
    box(0.10, 0.10, 0.06, [x + w / 2 - 0.08, y - 0.19, 0.06 + D + 0.02], grey);                                     // valve cover
    box(0.05, 0.05, 0.004, [x - w / 2 + 0.06, y + 0.22, F + 0.002], rust);                                          // rust bloom
    for (const bx of [x - w / 2 + 0.12, x + w / 2 - 0.12]) {                                                        // L brackets
      box(0.05, 0.45, 0.04, [bx, y - 0.45, 0.08], rust);
      box(0.05, 0.04, D + 0.02, [bx, y - 0.295, 0.06 + D / 2 + 0.01], rustDk);
      const dl = Math.sqrt(0.35 ** 2 + 0.3 ** 2);
      box(0.03, dl, 0.02, [bx, y - 0.45, 0.06 + 0.16], rust, [Math.atan2(0.3, 0.35), 0, 0]);
    }
  };
  unit(-0.55, 0.95, white, 0.78);
  unit(0.45, 1.00, white2, 0.75);

  // --- insulated pipes: drops, elbows, a horizontal run off to the left ------------------------
  const PR = 0.035, PZ = 0.20;
  for (const x of [-0.30, 0.70]) { cyl(PR, PR, 0.30, 8, [x, 0.55, PZ], lag); put(new THREE.TorusGeometry(0.07, PR, 5, 8, Math.PI / 2), lag, [x - 0.07, 0.40, PZ], [0, 0, 0]); }
  cyl(PR, PR, 1.60, 8, [-0.25, 0.33, PZ], lag, [0, 0, Math.PI / 2]);
  cyl(PR + 0.01, PR + 0.01, 0.05, 8, [0.20, 0.33, PZ], galv, [0, 0, Math.PI / 2]);        // coupler tape
  cyl(PR + 0.01, PR + 0.01, 0.05, 8, [-0.62, 0.33, PZ], galv, [0, 0, Math.PI / 2]);
  put(new THREE.TorusGeometry(0.07, PR, 5, 8, Math.PI / 2), lag, [-1.05, 0.40, PZ], [0, 0, Math.PI / 2]);
  cyl(PR, PR, 1.10, 8, [-1.12, 0.95, PZ], lag);
  put(new THREE.TorusGeometry(0.07, PR, 5, 8, Math.PI / 2), lag, [-1.05, 1.50, PZ], [0, 0, Math.PI]);
  cyl(PR, PR, 0.25, 8, [-0.92, 1.57, PZ], lag, [0, 0, Math.PI / 2]);
  for (const [x, y] of [[-0.45, 0.33], [0.05, 0.33], [-1.12, 0.75], [-1.12, 1.25]]) box(0.09, 0.03, 0.10, [x, y, PZ - 0.10], rustDk);   // clips
  // small copper lines from each unit's valve cover to the lagged pipe
  for (const x of [-0.25, 0.80]) cyl(0.008, 0.008, 0.20, 5, [x, 0.62, PZ + 0.05], galv, [0, 0, 0.2]);

  // --- flexible duct: one curve from the left unit up and over to a wall stub -------------------
  const pts = [[-0.60, 1.20, 0.30], [-0.70, 1.38, 0.32], [-0.88, 1.45, 0.22], [-0.96, 1.30, 0.12], [-0.96, 1.05, 0.10]];
  put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2]))), 20, 0.05, 8, false), duct);
  cyl(0.06, 0.06, 0.05, 8, [-0.96, 1.03, 0.10], grey);
  cyl(0.06, 0.06, 0.04, 8, [-0.60, 1.20, 0.30], grey, [0, 0, Math.PI / 2]);
  for (let k = 0; k < 7; k++) { const t = 0.1 + k * 0.13; const p = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2]))).getPoint(t); put(new THREE.TorusGeometry(0.052, 0.008, 4, 8), duct, [p.x, p.y, p.z], [0, 0, 0]).lookAt(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2]))).getPoint(t + 0.02)); }

  // --- junction box, cable coil, cable ----------------------------------------------------------
  box(0.16, 0.22, 0.09, [0.86, 1.10, 0.105], grey);
  box(0.10, 0.06, 0.006, [0.86, 1.14, 0.153], cable);                                    // window
  box(0.16, 0.02, 0.02, [0.86, 1.22, 0.12], rust);
  for (let k = 0; k < 3; k++) put(new THREE.TorusGeometry(0.09, 0.008, 4, 12), cable, [0.84, 0.68 - k * 0.02, 0.10 + k * 0.012], [0.1 * k, 0.15, 0]);
  cyl(0.008, 0.008, 0.32, 5, [0.86, 0.90, 0.08], cable, [0.05, 0, 0.04]);
  cyl(0.008, 0.008, 0.28, 5, [0.86, 1.36, 0.08], cable, [-0.06, 0, 0.03]);
  cyl(0.008, 0.008, 0.18, 5, [0.90, 0.85, 0.12], cable, [0.9, 0, 0.5]);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
