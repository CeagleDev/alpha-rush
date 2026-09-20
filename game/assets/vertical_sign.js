// vertical_sign — WINNER (arm C): a second reading of the reference. The box hangs from a top
// hanger arm and rests on a PERFORATED shelf bracket (a steel channel with a row of
// holes), off a wall fragment that is two materials: a concrete slab with a strip of
// corrugated tin beside it. The lit acrylic front is one quad with a sunk red band and a
// sooty lower third; the sides are lit too. 0.4 × 2.4 × 0.25 m; userData.mounts = 'back'.
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
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8, side: DS });
  const TIN2 = mk(0x5a554e, 'metal', { roughness: 0.85 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const CONC = mk(0x8a8378, 'stone', { roughness: 0.95, metalness: 0 });
  const CONC2 = mk(0x6f6a62, 'stone', { roughness: 0.95, metalness: 0 });
  const WOOD = mk(0x4f2d21, 'timber', { roughness: 0.9, metalness: 0 });
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const GRIME = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x8b6141), emissiveIntensity: 1.1, roughness: 0.5 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  // wall fragment: concrete slab (left 2/3) + corrugated tin strip (right 1/3) + a batten
  const WZ = -0.19;
  add(B(0.56, 2.60, 0.10), CONC, -0.12, 1.30, WZ - 0.05);
  add(B(0.56, 0.06, 0.102), BLACK, -0.12, 0.03, WZ - 0.05);              // grounding band
  add(B(0.20, 0.5, 0.012), CONC2, -0.30, 1.9, WZ + 0.006);               // damp stain (wear)
  add(B(0.24, 2.60, 0.06), TIN2, 0.28, 1.30, WZ - 0.07);
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 2.55, 6), TIN, 0.18 + i * 0.04, 1.30, WZ - 0.03);   // corrugations
  add(B(0.12, 2.40, 0.05), WOOD, -0.04, 1.25, WZ + 0.025);
  // box shell: back pan + top/bottom caps + four corner angles; core
  const W = 0.4, H = 2.4, D = 0.25, Y0 = 0.12, yc = Y0 + H / 2;
  add(B(W, H, 0.02), TIN2, 0, yc, -D / 2 + 0.01);
  add(B(W, 0.035, D), RUST2, 0, Y0 + H - 0.0175, 0);
  add(B(W, 0.035, D), BLACK, 0, Y0 + 0.0175, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(B(0.03, H, 0.03), sz > 0 ? RUST2 : RUST, sx * (W / 2 - 0.015), yc, sz * (D / 2 - 0.015));
  add(B(W - 0.06, H - 0.07, D - 0.05), TIN2, 0, yc, 0);
  // lit front: one cream quad, a sunk red band box over it, and a sooty lower quad
  const ih = H - 0.07, yb = Y0 + 0.035;
  add(P(W - 0.06, ih * 0.68), CREAM, 0, yb + ih * 0.32 + ih * 0.34, D / 2 - 0.004);
  add(P(W - 0.06, ih * 0.32), GRIME, 0, yb + ih * 0.16, D / 2 - 0.004);
  add(B(W - 0.04, 0.09, 0.014), RED, 0, yb + ih * 0.5, D / 2 - 0.006);
  for (const sx of [-1, 1]) {
    add(P(D - 0.06, ih * 0.68), CREAM, sx * (W / 2 - 0.004), yb + ih * 0.32 + ih * 0.34, 0, 0, sx * Math.PI / 2, 0);
    add(P(D - 0.06, ih * 0.32), GRIME, sx * (W / 2 - 0.004), yb + ih * 0.16, 0, 0, sx * Math.PI / 2, 0);
  }
  // the perforated shelf bracket: a channel under the box with a row of holes, on a wall cleat
  add(B(0.44, 0.02, 0.26), GALV, 0, Y0 - 0.01, -0.02);
  add(B(0.44, 0.09, 0.02), GALV, 0, Y0 - 0.055, D / 2 - 0.02);
  for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.02, 0.02, 0.026, 8), BLACK, -0.16 + i * 0.08, Y0 - 0.055, D / 2 - 0.02, Math.PI / 2, 0, 0);
  add(B(0.44, 0.09, 0.02), GALV, 0, Y0 - 0.055, WZ + 0.06);
  for (const sx of [-1, 1]) add(B(0.02, 0.09, 0.30), GALV, sx * 0.21, Y0 - 0.055, WZ + 0.06 + 0.15);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), RUST, sx * 0.14, Y0 - 0.055, WZ + 0.076, Math.PI / 2, 0, 0);
  // top hanger arm: a bar out from the batten with a stirrup over the box
  add(B(0.05, 0.05, 0.36), RUST2, 0, Y0 + H + 0.02, WZ + 0.18);
  add(B(0.46, 0.05, 0.05), RUST2, 0, Y0 + H + 0.02, 0);
  for (const sx of [-1, 1]) add(B(0.04, 0.16, 0.04), RUST, sx * (W / 2 + 0.02), Y0 + H - 0.06, 0);
  // conduit + junction box on the wall
  add(B(0.10, 0.12, 0.06), TIN2, 0.14, 0.55, WZ + 0.03);
  add(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 8), GALV, 0.14, 1.3, WZ + 0.02);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), GALV, 0.14, 2.0, WZ + 0.10, Math.PI / 2, 0, 0);

  g.userData.mounts = 'back';
  finish(THREE, g, [
    { x: 0, y: 0.9, z: 0.35, color: 0xd8ae70, intensity: 1.4, range: 3 },
    { x: 0, y: 2.0, z: 0.35, color: 0xd8ae70, intensity: 1.4, range: 3 },
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
