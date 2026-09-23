// roof_tank_block — BLOCK obstacle from the rooftops board (the horizontal tank at the left of the
// frame): a galvanised cylindrical tank lying on its side, 1.8 m wide x 1.1 m dia, in a steel cradle
// on four angle legs with cross braces and foot plates, 2.2 m to the top of the vent. Hoop bands,
// a manway on the end, a filler pipe and valve on top, an outlet elbow underneath, rust runs and a
// moss-stained saddle. Solid enough below the tank (cradle, braces, a slat crate parked between
// the legs) that a runner reads it as a wall. userData.obstacle = { kind: 'block', lanes: 1 }.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open);

  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.72, metalness: 0.3 });
  const GALV2 = M(0x767b7c, 'metal', { roughness: 0.78, metalness: 0.3 });
  const GALVD = M(0x5f6466, 'metal', { roughness: 0.75, metalness: 0.3, side: DS });
  const RUST = M(0x8b4a22, 'metal', { roughness: 0.92, metalness: 0.3 });
  const RUST2 = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const MOSS = M(0x4a5a2a, 'foliage', { roughness: 0.95 });
  const DARK = M(0x110f12, 'metal', { roughness: 0.9 });
  const TIMBER = M(0x4f2d21, 'timber', { roughness: 0.92 });

  const R = 0.55, L = 1.5, CY = 1.32;      // tank axis height; overall width 1.8 with the domed ends
  // --- cradle: legs, ring beams, saddles, braces, foot plates -------------------------
  const LX = 0.62, LZ = 0.42, LT = 0.86;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.22, 0.03, 0.22), DARK, sx * LX, 0.015, sz * LZ);
    add(B(0.10, LT, 0.10), sx * sz > 0 ? RUST2 : RUST, sx * LX, 0.03 + LT / 2, sz * LZ);
    add(B(0.11, 0.18, 0.11), RUSTD, sx * LX, 0.12, sz * LZ);
  }
  for (const s of [-1, 1]) {
    add(B(2 * LX + 0.1, 0.10, 0.10), RUST, 0, LT - 0.02, s * LZ);
    add(B(0.10, 0.10, 2 * LZ + 0.1), RUST2, s * LX, LT - 0.02, 0);
    add(B(2 * LX, 0.06, 0.06), RUST2, 0, 0.32, s * LZ);
    const bl = Math.hypot(2 * LX - 0.1, LT - 0.45), ang = Math.atan2(LT - 0.45, 2 * LX - 0.1);
    add(B(bl, 0.05, 0.02), RUST2, 0, 0.35 + (LT - 0.45) / 2, s * (LZ + 0.06), 0, 0, ang);
    add(B(bl, 0.05, 0.02), RUST, 0, 0.35 + (LT - 0.45) / 2, s * (LZ + 0.06), 0, 0, -ang);
    // saddles: curved cradles the tank sits in
    add(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.08, 14, 1, true, Math.PI * 0.62, Math.PI * 0.76), GALVD, s * 0.45, CY, 0, 0, 0, Math.PI / 2);
    add(B(0.08, 0.12, 2 * LZ + 0.1), RUST2, s * 0.45, LT + 0.04, 0);
  }
  add(B(0.05, 0.06, 2 * LZ), MOSS, 0.45, LT + 0.11, 0);                                   // moss on the shaded saddle
  // a slat crate parked between the legs, so the space under the tank is not a gap
  for (let k = 0; k < 4; k++) add(B(0.9, 0.06, 0.55), TIMBER, -0.05, 0.08 + k * 0.14, 0.02);
  for (const sx of [-1, 1]) add(B(0.06, 0.55, 0.55), TIMBER, -0.05 + sx * 0.44, 0.31, 0.02);
  add(B(0.92, 0.05, 0.57), DARK, -0.05, 0.03, 0.02);
  // --- tank: body, dished ends, hoops, weld seam, manway, top fittings --------------------
  add(C(R, R, L, 18), GALV, 0, CY, 0, 0, 0, Math.PI / 2);
  add(C(R + 0.002, R + 0.002, 0.30, 18, true), GALV2, 0.2, CY, 0, 0, 0, Math.PI / 2);      // a duller replaced ring
  for (const s of [-1, 1]) { const e = add(new THREE.SphereGeometry(R, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), GALV2, s * L / 2, CY, 0, 0, 0, s * -Math.PI / 2); e.scale.set(1, 0.3, 1); }
  for (const x of [-0.6, -0.2, 0.25, 0.6]) add(new THREE.TorusGeometry(R + 0.012, 0.02, 4, 18), RUST2, x, CY, 0, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(R + 0.006, 0.008, 3, 18), RUSTD, 0.02, CY, 0, 0, Math.PI / 2, 0);   // weld seam
  add(C(0.16, 0.16, 0.05, 12), RUST, L / 2 + 0.17, CY, 0, 0, 0, Math.PI / 2);                    // manway on the +x end
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; add(C(0.012, 0.012, 0.03, 6), DARK, L / 2 + 0.19, CY + Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0, 0, Math.PI / 2); }
  add(C(0.07, 0.07, 0.28, 10), GALVD, 0.35, CY + R + 0.12, 0);                                    // filler neck
  add(C(0.10, 0.10, 0.04, 10), RUST, 0.35, CY + R + 0.28, 0);
  add(C(0.035, 0.035, 0.32, 8), GALV, -0.3, CY + R + 0.12, 0);                                    // vent pipe: up, then an elbow
  add(new THREE.TorusGeometry(0.05, 0.035, 6, 8, Math.PI / 2), GALV, -0.35, CY + R + 0.28, 0, 0, 0, 0);
  add(C(0.035, 0.035, 0.10, 8), GALV, -0.42, CY + R + 0.33, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.10, 8), GALV, 0.55, CY + R + 0.05, 0.02);                                  // level gauge stub with a red wheel valve
  add(new THREE.TorusGeometry(0.06, 0.012, 4, 10), M(0xb8302a, 'metal', { roughness: 0.7, metalness: 0.3 }), 0.55, CY + R + 0.12, 0.02, Math.PI / 2, 0, 0);
  // outlet under the tank: pipe down, elbow, valve, pipe out past a leg
  add(C(0.035, 0.035, 0.30, 8), GALVD, -0.15, CY - R - 0.12, 0.1);
  add(C(0.045, 0.045, 0.05, 8), RUSTD, -0.15, CY - R - 0.20, 0.1);
  add(new THREE.TorusGeometry(0.06, 0.035, 6, 8, Math.PI / 2), GALVD, -0.09, CY - R - 0.27, 0.1, 0, 0, Math.PI);
  add(C(0.035, 0.035, 0.42, 8), GALVD, -0.36, CY - R - 0.33, 0.1, 0, 0, Math.PI / 2);
  // wear: rust runs down the shell and the end, a stain under the filler
  for (const [a, h, x] of [[0.4, 0.45, -0.5], [1.3, 0.3, 0.1], [2.4, 0.5, 0.45], [4.1, 0.35, -0.2]]) add(B(0.04, 0.006, h), RUST2, x, CY + Math.cos(a) * (R + 0.004), Math.sin(a) * (R + 0.004), -a, 0, 0);
  add(B(0.2, 0.006, 0.5), RUSTD, 0.35, CY + R + 0.004, 0.0);

  g.userData.obstacle = { kind: 'block', lanes: 1 };
  g.userData.lights = [];
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
  if (g.userData.lights) g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
}
