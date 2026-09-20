// plant_pots — arm A: primitives. Five mismatched pots as tapered cylinders with rim rings and
// soil discs, leggy plants from crossed foliage planes and thin stems, a small tree (trunk and
// three foliage spheres), a galvanised watering can, and a coiled hose. Footprint ~1.35 x 0.95.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const TERRA = M(0xb06a45, 'stone', { roughness: 0.9, side: DS });
  const TERRA2 = M(0x9a5b3c, 'stone', { roughness: 0.9, side: DS });
  const TERRA3 = M(0x7d4a33, 'stone', { roughness: 0.9, side: DS });
  const GLAZE = M(0x2f4a3a, 'tile', { roughness: 0.5, side: DS });
  const SOIL = M(0x2b2118, 'ground', { roughness: 1.0 });
  const FOL = M(0x4d6b3a, 'foliage', { roughness: 0.9, side: DS });
  const FOL2 = M(0x3a5530, 'foliage', { roughness: 0.9, side: DS });
  const FOL3 = M(0x6c8a4a, 'foliage', { roughness: 0.9, side: DS });
  const STEM = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const GALV = M(0x8d9093, 'metal', { roughness: 0.6, metalness: 0.3 });
  const GALV2 = M(0x6b6e6f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const HOSE = M(0x8b7a3a, 'metal', { roughness: 0.8 });
  const HOSE2 = M(0x6e6030, 'metal', { roughness: 0.85 });
  const pot = (x, z, rt, rb, h, mat) => {
    add(C(rt, rb, h, 10, true), mat, x, h / 2, z);
    add(C(rb, rb, 0.01, 10), mat, x, 0.005, z);
    add(C(rb + 0.002, rb + 0.002, 0.05, 10, true), GROUND, x, 0.025, z);
    add(C(rt + 0.012, rt + 0.012, 0.035, 10, true), mat === TERRA ? TERRA2 : TERRA3, x, h - 0.017, z);
    add(C(rt - 0.01, rt - 0.01, 0.01, 10), SOIL, x, h - 0.03, z);
    add(B(rt * 0.6, h * 0.35, 0.012), RUST, x, h * 0.35, z + rb + 0.003);   // stain / mineral run
  };
  const leaf = (x, y, z, w, h, ry, mat) => add(new THREE.PlaneGeometry(w, h), mat, x, y, z, 0, ry, 0);
  const leggy = (x, z, y0, h, mat) => {
    add(C(0.006, 0.008, h, 5, true), STEM, x, y0 + h / 2, z, 0.1, 0, 0.15);
    for (let i = 0; i < 4; i++) leaf(x + (i - 1.5) * 0.05, y0 + h * (0.6 + i * 0.12), z + (i % 2) * 0.04 - 0.02, 0.22, 0.14, i * 0.8, i % 2 ? mat : FOL2);
    leaf(x, y0 + h * 0.4, z, 0.16, 0.10, 0.4, FOL3);
  };
  // big tree pot
  pot(0.25, -0.25, 0.20, 0.15, 0.36, TERRA);
  add(C(0.02, 0.035, 0.60, 6, true), STEM, 0.25, 0.63, -0.25, 0.05, 0, -0.05);
  add(new THREE.SphereGeometry(0.22, 8, 5), FOL, 0.25, 1.02, -0.25);
  add(new THREE.SphereGeometry(0.16, 7, 5), FOL2, 0.10, 0.90, -0.15);
  add(new THREE.SphereGeometry(0.15, 7, 5), FOL3, 0.38, 0.86, -0.36);
  // tall pot with a leggy plant
  pot(-0.42, -0.22, 0.15, 0.12, 0.34, GLAZE);
  leggy(-0.42, -0.22, 0.32, 0.55, FOL);
  // medium pot with grass-like blades
  pot(-0.12, -0.32, 0.13, 0.10, 0.26, TERRA2);
  for (let i = 0; i < 5; i++) add(new THREE.ConeGeometry(0.02, 0.36, 3), FOL3, -0.12 + (i - 2) * 0.03, 0.26 + 0.16, -0.32 + ((i * 7) % 3) * 0.03 - 0.03, 0.1 * (i - 2), 0, -0.15 * (i - 2));
  // two small pots
  pot(-0.38, 0.22, 0.10, 0.08, 0.18, TERRA);
  leggy(-0.38, 0.22, 0.17, 0.30, FOL2);
  pot(0.05, 0.16, 0.09, 0.07, 0.16, TERRA3);
  add(new THREE.SphereGeometry(0.08, 6, 4), FOL3, 0.05, 0.20, 0.16);
  add(new THREE.SphereGeometry(0.06, 6, 4), FOL, 0.02, 0.26, 0.20);
  // hose coil around the small pot
  add(new THREE.TorusGeometry(0.22, 0.018, 6, 14), HOSE, 0.05, 0.02, 0.26, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.19, 0.018, 6, 14), HOSE2, 0.06, 0.05, 0.25, Math.PI / 2, 0, 0);
  add(C(0.018, 0.018, 0.30, 6), HOSE, -0.20, 0.02, 0.40, 0, 0.5, Math.PI / 2);
  add(C(0.02, 0.022, 0.05, 6), GALV2, -0.34, 0.02, 0.47, 0, 0.5, Math.PI / 2);
  // watering can
  add(C(0.11, 0.12, 0.30, 12), GALV, 0.50, 0.15, 0.20);
  add(C(0.122, 0.122, 0.05, 12, true), GROUND, 0.50, 0.025, 0.20);
  add(C(0.122, 0.122, 0.04, 12, true), RUST, 0.50, 0.09, 0.20);
  add(C(0.06, 0.06, 0.03, 10), GALV2, 0.50, 0.315, 0.20);
  add(C(0.014, 0.03, 0.40, 6, true), GALV, 0.66, 0.30, 0.10, 0, 0, -0.9);
  add(C(0.045, 0.035, 0.03, 8), GALV2, 0.80, 0.42, 0.10, 0, 0, -0.9);
  add(new THREE.TorusGeometry(0.10, 0.012, 4, 10, Math.PI), GALV2, 0.50, 0.30, 0.20, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.08, 0.012, 4, 10, Math.PI), GALV2, 0.37, 0.20, 0.20, 0, 0, Math.PI / 2);
  // --- the six lines: measure vertices, base to y=0, centre x/z ---------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
