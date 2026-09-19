// gas_cylinders — arm A: primitives. Two grey LPG cylinders 0.3 dia x 1.2 h (foot skirt, body,
// chamfered shoulder, collar, valve) on a tin wall fragment with a timber batten, a steel strap
// across both, a chain from the batten down between them, and a gauge. mounts = 'back'.
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
  // wall fragment: tin sheet + timber batten, standing on the ground behind the cylinders
  add(B(1.0, 1.35, 0.05), TIN, 0, 0.675, -0.19);
  add(B(1.0, 0.06, 0.05), GROUND, 0, 0.03, -0.19);
  add(B(0.32, 0.5, 0.012), TIN2, -0.3, 0.55, -0.16);        // a faded, rustier panel
  add(B(0.14, 0.9, 0.012), RUST, 0.38, 0.8, -0.16);
  add(B(1.0, 0.12, 0.06), WOOD, 0, 1.14, -0.135);           // batten
  for (const x of [-0.42, 0.42]) add(C(0.015, 0.015, 0.02, 6), RUSTD, x, 1.14, -0.10, Math.PI / 2, 0, 0);
  const S = 12;
  const cyl = (x) => {
    add(C(0.15, 0.15, 0.10, S, true), RUST, x, 0.05, 0.03);   // foot skirt, rusted
    add(C(0.15, 0.15, 0.06, S, true), GROUND, x, 0.03, 0.03);
    add(C(0.15, 0.15, 0.01, S), GREY2, x, 0.10, 0.03);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; add(B(0.05, 0.03, 0.02), GROUND, x + Math.sin(a) * 0.148, 0.055, 0.03 + Math.cos(a) * 0.148, 0, a, 0); }
    add(C(0.15, 0.15, 0.75, S, true), GREY, x, 0.475, 0.03);
    add(C(0.152, 0.152, 0.06, S, true), RUST, x, 0.16, 0.03); // rust ring above the foot
    add(C(0.08, 0.15, 0.10, S, true), GREY, x, 0.90, 0.03);   // shoulder
    add(C(0.08, 0.08, 0.02, S), GREY2, x, 0.955, 0.03);
    add(C(0.05, 0.05, 0.06, 8), GREY2, x, 0.995, 0.03);       // collar
    add(B(0.05, 0.10, 0.05), BRASS, x, 1.07, 0.03);           // valve body
    add(C(0.035, 0.035, 0.012, 8), RUSTD, x, 1.13, 0.03);     // handwheel
    add(B(0.07, 0.008, 0.012), RUSTD, x, 1.135, 0.03, 0, 0.8, 0);
    add(B(0.07, 0.008, 0.012), RUSTD, x, 1.135, 0.03, 0, -0.8, 0);
    add(C(0.012, 0.012, 0.06, 6), BRASS, x + 0.05, 1.06, 0.03, 0, 0, Math.PI / 2);  // outlet
    add(B(0.06, 0.04, 0.03), GREY2, x - 0.055, 0.72, 0.03 + 0.14, 0, 0, 0);          // dent patch
  };
  cyl(-0.17); cyl(0.17);
  // steel strap through both, bolted back to the wall
  add(B(0.72, 0.06, 0.02), GREY2, 0, 0.45, 0.19);
  for (const s of [-1, 1]) { add(B(0.02, 0.06, 0.20), GREY2, s * 0.35, 0.45, 0.06); add(B(0.02, 0.06, 0.06), RUSTD, s * 0.35, 0.45, -0.13); }
  add(B(0.72, 0.012, 0.024), RUST, 0, 0.425, 0.19);
  // chain from the batten down between the cylinders
  add(C(0.012, 0.012, 0.66, 5, true), RUSTD, 0, 0.78, 0.02);
  for (let i = 0; i < 7; i++) add(B(0.03, 0.045, 0.02), RUST, 0, 0.50 + i * 0.09, 0.02, 0, (i % 2) * Math.PI / 2, 0);
  add(C(0.008, 0.008, 0.12, 5, true), RUSTD, 0, 1.08, -0.06, 0.6, 0, 0);
  // gauge on a T-piece between the valves
  add(C(0.012, 0.012, 0.28, 6), BRASS, 0, 1.06, 0.06, 0, 0, Math.PI / 2);
  add(C(0.045, 0.045, 0.02, 10), GREY2, 0, 1.13, 0.06, Math.PI / 2, 0, 0);
  add(C(0.036, 0.036, 0.006, 10), PAPER, 0, 1.13, 0.072, Math.PI / 2, 0, 0);
  add(B(0.004, 0.03, 0.004), RUSTD, 0.005, 1.14, 0.076, 0, 0, -0.5);
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
