// crate_stack — arm C: a different reading. Crates read as a solid lower skirt
// (a moulded 10 cm band with recessed dark hand-hole slots on the ends), an
// open mid band of vertical bars, and a heavy top rim with a stacking lip;
// the four crates are turned a few degrees each way so the stack corkscrews.
// White / yellow / white / yellow from the bottom, dirt as colour variation,
// eight bottle necks in the top crate. 0.5 × 0.35 × 0.3 m each, ≈ 1.25 m
// tall. Grounding band: the lowest skirt's bottom 4 cm is black. Jump.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  // two yellows, two whites, each with its own dirt level (wear as colour variation)
  const YEL = mk(0xf8e845, "plaster", { roughness: 0.75 });
  const YEL2 = mk(0xd9c73a, "plaster", { roughness: 0.85 });
  const WHT = mk(0xeee2c8, "plaster", { roughness: 0.8 });
  const WHT2 = mk(0xc9bda3, "plaster", { roughness: 0.9 });
  const GRIME = mk(0x8b6141, "plaster", { roughness: 0.95 });
  const BLACK = mk(0x110f12, "plaster", { roughness: 0.95 });
  const GLASS = mk(0x4a2a12, "metal", { roughness: 0.35, metalness: 0.1 });
  const GLASS2 = mk(0x5a3416, "metal", { roughness: 0.35, metalness: 0.1 });
  const CAP = mk(0xbf7c42, "metal", { roughness: 0.5, metalness: 0.4 });
  const LABEL = mk(0xb8302a, "plaster", { roughness: 0.9 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const CW = 0.5, CD = 0.35, CH = 0.3;
  function crate(body, dirt, x, y, z, ry, bottom) {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c);
    const A = (geo, mat, px, py, pz) => add(geo, mat, px, py, pz, 0, 0, 0, c);
    // moulded skirt: 10 cm band, hollow (four walls) over a floor
    A(B(CW - 0.04, 0.02, CD - 0.04), dirt, 0, 0.03, 0);
    for (const sz of [-1, 1]) A(B(CW, 0.10, 0.025), body, 0, 0.05, sz * (CD / 2 - 0.0125));
    for (const sx of [-1, 1]) A(B(0.025, 0.10, CD - 0.05), body, sx * (CW / 2 - 0.0125), 0.05, 0);
    // grounding / grime band round the skirt foot, 4 cm
    for (const sz of [-1, 1]) A(B(CW + 0.004, 0.04, 0.006), bottom ? BLACK : dirt, 0, 0.02, sz * (CD / 2 + 0.001));
    for (const sx of [-1, 1]) A(B(0.006, 0.04, CD + 0.004), bottom ? BLACK : dirt, sx * (CW / 2 + 0.001), 0.02, 0);
    // recessed hand-hole slots on the ends
    for (const sx of [-1, 1]) A(B(0.008, 0.035, 0.12), BLACK, sx * (CW / 2 - 0.02), 0.065, 0);
    // open mid band: corner posts and vertical bars, 0.10..0.26
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) A(B(0.035, 0.16, 0.035), body, sx * (CW / 2 - 0.0175), 0.18, sz * (CD / 2 - 0.0175));
    for (const sz of [-1, 1]) for (let i = 0; i < 5; i++) A(B(0.02, 0.16, 0.022), body, -0.16 + i * 0.08, 0.18, sz * (CD / 2 - 0.011));
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) A(B(0.022, 0.16, 0.02), body, sx * (CW / 2 - 0.011), 0.18, -0.09 + i * 0.09);
    // heavy top rim 4 cm and a stacking lip inside it
    for (const sz of [-1, 1]) A(B(CW, 0.04, 0.03), body, 0, CH - 0.02, sz * (CD / 2 - 0.015));
    for (const sx of [-1, 1]) A(B(0.03, 0.04, CD - 0.06), body, sx * (CW / 2 - 0.015), CH - 0.02, 0);
    for (const sz of [-1, 1]) A(B(CW - 0.06, 0.012, 0.012), dirt, 0, CH + 0.006, sz * (CD / 2 - 0.036));
    // a dirt smear on one long face
    A(B(0.16, 0.05, 0.004), dirt, 0.08, 0.06, CD / 2 + 0.002);
    return c;
  }
  crate(WHT2, GRIME, 0.0, 0.0, 0.0, 0.05, true);
  crate(YEL2, GRIME, 0.015, 0.30, 0.01, -0.07, false);
  crate(WHT, WHT2, -0.02, 0.60, -0.01, 0.04, false);
  const top = crate(YEL, YEL2, 0.01, 0.90, 0.015, -0.03, false);
  // eight bottles, 4 × 2, in the top crate
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const b = new THREE.Group();
    b.position.set(-0.165 + i * 0.11, 0.05, -0.08 + j * 0.16);
    b.rotation.set(0.05 * ((i + j) % 3 - 1), 0, 0.06 * ((i * 2 + j) % 3 - 1));
    top.add(b);
    const mat = (i + j) % 2 ? GLASS : GLASS2;
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), mat, 0, 0.09, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.012, 0.03, 0.04, 6), mat, 0, 0.20, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), mat, 0, 0.255, 0, 0, 0, 0, b);
    add(new THREE.SphereGeometry(0.015, 6, 4), CAP, 0, 0.29, 0, 0, 0, 0, b);
  }
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.obstacle = { kind: "jump", lanes: 1 };
  return g;
}
