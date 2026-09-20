// guard_rail — arm B: profiles. The rail is a true W section drawn as a Shape and extruded 4.0 m
// along X (bevel off: a bevel would grow the profile and hang it below its own base); the posts are
// extruded C channels on extruded base plates. 0.75 m tall, rail face +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const GALV = M(0x9aa0a3, 'metal', 0.6, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.72, 0.3);
  const SCUFF = M(0xb4b8ba, 'metal', 0.45, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const MOSS = M(0x4a5a3a, 'metal', 0.95, 0.02);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const REFL = M(0xd8d2c4, 'metal', 0.4, 0.2);
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 4, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  // profile drawn in (u = world z, v = world y); rotation.y = -PI/2 sends +u to +Z and the sweep to X
  // the 5th argument is an offset ALONG the sweep (world X). Putting it in z instead pushes the
  // part out behind the rail and the measured depth goes from 0.35 m to 1.9 m without anything warning.
  const sweepX = (shape, len, mat, y, xoff) => add(ex(shape, len), mat, xoff || 0, y || 0, 0, 0, -Math.PI / 2, 0);
  const L = 4.0, RY = 0.575, T = 0.03;
  // ---- the W section: two forward ribs and a valley at the centre, 3 cm thick ----------------
  const w = [
    [0.0, -0.155], [0.06, -0.115], [0.075, -0.06], [0.02, -0.022], [0.02, 0.022], [0.075, 0.06], [0.06, 0.115], [0.0, 0.155],
    [-T, 0.155], [0.06 - T, 0.115], [0.075 - T, 0.06], [0.02 - T, 0.022], [0.02 - T, -0.022], [0.075 - T, -0.06], [0.06 - T, -0.115], [-T, -0.155],
  ];
  sweepX(poly(w), L, GALV, RY, 0);
  // scuffs and a rust run laid onto the ribs
  sweepX(poly([[0.062, -0.12], [0.078, -0.062], [0.078, -0.05], [0.062, -0.108]]), 1.4, SCUFF, RY, -0.75);
  sweepX(poly([[0.062, 0.108], [0.078, 0.05], [0.078, 0.062], [0.062, 0.12]]), 0.9, SCUFF, RY, 1.15);
  sweepX(poly([[0.05, -0.16], [0.078, -0.12], [0.078, -0.1], [0.05, -0.14]]), L, RUST, RY, 0);
  add(B(0.55, 0.24, 0.02), SCUFF, 0.2, RY, 0.075, 0, 0, 0.07);                       // dent panel
  add(B(0.7, 0.1, 0.02), RUST, -1.4, RY + 0.05, 0.07);
  // ---- terminals: the section closed off by a wrapped end block ---------------------------------
  for (const sx of [-1, 1]) {
    add(B(0.12, 0.35, 0.16), RUSTD, sx * (L / 2 - 0.06), RY, 0.02);
    add(B(0.08, 0.37, 0.03), RUST, sx * (L / 2 - 0.04), RY, 0.095);
    for (const sy of [-1, 1]) add(CYL(0.014, 0.014, 0.04, 4), BOLT, sx * (L / 2 - 0.06), RY + sy * 0.11, 0.105, Math.PI / 2, 0, 0);
  }
  // ---- posts: extruded C channel, open to the back --------------------------------------------------
  const chan = poly([[0, 0], [0.13, 0], [0.13, 0.025], [0.028, 0.025], [0.028, 0.105], [0.13, 0.105], [0.13, 0.13], [0, 0.13]]);
  for (const px of [-1.55, 0, 1.55]) {
    add(ex(chan, 0.62), GALV, px - 0.065, 0.31, -0.13, -Math.PI / 2, 0, 0);
    add(B(0.14, 0.28, 0.14), RUST, px, 0.19, -0.08);
    add(B(0.15, 0.08, 0.15), MOSS, px, 0.09, -0.08);
    add(ex(poly([[-0.14, -0.14], [0.14, -0.14], [0.14, 0.14], [-0.14, 0.14]],
      [[[-0.1, -0.1], [-0.06, -0.1], [-0.06, -0.06], [-0.1, -0.06]], [[0.06, 0.06], [0.1, 0.06], [0.1, 0.1], [0.06, 0.1]]]), 0.022), GALVD, px, 0.011, -0.08, -Math.PI / 2, 0, 0);
    add(B(0.3, 0.035, 0.3), DARK, px, 0.035, -0.08);
    for (const ax of [-1, 1]) add(CYL(0.013, 0.013, 0.06, 4), BOLT, px + ax * 0.08, 0.04, -0.08 + ax * 0.08);
    add(ex(poly([[-0.08, -0.08], [0.08, -0.08], [0.08, 0.08], [-0.08, 0.08]]), 0.07), GALVD, px, RY, -0.035, 0, 0, 0);
    add(CYL(0.02, 0.02, 0.05, 4), BOLT, px, RY, 0.085, Math.PI / 2, 0, 0);
  }
  // ---- reflector on the top rib ------------------------------------------------------------------------
  add(B(0.1, 0.12, 0.03), GALVD, 1.05, RY + 0.02, 0.085);
  add(B(0.06, 0.08, 0.02), REFL, 1.05, RY + 0.02, 0.102);
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = [];
  return g;
}
