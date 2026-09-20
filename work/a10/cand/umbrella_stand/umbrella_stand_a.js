// umbrella_stand — arm A: primitives. A rusty tubular frame 0.4 x 0.4 x 0.6 (round posts, top
// and mid rails, patched tin panels round the lower half, feet, a drip tray), holding four closed
// umbrellas as cones with hooked handles, one broken with its ribs sticking out.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUST2 = M(0x8a5a30, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2, side: DS });
  const TIN2 = M(0x8b6141, 'metal', { roughness: 0.9, side: DS });
  const STEEL = M(0x6c7073, 'metal', { roughness: 0.6, metalness: 0.3 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.85 });
  const RED = M(0x8e2f28, 'fabric', { roughness: 0.8 });
  const NAVY = M(0x2a3350, 'fabric', { roughness: 0.8 });
  const MUST = M(0xb08a2e, 'fabric', { roughness: 0.8 });
  const GREEN = M(0x2f4a35, 'fabric', { roughness: 0.8 });
  const H = 0.6, W = 0.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(C(0.013, 0.013, H, 6, true), RUST, sx * 0.19, H / 2, sz * 0.19);
    add(B(0.05, 0.03, 0.05), RUSTD, sx * 0.19, 0.015, sz * 0.19);              // feet (grounding)
  }
  const rail = (y, mat) => {
    add(C(0.012, 0.012, W, 6, true), mat, 0, y, 0.19, 0, 0, Math.PI / 2);
    add(C(0.012, 0.012, W, 6, true), mat, 0, y, -0.19, 0, 0, Math.PI / 2);
    add(C(0.012, 0.012, W, 6, true), mat, 0.19, y, 0, Math.PI / 2, 0, 0);
    add(C(0.012, 0.012, W, 6, true), mat, -0.19, y, 0, Math.PI / 2, 0, 0);
  };
  rail(H, RUST2); rail(0.44, RUST);
  // tin panels round the lower half, one patched, one torn short
  add(B(0.38, 0.30, 0.015), TIN, 0, 0.20, 0.19);
  add(B(0.38, 0.30, 0.015), TIN2, 0, 0.20, -0.19);
  add(B(0.015, 0.30, 0.38), TIN, 0.19, 0.20, 0);
  add(B(0.015, 0.22, 0.38), TIN2, -0.19, 0.16, 0);
  add(B(0.20, 0.12, 0.018), RUST, 0.06, 0.26, 0.19);       // a riveted patch
  add(B(0.38, 0.06, 0.017), GROUND, 0, 0.03, 0.19);
  add(B(0.38, 0.06, 0.017), GROUND, 0, 0.03, -0.19);
  add(B(0.017, 0.06, 0.38), GROUND, 0.19, 0.03, 0);
  add(B(0.017, 0.06, 0.38), GROUND, -0.19, 0.03, 0);
  add(B(0.36, 0.02, 0.36), RUSTD, 0, 0.05, 0);              // drip tray floor
  // umbrellas: tip at the tray, handle above the top rail, each leaning its own way
  const umb = (x, z, mat, len, lean, ry, broken) => {
    const u = new THREE.Group(); u.position.set(x, 0.06, z); u.rotation.set(lean, ry, lean * 0.6); g.add(u);
    add(C(0.005, 0.008, 0.05, 4, true), STEEL, 0, 0.025, 0, 0, 0, 0, u);                 // ferrule
    add(new THREE.ConeGeometry(0.042, len, 6, 1, true), mat, 0, 0.05 + len / 2, 0, Math.PI, 0, 0, u);
    add(new THREE.ConeGeometry(0.043, len * 0.25, 6, 1, true), mat, 0, 0.05 + len * 0.62, 0, Math.PI, 0, 0, u); // fold flare
    add(B(0.03, 0.02, 0.09), mat, 0, 0.05 + len * 0.55, 0, 0, 0, 0, u);           // tie band
    add(C(0.006, 0.006, 0.10, 5, true), STEEL, 0, 0.05 + len + 0.05, 0, 0, 0, 0, u);
    add(new THREE.TorusGeometry(0.035, 0.009, 3, 6, Math.PI), WOOD, 0.035, 0.05 + len + 0.10, 0, 0, 0, 0, u);
    add(C(0.009, 0.009, 0.06, 5, true), WOOD, 0.07, 0.05 + len + 0.07, 0, 0, 0, 0, u);
    if (broken) for (let i = 0; i < 3; i++) add(C(0.002, 0.002, 0.30, 3, true), STEEL, 0, 0.05 + len * 0.8, 0, 0.5 + i * 0.25, i * 1.5, 0.6, u);
  };
  umb(-0.10, -0.08, RED, 0.62, 0.12, 0.3, false);
  umb(0.02, -0.11, NAVY, 0.70, -0.06, 1.2, true);
  umb(-0.04, 0.09, MUST, 0.60, 0.10, 2.3, false);
  umb(0.11, 0.06, GREEN, 0.66, -0.14, 0.8, false);
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
