// stool_table_set — arm A: primitives. Round steel folding table 0.6 dia x 0.7 h with a faded
// red top and a dark rim, four splayed tube legs crossing in an X with a foot ring, two square
// wooden stools 0.42 h (plank seats, four legs, stretchers), a beer bottle and a glass on top.
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
  add(C(0.305, 0.305, 0.03, 20, true), RUSTD, TX, 0.685, TZ);         // dark rolled rim
  add(B(0.22, 0.004, 0.14), RED2, TX + 0.08, 0.7015, TZ + 0.05, 0, 0.4, 0);   // faded patches
  add(B(0.16, 0.004, 0.10), RED2, TX - 0.14, 0.7015, TZ - 0.06, 0, -0.6, 0);
  add(C(0.05, 0.05, 0.04, 8), STEEL, TX, 0.65, TZ);                   // hub under the top
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, dx = Math.sin(a), dz = Math.cos(a);
    add(C(0.011, 0.011, 0.70, 6, true), STEEL, TX + dx * 0.12, 0.34, TZ + dz * 0.12, Math.atan2(-dz * 0.22, 0.68) * 0, 0, 0)
      .rotation.set(dz * 0.31, 0, -dx * 0.31);
    add(B(0.06, 0.02, 0.06), RUSTD, TX + dx * 0.24, 0.01, TZ + dz * 0.24);
  }
  add(new THREE.TorusGeometry(0.22, 0.008, 3, 12), RUST, TX, 0.10, TZ, Math.PI / 2, 0, 0);   // foot ring
  add(C(0.008, 0.008, 0.44, 5, true), RUST, TX, 0.42, TZ, 0, 0, Math.PI / 2);                // cross braces
  add(C(0.008, 0.008, 0.44, 5, true), RUST, TX, 0.42, TZ, Math.PI / 2, 0, 0);
  // stools
  const stool = (x, z, ry, seat, leg, dark) => {
    const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s);
    add(B(0.34, 0.045, 0.28), seat, 0, 0.3975, 0, 0, 0, 0, s);
    add(B(0.06, 0.05, 0.03), dark, 0, 0.40, 0, 0, 0, 0, s);            // hand hole
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      add(B(0.04, 0.38, 0.04), leg, sx * 0.13, 0.19, sz * 0.10, sz * 0.06, 0, -sx * 0.06, s);
      add(B(0.04, 0.05, 0.04), GROUND, sx * 0.145, 0.025, sz * 0.115, 0, 0, 0, s);
    }
    add(B(0.26, 0.03, 0.025), dark, 0, 0.15, 0.11, 0, 0, 0, s);
    add(B(0.26, 0.03, 0.025), dark, 0, 0.15, -0.11, 0, 0, 0, s);
    add(B(0.025, 0.03, 0.22), dark, 0.13, 0.18, 0, 0, 0, 0, s);
    add(B(0.025, 0.03, 0.22), dark, -0.13, 0.18, 0, 0, 0, 0, s);
  };
  stool(-0.50, 0.22, 0.3, WOOD, WOOD, WOOD2);
  stool(0.50, 0.18, -0.5, PALE, PALE, PALE2);
  // bottle and glass
  add(L([[0, 0], [0.03, 0], [0.032, 0.14], [0.02, 0.19], [0.012, 0.22], [0.012, 0.26], [0.0, 0.26]], 8), BROWN, TX - 0.08, 0.70, TZ - 0.02);
  add(C(0.012, 0.012, 0.01, 8), RUSTD, TX - 0.08, 0.965, TZ - 0.02);
  add(L([[0, 0], [0.03, 0], [0.035, 0.09], [0.0, 0.09]], 8), GLASS, TX + 0.10, 0.70, TZ + 0.04);
  add(C(0.028, 0.028, 0.03, 8), WATER, TX + 0.10, 0.725, TZ + 0.04);
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
