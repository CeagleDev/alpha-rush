// traffic_mirror — arm B: profiles. The housing is ONE LatheGeometry: a dished back that
// curls into a rolled rim at the front, so the frame and the back are a single spun-steel
// skin in orange-red; the hood is a partial lathe (phiLength = 0.9 pi) of a flared profile
// sitting over the top; the mirror is a shallow sphere cap (metalness 1, roughness 0.15,
// unnamed). Pole is a lathe with a foot collar and a cap; the small plate hangs on two
// straps. 0.8 m dia on a 3.5 m pole, head tilted down 12 deg, faces +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const ORANGE = mk(0xd8342a, 'metal', { roughness: 0.75, metalness: 0.2, side: DS });
  const ORANGE2 = mk(0xb32a22, 'metal', { roughness: 0.85, metalness: 0.2, side: DS });
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25, side: DS });
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
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));

  // pole: lathe with a foot collar, and a cap
  const pole = V2([[0.0, 0], [0.042, 0], [0.042, 0.06], [0.036, 0.08], [0.034, 3.44], [0.04, 3.46], [0.04, 3.50], [0, 3.50]]);
  add(new THREE.LatheGeometry(pole, 10), RUST2, 0, 0, 0);
  add(new THREE.CylinderGeometry(0.043, 0.043, 0.06, 10, 1, true), BLACK, 0, 0.03, 0);         // grounding band
  add(new THREE.CylinderGeometry(0.037, 0.037, 0.6, 10, 1, true, 2.4, 2.0), RUST, 0, 1.2, 0);     // rust run
  // small plate on two straps
  add(new THREE.BoxGeometry(0.34, 0.26, 0.02), PLATE, 0, 2.05, 0.05, 0, 0, -0.02);
  add(new THREE.BoxGeometry(0.34, 0.06, 0.022), RUST, 0, 2.16, 0.05, 0, 0, -0.02);
  add(new THREE.BoxGeometry(0.34, 0.03, 0.022), RUST2, 0, 1.935, 0.05, 0, 0, -0.02);
  for (const y of [1.97, 2.13]) add(new THREE.BoxGeometry(0.03, 0.02, 0.09), GALV, 0.0, y, 0.0);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), GALV, sx * 0.15, 2.05 + sy * 0.10, 0.063, Math.PI / 2, 0, 0);
  // head
  const head = new THREE.Group(); head.position.set(0, 3.02, 0.10); head.rotation.x = 0.21;
  const put = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); head.add(m); return m; };
  const R = 0.40;
  // housing profile: (radius, depth along the lathe's Y = the mirror's -Z once rotated) back centre -> dish -> rim curl -> lip
  const housing = V2([[0, -0.11], [0.20, -0.105], [0.33, -0.08], [R - 0.01, -0.03], [R, 0.0], [R - 0.005, 0.03], [R - 0.03, 0.035], [R - 0.045, 0.0]]);
  put(new THREE.LatheGeometry(housing, 24), ORANGE, 0, 0, 0, Math.PI / 2, 0, 0);
  put(new THREE.CircleGeometry(R - 0.045, 24), BLACK, 0, 0, 0.002);
  const RS = 1.05, th = Math.asin((R - 0.05) / RS);
  put(new THREE.SphereGeometry(RS, 24, 5, 0, Math.PI * 2, 0, th), MIRROR, 0, 0, 0.004 - RS * Math.cos(th), Math.PI / 2, 0, 0);
  // hood: partial lathe of a flare, over the top
  const hood = V2([[R + 0.005, -0.02], [R + 0.02, 0.03], [R + 0.03, 0.10], [R + 0.05, 0.16]]);
  put(new THREE.LatheGeometry(hood, 12, Math.PI * 0.05, Math.PI * 0.9), ORANGE2, 0, 0, 0, Math.PI / 2, 0, 0);
  put(new THREE.TorusGeometry(R + 0.05, 0.010, 4, 12, Math.PI * 0.9), ORANGE, 0, 0, 0.16, 0, 0, Math.PI * 0.05);
  // faded panel on the dish (wear)
  put(new THREE.CylinderGeometry(R - 0.05, R - 0.02, 0.04, 24, 1, true, 3.4, 1.4), ORANGE2, 0, 0, -0.06, Math.PI / 2, 0, 0);
  put(new THREE.BoxGeometry(0.10, 0.06, 0.08), ORANGE2, 0, -R + 0.02, -0.07);
  g.add(head);
  // yoke to the pole
  add(new THREE.BoxGeometry(0.06, 0.16, 0.07), GALV, 0, 2.62, 0.05);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.10, 10), GALV, 0, 2.62, 0);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), BLACK, sx * 0.04, 2.59, 0.088, Math.PI / 2, 0, 0);

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
