// drink_cases — arm A: primitives. Three stacked drinks crates 0.5 x 0.35 x 0.3 (green, red,
// timber-yellow), each an open box (four walls, floor, corner posts) with dark hand-slots, the
// stack offset and turned a little, bottle necks with caps standing in the top one.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const GREEN = M(0x2f5a3a, 'plaster', { roughness: 0.8, side: DS });
  const GREEN2 = M(0x24472d, 'plaster', { roughness: 0.85 });
  const RED = M(0x8e3a2e, 'plaster', { roughness: 0.8, side: DS });
  const RED2 = M(0x6e2c22, 'plaster', { roughness: 0.85 });
  const WOOD = M(0xb59a4a, 'timber', { roughness: 0.9, side: DS });
  const WOOD2 = M(0x8b6141, 'timber', { roughness: 0.92 });
  const INNER = M(0x1a1618, 'plaster', { roughness: 0.95, side: DS });
  const GLASS = M(0xb9c8d0, 'metal', { roughness: 0.25, metalness: 0.1 });
  const CAP = M(0x8a1e1a, 'metal', { roughness: 0.5, metalness: 0.2 });
  const SCUFF = M(0x9a9a92, 'plaster', { roughness: 0.9 });
  const W = 0.50, D = 0.35, H = 0.30, T = 0.018;
  const crate = (x, y, z, ry, mat, dark, floor) => {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c);
    add(B(W, 0.025, D), floor || dark, 0, 0.0125, 0, 0, 0, 0, c);
    add(B(W, H - 0.03, T), mat, 0, H / 2, D / 2 - T / 2, 0, 0, 0, c);
    add(B(W, H - 0.03, T), mat, 0, H / 2, -D / 2 + T / 2, 0, 0, 0, c);
    add(B(T, H - 0.03, D), mat, W / 2 - T / 2, H / 2, 0, 0, 0, 0, c);
    add(B(T, H - 0.03, D), mat, -W / 2 + T / 2, H / 2, 0, 0, 0, 0, c);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(B(0.035, H, 0.035), dark, sx * (W / 2 - 0.0175), H / 2, sz * (D / 2 - 0.0175), 0, 0, 0, c);
    add(B(W + 0.004, 0.03, D + 0.004), dark, 0, H - 0.015, 0, 0, 0, 0, c);   // top rail
    add(B(W + 0.004, 0.03, D + 0.004), dark, 0, 0.115, 0, 0, 0, 0, c);         // mid rail
    for (const sz of [-1, 1]) { add(B(0.14, 0.05, 0.02), INNER, -0.11, 0.20, sz * (D / 2 - T / 2), 0, 0, 0, c); add(B(0.14, 0.05, 0.02), INNER, 0.11, 0.20, sz * (D / 2 - T / 2), 0, 0, 0, c); }
    for (const sx of [-1, 1]) add(B(0.02, 0.05, 0.16), INNER, sx * (W / 2 - T / 2), 0.20, 0, 0, 0, 0, c);
    return c;
  };
  let c = crate(0, 0, 0, 0.04, WOOD, WOOD2);
  add(B(W, 0.06, D), GROUND, 0, 0.03, 0, 0, 0, 0, c);
  add(B(0.20, 0.10, 0.006), SCUFF, 0.08, 0.20, D / 2 + 0.002, 0, 0, 0, c);     // faded paint ghost
  c = crate(0.03, 0.30, -0.02, -0.10, RED, RED2);
  add(B(0.18, 0.06, 0.006), INNER, -0.10, 0.06, D / 2 + 0.002, 0, 0, 0, c);    // black brush mark
  add(B(0.08, 0.03, 0.006), INNER, 0.12, 0.05, D / 2 + 0.002, 0, 0, 0.4, c);
  c = crate(-0.02, 0.60, 0.02, 0.07, GREEN, GREEN2);
  add(B(0.22, 0.08, 0.006), SCUFF, -0.06, 0.18, D / 2 + 0.002, 0, 0, 0, c);
  add(B(W - 0.05, 0.02, D - 0.05), INNER, 0, 0.16, 0, 0, 0, 0, c);            // bottle carrier grid in shadow
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const x = -0.18 + i * 0.12, z = -0.11 + j * 0.11;
    add(C(0.024, 0.024, 0.06, 6, true), GLASS, x, 0.20, z, 0, 0, 0, c);
    add(C(0.012, 0.022, 0.06, 6, true), GLASS, x, 0.26, z, 0, 0, 0, c);
    add(C(0.013, 0.013, 0.01, 6), (i + j) % 3 ? GLASS : CAP, x, 0.295, z, 0, 0, 0, c);
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
