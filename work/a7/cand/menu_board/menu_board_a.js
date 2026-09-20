// menu_board — arm A: primitives. A 0.6 × 1.0 m wooden A-frame: two hinged leg frames (rails
// + stiles as boxes, in three weathered timber tones with pale chipped-paint flecks), a plain
// near-black board face on the front leaf with a small red tag box, a corrugated-tin kick
// panel below it, rusty hinge straps across the top, and a rear leaf with its own cross rails.
// The board face IS a flat thing: userData.mounts = 'front'. Front = +Z, base y = 0.
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
  const CHIP = mk(0xc9c6bd, 'plaster', { roughness: 0.95 });         // old paint flecks (wear)
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8, metalness: 0.3 });
  const RED = mk(0xb8302a, 'metal', { roughness: 0.85, metalness: 0.1 });
  const BLACK = mk(0x110f12, 'timber', { roughness: 0.9 });
  const BOARD = new THREE.MeshStandardMaterial({ color: 0x14121a, roughness: 0.92, metalness: 0 });   // near-black board face: plain, unnamed
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const leaf = (front) => {
    const L = new THREE.Group();
    const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); L.add(m); return m; };
    // stiles and rails, in the leaf's own plane (z = 0), base at y = 0 to the hinge at y = 1.0
    put(B(0.05, 1.0, 0.03), front ? WOOD : WOOD2, -0.275, 0.5, 0);
    put(B(0.05, 1.0, 0.03), front ? WOOD2 : WOOD3, 0.275, 0.5, 0);
    put(B(0.6, 0.06, 0.03), WOOD3, 0, 0.97, 0);
    put(B(0.6, 0.05, 0.03), WOOD, 0, 0.38, 0);
    put(B(0.6, 0.05, 0.03), WOOD2, 0, 0.12, 0);
    // feet: grounding band
    for (const sx of [-1, 1]) put(B(0.052, 0.05, 0.032), BLACK, sx * 0.275, 0.025, 0);
    // paint flecks
    put(B(0.02, 0.10, 0.004), CHIP, -0.27, 0.62, 0.016);
    put(B(0.015, 0.06, 0.004), CHIP, 0.28, 0.30, 0.016);
    put(B(0.08, 0.012, 0.004), CHIP, 0.10, 0.955, 0.016);
    if (front) {
      put(B(0.5, 0.52, 0.012), BOARD, 0, 0.68, 0.0);                  // the board, flush in the frame
      put(B(0.12, 0.08, 0.008), RED, 0.15, 0.50, 0.008);             // red tag box
      // corrugated tin kick panel: alternating half-cylinders
      for (let i = 0; i < 9; i++) put(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6, 1, true), TIN, -0.2 + i * 0.05, 0.245, i % 2 ? 0.0 : 0.008);
      put(B(0.5, 0.22, 0.006), TIN, 0, 0.245, -0.004);
    } else {
      put(B(0.5, 0.05, 0.03), WOOD3, 0, 0.66, 0);                    // a mid rail on the back leaf
      put(B(0.04, 0.5, 0.02), WOOD2, 0, 0.66, 0.0);                  // a vertical brace
    }
    return L;
  };
  const ANG = 0.21;
  const F = leaf(true); F.position.set(0, 0, 0); F.rotation.x = -ANG;     // front leaf leans back at the top? no: hinge at top, feet forward
  const Bk = leaf(false); Bk.rotation.x = ANG;
  // rotate about the top hinge: each leaf is built base-at-0, so shift so tops meet at the hinge
  for (const [leafG, s] of [[F, 1], [Bk, -1]]) {
    leafG.rotation.x = -s * ANG;
    leafG.position.set(0, 0, s * Math.sin(ANG) * 1.0);
  }
  g.add(F, Bk);
  // hinge straps across the top (rusty) and a chain between the leaves
  for (const sx of [-0.2, 0.2]) {
    const s = new THREE.Mesh(B(0.05, 0.02, 0.10), RUST); s.position.set(sx, 1.0 - 0.005, 0); g.add(s);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6), RUST); p.position.set(sx, 1.0, 0); p.rotation.z = Math.PI / 2; g.add(p);
  }
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.34, 4), RUST);
  chain.position.set(0.22, 0.45, 0); chain.rotation.x = Math.PI / 2; g.add(chain);

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
