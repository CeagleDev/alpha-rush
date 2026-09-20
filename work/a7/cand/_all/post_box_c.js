// post_box — arm C: a different breakdown. The barrel is built as a stack: a wide rusted
// plinth drum, a chamfered foot ring, the red barrel with a proud vertical casting seam on
// the back and two shallow horizontal beading rings, a deep cornice (torus + drum) and a
// low cone-topped cap; the slot sits in a raised boss with a sloped hood; the door is a
// recessed panel (dark reveal) with a proud red leaf and a T-handle. 1.4 m × 0.45 m,
// front = +Z, base y = 0, black grounding band at the foot.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.2, ...o });
    if (name) m.name = name;
    return m;
  };
  const RED = mk(0xb8302a, 'metal', { roughness: 0.8 });
  const RED2 = mk(0x9c2822, 'metal', { roughness: 0.85 });
  const RED3 = mk(0xc9463a, 'metal', { roughness: 0.75 });        // a newer paint patch (wear: repainted panel)
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
  add(new THREE.CylinderGeometry(0.25, 0.255, 0.07, S), BLACK, 0, 0.035, 0);
  add(new THREE.CylinderGeometry(0.24, 0.25, 0.07, S), RUST, 0, 0.105, 0);
  add(new THREE.CylinderGeometry(R, 0.24, 0.05, S), RUST2, 0, 0.165, 0);                     // chamfered foot
  add(new THREE.CylinderGeometry(R, R, 1.0, S), RED, 0, 0.69, 0);
  add(new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.30, S, 1, true, 0.9, 0.9), RED3, 0, 0.85, 0);   // repainted patch
  for (const y of [0.32, 1.10]) add(new THREE.TorusGeometry(R, 0.006, 4, S), RED2, 0, y, 0, Math.PI / 2, 0, 0);   // beading
  add(new THREE.BoxGeometry(0.025, 0.95, 0.014), RED2, 0, 0.7, -R);                           // casting seam
  // cornice and cap
  add(new THREE.TorusGeometry(0.235, 0.022, 6, S), RED2, 0, 1.21, 0, Math.PI / 2, 0, 0);
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.05, S), RED, 0, 1.255, 0);
  add(new THREE.CylinderGeometry(0.19, 0.25, 0.06, S), RED2, 0, 1.31, 0);
  add(new THREE.ConeGeometry(0.19, 0.06, S), RED, 0, 1.37, 0);
  add(new THREE.SphereGeometry(0.02, 8, 6), RED2, 0, 1.40, 0);
  // slot in a raised boss with a sloped hood
  add(new THREE.BoxGeometry(0.28, 0.10, 0.03), RED2, 0, 0.99, R - 0.01);
  add(new THREE.BoxGeometry(0.22, 0.025, 0.03), BLACK, 0, 0.975, R + 0.006);
  add(new THREE.BoxGeometry(0.30, 0.02, 0.07), RED, 0, 1.03, R + 0.01, -0.35, 0, 0);
  // door: recessed reveal, proud leaf, T-handle, hinge knuckles
  add(new THREE.BoxGeometry(0.24, 0.26, 0.02), BLACK, 0, 0.60, R - 0.012);
  add(new THREE.BoxGeometry(0.20, 0.22, 0.026), RED, 0, 0.60, R - 0.004);
  add(new THREE.BoxGeometry(0.02, 0.06, 0.03), GALV, -0.06, 0.58, R + 0.012);
  add(new THREE.BoxGeometry(0.05, 0.015, 0.015), GALV, -0.06, 0.58, R + 0.024);
  for (const y of [0.52, 0.68]) add(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 6), RUST2, 0.105, y, R - 0.004);
  // a drip stain under the slot (wear)
  add(new THREE.BoxGeometry(0.03, 0.18, 0.004), RUST2, 0.08, 0.86, R + 0.001);

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
