// stool_table_set — arm C: a different reading of the reference. The table's folding base is a
// scissor frame: two pairs of legs crossing at a central collar with hooked feet, and the two
// stools are of different patterns as in the image: one square with a hand hole and wedged
// legs, one with an oval plank seat and legs splayed in both directions. Bottle and glass.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const RED = M(0xa8392f, 'metal', { roughness: 0.8, metalness: 0.1 });
  const RED2 = M(0x7e2c25, 'metal', { roughness: 0.85, metalness: 0.1 });
  const STEEL = M(0x6c7073, 'metal', { roughness: 0.6, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const WOOD2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const PALE = M(0x8b6141, 'timber', { roughness: 0.9 });
  const PALE2 = M(0x6c4028, 'timber', { roughness: 0.92 });
  const BROWN = M(0x5a3a14, 'metal', { roughness: 0.3, metalness: 0.1, side: DS });
  const GLASS = M(0xb9c8d0, 'metal', { roughness: 0.2, metalness: 0.1, side: DS });
  const WATER = M(0x9accf2, 'metal', { roughness: 0.2 });
  const TX = 0, TZ = -0.1;
  add(C(0.30, 0.30, 0.025, 20), RED, TX, 0.6875, TZ);
  add(C(0.305, 0.305, 0.03, 20, true), RUSTD, TX, 0.685, TZ);
  add(B(0.22, 0.004, 0.14), RED2, TX + 0.08, 0.7015, TZ + 0.05, 0, 0.4, 0);
  add(B(0.16, 0.004, 0.10), RED2, TX - 0.14, 0.7015, TZ - 0.06, 0, -0.6, 0);
  add(B(0.20, 0.004, 0.06), RUST, TX - 0.02, 0.7015, TZ + 0.18, 0, 0.9, 0);   // rust bloom at the edge
  add(C(0.04, 0.04, 0.06, 8), STEEL, TX, 0.36, TZ);                            // scissor collar
  add(C(0.03, 0.03, 0.03, 8), STEEL, TX, 0.655, TZ);
  // two scissor pairs, each leg a full 0.72 m tube from the top ring to a hooked foot
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, dx = Math.sin(a), dz = Math.cos(a);
    const leg = add(C(0.011, 0.011, 0.72, 6, true), STEEL, TX + dx * 0.0, 0.35, TZ + dz * 0.0);
    leg.rotation.set(dz * 0.36, 0, -dx * 0.36);
    add(C(0.011, 0.011, 0.08, 6, true), RUST, TX + dx * 0.25, 0.02, TZ + dz * 0.25, 0, 0, 0).rotation.set(dz * Math.PI / 2, 0, -dx * Math.PI / 2);  // hooked foot
    add(B(0.05, 0.02, 0.05), RUSTD, TX + dx * 0.25, 0.01, TZ + dz * 0.25);
    add(C(0.008, 0.008, 0.36, 5, true), RUST, TX + dx * 0.19, 0.66, TZ + dz * 0.19, 0, 0, 0).rotation.set(dz * 0.36, 0, -dx * 0.36);  // top braces
  }
  add(new THREE.TorusGeometry(0.16, 0.007, 3, 12), RUST, TX, 0.64, TZ, Math.PI / 2, 0, 0);
  // square stool with a hand hole and wedged legs
  let s = new THREE.Group(); s.position.set(-0.50, 0, 0.22); s.rotation.y = 0.3; g.add(s);
  add(B(0.34, 0.05, 0.30), WOOD, 0, 0.395, 0, 0, 0, 0, s);
  add(B(0.07, 0.06, 0.03), WOOD2, 0, 0.40, 0, 0, 0, 0, s);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.045, 0.40, 0.045), WOOD, sx * 0.13, 0.20, sz * 0.11, sz * 0.05, 0, -sx * 0.05, s);
    add(B(0.045, 0.05, 0.045), GROUND, sx * 0.14, 0.025, sz * 0.12, 0, 0, 0, s);
    add(B(0.02, 0.02, 0.05), WOOD2, sx * 0.13, 0.42, sz * 0.11, 0, 0, 0, s);   // wedge ends through the seat
  }
  add(B(0.24, 0.035, 0.03), WOOD2, 0, 0.14, 0.12, 0, 0, 0, s);
  add(B(0.24, 0.035, 0.03), WOOD2, 0, 0.14, -0.12, 0, 0, 0, s);
  add(B(0.03, 0.035, 0.22), WOOD2, 0.14, 0.20, 0, 0, 0, 0, s);
  add(B(0.03, 0.035, 0.22), WOOD2, -0.14, 0.20, 0, 0, 0, 0, s);
  add(B(0.05, 0.025, 0.03), RUST, 0.06, 0.14, 0.12, 0, 0, 0, s);     // wire binding
  // oval-seat stool, legs splayed both ways
  s = new THREE.Group(); s.position.set(0.50, 0, 0.18); s.rotation.y = -0.5; g.add(s);
  add(C(0.19, 0.19, 0.045, 12), PALE, 0, 0.3975, 0, 0, 0, 0, s).scale.set(1, 1, 0.65);
  add(B(0.20, 0.048, 0.04), PALE2, 0, 0.3975, 0.05, 0, 0, 0, s);      // plank joint line
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.04, 0.39, 0.04), PALE, sx * 0.12, 0.195, sz * 0.07, sz * 0.10, 0, -sx * 0.10, s);
    add(B(0.04, 0.05, 0.04), GROUND, sx * 0.15, 0.025, sz * 0.10, 0, 0, 0, s);
  }
  add(B(0.28, 0.03, 0.025), PALE2, 0, 0.13, 0.095, 0, 0, 0, s);
  add(B(0.28, 0.03, 0.025), PALE2, 0, 0.13, -0.095, 0, 0, 0, s);
  add(B(0.025, 0.03, 0.20), PALE2, 0.14, 0.16, 0, 0, 0, 0, s);
  add(B(0.025, 0.03, 0.20), PALE2, -0.14, 0.16, 0, 0, 0, 0, s);
  // bottle from stacked cylinders, glass as an open cylinder with a water level
  add(C(0.03, 0.03, 0.15, 8), BROWN, TX - 0.08, 0.775, TZ - 0.02);
  add(C(0.012, 0.03, 0.05, 8, true), BROWN, TX - 0.08, 0.875, TZ - 0.02);
  add(C(0.012, 0.012, 0.06, 8), BROWN, TX - 0.08, 0.93, TZ - 0.02);
  add(C(0.013, 0.013, 0.01, 8), RUSTD, TX - 0.08, 0.965, TZ - 0.02);
  add(C(0.035, 0.03, 0.09, 8, true), GLASS, TX + 0.10, 0.745, TZ + 0.04);
  add(C(0.03, 0.03, 0.005, 8), GLASS, TX + 0.10, 0.7025, TZ + 0.04);
  add(C(0.031, 0.031, 0.03, 8), WATER, TX + 0.10, 0.72, TZ + 0.04);
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
