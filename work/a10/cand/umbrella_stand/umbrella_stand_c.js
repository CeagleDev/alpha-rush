// umbrella_stand — arm C: a different breakdown. The stand as a heavier angle-iron cage with a
// full-height back panel, torn side sheets and a front sheet with a hole; the umbrellas as
// six-sided cones of different lengths, and the broken one collapsed across the top rails
// with its canopy split. Read as a much more battered object.
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
  const RED = M(0x8e2f28, 'fabric', { roughness: 0.8, side: DS });
  const NAVY = M(0x2a3350, 'fabric', { roughness: 0.8, side: DS });
  const MUST = M(0xb08a2e, 'fabric', { roughness: 0.8, side: DS });
  const GREEN = M(0x2f4a35, 'fabric', { roughness: 0.8, side: DS });
  const H = 0.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.025, H, 0.025), RUST, sx * 0.1875, H / 2, sz * 0.1875);
    add(B(0.025, 0.06, 0.025), GROUND, sx * 0.1875, 0.03, sz * 0.1875);
  }
  for (const y of [H - 0.012, 0.40]) {
    add(B(0.40, 0.025, 0.025), y > 0.5 ? RUST2 : RUST, 0, y, 0.1875);
    add(B(0.40, 0.025, 0.025), y > 0.5 ? RUST2 : RUST, 0, y, -0.1875);
    add(B(0.025, 0.025, 0.40), y > 0.5 ? RUST2 : RUST, 0.1875, y, 0);
    add(B(0.025, 0.025, 0.40), y > 0.5 ? RUST2 : RUST, -0.1875, y, 0);
  }
  add(B(0.36, 0.56, 0.012), TIN2, 0, 0.30, -0.19);         // full back sheet
  add(B(0.36, 0.34, 0.012), TIN, 0, 0.19, 0.19);            // front sheet
  add(B(0.10, 0.08, 0.014), GROUND, 0.08, 0.22, 0.19);      // hole in it
  add(B(0.012, 0.30, 0.24), TIN, 0.19, 0.17, -0.06);        // torn side sheets
  add(B(0.012, 0.18, 0.36), TIN2, -0.19, 0.11, 0);
  add(B(0.012, 0.10, 0.14), RUST, -0.19, 0.28, -0.10);
  add(B(0.36, 0.06, 0.014), GROUND, 0, 0.03, 0.19);
  add(B(0.36, 0.06, 0.014), GROUND, 0, 0.03, -0.19);
  add(B(0.34, 0.02, 0.34), RUSTD, 0, 0.04, 0);
  const umb = (x, z, mat, len, lean, ry) => {
    const u = new THREE.Group(); u.position.set(x, 0.05, z); u.rotation.set(lean, ry, lean * 0.5); g.add(u);
    add(C(0.005, 0.009, 0.05, 5), STEEL, 0, 0.025, 0, 0, 0, 0, u);
    add(new THREE.ConeGeometry(0.045, len, 6, 1, true), mat, 0, 0.05 + len / 2, 0, Math.PI, 0, 0, u);
    add(new THREE.ConeGeometry(0.03, len * 0.3, 6, 1, true), mat, 0, 0.05 + len * 0.15, 0, Math.PI, 0.5, 0, u);
    add(B(0.028, 0.025, 0.096), mat, 0, 0.05 + len * 0.6, 0, 0, 0, 0, u);
    add(C(0.006, 0.006, 0.09, 5, true), STEEL, 0, 0.05 + len + 0.045, 0, 0, 0, 0, u);
    add(new THREE.TorusGeometry(0.035, 0.009, 4, 8, Math.PI), WOOD, 0.035, 0.05 + len + 0.09, 0, 0, 0, 0, u);
    add(C(0.009, 0.009, 0.06, 5, true), WOOD, 0.07, 0.05 + len + 0.06, 0, 0, 0, 0, u);
  };
  umb(-0.09, -0.07, RED, 0.62, 0.10, 0.3);
  umb(-0.02, 0.08, MUST, 0.56, 0.12, 2.3);
  umb(0.10, 0.02, GREEN, 0.68, -0.13, 0.8);
  // the broken one lying across the top rails, canopy split in two, ribs out
  const b = new THREE.Group(); b.position.set(0.02, H + 0.04, -0.02); b.rotation.set(0, 0.5, Math.PI / 2 - 0.15); g.add(b);
  add(C(0.006, 0.006, 0.70, 5, true), STEEL, 0, 0.35, 0, 0, 0, 0, b);
  add(new THREE.ConeGeometry(0.04, 0.32, 6, 1, true), NAVY, 0.01, 0.17, 0.01, Math.PI, 0, 0.15, b);
  add(new THREE.ConeGeometry(0.035, 0.26, 6, 1, true), NAVY, -0.02, 0.36, -0.02, Math.PI, 0, -0.4, b);
  for (let i = 0; i < 4; i++) add(C(0.002, 0.002, 0.26, 3, true), STEEL, 0, 0.40, 0, 0.6 + i * 0.3, i * 1.6, 0.5, b);
  add(new THREE.TorusGeometry(0.035, 0.009, 4, 8, Math.PI), WOOD, 0.035, 0.74, 0, 0, 0, 0, b);
  add(C(0.009, 0.009, 0.06, 5, true), WOOD, 0.07, 0.71, 0, 0, 0, 0, b);
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
