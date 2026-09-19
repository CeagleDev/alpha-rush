// gas_cylinders — arm B: profiles. Each cylinder is one LatheGeometry (foot skirt, body,
// shoulder, collar) and the valve another; the gauge is a lathe dish; the wall fragment is a
// box with a timber batten; the chain is a beaded rod. mounts = 'back'.
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
  const BRASS = M(0xa8823c, 'metal', { roughness: 0.5, metalness: 0.4, side: DS });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2 });
  const TIN2 = M(0x8b6141, 'metal', { roughness: 0.9 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const PAPER = M(0xd8c9a8, 'metal', { roughness: 0.6, side: DS });
  add(B(1.0, 1.35, 0.05), TIN, 0, 0.675, -0.19);
  add(B(1.0, 0.06, 0.05), GROUND, 0, 0.03, -0.19);
  add(B(0.4, 0.6, 0.012), TIN2, 0.28, 0.5, -0.16);
  add(B(0.10, 1.0, 0.012), RUST, -0.42, 0.75, -0.16);
  add(B(1.0, 0.12, 0.06), WOOD, 0, 1.12, -0.135);
  const S = 12;
  const prof = [[0, 0.005], [0.14, 0.005], [0.15, 0.0], [0.15, 0.10], [0.135, 0.10], [0.135, 0.13], [0.15, 0.15],
                [0.15, 0.82], [0.13, 0.90], [0.07, 0.96], [0.05, 0.99], [0.05, 1.02], [0.0, 1.02]];
  const valve = [[0, 0], [0.02, 0], [0.02, 0.06], [0.035, 0.07], [0.035, 0.09], [0.028, 0.09], [0.028, 0.15], [0.0, 0.15]];
  for (const x of [-0.17, 0.17]) {
    add(L(prof, S), GREY, x, 0, 0.03);
    add(C(0.152, 0.152, 0.06, S, true), GROUND, x, 0.03, 0.03);
    add(C(0.152, 0.152, 0.06, S, true), RUST, x, 0.085, 0.03);    // rusted foot band
    add(C(0.151, 0.151, 0.05, S, true), GREY2, x, 0.60, 0.03);    // a dull worn band
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.6; add(B(0.05, 0.03, 0.02), GROUND, x + Math.sin(a) * 0.148, 0.05, 0.03 + Math.cos(a) * 0.148, 0, a, 0); }
    add(L(valve, 8), BRASS, x, 1.02, 0.03);
    add(C(0.04, 0.04, 0.012, 8), RUSTD, x, 1.17, 0.03);            // handwheel
    add(C(0.012, 0.012, 0.06, 6), BRASS, x + 0.045, 1.10, 0.03, 0, 0, Math.PI / 2);
  }
  // strap and its wall lugs
  add(B(0.72, 0.06, 0.02), GREY2, 0, 0.45, 0.19);
  add(B(0.72, 0.012, 0.024), RUST, 0, 0.425, 0.19);
  for (const s of [-1, 1]) add(B(0.02, 0.06, 0.32), GREY2, s * 0.35, 0.45, 0.02);
  // chain: a rod with beads, from the batten to the strap
  add(C(0.012, 0.012, 0.72, 5, true), RUSTD, 0, 0.80, 0.04);
  for (let i = 0; i < 6; i++) add(B(0.03, 0.045, 0.02), RUST, 0, 0.52 + i * 0.11, 0.04, 0, (i % 2) * Math.PI / 2, 0);
  // gauge dish on a cross pipe
  add(C(0.012, 0.012, 0.26, 6), BRASS, 0, 1.10, 0.06, 0, 0, Math.PI / 2);
  add(L([[0, 0], [0.045, 0], [0.045, 0.02], [0.036, 0.024], [0.0, 0.024]], 10), GREY2, 0, 1.17, 0.06, Math.PI / 2, 0, 0);
  add(C(0.034, 0.034, 0.004, 10), PAPER, 0, 1.17, 0.085, Math.PI / 2, 0, 0);
  add(C(0.012, 0.012, 0.05, 6), BRASS, 0, 1.135, 0.06);
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
