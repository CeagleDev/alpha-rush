// laundry_line — arm A: primitives. A 3 m bamboo pole (cylinder with node rings) on two wall
// hooks with timber backing plates, five garments as thin boxes (shirt, shirt, trousers, towel
// folded over the pole, small jacket) with sleeves, on wire hangers, each with a little sag.
// Base y=0 is the lowest garment hem; the pole sits ~1.05 m above it. THE GAME MOUNTS THIS
// AT 2.2 m (the hem height), so the pole ends up at ~3.25 m. mounts = 'back'.
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
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95 });
  const WIRE = M(0x9aa0a3, 'metal', { roughness: 0.5, metalness: 0.4 });
  const CREAM = M(0xd9c9a8, 'fabric', { roughness: 0.9 });
  const CREAM2 = M(0xbfae8e, 'fabric', { roughness: 0.9 });
  const DENIM = M(0x6e86a3, 'fabric', { roughness: 0.9 });
  const DENIM2 = M(0x5a7089, 'fabric', { roughness: 0.9 });
  const DARK = M(0x2a2a2e, 'fabric', { roughness: 0.9 });
  const TOWEL = M(0x5c6b47, 'fabric', { roughness: 0.95 });
  const TOWEL2 = M(0x4d5a3b, 'fabric', { roughness: 0.95 });
  const JACK = M(0x7a6558, 'fabric', { roughness: 0.9 });
  const JACK2 = M(0x8d7a6b, 'fabric', { roughness: 0.9 });
  const PY = 1.05;
  add(C(0.02, 0.02, 3.0, 8, true), BAMBOO, 0, PY, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), NODE, -1.5, PY, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), NODE, 1.5, PY, 0, 0, 0, Math.PI / 2);
  for (const x of [-1.2, -0.7, -0.2, 0.3, 0.8, 1.3]) add(C(0.023, 0.023, 0.025, 8, true), NODE, x, PY, 0, 0, 0, Math.PI / 2);
  // hooks on timber plates against the wall (the back face)
  for (const x of [-1.0, 1.0]) {
    add(B(0.22, 0.40, 0.03), WOOD, x, PY, -0.085);
    add(B(0.10, 0.14, 0.012), TIN, x - 0.04, PY + 0.10, -0.064);
    add(B(0.06, 0.09, 0.012), RUST, x + 0.05, PY - 0.10, -0.064);
    add(B(0.03, 0.03, 0.07), RUSTD, x, PY - 0.03, -0.035);
    add(B(0.03, 0.05, 0.02), RUSTD, x, PY, 0.01);
    add(B(0.03, 0.02, 0.06), RUSTD, x, PY - 0.03, 0.0);
  }
  const hanger = (x, ry) => {
    const h = new THREE.Group(); h.position.set(x, PY, 0); h.rotation.y = ry; g.add(h);
    add(new THREE.TorusGeometry(0.03, 0.004, 3, 8, Math.PI), WIRE, 0, 0.03, 0, 0, 0, 0, h);
    add(C(0.004, 0.004, 0.10, 3, true), WIRE, 0, -0.05, 0, 0, 0, 0, h);
    add(B(0.40, 0.006, 0.006), WIRE, 0, -0.10, 0, 0, 0, 0, h);
    add(B(0.22, 0.006, 0.006), WIRE, -0.1, -0.05, 0, 0, 0, Math.PI / 4, h);
    add(B(0.22, 0.006, 0.006), WIRE, 0.1, -0.05, 0, 0, 0, -Math.PI / 4, h);
    return h;
  };
  // shirt 1 (cream), hem at ~0.30
  let s = hanger(-1.05, 0.12);
  add(B(0.40, 0.66, 0.05), CREAM, 0, -0.44, 0, 0.06, 0, 0, s);
  add(B(0.14, 0.24, 0.05), CREAM, -0.25, -0.24, 0, 0, 0, 0.5, s);
  add(B(0.14, 0.24, 0.05), CREAM2, 0.25, -0.24, 0, 0, 0, -0.5, s);
  add(B(0.14, 0.05, 0.055), CREAM2, 0, -0.14, 0, 0, 0, 0, s);
  add(B(0.10, 0.12, 0.052), CREAM2, 0.08, -0.55, 0, 0, 0, 0.2, s);   // stain
  // shirt 2 (denim)
  s = hanger(-0.55, -0.15);
  add(B(0.38, 0.62, 0.05), DENIM, 0, -0.42, 0, -0.05, 0, 0, s);
  add(B(0.13, 0.22, 0.05), DENIM2, -0.24, -0.23, 0, 0, 0, 0.45, s);
  add(B(0.13, 0.22, 0.05), DENIM2, 0.24, -0.23, 0, 0, 0, -0.45, s);
  add(B(0.14, 0.05, 0.055), DENIM2, 0, -0.14, 0, 0, 0, 0, s);
  // trousers (dark), longest: hem at 0
  s = hanger(-0.10, 0.08);
  add(B(0.30, 0.16, 0.06), DARK, 0, -0.18, 0, 0, 0, 0, s);
  add(B(0.13, 0.90, 0.055), DARK, -0.08, -0.60, 0, 0.04, 0, 0.03, s);
  add(B(0.13, 0.86, 0.055), DARK, 0.08, -0.58, 0.01, -0.03, 0, -0.04, s);
  // towel folded over the pole, front longer than back
  add(B(0.36, 0.70, 0.03), TOWEL, 0.42, PY - 0.33, 0.04, 0.05, 0.05, 0);
  add(B(0.36, 0.50, 0.03), TOWEL2, 0.42, PY - 0.24, -0.035, -0.05, 0.05, 0);
  add(B(0.36, 0.05, 0.10), TOWEL, 0.42, PY + 0.03, 0.0, 0, 0.05, 0);
  add(B(0.36, 0.03, 0.034), TOWEL2, 0.42, PY - 0.60, 0.045, 0.05, 0.05, 0);   // hem band
  // small jacket, hood, sleeves hanging
  s = hanger(1.05, -0.2);
  add(B(0.34, 0.46, 0.09), JACK, 0, -0.35, 0, 0.03, 0, 0, s);
  add(B(0.11, 0.36, 0.09), JACK2, -0.22, -0.32, 0, 0, 0, 0.12, s);
  add(B(0.11, 0.36, 0.09), JACK2, 0.22, -0.32, 0, 0, 0, -0.12, s);
  add(new THREE.SphereGeometry(0.10, 8, 5), JACK2, 0, -0.08, -0.03);
  add(B(0.34, 0.04, 0.095), JACK2, 0, -0.56, 0, 0, 0, 0, s);
  add(B(0.03, 0.40, 0.095), RUSTD, 0, -0.36, 0, 0, 0, 0, s);   // zip line
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
