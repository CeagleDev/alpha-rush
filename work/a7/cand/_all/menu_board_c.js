// menu_board — arm C: a different reading. A heavier, boxier A-frame: the front leaf is a
// deep timber box frame (double thickness stiles, a fat bottom rail with a chamfer strip),
// the board is set back in a REVEAL so its edge shows, the tag box hangs on a nail, the kick
// panel is horizontal tin slats; the back leaf is a lighter ladder frame with three rungs,
// and the two leaves are tied by a rusty chain and top hinge plates. 0.6 w × 1.0 h.
// Board face is flat: userData.mounts = 'front'. Front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const WOOD = mk(0x8b6141, 'timber');
  const WOOD2 = mk(0x6c4028, 'timber');
  const WOOD3 = mk(0x4f2d21, 'timber');
  const GREY = mk(0x9a9187, 'timber', { roughness: 0.95 });           // silvered, weathered face (wear)
  const CHIP = mk(0xc9c6bd, 'plaster', { roughness: 0.95 });
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8, metalness: 0.3 });
  const RED = mk(0xb8302a, 'metal', { roughness: 0.85, metalness: 0.1 });
  const BLACK = mk(0x110f12, 'timber', { roughness: 0.9 });
  const BOARD = mk(0x14121a, 'timber', { roughness: 0.92, metalness: 0 });   // plain near-black board face
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const ANG = 0.20, H = 1.0, W = 0.6;
  const F = new THREE.Group(), K = new THREE.Group();
  const put = (L, geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); L.add(m); return m; };
  // front leaf: deep box frame
  for (const sx of [-1, 1]) {
    put(F, B(0.06, H, 0.04), sx < 0 ? GREY : WOOD, sx * 0.27, H / 2, 0);
    put(F, B(0.03, H - 0.1, 0.02), WOOD3, sx * 0.235, H / 2 - 0.05, 0.01);        // inner stile (doubled)
    put(F, B(0.062, 0.06, 0.042), BLACK, sx * 0.27, 0.03, 0);                       // feet: grounding band
  }
  put(F, B(W, 0.07, 0.04), WOOD2, 0, H - 0.035, 0);
  put(F, B(W, 0.08, 0.05), WOOD3, 0, 0.11, 0.005);                                  // fat bottom rail
  put(F, B(W, 0.02, 0.02), WOOD, 0, 0.16, 0.03);                                     // chamfer strip
  put(F, B(W - 0.1, 0.05, 0.03), WOOD2, 0, 0.42, 0.0);                               // mid rail
  put(F, B(W - 0.12, 0.50, 0.012), BOARD, 0, 0.70, -0.008);                          // board set back in a reveal
  put(F, B(0.11, 0.075, 0.008), RED, 0.13, 0.52, 0.004, 0, 0, 0.06);                 // tag box, hung slightly askew
  put(F, new THREE.CylinderGeometry(0.004, 0.004, 0.02, 5), RUST, 0.13, 0.565, 0.004, Math.PI / 2, 0, 0);
  for (let i = 0; i < 4; i++) put(F, B(W - 0.12, 0.04, 0.008), i % 2 ? TIN : RUST, 0, 0.21 + i * 0.05, 0.012 - (i % 2) * 0.006);   // tin slats
  put(F, B(0.03, 0.15, 0.004), CHIP, -0.27, 0.75, 0.021);
  put(F, B(0.10, 0.015, 0.004), CHIP, 0.15, 0.985, 0.021);
  // back leaf: ladder frame
  for (const sx of [-1, 1]) {
    put(K, B(0.05, H, 0.03), sx < 0 ? WOOD2 : GREY, sx * 0.275, H / 2, 0);
    put(K, B(0.052, 0.06, 0.032), BLACK, sx * 0.275, 0.03, 0);
  }
  put(K, B(W, 0.06, 0.03), WOOD3, 0, H - 0.03, 0);
  for (const y of [0.25, 0.52, 0.78]) put(K, B(W - 0.1, 0.05, 0.025), WOOD, 0, y, 0);
  put(K, B(0.015, 0.05, 0.004), CHIP, 0.27, 0.55, -0.016);
  F.rotation.x = -ANG; F.position.z = Math.sin(ANG) * H;
  K.rotation.x = ANG; K.position.z = -Math.sin(ANG) * H;
  g.add(F, K);
  // hinge plates and a chain
  for (const sx of [-0.2, 0.2]) {
    const s = new THREE.Mesh(B(0.06, 0.02, 0.12), RUST); s.position.set(sx, H - 0.004, 0); g.add(s);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 6), RUST); p.position.set(sx, H + 0.004, 0); p.rotation.z = Math.PI / 2; g.add(p);
  }
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 4, 6), RUST); l.position.set(0.2, 0.48, -0.15 + i * 0.06); l.rotation.y = i % 2 ? Math.PI / 2 : 0; g.add(l); }

  g.userData.mounts = 'front';
  finish(THREE, g);
  return g;
}
function finish(THREE, g) {
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
}
