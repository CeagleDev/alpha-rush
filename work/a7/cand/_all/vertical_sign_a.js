// vertical_sign — arm A: primitives. A narrow 0.4 × 2.4 × 0.25 m lightbox standing off a
// short wall fragment (plaster slab + a timber batten) on two angle brackets and a top
// strap. Front and both sides are cream emissive acrylic (the lit box reads from the
// street), a lit red band across the middle, a grime-darkened lower panel, rusty tin
// rails. Back mounts flush: userData.mounts = 'back'. Front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const RUST2 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.15 });
  const TIN2 = mk(0x5a554e, 'metal', { roughness: 0.85 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const WALL = mk(0x8a8378, 'plaster', { roughness: 0.95, metalness: 0 });
  const WALL2 = mk(0x6f6a62, 'plaster', { roughness: 0.95, metalness: 0 });
  const WOOD = mk(0x4f2d21, 'timber', { roughness: 0.9, metalness: 0 });
  const WOOD2 = mk(0x37201b, 'timber', { roughness: 0.9, metalness: 0 });
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const GRIME = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x8b6141), emissiveIntensity: 1.2, roughness: 0.5 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const P = (w, h) => new THREE.PlaneGeometry(w, h);

  // wall fragment: plaster slab with a chipped lower corner, and a timber batten
  const WZ = -0.19;                                   // wall front face
  add(B(0.80, 2.60, 0.10), WALL, 0, 1.30, WZ - 0.05);
  add(B(0.80, 0.06, 0.10), BLACK, 0, 0.03, WZ - 0.05 + 0.001);           // grounding band
  add(B(0.30, 0.40, 0.012), WALL2, -0.25, 2.2, WZ + 0.006);              // stain (wear)
  add(B(0.14, 2.50, 0.05), WOOD, 0.0, 1.30, WZ + 0.025);
  add(B(0.14, 0.30, 0.052), WOOD2, 0.0, 0.85, WZ + 0.025);               // darker weathered patch
  // the box: rails and back
  const W = 0.4, H = 2.4, D = 0.25, Y0 = 0.10, zc = 0.0;                 // box centre z
  const yc = Y0 + H / 2;
  add(B(W, H, 0.03), TIN2, 0, yc, zc - D / 2 + 0.015);                   // back pan
  add(B(W, 0.04, D), RUST, 0, Y0 + H - 0.02, zc);
  add(B(W, 0.04, D), BLACK, 0, Y0 + 0.02, zc);                          // bottom rail: grounding band
  for (const sx of [-1, 1]) add(B(0.03, H, 0.03), RUST2, sx * (W / 2 - 0.015), yc, zc + D / 2 - 0.015);   // front corner posts
  for (const sx of [-1, 1]) add(B(0.03, H, 0.03), RUST, sx * (W / 2 - 0.015), yc, zc - D / 2 + 0.015);
  add(B(W - 0.06, H - 0.08, D - 0.06), TIN2, 0, yc, zc);                 // core (lit from inside)
  // lit faces: front and both sides
  const ih = H - 0.08;
  add(P(W - 0.06, ih * 0.62), CREAM, 0, Y0 + 0.04 + ih * 0.38 + ih * 0.31, zc + D / 2 - 0.004);
  add(P(W - 0.06, 0.10), RED, 0, Y0 + 0.04 + ih * 0.38 - 0.05, zc + D / 2 - 0.004);
  add(P(W - 0.06, ih * 0.38 - 0.10), GRIME, 0, Y0 + 0.04 + (ih * 0.38 - 0.10) / 2, zc + D / 2 - 0.004);
  for (const sx of [-1, 1]) {
    add(P(D - 0.06, ih * 0.7), CREAM, sx * (W / 2 - 0.004), Y0 + 0.04 + ih * 0.3 + ih * 0.35, zc, 0, sx * Math.PI / 2, 0);
    add(P(D - 0.06, ih * 0.3), GRIME, sx * (W / 2 - 0.004), Y0 + 0.04 + ih * 0.15, zc, 0, sx * Math.PI / 2, 0);
  }
  // brackets: two angle brackets below with drilled holes, a strap at the top, all galv/rust
  for (const bx of [-0.12, 0.12]) {
    add(B(0.05, 0.03, 0.22), RUST2, bx, Y0 - 0.015, zc - 0.03);
    add(B(0.05, 0.12, 0.03), RUST2, bx, Y0 - 0.06, WZ + 0.065);
    for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.008, 0.008, 0.034, 6), BLACK, bx, Y0 - 0.015, zc - 0.10 + i * 0.06);
  }
  add(B(0.44, 0.04, 0.02), GALV, 0, Y0 + H - 0.10, zc - D / 2 - 0.01);
  add(B(0.44, 0.04, 0.02), GALV, 0, Y0 + H - 0.10, WZ + 0.06);
  add(B(0.06, 0.04, 0.14), GALV, -0.19, Y0 + H - 0.10, (zc - D / 2 + WZ + 0.06) / 2);
  add(B(0.06, 0.04, 0.14), GALV, 0.19, Y0 + H - 0.10, (zc - D / 2 + WZ + 0.06) / 2);
  for (let i = 0; i < 2; i++) add(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), RUST, -0.2 + i * 0.4, Y0 + H - 0.10, WZ + 0.075, Math.PI / 2, 0, 0);
  // conduit up the wall into the box
  add(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 8), GALV, 0.26, 0.6, WZ + 0.02);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), GALV, 0.26, 1.10, zc - 0.06, Math.PI / 2, 0, 0);

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
