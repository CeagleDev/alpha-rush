// menu_board — arm B: profiles. Each leaf of the A-frame is ONE extruded frame Shape (a
// rectangle with a rectangular hole) so the joinery is a single sweep; the two leaves lean
// together at the top under a rusty hinge bar. The front leaf's hole holds a near-black
// board panel (plain) with a small red tag box and a tin kick strip; the back leaf's hole
// is open with a cross brace. 0.6 w × 1.0 h. Board face is flat: userData.mounts = 'front'.
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
  const CHIP = mk(0xc9c6bd, 'plaster', { roughness: 0.95 });
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8, metalness: 0.3 });
  const RED = mk(0xb8302a, 'metal', { roughness: 0.85, metalness: 0.1 });
  const BLACK = mk(0x110f12, 'timber', { roughness: 0.9 });
  const BOARD = new THREE.MeshStandardMaterial({ color: 0x14121a, roughness: 0.92, metalness: 0 });
  const rect = (w, h, x0, y0) => { const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x0 + w, y0); s.lineTo(x0 + w, y0 + h); s.lineTo(x0, y0 + h); s.lineTo(x0, y0); return s; };
  const ANG = 0.21, H = 1.0, W = 0.6;
  const leaf = (front) => {
    const L = new THREE.Group();
    const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); L.add(m); return m; };
    const frame = rect(W, H, -W / 2, 0);
    frame.holes.push(rect(W - 0.10, 0.52, -W / 2 + 0.05, 0.42));
    frame.holes.push(rect(W - 0.10, 0.22, -W / 2 + 0.05, 0.14));
    const fg = new THREE.ExtrudeGeometry(frame, { depth: 0.03, bevelEnabled: false });
    fg.translate(0, 0, -0.015);
    put(fg, front ? WOOD : WOOD2, 0, 0, 0);
    // a second, thinner cap rail proud on the top in a darker tone, and feet in black (grounding band)
    put(new THREE.BoxGeometry(W, 0.05, 0.036), WOOD3, 0, H - 0.025, 0);
    for (const sx of [-1, 1]) put(new THREE.BoxGeometry(0.052, 0.05, 0.032), BLACK, sx * (W / 2 - 0.025), 0.025, 0);
    put(new THREE.BoxGeometry(0.02, 0.12, 0.004), CHIP, -W / 2 + 0.02, 0.6, 0.016);
    put(new THREE.BoxGeometry(0.06, 0.014, 0.004), CHIP, 0.12, 0.40, 0.016);
    if (front) {
      put(new THREE.BoxGeometry(W - 0.10, 0.52, 0.012), BOARD, 0, 0.68, 0);
      put(new THREE.BoxGeometry(0.12, 0.08, 0.008), RED, 0.14, 0.50, 0.008);
      for (let i = 0; i < 9; i++) put(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6, 1, true), TIN, -0.2 + i * 0.05, 0.25, i % 2 ? 0.0 : 0.008);
      put(new THREE.BoxGeometry(W - 0.10, 0.22, 0.006), TIN, 0, 0.25, -0.004);
    } else {
      put(new THREE.BoxGeometry(0.04, 0.6, 0.02), WOOD3, -0.1, 0.62, 0);
      put(new THREE.BoxGeometry(0.04, 0.6, 0.02), WOOD3, 0.1, 0.62, 0);
      put(new THREE.BoxGeometry(W - 0.10, 0.04, 0.02), WOOD, 0, 0.25, 0);
    }
    return L;
  };
  for (const [front, s] of [[true, 1], [false, -1]]) {
    const L = leaf(front);
    L.rotation.x = -s * ANG;
    L.position.set(0, 0, s * Math.sin(ANG) * H);
    g.add(L);
  }
  // hinge bar and straps
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, W + 0.04, 8), RUST); bar.position.set(0, H + 0.005, 0); bar.rotation.z = Math.PI / 2; g.add(bar);
  for (const sx of [-0.2, 0.2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.12), RUST); s.position.set(sx, H - 0.004, 0); g.add(s); }
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.34, 4), RUST);
  chain.position.set(-0.22, 0.45, 0); chain.rotation.x = Math.PI / 2; g.add(chain);

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
