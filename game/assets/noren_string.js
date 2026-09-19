// noren_string — arm C: a different reading. The five banners hang as one
// split noren: butted close (2 cm slits), the outer two swung a little further
// out of plane as if caught by a breeze, each with a doubled-over top sleeve
// (a box round the rope) instead of loops, side seams as thin edge strips and a
// hem that is both a grime band and a row of hanging threads (thin cylinders).
// Rope: TubeGeometry on a CatmullRom curve, ends x = ±3, 10 cm sag, with a
// wrapped rope collar at each end.
// Base y = 0 is the LOWEST HEM. Rope ends sit at y ≈ 1.33; the game hangs the
// rope at 3.2 m, so it places this group at y ≈ 3.2 − 1.33 = 1.87.
// Banner faces are single PlaneGeometry quads (UV 0..1), material `fabric`.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const ROPE = mk(0x8b6141, 'timber', { roughness: 0.95 });
  const COLLAR = mk(0x6c4028, 'timber', { roughness: 0.95 });
  const SLEEVE = mk(0x1b2034, 'fabric', { side: DS });
  const SEAM = mk(0x2b3352, 'fabric', { side: DS });
  const THREAD = mk(0x110f12, 'fabric', { roughness: 0.98 });
  const GRIME = mk(0x110f12, 'fabric', { side: DS, roughness: 0.98 });
  const STAIN = mk(0x231718, 'fabric', { side: DS, roughness: 0.98 });
  const CLOTH = [0x232a42, 0x1d2338, 0x212841, 0x1f2540, 0x262d48].map((c) => mk(c, 'fabric', { side: DS, roughness: 0.92 }));

  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };

  // ---- rope ------------------------------------------------------------------
  const Y0 = 1.33, SAG = 0.10;
  const ropeY = (x) => Y0 - SAG * (1 - (x / 3) * (x / 3));
  const pts = [];
  for (let i = 0; i <= 12; i++) { const x = -3 + i * 0.5; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.016, 5, false), ROPE));
  for (const sx of [-1, 1]) {
    // wrapped collar where the rope is tied off, and the loose tail
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 7), COLLAR, sx * 2.9, ropeY(sx * 2.9), 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.012, 0.008, 0.2, 5), COLLAR, sx * 2.88, ropeY(sx * 2.9) - 0.11, 0.015, 0.2, 0, sx * 0.3);
  }

  // ---- banners, butted close as a split curtain --------------------------------
  const W = 0.5, H = 1.2;
  const xs = [-1.04, -0.52, 0, 0.52, 1.04];
  const rots = [[0.03, -0.12], [-0.01, -0.03], [0.015, 0.01], [-0.02, 0.04], [0.035, 0.11]];
  xs.forEach((bx, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(bx, ropeY(bx), 0);
    pivot.rotation.set(rots[i][0], rots[i][1], 0);
    g.add(pivot);
    // doubled-over sleeve round the rope
    add(new THREE.BoxGeometry(W - 0.02, 0.06, 0.05), SLEEVE, 0, -0.005, 0, 0, 0, 0, pivot);
    const top = -0.035;
    add(new THREE.PlaneGeometry(W, H), CLOTH[i], 0, top - H / 2, 0, 0, 0, 0, pivot);
    // side seams: thin edge strips so the slit edges catch light
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.012, H, 0.008), SEAM, sx * (W / 2 - 0.004), top - H / 2, 0, 0, 0, 0, pivot);
    // a stain band a third of the way up on some banners, a grime band at the hem
    if (i % 2 === 0) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(W - 0.04, 0.05, 0.002), STAIN, 0, top - H + 0.14, sz * 0.003, 0, 0, 0, pivot);
    for (const sz of [-1, 1]) add(new THREE.BoxGeometry(W, 0.05, 0.003), GRIME, 0, top - H + 0.025, sz * 0.003, 0, 0, 0, pivot);
    // hanging threads
    const n = 9;
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      const th = 0.03 + 0.05 * (((k * 3 + i * 2) % 4) / 3);
      add(new THREE.CylinderGeometry(0.004, 0.003, th, 3), THREAD, -W / 2 + u * W + 0.01 * ((k + i) % 2), top - H - th / 2 + 0.01, 0, 0, 0, 0.08 * (((k + i) % 3) - 1), pivot);
    }
  });

  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.hangAt = 3.2;
  g.userData.mounts = ['left', 'right'];   // the rope ends tie off to the shophouses either side
  return g;
}
