// laundry_line — arm C: a different reading. Garments hang as pleated bundles: each is a run
// of narrow vertical strips at staggered depths and lengths so the drape and the sag read in
// silhouette from every side, pinned to the pole with wooden pegs instead of hangers. The
// towel is thrown over the pole. Base y=0 at the lowest hem; THE GAME MOUNTS THIS AT 2.2 m
// so the pole lands ~3.2 m. mounts = 'back'.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  g.userData.mounts = 'back';
  const BAMBOO = M(0xb99a5e, 'timber', { roughness: 0.7 });
  const NODE = M(0x8b6141, 'timber', { roughness: 0.8 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const PEG = M(0x6c4028, 'timber', { roughness: 0.9 });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95 });
  const CREAM = M(0xd9c9a8, 'fabric', { roughness: 0.9 });
  const CREAM2 = M(0xbfae8e, 'fabric', { roughness: 0.9 });
  const DENIM = M(0x6e86a3, 'fabric', { roughness: 0.9 });
  const DENIM2 = M(0x5a7089, 'fabric', { roughness: 0.9 });
  const DARK = M(0x2a2a2e, 'fabric', { roughness: 0.9 });
  const DARK2 = M(0x35353a, 'fabric', { roughness: 0.9 });
  const TOWEL = M(0x5c6b47, 'fabric', { roughness: 0.95 });
  const TOWEL2 = M(0x4d5a3b, 'fabric', { roughness: 0.95 });
  const JACK = M(0x7a6558, 'fabric', { roughness: 0.9 });
  const JACK2 = M(0x8d7a6b, 'fabric', { roughness: 0.9 });
  const PY = 1.0;
  add(C(0.02, 0.02, 3.0, 8, true), BAMBOO, 0, PY, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), NODE, -1.5, PY, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), NODE, 1.5, PY, 0, 0, 0, Math.PI / 2);
  for (const x of [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]) add(C(0.023, 0.023, 0.025, 8, true), NODE, x, PY, 0, 0, 0, Math.PI / 2);
  for (const x of [-1.0, 1.0]) {
    add(B(0.22, 0.40, 0.03), WOOD, x, PY, -0.085);
    add(B(0.12, 0.12, 0.012), TIN, x - 0.03, PY + 0.10, -0.064);
    add(B(0.07, 0.08, 0.012), RUST, x + 0.06, PY - 0.12, -0.064);
    add(B(0.03, 0.03, 0.07), RUSTD, x, PY - 0.03, -0.035);
    add(B(0.03, 0.05, 0.02), RUSTD, x, PY, 0.01);
    add(B(0.03, 0.02, 0.06), RUSTD, x, PY - 0.03, 0.0);
  }
  const peg = (x, z) => { add(B(0.012, 0.07, 0.018), PEG, x, PY + 0.02, z + 0.012); add(B(0.012, 0.07, 0.018), PEG, x, PY + 0.02, z - 0.012); };
  // a pleated garment: strips of (width, length, z offset) hung from the pole at x
  const drape = (x, top, strips, mats, ry) => {
    const d = new THREE.Group(); d.position.set(x, PY, 0); d.rotation.y = ry; g.add(d);
    let cx = -strips.reduce((a, s) => a + s[0], 0) / 2;
    strips.forEach((s, i) => { cx += s[0] / 2; add(B(s[0], s[1], 0.03), mats[i % mats.length], cx, top - s[1] / 2, s[2], s[3] || 0, 0, 0, d); cx += s[0] / 2; });
    return d;
  };
  // shirt 1: body strips plus two sleeves hanging outside
  drape(-1.1, 0.0, [[0.09, 0.30, 0.01, 0.15], [0.07, 0.62, 0.02], [0.08, 0.66, -0.01], [0.08, 0.64, 0.02], [0.07, 0.60, -0.02], [0.09, 0.30, 0.01, 0.15]], [CREAM2, CREAM, CREAM, CREAM2, CREAM, CREAM2], 0.1);
  peg(-1.16, 0); peg(-1.04, 0);
  // shirt 2
  drape(-0.62, 0.0, [[0.08, 0.28, 0.0, 0.2], [0.07, 0.58, 0.015], [0.08, 0.62, -0.015], [0.07, 0.60, 0.015], [0.08, 0.26, 0.0, 0.2]], [DENIM2, DENIM, DENIM, DENIM2, DENIM2], -0.12);
  peg(-0.66, 0); peg(-0.58, 0);
  // trousers: waistband then two legs each of two strips, hem at 0
  add(B(0.30, 0.10, 0.06), DARK2, -0.14, PY - 0.05, 0.0);
  drape(-0.14, -0.08, [[0.07, 0.92, 0.01], [0.07, 0.90, -0.01], [0.02, 0.5, 0.0], [0.07, 0.88, 0.01], [0.07, 0.92, -0.01]], [DARK, DARK2, DARK2, DARK, DARK2], 0.05);
  peg(-0.24, 0); peg(-0.04, 0);
  // towel over the pole: front drop long, back drop short, pleated
  drape(0.36, 0.05, [[0.09, 0.62, 0.03], [0.09, 0.66, 0.045], [0.09, 0.64, 0.03], [0.09, 0.60, 0.045]], [TOWEL, TOWEL2, TOWEL, TOWEL2], 0.06);
  drape(0.36, 0.05, [[0.09, 0.42, -0.04], [0.09, 0.46, -0.03], [0.09, 0.44, -0.04], [0.09, 0.40, -0.03]], [TOWEL2, TOWEL, TOWEL2, TOWEL], 0.06);
  add(B(0.36, 0.05, 0.10), TOWEL, 0.36, PY + 0.03, 0, 0, 0.06, 0);
  // small jacket: thick body strips, sleeves as hanging cylinders, a hood
  drape(1.0, -0.02, [[0.10, 0.46, 0.0], [0.10, 0.50, 0.03], [0.10, 0.48, 0.0]], [JACK, JACK2, JACK], -0.15);
  add(C(0.04, 0.045, 0.36, 6), JACK2, 0.80, PY - 0.30, 0.0, 0.1, 0, 0.12);
  add(C(0.04, 0.045, 0.36, 6), JACK2, 1.20, PY - 0.30, 0.0, -0.1, 0, -0.12);
  add(new THREE.SphereGeometry(0.10, 8, 5), JACK2, 1.0, PY - 0.06, -0.05);
  add(B(0.03, 0.40, 0.07), RUSTD, 1.0, PY - 0.30, 0.02, 0, -0.15, 0);
  peg(0.92, 0); peg(1.08, 0);
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
