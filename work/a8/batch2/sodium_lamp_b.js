// sodium_lamp — arm B: profiles. The column is one continuous LatheGeometry (swaged taper with
// collars), the base plate and the hatch surround are extruded profiles, the arm is a TubeGeometry
// on a long S-curve, and the head is a trapezoid section swept along its own length.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const EM = (hex, i) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(hex), emissiveIntensity: i || 2.4, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 10, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const tube = (pts, r, mat, seg, rad) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), seg || 12, r, rad || 8, false), mat, 0, 0, 0);
  const lights = [];
  const GALV = M(0x9aa0a3, 'metal', 0.62, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.7, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const SODIUM = EM(0xe5b055, 2.6);
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 6, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  // ---- base plate: extruded square with a central hole, laid flat ---------------------
  add(ex(poly([[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]], [[[-0.14, -0.14], [0.14, -0.14], [0.14, 0.14], [-0.14, 0.14]]]), 0.05), GALVD, 0, 0.025, 0, -Math.PI / 2, 0, 0);
  add(B(0.5, 0.05, 0.5), RUSTD, 0, 0.06, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { add(CYL(0.022, 0.022, 0.1, 6), BOLT, sx * 0.25, 0.09, sz * 0.25); add(CYL(0.031, 0.031, 0.022, 6), RUST, sx * 0.25, 0.14, sz * 0.25); }
  // ---- column: one lathe from base to tip (swaged, with collars) ------------------------
  add(new THREE.LatheGeometry(V2([
    [0.19, 0.05], [0.19, 1.45], [0.205, 1.45], [0.205, 1.58], [0.15, 1.62],
    [0.145, 3.2], [0.16, 3.22], [0.16, 3.3], [0.13, 3.34],
    [0.125, 6.4], [0.14, 6.42], [0.14, 6.5], [0.11, 6.54],
    [0.085, 9.5], [0.075, 9.56], [0.0, 9.56]]), 12), GALV, 0, 0, 0);
  add(new THREE.LatheGeometry(V2([[0.212, 1.45], [0.212, 1.56], [0.16, 1.6]]), 12), RUST, 0, 0, 0);       // rust at the collar
  add(new THREE.LatheGeometry(V2([[0.148, 3.2], [0.165, 3.24], [0.135, 3.32]]), 12), RUST, 0, 0, 0);
  add(new THREE.LatheGeometry(V2([[0.196, 0.06], [0.196, 0.34], [0.19, 0.36]]), 12), RUST, 0, 0, 0);       // rust run off the base
  // ---- hatch: extruded surround with the door sunk inside it -------------------------------
  add(ex(poly([[-0.13, -0.3], [0.13, -0.3], [0.13, 0.3], [-0.13, 0.3]], [[[-0.1, -0.27], [0.1, -0.27], [0.1, 0.27], [-0.1, 0.27]]]), 0.03), GALVD, 0, 0.85, 0.195);
  add(B(0.2, 0.54, 0.02), GALVD, 0, 0.85, 0.185);
  for (const sy of [0.7, 1.0]) { add(B(0.06, 0.08, 0.035), RUST, -0.085, sy, 0.2); add(CYL(0.013, 0.013, 0.06, 6), BOLT, -0.085, sy, 0.225, Math.PI / 2, 0, 0); }
  add(B(0.06, 0.11, 0.035), RUST, 0.075, 0.86, 0.2);
  add(ex(poly([[-0.07, -0.16], [0.07, -0.16], [0.07, 0.16], [-0.07, 0.16]]), 0.03), GALVD, 0, 2.4, 0.15);   // cable clip
  add(CYL(0.012, 0.012, 2.6, 6), DARK, 0, 3.6, 0.145);
  // ---- arm: TubeGeometry on a long S-curve, reaching +Z ---------------------------------------
  tube([[0, 9.4, 0], [0, 9.9, 0.05], [0, 10.16, 0.4], [0, 10.24, 0.95], [0, 10.2, 1.55], [0, 10.12, 1.86]], 0.052, GALV, 16);
  add(new THREE.LatheGeometry(V2([[0.075, 0], [0.075, 0.14], [0.055, 0.16]]), 10), GALVD, 0, 9.42, 0);
  add(new THREE.LatheGeometry(V2([[0.078, 0.14], [0.078, 0.2], [0.06, 0.21]]), 10), RUST, 0, 9.42, 0);
  // ---- head: trapezoid section swept along the head's length (+Z) --------------------------------
  const headSec = poly([[-0.15, -0.06], [0.15, -0.06], [0.13, 0.09], [-0.13, 0.09]]);
  add(ex(headSec, 0.7), GALV, 0, 10.12, 2.14);
  add(B(0.3, 0.04, 0.72), GALVD, 0, 10.22, 2.14);
  add(ex(poly([[-0.13, -0.05], [0.13, -0.05], [0.13, 0.02], [-0.13, 0.02]]), 0.62), SODIUM, 0, 10.03, 2.14);   // glowing lens block
  add(B(0.31, 0.025, 0.64), DARK, 0, 9.98, 2.14);
  add(ex(poly([[-0.07, -0.05], [0.07, -0.05], [0.07, 0.06], [-0.07, 0.06]]), 0.12), GALVD, 0, 10.18, 1.74);     // gear canister
  for (let i = 0; i < 3; i++) add(B(0.18, 0.014, 0.014), GALVD, 0, 10.21, 1.98 + i * 0.14);
  add(B(0.18, 0.05, 0.03), RUST, 0.05, 10.1, 2.47);
  lights.push({ x: 0, y: 9.92, z: 2.14, color: 0xe5b055, intensity: 1.2, range: 12 });
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
