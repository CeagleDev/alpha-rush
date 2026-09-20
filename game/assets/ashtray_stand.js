// ashtray_stand — winner (arm C): a different reading. A heavy cast base ring with bolt lugs, a ribbed
// lower drum (vertical rib boxes) in faded paint, a 12-sided column, the top as a separate
// wide bowl (flared open cone + rim torus) sitting on a neck, sand and butts.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const STEEL = M(0xa9adaf, 'metal', { roughness: 0.45, metalness: 0.3, side: DS });
  const STEEL2 = M(0x7d8184, 'metal', { roughness: 0.55, metalness: 0.3, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const GREEN = M(0x3f5a45, 'metal', { roughness: 0.8 });
  const RED = M(0x8e3a2e, 'metal', { roughness: 0.8 });
  const SAND = M(0xc4a878, 'stone', { roughness: 1.0 });
  const WHITE = M(0xe8e2d4, 'fabric', { roughness: 0.9 });
  const FILTER = M(0xc98a45, 'fabric', { roughness: 0.9 });
  const S = 10;
  add(C(0.19, 0.20, 0.04, S), RUSTD, 0, 0.02, 0);
  add(C(0.205, 0.205, 0.03, S, true), GROUND, 0, 0.015, 0);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; add(B(0.05, 0.03, 0.05), RUSTD, Math.sin(a) * 0.15, 0.05, Math.cos(a) * 0.15, 0, a, 0); }
  add(C(0.115, 0.12, 0.22, S, true), RUST, 0, 0.15, 0);            // ribbed drum
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; add(B(0.02, 0.18, 0.012), i % 4 === 1 ? GREEN : i % 4 === 3 ? RED : RUST, Math.sin(a) * 0.12, 0.15, Math.cos(a) * 0.12, 0, a, 0); }
  add(C(0.10, 0.10, 0.50, S, true), STEEL, 0, 0.51, 0);
  add(C(0.104, 0.104, 0.08, S, true), STEEL2, 0.01, 0.42, 0);      // dented band off-centre
  add(C(0.11, 0.10, 0.02, S, true), STEEL2, 0, 0.27, 0);                 // collar between drum and column
  add(B(0.05, 0.05, 0.006), STEEL2, -0.03, 0.62, 0.10, 0, -0.3, 0);
  add(C(0.06, 0.06, 0.04, 8, true), STEEL2, 0, 0.78, 0);                 // neck
  add(C(0.13, 0.07, 0.10, S, true), STEEL, 0, 0.85, 0);            // bowl
  add(C(0.07, 0.07, 0.01, S), STEEL2, 0, 0.80, 0);
  add(new THREE.TorusGeometry(0.128, 0.008, 3, 8), STEEL2, 0, 0.90, 0, Math.PI / 2, 0, 0);
  add(C(0.118, 0.118, 0.012, S), SAND, 0, 0.88, 0);
  for (let i = 0; i < 5; i++) {
    const a = i * 2.2, r = 0.02 + (i % 3) * 0.03;
    add(C(0.004, 0.004, 0.035, 3, true), WHITE, Math.sin(a) * r, 0.89, Math.cos(a) * r, 0, a, Math.PI / 2 - 0.1 * (i % 2));
    add(C(0.004, 0.004, 0.012, 3, true), FILTER, Math.sin(a) * r + Math.cos(a) * 0.022, 0.89, Math.cos(a) * r - Math.sin(a) * 0.022, 0, a, Math.PI / 2);
  }
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
