// gas_cylinders — winner (arm C): a different reading. Cylinders with true domed shoulders (partial
// spheres), tall ventilated foot skirts, an angle-iron cradle at mid height instead of a flat
// strap, and the chain crossing in an X between the two bottles with a padlock. mounts = 'back'.
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
  const GREY = M(0x7f8386, 'metal', { roughness: 0.75, metalness: 0.2, side: DS });
  const GREY2 = M(0x6a6e71, 'metal', { roughness: 0.8, metalness: 0.2, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const BRASS = M(0xa8823c, 'metal', { roughness: 0.5, metalness: 0.4 });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2 });
  const TIN2 = M(0x8b6141, 'metal', { roughness: 0.9 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const PAPER = M(0xd8c9a8, 'metal', { roughness: 0.6 });
  add(B(1.0, 1.35, 0.05), TIN, 0, 0.675, -0.19);
  add(B(1.0, 0.06, 0.05), GROUND, 0, 0.03, -0.19);
  add(B(0.5, 0.36, 0.012), TIN2, -0.2, 0.95, -0.16);
  add(B(0.2, 0.7, 0.012), RUST, 0.35, 0.4, -0.16);
  add(B(1.0, 0.10, 0.06), WOOD, 0, 1.20, -0.135);     // top rail
  add(B(1.0, 0.10, 0.06), WOOD, 0, 0.30, -0.135);     // bottom rail
  const S = 10;
  for (const x of [-0.17, 0.17]) {
    add(C(0.15, 0.15, 0.14, S, true), RUST, x, 0.07, 0.03);                  // ventilated skirt
    add(C(0.15, 0.15, 0.06, S, true), GROUND, x, 0.03, 0.03);
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.3; add(B(0.05, 0.04, 0.02), GROUND, x + Math.sin(a) * 0.148, 0.08, 0.03 + Math.cos(a) * 0.148, 0, a, 0); }
    add(C(0.15, 0.15, 0.68, S, true), GREY, x, 0.48, 0.03);
    add(C(0.15, 0.15, 0.01, S), GREY2, x, 0.14, 0.03);
    const dome = add(new THREE.SphereGeometry(0.15, S, 2, 0, Math.PI * 2, 0, Math.PI / 2), GREY, x, 0.82, 0.03);
    dome.scale.set(1, 0.9, 1);
    add(C(0.151, 0.151, 0.05, S, true), RUST, x, 0.30, 0.03);
    add(B(0.06, 0.20, 0.014), RUSTD, x + 0.03, 0.55, 0.03 + 0.145, 0, 0.2, 0); // rust run
    add(C(0.05, 0.05, 0.08, 6, true), GREY2, x, 0.99, 0.03);                            // collar
    add(B(0.05, 0.09, 0.05), BRASS, x, 1.07, 0.03);
    add(new THREE.TorusGeometry(0.03, 0.006, 3, 6), RUSTD, x, 1.13, 0.03, Math.PI / 2, 0, 0);
    add(C(0.012, 0.012, 0.06, 6), BRASS, x - 0.045, 1.06, 0.03, 0, 0, Math.PI / 2);
  }
  // angle-iron cradle at mid height: an L in section, with a hasp
  add(B(0.74, 0.05, 0.02), GREY2, 0, 0.52, 0.19);
  add(B(0.74, 0.02, 0.06), GREY2, 0, 0.505, 0.17);
  add(B(0.74, 0.012, 0.024), RUST, 0, 0.535, 0.19);
  for (const s of [-1, 1]) add(B(0.02, 0.05, 0.36), GREY2, s * 0.36, 0.52, 0.0);
  // chain X with a padlock at the crossing
  for (const s of [-1, 1]) {
    add(C(0.011, 0.011, 0.98, 5, true), RUSTD, 0, 0.72, 0.20, 0, 0, s * 0.62);
    for (let i = 0; i < 3; i++) { const t = -0.36 + i * 0.36; add(B(0.03, 0.04, 0.02), RUST, -Math.sin(s * 0.62) * t, 0.72 + Math.cos(0.62) * t, 0.20, 0, (i % 2) * Math.PI / 2, s * 0.62); }
  }
  add(B(0.06, 0.07, 0.025), BRASS, 0, 0.66, 0.215);
  add(new THREE.TorusGeometry(0.02, 0.005, 3, 8, Math.PI), GREY2, 0, 0.70, 0.215);
  // gauge on the cross pipe between the valves
  add(C(0.012, 0.012, 0.25, 6), BRASS, 0, 1.06, 0.06, 0, 0, Math.PI / 2);
  add(C(0.045, 0.045, 0.02, 8, true), GREY2, 0, 1.12, 0.06, Math.PI / 2, 0, 0);
  add(C(0.036, 0.036, 0.006, 8), PAPER, 0, 1.12, 0.072, Math.PI / 2, 0, 0);
  add(B(0.004, 0.03, 0.004), RUSTD, 0.006, 1.13, 0.076, 0, 0, -0.6);
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
