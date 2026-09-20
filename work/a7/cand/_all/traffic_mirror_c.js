// traffic_mirror — arm C: a different breakdown. A deeper drum housing: an extruded annulus
// (Shape with a hole) as the front bezel, a fat open drum wall behind it with a flat back and
// four clip tabs round the rim, a separate flat hood plate bent from the top (a box + a
// wedge), the mirror a domed sphere cap (metalness 1, roughness 0.15, unnamed). A two-bolt
// U-clamp grips the pole; the small plate is bolted through a spacer. 0.8 m dia, 3.5 m rusty
// pole with a grounding band, head tilted down, faces +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const ORANGE = mk(0xd8342a, 'metal', { roughness: 0.75, metalness: 0.2 });
  const ORANGE2 = mk(0xb32a22, 'metal', { roughness: 0.85, metalness: 0.2, side: DS });
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
  // pole with a rust run and a grounding band
  add(new THREE.CylinderGeometry(0.035, 0.038, 3.44, 10), RUST2, 0, 1.78, 0);
  add(new THREE.CylinderGeometry(0.041, 0.043, 0.06, 10), BLACK, 0, 0.03, 0);
  add(new THREE.CylinderGeometry(0.037, 0.039, 0.7, 10, 1, true, 1.0, 2.0), RUST, 0, 0.7, 0);
  add(new THREE.SphereGeometry(0.037, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GALV, 0, 3.50, 0);
  // plate on a spacer, two bolts
  add(new THREE.BoxGeometry(0.06, 0.06, 0.05), GALV, 0, 2.02, 0.025);
  add(new THREE.BoxGeometry(0.32, 0.26, 0.016), PLATE, 0, 2.02, 0.058, 0, 0, 0.04);
  add(new THREE.BoxGeometry(0.32, 0.07, 0.018), RUST, 0.0, 2.125, 0.058, 0, 0, 0.04);
  add(new THREE.BoxGeometry(0.05, 0.26, 0.018), RUST2, 0.14, 2.02, 0.058, 0, 0, 0.04);
  for (const sy of [-1, 1]) add(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 6), BLACK, 0, 2.02 + sy * 0.02, 0.07, Math.PI / 2, 0, 0);
  // head
  const head = new THREE.Group(); head.position.set(0, 3.0, 0.12); head.rotation.x = 0.22;
  const put = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); head.add(m); return m; };
  const R = 0.40;
  const ring = new THREE.Shape(); ring.absarc(0, 0, R, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, R - 0.045, 0, Math.PI * 2, true); ring.holes.push(hole);
  const bezel = new THREE.ExtrudeGeometry(ring, { depth: 0.03, bevelEnabled: false, curveSegments: 12 });
  put(bezel, ORANGE, 0, 0, -0.01);
  put(new THREE.CylinderGeometry(R - 0.01, R - 0.03, 0.14, 24, 1, true), ORANGE2, 0, 0, -0.08, Math.PI / 2, 0, 0);   // drum wall
  put(new THREE.CircleGeometry(R - 0.03, 24), ORANGE2, 0, 0, -0.15, Math.PI, 0, 0);                                 // back
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; put(new THREE.BoxGeometry(0.04, 0.03, 0.05), GALV, Math.cos(a) * (R - 0.005), Math.sin(a) * (R - 0.005), -0.02, 0, 0, a); }   // clip tabs
  put(new THREE.CircleGeometry(R - 0.05, 24), BLACK, 0, 0, 0.012);
  const RS = 1.05, th = Math.asin((R - 0.055) / RS);
  put(new THREE.SphereGeometry(RS, 24, 5, 0, Math.PI * 2, 0, th), MIRROR, 0, 0, 0.014 - RS * Math.cos(th), Math.PI / 2, 0, 0);
  // hood: a flat plate bent out over the top, and a wedge gusset each side
  put(new THREE.BoxGeometry(0.62, 0.02, 0.18), ORANGE, 0, R + 0.02, 0.06, 0.12, 0, 0);
  for (const sx of [-1, 1]) put(new THREE.BoxGeometry(0.02, 0.06, 0.12), ORANGE2, sx * 0.30, R - 0.01, 0.03, 0.12, 0, 0);
  put(new THREE.BoxGeometry(0.62, 0.03, 0.02), ORANGE2, 0, R + 0.005, 0.15, 0.12, 0, 0);   // hood lip
  // chipped bezel corner (wear)
  put(new THREE.BoxGeometry(0.06, 0.03, 0.006), GALV, -0.24, -0.28, 0.021, 0, 0, 0.9);
  put(new THREE.BoxGeometry(0.10, 0.06, 0.08), ORANGE2, 0, -R + 0.03, -0.10);
  g.add(head);
  // U-clamp on the pole
  add(new THREE.BoxGeometry(0.10, 0.05, 0.08), GALV, 0, 2.6, 0.06);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10, 1, true, Math.PI, Math.PI), GALV, 0, 2.6, 0).material.side = DS;
  add(new THREE.BoxGeometry(0.16, 0.05, 0.02), GALV, 0, 2.6, -0.045);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.009, 0.009, 0.12, 6), BLACK, sx * 0.06, 2.6, 0.0, Math.PI / 2, 0, 0);

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
