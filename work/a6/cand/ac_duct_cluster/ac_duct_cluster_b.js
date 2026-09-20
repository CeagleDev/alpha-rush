// ac_duct_cluster — arm B: profiles. AC bodies are extruded rounded rectangles, the fan
// grilles lathed dishes, the brackets extruded L-sections, every pipe (lagged lines, the
// flexible duct, the cable) a TubeGeometry along a curve, the cable coil a tube on a helix,
// and the plank fragment one extruded grooved profile. 2.0 w x 1.6 h x 0.5 d.
// Mounts on its back; base y=0 is the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const V3 = (q) => new THREE.Vector3(q[0], q[1], q[2]);
  const tube = (pts, rad, mat, tseg, rseg = 8, tension = 0.3) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3), false, 'catmullrom', tension), tseg, rad, rseg, false), mat);
  const rrect = (w, h, rad) => { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad);
    s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s; };
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 }), mat, p, r);
  const lathe = (pts, seg, mat, p, r) => put(new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), seg), mat, p, r);

  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const white = M(0xb9b3a4, 'metal', { roughness: 0.85, metalness: 0.3 });
  const white2 = M(0xc2b89f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const whiteDirty = M(0x8f8a7c, 'metal', { roughness: 0.9, metalness: 0.3 });
  const fanDk = M(0x2a2a2a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const grille = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const grey = M(0x656a6e, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const lag = M(0x8a8378, 'fabric', { roughness: 0.95 });
  const duct = M(0x9a9388, 'metal', { roughness: 0.9, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- fragment: grooved plank profile ---------------------------------------------------
  {
    const s = new THREE.Shape(); const W = 1.0, N = 6, bh = 1.5 / N;
    s.moveTo(-W, 0.05); s.lineTo(W, 0.05);
    for (let i = 0; i < N; i++) { const y0 = 0.05 + i * bh; s.lineTo(W, y0 + bh - 0.014); s.lineTo(W - 0.012, y0 + bh - 0.007); s.lineTo(W, y0 + bh); }
    s.lineTo(-W, 1.55);
    for (let i = N - 1; i >= 0; i--) { const y0 = 0.05 + i * bh; s.lineTo(-W, y0 + 0.014); s.lineTo(-W + 0.012, y0 + 0.007); s.lineTo(-W, y0); }
    s.lineTo(-W, 0.05);
    ext(s, 0.06, timber, [0, 0, -0.06]);
    box(2.0, 0.05, 0.06, [0, 0.025, -0.03], dark);
    box(2.0, 0.03, 0.06, [0, 0.80, -0.028], timber2);
    box(2.08, 0.05, 0.18, [0, 1.575, 0.03], timber2);
    const z = new THREE.Shape(); z.moveTo(0, 0);
    for (let i = 0; i <= 22; i++) z.lineTo(i * 0.02, (i % 2 ? 0.012 : 0));
    z.lineTo(0.44, -0.006); z.lineTo(0, -0.006); z.lineTo(0, 0);
    ext(z, 0.55, tin, [-0.22, 0.68, 0.006], [Math.PI / 2, 0, 0]);
    box(0.30, 0.20, 0.03, [0.55, 0.30, 0.015], grey);
    for (let i = 0; i < 4; i++) { const bl = box(0.26, 0.02, 0.03, [0.55, 0.23 + i * 0.045, 0.03], galv); bl.rotation.x = 0.6; }
  }

  // --- units: extruded bodies, lathed grilles, extruded L brackets ---------------------------
  const unit = (x, y, bodyMat, w) => {
    const D = 0.28, F = 0.06 + D;
    ext(rrect(w, 0.55, 0.03), D, bodyMat, [x, y, 0.06]);
    box(w - 0.02, 0.05, D, [x, y - 0.245, 0.06 + D / 2], whiteDirty);
    const fx = x - w / 2 + 0.30;
    cyl(0.20, 0.20, 0.02, 14, [fx, y, F - 0.005], fanDk, [Math.PI / 2, 0, 0]);
    lathe([[0.04, 0.02], [0.10, 0.012], [0.16, 0.006], [0.21, 0.0], [0.22, 0.012], [0.21, 0.02]], 14, grille, [fx, y, F], [Math.PI / 2, 0, 0]);
    cyl(0.045, 0.045, 0.03, 8, [fx, y, F + 0.005], white2, [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 3; k++) box(0.40, 0.012, 0.008, [fx, y, F + 0.012], grille, [0, 0, k * Math.PI / 3]);
    box(w * 0.32, 0.36, 0.006, [x + w / 2 - w * 0.2, y + 0.02, F + 0.003], whiteDirty);
    for (let k = 0; k < 6; k++) box(w * 0.28, 0.012, 0.012, [x + w / 2 - w * 0.2, y - 0.14 + k * 0.05, F + 0.008], grille);
    for (let k = 0; k < 5; k++) box(0.012, 0.44, 0.012, [x + w / 2 + 0.006, y, 0.06 + 0.05 + k * 0.045], grille);
    box(0.10, 0.10, 0.06, [x + w / 2 - 0.08, y - 0.19, 0.06 + D + 0.02], grey);
    box(0.05, 0.05, 0.004, [x - w / 2 + 0.06, y + 0.22, F + 0.002], rust);
    const L = new THREE.Shape(); L.moveTo(0, 0); L.lineTo(0.04, 0); L.lineTo(0.04, 0.42); L.lineTo(D + 0.02, 0.42); L.lineTo(D + 0.02, 0.46); L.lineTo(0, 0.46); L.lineTo(0, 0);
    for (const bx of [x - w / 2 + 0.12, x + w / 2 - 0.12]) {
      ext(L, 0.05, rust, [bx - 0.025, y - 0.735, 0.06], [0, -Math.PI / 2, 0]);
      tube([[bx, y - 0.72, 0.09], [bx, y - 0.32, 0.06 + D]], 0.012, rustDk, 1, 5);
    }
  };
  unit(-0.55, 0.95, white, 0.78);
  unit(0.45, 1.00, white2, 0.75);

  // --- lagged pipes, one sweep each -----------------------------------------------------------
  const PZ = 0.20;
  tube([[-0.30, 0.70, PZ], [-0.30, 0.42, PZ], [-0.36, 0.34, PZ], [-0.60, 0.33, PZ], [-1.00, 0.33, PZ], [-1.10, 0.40, PZ], [-1.12, 0.80, PZ], [-1.12, 1.40, PZ], [-1.06, 1.55, PZ], [-0.85, 1.57, PZ]], 0.035, lag, 40);
  tube([[0.70, 0.72, PZ], [0.70, 0.42, PZ], [0.63, 0.34, PZ], [0.30, 0.33, PZ], [-0.30, 0.33, PZ]], 0.035, lag, 16);
  for (const [x, y] of [[-0.45, 0.33], [0.05, 0.33], [-1.12, 0.75], [-1.12, 1.25]]) box(0.09, 0.03, 0.10, [x, y, PZ - 0.10], rustDk);
  cyl(0.045, 0.045, 0.05, 8, [0.20, 0.33, PZ], galv, [0, 0, Math.PI / 2]);
  cyl(0.045, 0.045, 0.05, 8, [-0.62, 0.33, PZ], galv, [0, 0, Math.PI / 2]);
  for (const x of [-0.25, 0.80]) tube([[x, 0.72, PZ + 0.05], [x + 0.02, 0.60, PZ + 0.05], [x - 0.02, 0.50, PZ + 0.04]], 0.008, galv, 4, 5);

  // --- flexible duct with ribs, on one curve ------------------------------------------------------
  const dp = [[-0.60, 1.20, 0.30], [-0.70, 1.38, 0.32], [-0.88, 1.45, 0.22], [-0.96, 1.30, 0.12], [-0.96, 1.05, 0.10]];
  tube(dp, 0.05, duct, 24, 8, 0.5);
  const curve = new THREE.CatmullRomCurve3(dp.map(V3), false, 'catmullrom', 0.5);
  for (let k = 0; k < 8; k++) { const t = 0.08 + k * 0.115; const p = curve.getPoint(t); const m = put(new THREE.TorusGeometry(0.052, 0.008, 4, 8), duct, [p.x, p.y, p.z]); m.lookAt(curve.getPoint(t + 0.02)); }
  cyl(0.06, 0.06, 0.05, 8, [-0.96, 1.03, 0.10], grey);
  cyl(0.06, 0.06, 0.04, 8, [-0.60, 1.20, 0.30], grey, [0, 0, Math.PI / 2]);

  // --- junction box, helical cable coil, cable --------------------------------------------------------
  ext(rrect(0.16, 0.22, 0.015), 0.09, grey, [0.86, 1.10, 0.06]);
  box(0.10, 0.06, 0.006, [0.86, 1.14, 0.153], cable);
  box(0.16, 0.02, 0.02, [0.86, 1.22, 0.12], rust);
  { const hp = []; for (let i = 0; i <= 30; i++) { const a = i * Math.PI * 2 * 2.5 / 30; hp.push([0.84 + Math.cos(a) * 0.09, 0.66 + Math.sin(a) * 0.09 * 0.9, 0.10 + i * 0.0012]); } tube(hp, 0.008, cable, 40, 4); }
  tube([[0.86, 0.99, 0.08], [0.88, 0.85, 0.09], [0.84, 0.75, 0.10]], 0.008, cable, 6, 5);
  tube([[0.86, 1.21, 0.08], [0.84, 1.40, 0.07], [0.90, 1.52, 0.06]], 0.008, cable, 6, 5);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
