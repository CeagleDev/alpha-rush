// post_box — WINNER (arm B): one LatheGeometry profile for the whole body: plinth step, barrel,
// cornice ring, dome and finial in a single sweep (faded red), with a second short lathe
// for the rusted plinth over it (grounding band), a hooded slot, a collection door on a
// dark seam plate with a handle, and a chipped-paint patch. 1.4 m × 0.45 m, front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.2, ...o });
    if (name) m.name = name;
    return m;
  };
  const RED = mk(0xb8302a, 'metal', { roughness: 0.8 });
  const RED2 = mk(0x9c2822, 'metal', { roughness: 0.85, side: DS });
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const RUST2 = mk(0x6e4128, 'metal', { roughness: 0.95, metalness: 0.2, side: DS });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const S = 20, R = 0.215;
  // the body: from the axis at the base, out over the plinth, up the barrel, the cornice, over the dome to the finial
  const body = V2([[0, 0.0], [0.24, 0.0], [0.24, 0.10], [0.225, 0.13], [R, 0.16], [R, 1.19], [0.24, 1.21], [0.25, 1.25], [0.25, 1.29],
    [0.235, 1.31], [0.20, 1.35], [0.14, 1.38], [0.07, 1.395], [0.04, 1.40], [0.03, 1.42], [0.0, 1.42]]);
  add(new THREE.LatheGeometry(body, S), RED, 0, 0, 0);
  // rusted plinth (a lathe over the body's plinth) and the black grounding band
  const plinth = V2([[0.246, 0.06], [0.256, 0.06], [0.256, 0.10], [0.246, 0.13], [0.232, 0.135]]);
  add(new THREE.LatheGeometry(plinth, S), RUST, 0, 0, 0).material.side = DS;
  add(new THREE.CylinderGeometry(0.257, 0.262, 0.06, S), BLACK, 0, 0.03, 0);
  // rust band where the paint has gone at the foot, and a faded patch on the side (wear)
  add(new THREE.CylinderGeometry(R + 0.003, R + 0.006, 0.09, S, 1, true), RUST2, 0, 0.21, 0);
  add(new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.5, S, 1, true, 3.0, 1.4), RED2, 0, 0.7, 0);
  // slot with a hood
  add(new THREE.BoxGeometry(0.22, 0.03, 0.03), BLACK, 0, 0.98, R - 0.005);
  add(new THREE.BoxGeometry(0.26, 0.02, 0.06), RED2, 0, 1.005, R - 0.01, -0.3, 0, 0);
  add(new THREE.BoxGeometry(0.26, 0.05, 0.02), RED, 0, 1.03, R - 0.002);
  // collection door on a dark seam plate, hinge strip and a handle
  add(new THREE.BoxGeometry(0.22, 0.24, 0.02), BLACK, 0, 0.62, R - 0.012);
  add(new THREE.BoxGeometry(0.20, 0.22, 0.03), RED, 0, 0.62, R - 0.008);
  add(new THREE.BoxGeometry(0.02, 0.22, 0.034), RUST2, 0.10, 0.62, R - 0.008);
  add(new THREE.BoxGeometry(0.05, 0.02, 0.02), GALV, -0.06, 0.60, R + 0.012);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), GALV, -0.06, 0.60, R + 0.005, Math.PI / 2, 0, 0);
  // back: a vertical casting seam and a boss
  add(new THREE.BoxGeometry(0.02, 1.0, 0.012), RED2, 0, 0.72, -R);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 12), RED2, 0, 0.9, -R, Math.PI / 2, 0, 0);

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
