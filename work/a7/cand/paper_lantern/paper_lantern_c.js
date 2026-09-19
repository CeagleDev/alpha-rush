// paper_lantern — arm C: a different breakdown. The paper is a stack of eleven open
// frusta, each stepped 4 mm out at its lower edge so every joint is a shadowed crease
// (the bamboo-ring look), over a bright inner core sphere; the tin rings are closed
// drums with a knob on top; the hanger is a two-arc wire cage meeting at a loop.
// 0.45 m dia, base y = 0 at the bottom drum, hung by the loop. One warm light.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RING = mk(0x110f12, 'metal', { roughness: 0.9 });
  const RING2 = mk(0x231718, 'metal', { roughness: 0.9 });
  const WIRE = mk(0x37201b, 'metal', { roughness: 0.8, metalness: 0.4 });
  const BODY = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.4, roughness: 0.35, side: DS });
  const FADED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xc4553a), emissiveIntensity: 2.2, roughness: 0.4, side: DS }); // sun-faded panels (wear)
  const CORE = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 3.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };

  const R = 0.225, RY = 0.20, CY = 0.245, Y0 = 0.045, Y1 = 0.445, N = 11;
  const rad = (y) => Math.max(0.095, Math.sqrt(Math.max(0, 1 - ((y - CY) / RY) ** 2)) * R);
  for (let i = 0; i < N; i++) {
    const ya = Y0 + (i / N) * (Y1 - Y0), yb = Y0 + ((i + 1) / N) * (Y1 - Y0);
    const rb = rad(ya) + 0.004, rt = rad(yb) - 0.004;         // bottom edge proud, top edge tucked in
    add(new THREE.CylinderGeometry(rt, rb, yb - ya, 16, 1, true), i === 3 || i === 7 ? FADED : BODY, 0, (ya + yb) / 2, 0);
  }
  add(new THREE.SphereGeometry(0.11, 10, 8), CORE, 0, CY, 0);
  // tin drums
  add(new THREE.CylinderGeometry(0.10, 0.104, 0.045, 16), RING, 0, 0.0225, 0);
  add(new THREE.CylinderGeometry(0.104, 0.10, 0.045, 16), RING2, 0, 0.4675, 0);
  add(new THREE.CylinderGeometry(0.02, 0.028, 0.02, 10), RING2, 0, 0.50, 0);
  // wire cage: two half-tori crossing over the crown
  add(new THREE.TorusGeometry(0.08, 0.004, 4, 12, Math.PI), WIRE, 0, 0.485, 0, 0, 0, 0);
  add(new THREE.TorusGeometry(0.08, 0.004, 4, 12, Math.PI), WIRE, 0, 0.485, 0, 0, Math.PI / 2, 0);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.025, 6), WIRE, 0, 0.575, 0);
  add(new THREE.TorusGeometry(0.018, 0.004, 4, 10), WIRE, 0, 0.603, 0, 0, 0, 0);

  finish(THREE, g, [{ x: 0, y: CY, z: 0, color: 0xf0a060, intensity: 1.2, range: 3 }]);
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
