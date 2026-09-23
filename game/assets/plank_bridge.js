// plank_bridge — from the rooftops board: the timber walkways laid along the roof edges. A 4 m x 2 m
// section of scaffold planks on two steel channel joists with end plates and bolt heads, the planks
// laid across the joists with uneven gaps, two warped, one split and one missing, a rusted band
// strap round each end and a bit of moss in the gaps. 0.2 m tall. Base y = 0 at the joist feet,
// long axis along Z, centred.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const hash = (i, j) => { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };
  const PLANK = [M(0x8b6141, 'timber'), M(0x7a5538, 'timber'), M(0x6c4028, 'timber'), M(0x9a7350, 'timber')];
  const PLANKD = M(0x4f2d21, 'timber');
  const STEEL = M(0x4a4a4c, 'metal', { roughness: 0.75, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.95 });
  const MOSS = M(0x4a5a2a, 'foliage', { roughness: 0.95 });

  const L = 4.0, W = 2.0, JY = 0.15;      // joists: channel sections 15 cm tall at x = ±0.7
  for (const sx of [-1, 1]) {
    const x = sx * 0.7;
    add(B(0.10, JY, L), STEEL, x, JY / 2, 0);                           // web
    add(B(0.16, 0.02, L), RUST, x, JY - 0.01, 0);                       // top flange
    add(B(0.16, 0.02, L), BLACK, x, 0.01, 0);                           // bottom flange = grounding band
    for (let k = 0; k < 4; k++) add(B(0.12, JY - 0.04, 0.02), RUSTD, x, JY / 2, -1.5 + k);   // stiffeners
    for (const sz of [-1, 1]) add(B(0.2, JY + 0.02, 0.03), RUST, x, JY / 2, sz * (L / 2 - 0.015));   // end plates
  }
  for (const sz of [-1, 1]) { add(B(1.6, 0.06, 0.06), STEEL, 0, 0.06, sz * (L / 2 - 0.2)); add(B(1.6, 0.06, 0.06), STEEL, 0, 0.06, sz * 0.9); }   // cross ties
  // planks across the joists, 0.22 wide, gaps 1-3 cm, thickness 4 cm; some warped, one missing
  const n = 16, pitch = L / n;
  for (let k = 0; k < n; k++) {
    if (k === 10) continue;                                              // the missing plank
    const z = -L / 2 + pitch * (k + 0.5) + (hash(k, 1) - 0.5) * 0.02;
    const warp = hash(k, 2) < 0.2 ? (hash(k, 3) - 0.5) * 0.06 : 0;
    const mat = PLANK[Math.floor(hash(k, 4) * PLANK.length)];
    const w = pitch - 0.02 - hash(k, 5) * 0.02;
    const p = add(B(W, 0.04, w), mat, 0, JY + 0.02 + Math.abs(warp) * 0.5, z, 0, 0, warp);
    if (k === 5) { p.scale.x = 0.5; p.position.x = -0.5; add(B(0.92, 0.04, w), PLANKD, 0.52, JY + 0.02, z, 0, 0.05, 0); }   // the split plank
    // bolt heads over each joist, a dark knot or two
    for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 6), RUSTD, sx * 0.7, JY + 0.045, z);
    if (hash(k, 6) < 0.3) add(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 6), PLANKD, (hash(k, 7) - 0.5) * 1.6, JY + 0.044, z);
  }
  add(B(0.3, 0.03, 0.25), MOSS, 0.4, JY + 0.005, -L / 2 + pitch * 10.5);  // moss showing through the gap
  add(B(0.08, 0.012, 0.35), MOSS, -0.85, JY + 0.045, 0.6);                 // and on a plank end
  // rusted band straps round the plank ends, both sides
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) add(B(0.05, 0.10, 0.5), RUST, sx * (W / 2 - 0.02), JY + 0.02, sz * (L / 2 - 0.3));
  place(THREE, g);
  return g;
}
function place(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
}
