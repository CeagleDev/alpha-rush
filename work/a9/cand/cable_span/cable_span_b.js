// cable_span — arm B: assembled from primitives.
// Each cable is a chain of 14 short cylinders laid end to end along its parabola,
// overlapping by half a segment so the chain reads as one line; no tubes, no
// curves. Same layout: three bundles of four across the road at z = -10, 0, +10,
// a spare-cable loop (a torus, tilted), a junction box and end cleats.
// Base y = 0 is the LOWEST cable point; the game places the group at y = 4.5.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); s.name = name; return s; };
  const CABLE = mat(0x110f12, 'metal', 0.75, 0.3);
  const CABLE2 = mat(0x161316, 'metal', 0.70, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const BOX   = mat(0x37201b, 'metal', 0.85, 0.3);
  const TIMB  = mat(0x37201b, 'timber', 0.90);
  const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const instance = (geo, material, list) => {
    const im = new THREE.InstancedMesh(geo, material, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((t, i) => { const r = t.r || [0, 0, 0], s = t.s || [1, 1, 1]; e.set(r[0], r[1], r[2]); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(t.p[0], t.p[1], t.p[2]), q, new THREE.Vector3(s[0], s[1], s[2])); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true; g.add(im); return im;
  };
  const segsA = [], segsB = [];
  const N = 14;
  const chain = (y0, y1, sag, z, list, rs) => {
    const f = (t) => y0 + (y1 - y0) * t - 4 * sag * t * (1 - t);
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const xa = -4.5 + 9 * t0, xb = -4.5 + 9 * t1, ya = f(t0), yb = f(t1);
      const len = Math.hypot(xb - xa, yb - ya) * 1.08;
      list.push({ p: [(xa + xb) / 2, (ya + yb) / 2, z], r: [0, 0, Math.atan2(yb - ya, xb - xa) - Math.PI / 2], s: [rs, len, rs] });
    }
  };
  const bundles = [
    { z: -10, h: [0.72, 0.95, 1.30, 1.70], sag: [0.55, 0.60, 0.50, 0.65], tilt: 0.12 },
    { z: 0,   h: [0.60, 0.86, 1.15, 1.95], sag: [0.60, 0.52, 0.66, 0.70], tilt: -0.10 },
    { z: 10,  h: [0.80, 1.05, 1.45, 1.80], sag: [0.62, 0.48, 0.55, 0.45], tilt: 0.20 },
  ];
  bundles.forEach((b) => {
    b.h.forEach((h, i) => chain(h - b.tilt, h + b.tilt, b.sag[i], b.z + (i - 1.5) * 0.05, i % 2 ? segsB : segsA, i === 3 ? 1.3 : 1));
    for (const sx of [-1, 1]) {
      B(0.10, 0.5, 0.22, TIMB, sx * 4.47, b.h[1] + 0.2, b.z);
      B(0.14, 0.03, 0.10, RUST, sx * 4.45, b.h[3] + 0.2, b.z + 0.02);
    }
  });
  // one cylinder, 1 m long, 12 mm radius, scaled per segment
  instance(new THREE.CylinderGeometry(0.012, 0.012, 1, 6, 1, true), CABLE, segsA).material.side = THREE.DoubleSide;
  instance(new THREE.CylinderGeometry(0.012, 0.012, 1, 6, 1, true), CABLE2, segsB).material.side = THREE.DoubleSide;
  // junction box under the middle bundle with a drop cable
  B(0.26, 0.34, 0.14, BOX, 3.0, 0.62, 0.05);
  B(0.28, 0.02, 0.16, RUST, 3.0, 0.80, 0.05);
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6), CABLE); drop.position.set(3.0, 1.19, 0.05); g.add(drop);
  // spare loop: a tilted torus hanging off the middle bundle
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 5, 18), CABLE2);
  loop.position.set(-2.6, 0.56, 0.02); loop.rotation.y = 0.15; g.add(loop);
  for (const dx of [-0.34, 0.34]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 4, 8), RUST); t.position.set(-2.6 + dx, 0.88, 0.02); g.add(t); }
  // insulator cleats at the ends
  const cl = [];
  bundles.forEach((b) => b.h.forEach((h, i) => { for (const sx of [-1, 1]) cl.push({ p: [sx * 4.4, h + (sx < 0 ? -b.tilt : b.tilt), b.z + (i - 1.5) * 0.05], r: [0, 0, Math.PI / 2] }); }));
  instance(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), RUST, cl);
  for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6), BOX); s.rotation.z = Math.PI / 2; s.position.set(-1.0 + i * 3.2, 0.5 + i * 0.6, 10 + (i - 1) * 0.05); g.add(s); }

  g.userData.mountHeight = 4.5;

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mt) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mt)); };
    if (n.isInstancedMesh) { for (let k = 0; k < n.count; k++) { n.getMatrixAt(k, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
