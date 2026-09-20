// post_box — arm A: primitives. A 1.4 m × 0.45 m round pillar post box: a rusted plinth
// cylinder (grounding band), the faded-red barrel, a rust band where the paint has gone at
// the foot, a cornice ring under a domed hemisphere cap with a finial, a hooded slot, a
// small collection door on a raised plate with a dark seam and a handle. Front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.2, ...o });
    if (name) m.name = name;
    return m;
  };
  const RED = mk(0xb8302a, 'metal', { roughness: 0.8 });
  const RED2 = mk(0x9c2822, 'metal', { roughness: 0.85 });       // shaded / chipped tone
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const RUST2 = mk(0x6e4128, 'metal', { roughness: 0.95, metalness: 0.2 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const S = 20, R = 0.215;
  // plinth and grounding band
  add(new THREE.CylinderGeometry(0.245, 0.255, 0.06, S), BLACK, 0, 0.03, 0);
  add(new THREE.CylinderGeometry(0.235, 0.245, 0.06, S), RUST, 0, 0.09, 0);
  // barrel, with a rust band at the foot
  add(new THREE.CylinderGeometry(R, R + 0.004, 0.10, S), RUST2, 0, 0.17, 0);
  add(new THREE.CylinderGeometry(R, R, 0.98, S), RED, 0, 0.71, 0);
  add(new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.4, S, 1, true, 2.6, 1.6), RED2, 0, 0.55, 0);   // faded panel on the back-left (wear)
  // cornice and cap
  add(new THREE.CylinderGeometry(0.245, 0.225, 0.05, S), RED, 0, 1.225, 0);
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.04, S), RED2, 0, 1.27, 0);
  const dome = add(new THREE.SphereGeometry(0.245, S, 6, 0, Math.PI * 2, 0, Math.PI / 2), RED, 0, 1.29, 0);
  dome.scale.set(1, 0.42, 1);
  add(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 8), RED2, 0, 1.395, 0);
  // slot with a hood
  add(new THREE.BoxGeometry(0.22, 0.03, 0.03), BLACK, 0, 0.98, R - 0.005);
  add(new THREE.BoxGeometry(0.26, 0.02, 0.06), RED2, 0, 1.005, R - 0.01, -0.3, 0, 0);
  add(new THREE.BoxGeometry(0.26, 0.05, 0.02), RED, 0, 1.03, R - 0.002);
  // collection door: seam (dark plate) under a raised door plate, hinge strip, handle
  add(new THREE.BoxGeometry(0.22, 0.24, 0.02), BLACK, 0, 0.62, R - 0.012);
  add(new THREE.BoxGeometry(0.20, 0.22, 0.03), RED, 0, 0.62, R - 0.008);
  add(new THREE.BoxGeometry(0.02, 0.22, 0.034), RUST2, 0.10, 0.62, R - 0.008);
  add(new THREE.BoxGeometry(0.05, 0.02, 0.02), GALV, -0.06, 0.60, R + 0.012);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), GALV, -0.06, 0.60, R + 0.005, Math.PI / 2, 0, 0);
  // rear seam strip and a maker's boss on the back
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
