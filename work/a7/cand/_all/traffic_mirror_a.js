// traffic_mirror — arm A: primitives. A 0.8 m convex mirror (a shallow SphereGeometry cap,
// metalness 1 / roughness 0.15, unnamed so the env reflects in it) in an orange-red torus
// frame with a cylinder back dish and a half-cylinder hood over the top, tilted 12 deg down on
// a U-bracket at the top of a 3.5 m rusty pole with a small rusted plate. Base y = 0 at the
// pole foot (grounding band), centred, mirror faces +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const ORANGE = mk(0xd8342a, 'metal', { roughness: 0.75, metalness: 0.2 });
  const ORANGE2 = mk(0xb32a22, 'metal', { roughness: 0.85, metalness: 0.2, side: DS });    // shaded / faded (wear)
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const RUST2 = mk(0x6e4128, 'metal', { roughness: 0.95, metalness: 0.2 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const PLATE = mk(0xc9c6bd, 'metal', { roughness: 0.8, metalness: 0.2 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const MIRROR = new THREE.MeshStandardMaterial({ color: 0xc9c6bd, metalness: 1.0, roughness: 0.15 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };

  // pole
  add(new THREE.CylinderGeometry(0.035, 0.038, 3.44, 10), RUST2, 0, 0.06 + 1.72, 0);
  add(new THREE.CylinderGeometry(0.040, 0.042, 0.06, 10), BLACK, 0, 0.03, 0);              // grounding band
  add(new THREE.CylinderGeometry(0.037, 0.039, 0.5, 10, 1, true, 0.2, 2.2), RUST, 0, 0.9, 0);   // rust run
  add(new THREE.CylinderGeometry(0.037, 0.037, 0.03, 10), GALV, 0, 3.49, 0);              // cap
  // the small plate: on a bracket, a little askew
  add(new THREE.BoxGeometry(0.34, 0.26, 0.02), PLATE, 0, 2.05, 0.045, 0, 0, 0.03);
  add(new THREE.BoxGeometry(0.34, 0.05, 0.022), RUST, 0, 2.17, 0.045, 0, 0, 0.03);        // rust band across the top
  add(new THREE.BoxGeometry(0.06, 0.26, 0.02), RUST2, -0.14, 2.05, 0.046, 0, 0, 0.03);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), GALV, sx * 0.15, 2.05 + sy * 0.10, 0.058, Math.PI / 2, 0, 0);
  add(new THREE.BoxGeometry(0.10, 0.06, 0.05), GALV, 0, 2.05, 0.015);
  // mirror head: a tilted subgroup
  const head = new THREE.Group();
  head.position.set(0, 3.02, 0.09);
  head.rotation.x = 0.21;                                            // positive: front tilts DOWN
  const put = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); head.add(m); return m; };
  const R = 0.40, RS = 1.05, th = Math.asin((R - 0.04) / RS);
  put(new THREE.CylinderGeometry(R, R - 0.03, 0.10, 24, 1, true), ORANGE2, 0, 0, -0.05, Math.PI / 2, 0, 0);   // back dish wall
  put(new THREE.CircleGeometry(R - 0.03, 24), ORANGE2, 0, 0, -0.10, Math.PI, 0, 0);                            // back
  put(new THREE.TorusGeometry(R - 0.02, 0.025, 6, 24), ORANGE, 0, 0, 0.0);                                    // rim
  put(new THREE.CircleGeometry(R - 0.035, 24), BLACK, 0, 0, 0.004);                                            // gasket behind the glass
  const cap = put(new THREE.SphereGeometry(RS, 24, 5, 0, Math.PI * 2, 0, th), MIRROR, 0, 0, 0.005 - RS * Math.cos(th), Math.PI / 2, 0, 0);
  // hood: a half-cylinder visor over the top third, and a small lip
  put(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.12, 24, 1, true, -Math.PI * 0.45, Math.PI * 0.9), ORANGE, 0, 0, 0.06, Math.PI / 2, 0, 0).material.side = DS;
  put(new THREE.TorusGeometry(R + 0.03, 0.012, 4, 24, Math.PI * 0.9), ORANGE2, 0, 0, 0.12, 0, 0, Math.PI * 0.05);
  // bracket under the head: a yoke to the pole
  put(new THREE.BoxGeometry(0.10, 0.06, 0.08), ORANGE, 0, -R + 0.02, -0.06);
  g.add(head);
  add(new THREE.BoxGeometry(0.06, 0.16, 0.06), GALV, 0, 3.47 - 0.85, 0.05);
  add(new THREE.CylinderGeometry(0.048, 0.048, 0.10, 10), GALV, 0, 3.47 - 0.85, 0);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), BLACK, sx * 0.04, 3.47 - 0.85 - 0.03, 0.082, Math.PI / 2, 0, 0);

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
