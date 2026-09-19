// wall_lightbox — arm A: primitives. A 0.9 × 0.6 × 0.15 m rusty steel pan
// (back plate + four rails + a proud front bezel) holding an emissive cream
// acrylic face with a lit red band along the top. On the back: a hanging
// channel bracket, a junction box and a conduit riser. Back mounts flush to a
// wall (userData.mounts = 'back'). Front = +Z, base y = 0 at the bottom rail.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
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
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });

  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const W = 0.9, H = 0.6, D = 0.13;           // pan; bracket adds 0.02 behind
  const zb = -0.075 + 0.02;                    // back face of the pan
  const zf = zb + D;                           // front of the pan = +0.075
  // back plate and the four rails
  add(B(W, H, 0.02), TIN2, 0, H / 2, zb + 0.01);
  add(B(W, 0.04, D), RUST2, 0, H - 0.02, zb + D / 2);          // top rail
  add(B(W, 0.04, D), BLACK, 0, 0.02, zb + D / 2);              // bottom rail: grounding band
  for (const sx of [-1, 1]) add(B(0.04, H - 0.08, D), RUST, sx * (W / 2 - 0.02), H / 2, zb + D / 2);
  // proud front bezel ring (3 cm wide, 2 cm proud)
  add(B(W, 0.035, 0.03), RUST, 0, H - 0.0175, zf - 0.005);
  add(B(W, 0.035, 0.03), RUST2, 0, 0.0175, zf - 0.005);
  for (const sx of [-1, 1]) add(B(0.035, H, 0.03), sx < 0 ? RUST2 : RUST, sx * (W / 2 - 0.0175), H / 2, zf - 0.005);
  // the lit face, recessed 1.5 cm behind the bezel: red band over cream
  const iw = W - 0.08;
  add(B(iw, 0.11, 0.012), RED, 0, H - 0.04 - 0.055, zf - 0.018);
  add(B(iw, 0.02, 0.012), TIN2, 0, H - 0.04 - 0.12, zf - 0.02);
  add(B(iw, H - 0.08 - 0.13, 0.012), CREAM, 0, (H - 0.08 - 0.13) / 2 + 0.04, zf - 0.018);
  // grime on the acrylic: two matt stain patches, proud 1 mm
  add(B(0.14, 0.05, 0.002), STAIN, -iw / 2 + 0.09, 0.075, zf - 0.011);
  add(B(0.06, 0.12, 0.002), STAIN, iw / 2 - 0.05, 0.19, zf - 0.011);
  // rust runs down the bezel and side rails, a chipped corner
  add(B(0.03, 0.22, 0.004), RUST2, -W / 2 + 0.018, 0.30, zf + 0.012);
  add(B(0.025, 0.16, 0.004), RUST, W / 2 - 0.02, 0.40, zf + 0.012);
  add(B(0.05, 0.02, 0.004), RUST2, 0.31, H - 0.02, zf + 0.012);
  add(B(0.05, 0.05, 0.035), BLACK, W / 2 - 0.02, H - 0.02, zf - 0.003);   // chipped top-right corner
  // bezel screws
  for (const [x, y] of [[-W / 2 + 0.018, 0.018], [W / 2 - 0.018, 0.018], [-W / 2 + 0.018, H - 0.018], [W / 2 - 0.018, H - 0.018]])
    add(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 6), GALV, x, y, zf + 0.012, Math.PI / 2, 0, 0);
  // back: hanging channel bracket and two straps, 2 cm proud behind the pan
  add(B(0.6, 0.05, 0.02), GALV, 0, H - 0.09, zb - 0.01);
  for (const sx of [-1, 1]) add(B(0.05, 0.42, 0.02), GALV, sx * 0.25, H / 2 - 0.02, zb - 0.01);
  // junction box on the back bottom, conduit riser to the side rail
  add(B(0.12, 0.08, 0.02), TIN, 0.22, 0.09, zb - 0.01);
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.30, 6), GALV, 0.22, 0.28, zb - 0.012);
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.22, 6), GALV, 0.34, 0.09, zb - 0.012, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 6), TIN2, 0.22, 0.135, zb - 0.012);

  g.userData.mounts = 'back';
  const LIGHTS = [{ x: 0, y: 0.3, z: 0.35, color: 0xd8ae70, intensity: 1.2, range: 3.0 }];
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = LIGHTS.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
