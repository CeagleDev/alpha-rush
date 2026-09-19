// standing_lightbox — arm A: primitives. 0.6 × 1.5 m free-standing lightbox: a rusty
// steel pan (four rails + side cheeks + back) holding a cream emissive acrylic face on
// BOTH sides with a lit red band along the top, on a short pedestal over a small steel
// base plate (grounding band), a trailing rubber cable (TubeGeometry) with a plug behind.
// Front = +Z, base y = 0. userData.lights: one warm entry each side.
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

  const W = 0.6, H = 1.16, D = 0.14, Y0 = 0.34;      // box, and the height of its bottom rail
  const yc = Y0 + H / 2;
  // pan: rails, cheeks, a core slab behind both faces
  add(B(W, 0.04, D), RUST, 0, Y0 + H - 0.02, 0);
  add(B(W, 0.04, D), RUST2, 0, Y0 + 0.02, 0);
  for (const sx of [-1, 1]) add(B(0.04, H - 0.08, D), sx < 0 ? RUST : TIN2, sx * (W / 2 - 0.02), yc, 0);
  add(B(W - 0.08, H - 0.08, 0.06), TIN2, 0, yc, 0);
  // rounded-corner look: corner blocks proud on the rails
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(B(0.06, 0.06, D + 0.01), RUST, sx * (W / 2 - 0.03), yc + sy * (H / 2 - 0.03), 0);
  // faces, both sides: red band over cream, recessed 5 mm inside the rails
  const iw = W - 0.08, ih = H - 0.08;
  for (const sz of [-1, 1]) {
    const z = sz * (D / 2 - 0.006), ry = sz < 0 ? Math.PI : 0;
    add(new THREE.PlaneGeometry(iw, 0.15), RED, 0, Y0 + H - 0.04 - 0.075, z, 0, ry, 0);
    add(new THREE.PlaneGeometry(iw, ih - 0.15), CREAM, 0, Y0 + 0.04 + (ih - 0.15) / 2, z, 0, ry, 0);
    add(B(iw, 0.02, 0.014), TIN2, 0, Y0 + H - 0.04 - 0.15, z, 0, ry, 0);   // divider strip
    // grime: a stain patch low on the acrylic (wear)
    add(new THREE.PlaneGeometry(0.16, 0.05), STAIN, sz * -0.16, Y0 + 0.09, z + sz * 0.002, 0, ry, 0);
  }
  // side cheek stiffeners and a row of rivets down one edge
  for (const sx of [-1, 1]) add(B(0.012, H - 0.16, 0.05), TIN, sx * (W / 2 + 0.006), yc, 0);
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), RUST2, W / 2 + 0.014, Y0 + 0.12 + i * 0.18, 0, 0, 0, Math.PI / 2);
  // pedestal and base
  add(B(0.18, 0.28, 0.12), TIN2, 0, Y0 - 0.16, 0);
  add(B(0.22, 0.03, 0.16), RUST, 0, Y0 - 0.015, 0);          // top flange
  add(B(0.44, 0.02, 0.30), BLACK, 0, 0.01, 0);                // base plate: grounding band
  add(B(0.40, 0.012, 0.26), RUST2, 0, 0.026, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), RUST, sx * 0.17, 0.038, sz * 0.11);
  // dents / chipped paint: pale patches on the rails
  add(B(0.10, 0.012, 0.004), TIN, -0.12, Y0 + 0.02, D / 2 + 0.002);
  add(B(0.05, 0.10, 0.004), TIN, W / 2 - 0.02, Y0 + 0.6, D / 2 + 0.002);
  // trailing cable: out of the pedestal, down, and back along the floor to a plug
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.16, -0.06), new THREE.Vector3(0.14, 0.09, -0.16), new THREE.Vector3(0.06, 0.012, -0.28),
    new THREE.Vector3(-0.08, 0.012, -0.30), new THREE.Vector3(-0.16, 0.012, -0.32),
  ]);
  add(new THREE.TubeGeometry(curve, 16, 0.007, 5, false), RUBBER, 0, 0, 0);
  add(B(0.05, 0.03, 0.035), RUBBER, -0.19, 0.015, -0.33);

  finish(THREE, g, [
    { x: 0, y: yc, z: 0.22, color: 0xd8ae70, intensity: 1.4, range: 3 },
    { x: 0, y: yc, z: -0.22, color: 0xd8ae70, intensity: 1.4, range: 3 },
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
