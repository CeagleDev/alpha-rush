// standing_lightbox — arm C: a clamshell reading. A deep back pan and a front lid meet at a
// stepped joint line all round; each lit face stands PROUD of its lid on a 1 cm collar so the
// acrylic edge catches light; a hood strip over the top; the stem is a stubby I-beam on a
// bolted plate; the cable exits a gland on the side. Both faces lit (cream + red band).
// 0.6 × 1.5 m, front = +Z, base y = 0, userData.lights one warm entry each side.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const RUST2 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.15 });
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8 });
  const TIN2 = mk(0x5a554e, 'metal', { roughness: 0.85 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const STAIN = mk(0x8b6141, 'plaster', { roughness: 0.95, metalness: 0 });
  const RUBBER = mk(0x110f12, 'fabric', { roughness: 0.9, metalness: 0.05 });   // cable sheath
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const W = 0.6, H = 1.14, Y0 = 0.36, yc = Y0 + H / 2;
  // clamshell: back pan 0.07 deep, joint step, front lid 0.05 deep
  add(B(W, H, 0.07), TIN2, 0, yc, -0.03);
  add(B(W - 0.02, H - 0.02, 0.012), RUST, 0, yc, 0.011);            // the joint line
  add(B(W, H, 0.05), RUST2, 0, yc, 0.042);
  // each face: a collar proud of its lid, and the lit panels proud of the collar
  const iw = W - 0.09, ih = H - 0.09;
  for (const sz of [-1, 1]) {
    const zl = sz > 0 ? 0.067 : -0.065;             // the outer face of the lid / pan
    const ry = sz < 0 ? Math.PI : 0;
    add(B(iw + 0.03, ih + 0.03, 0.012), RUST, 0, yc, zl + sz * 0.006);
    add(B(iw + 0.006, ih + 0.006, 0.008), BLACK, 0, yc, zl + sz * 0.016);      // gasket
    add(new THREE.PlaneGeometry(iw, 0.16), RED, 0, Y0 + H - 0.045 - 0.08, zl + sz * 0.0205, 0, ry, 0);
    add(new THREE.PlaneGeometry(iw, ih - 0.16), CREAM, 0, Y0 + 0.045 + (ih - 0.16) / 2, zl + sz * 0.0205, 0, ry, 0);
    add(B(iw, 0.018, 0.006), TIN2, 0, Y0 + H - 0.045 - 0.16, zl + sz * 0.020);
    add(new THREE.PlaneGeometry(0.10, 0.09), STAIN, sz * 0.17, Y0 + 0.12, zl + sz * 0.0215, 0, ry, 0);   // grime (wear)
  }
  // hood strip over the top, bent tin, and lid screws down both cheeks
  add(B(W + 0.02, 0.03, 0.17), TIN, 0, Y0 + H + 0.005, 0.0);
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), GALV, sx * (W / 2 + 0.002), Y0 + 0.1 + i * 0.23, 0.042, 0, 0, Math.PI / 2);
  // a dented corner: a wedge of the lid pushed in (wear)
  add(B(0.08, 0.05, 0.02), TIN2, -W / 2 + 0.04, Y0 + 0.025, 0.06, 0, 0, 0.12);
  // stem: an I-beam stub (two flanges + web) on a bolted plate
  add(B(0.16, 0.30, 0.02), TIN2, 0, Y0 - 0.15, 0.05);
  add(B(0.16, 0.30, 0.02), TIN2, 0, Y0 - 0.15, -0.05);
  add(B(0.03, 0.30, 0.08), RUST2, 0, Y0 - 0.15, 0);
  add(B(0.24, 0.02, 0.18), RUST, 0, Y0 - 0.01, 0);
  add(B(0.24, 0.02, 0.18), RUST, 0, 0.05, 0);
  add(B(0.46, 0.04, 0.32), BLACK, 0, 0.02, 0);                    // base plate, grounding band
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 6), GALV, sx * 0.19, 0.047, sz * 0.12);
    add(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 6), GALV, sx * 0.09, 0.067, sz * 0.06);
  }
  // cable: gland on the side of the pan, then down the back to the floor and away
  add(new THREE.CylinderGeometry(0.014, 0.016, 0.03, 8), GALV, W / 2 + 0.012, Y0 + 0.08, -0.03, 0, 0, Math.PI / 2);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(W / 2 + 0.03, Y0 + 0.08, -0.03), new THREE.Vector3(W / 2 + 0.06, Y0 - 0.06, -0.10), new THREE.Vector3(0.22, 0.10, -0.22),
    new THREE.Vector3(0.10, 0.012, -0.28), new THREE.Vector3(-0.04, 0.012, -0.32),
  ]);
  add(new THREE.TubeGeometry(curve, 16, 0.007, 5, false), RUBBER, 0, 0, 0);
  add(B(0.05, 0.03, 0.035), RUBBER, -0.07, 0.015, -0.33);

  finish(THREE, g, [
    { x: 0, y: yc, z: 0.24, color: 0xd8ae70, intensity: 1.4, range: 3 },
    { x: 0, y: yc, z: -0.24, color: 0xd8ae70, intensity: 1.4, range: 3 },
  ]);
  return g;
}
function finish(THREE, g, lights) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
