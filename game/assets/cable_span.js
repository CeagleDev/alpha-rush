// cable_span — arm A: TubeGeometry along CatmullRom catenaries.
// Three bundles cross the road at z = -10, 0, +10, each of four black cables from
// x = -4.5 to +4.5 with its own endpoint heights and sag (0.45-0.7 m), plus a
// hanging loop of spare cable and a junction box on the middle bundle, and a
// cleat block at every end. Base y = 0 is the LOWEST cable point; the game places
// the group at y = 4.5, so the endpoints land at 5.1-6.5 m.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); s.name = name; return s; };
  const CABLE = mat(0x110f12, 'metal', 0.75, 0.3);
  const CABLE2 = mat(0x161316, 'metal', 0.70, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const BOX   = mat(0x37201b, 'metal', 0.85, 0.3);
  const TIMB  = mat(0x37201b, 'timber', 0.90);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z, ry) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (ry) o.rotation.y = ry; g.add(o); return o; };

  // a sagging cable: parabola through 7 points, then CatmullRom for the tube
  const cable = (x0, x1, y0, y1, sag, z, dz, r, material) => {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - 4 * sag * t * (1 - t), z + dz * Math.sin(t * Math.PI)));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, r, 6, false), material);
    g.add(m); return m;
  };

  // heights are in asset space: lowest point of the lowest cable at y = 0
  const bundles = [
    { z: -10, h: [0.72, 0.95, 1.30, 1.70], sag: [0.55, 0.60, 0.50, 0.65], tilt: 0.12 },
    { z: 0,   h: [0.60, 0.86, 1.15, 1.95], sag: [0.60, 0.52, 0.66, 0.70], tilt: -0.10 },
    { z: 10,  h: [0.80, 1.05, 1.45, 1.80], sag: [0.62, 0.48, 0.55, 0.45], tilt: 0.20 },
  ];
  bundles.forEach((b, bi) => {
    b.h.forEach((h, i) => {
      cable(-4.5, 4.5, h - b.tilt, h + b.tilt, b.sag[i], b.z + (i - 1.5) * 0.05, (hash(bi, i) - 0.5) * 0.3, i === 3 ? 0.016 : 0.012, i % 2 ? CABLE2 : CABLE);
    });
    // timber cleat blocks and a rusted bracket at each end
    for (const sx of [-1, 1]) {
      B(0.10, 0.5, 0.22, TIMB, sx * 4.47, b.h[1] + 0.2, b.z);
      B(0.14, 0.03, 0.10, RUST, sx * 4.45, b.h[3] + 0.2, b.z + 0.02);
      for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), RUST); c.rotation.z = Math.PI / 2; c.position.set(sx * 4.4, b.h[i] - (sx < 0 ? b.tilt : -b.tilt), b.z + (i - 1.5) * 0.05); g.add(c); }
    }
  });
  // junction box hung under the middle bundle at x = 3.0, with a drop cable into it
  B(0.26, 0.34, 0.14, BOX, 3.0, 0.62, 0.05);
  B(0.28, 0.02, 0.16, RUST, 3.0, 0.80, 0.05);
  cable(3.0, 3.0, 0.79, 1.60, -0.02, 0.05, 0.08, 0.010, CABLE);   // the drop into the box (a near-straight tube)
  // a hanging loop of spare cable under the bundle at z = 0, x = -2.6: a lazy oval
  {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const a = -0.25 + (i / 10) * (Math.PI + 0.5); pts.push(new THREE.Vector3(-2.6 + Math.cos(a) * 0.32, 0.90 - Math.sin(a) * 0.55 - (i === 0 || i === 10 ? 0 : 0.0), 0.02 + Math.sin(a) * 0.06)); }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.012, 6, false), CABLE2));
    // tie wraps binding the loop to the bundle
    for (const dx of [-0.32, 0.32]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 4, 8), RUST); t.position.set(-2.6 + dx, 0.88, 0.02); g.add(t); }
  }
  // a taped splice on one cable of the far bundle
  for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6), BOX); s.rotation.z = Math.PI / 2; s.position.set(-1.0 + i * 3.2, 0.5 + i * 0.6, 10 + (i - 1) * 0.05); g.add(s); }

  g.userData.mounts = ['left', 'right'];   // the x-ends terminate on the poles and shophouse walls
  g.userData.mountHeight = 4.5;    // place at y = 4.5 so the lowest cable clears the road at that height

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
