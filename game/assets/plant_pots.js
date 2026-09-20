// plant_pots — winner (arm B): profiles. Every pot is a LatheGeometry with a lip and a foot ring; the
// tree canopy and shrubs are lathe blobs; the watering can body is a lathe with a shoulder and
// neck; leaves are small cones; the hose is a stacked coil of two tori.
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
  const SOIL = M(0x2b2118, 'ground', { roughness: 1.0, side: DS });
  const FOL = M(0x4d6b3a, 'foliage', { roughness: 0.9, side: DS });
  const FOL2 = M(0x3a5530, 'foliage', { roughness: 0.9, side: DS });
  const FOL3 = M(0x6c8a4a, 'foliage', { roughness: 0.9, side: DS });
  const STEM = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const GALV = M(0x8d9093, 'metal', { roughness: 0.6, metalness: 0.3, side: DS });
  const GALV2 = M(0x6b6e6f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const HOSE = M(0x8b7a3a, 'metal', { roughness: 0.8 });
  const HOSE2 = M(0x6e6030, 'metal', { roughness: 0.85 });
  const pot = (x, z, r, h, mat) => {
    const p = add(L([[0, 0.01], [0.78, 0.0], [0.80, 0.08], [0.98, 0.9], [1.05, 0.95], [0.96, 1.0], [0.93, 0.90]], 8), mat, x, 0, z);
    p.scale.set(r, h, r);
    add(C(r * 0.8, r * 0.8, 0.05, 8, true), GROUND, x, 0.025, z);
    add(new THREE.CircleGeometry(r * 0.9, 8), SOIL, x, h * 0.92, z, -Math.PI / 2, 0, 0);
    add(C(r * 0.9, r * 0.9, h * 0.25, 8, true), RUST, x, h * 0.45, z).scale.set(1, 1, 0.3);  // mineral run patch (flattened ring)
  };
  const blob = (x, y, z, r, mat) => add(L([[0, -0.9], [0.7, -0.6], [1.0, 0.1], [0.6, 0.8], [0, 1.0]], 6), mat, x, y, z).scale.set(r, r, r);
  const spray = (x, y0, z, n, len, mat) => { for (let i = 0; i < n; i++) { const a = i * 2.4; add(new THREE.ConeGeometry(0.02, len, 3), mat, x + Math.sin(a) * 0.05, y0 + len / 2 - 0.02, z + Math.cos(a) * 0.05, Math.cos(a) * 0.5, 0, Math.sin(a) * -0.5); } };
  pot(0.25, -0.25, 0.20, 0.36, TERRA);
  add(C(0.02, 0.035, 0.60, 6, true), STEM, 0.25, 0.63, -0.25, 0.05, 0, -0.05);
  blob(0.25, 1.02, -0.25, 0.22, FOL);
  blob(0.10, 0.90, -0.15, 0.15, FOL2);
  blob(0.38, 0.86, -0.36, 0.14, FOL3);
  pot(-0.42, -0.22, 0.15, 0.34, GLAZE);
  add(C(0.006, 0.008, 0.55, 5, true), STEM, -0.42, 0.58, -0.22, 0.1, 0, 0.15);
  spray(-0.42, 0.62, -0.22, 5, 0.30, FOL);
  spray(-0.44, 0.80, -0.20, 3, 0.22, FOL3);
  pot(-0.12, -0.32, 0.13, 0.26, TERRA2);
  spray(-0.12, 0.25, -0.32, 6, 0.40, FOL3);
  pot(-0.38, 0.22, 0.10, 0.18, TERRA);
  spray(-0.38, 0.17, 0.22, 4, 0.30, FOL2);
  pot(0.05, 0.16, 0.09, 0.16, TERRA3);
  blob(0.05, 0.22, 0.16, 0.08, FOL3);
  add(new THREE.TorusGeometry(0.22, 0.018, 4, 8), HOSE, 0.05, 0.02, 0.26, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.19, 0.018, 4, 8), HOSE2, 0.06, 0.05, 0.25, Math.PI / 2, 0, 0);
  add(C(0.018, 0.018, 0.30, 5), HOSE, -0.20, 0.02, 0.40, 0, 0.5, Math.PI / 2);
  add(C(0.02, 0.022, 0.05, 6), GALV2, -0.34, 0.02, 0.47, 0, 0.5, Math.PI / 2);
  // watering can: lathe body with shoulder and neck
  add(L([[0, 0], [0.12, 0], [0.12, 0.24], [0.09, 0.29], [0.06, 0.33], [0.05, 0.33]], 8), GALV, 0.50, 0, 0.20);
  add(C(0.122, 0.122, 0.05, 8, true), GROUND, 0.50, 0.025, 0.20);
  add(C(0.122, 0.122, 0.04, 8, true), RUST, 0.50, 0.09, 0.20);
  add(C(0.014, 0.03, 0.40, 6, true), GALV, 0.66, 0.30, 0.10, 0, 0, -0.9);
  add(L([[0, 0], [0.045, 0], [0.045, 0.015], [0.035, 0.03], [0, 0.03]], 6), GALV2, 0.80, 0.42, 0.10, 0, 0, -0.9);
  add(new THREE.TorusGeometry(0.10, 0.012, 3, 7, Math.PI), GALV2, 0.50, 0.30, 0.20, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.08, 0.012, 3, 7, Math.PI), GALV2, 0.37, 0.20, 0.20, 0, 0, Math.PI / 2);
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
