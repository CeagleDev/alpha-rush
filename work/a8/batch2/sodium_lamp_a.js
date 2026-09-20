// sodium_lamp — arm A: primitives. 10 m galvanised post: stepped cylinder column, bolted base
// plate, square access-hatch door with hinges, a curved arm (TubeGeometry on a quarter-curve)
// reaching over the road (+Z) and a rectangular sodium head built from boxes. Head glows 0xe5b055.
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
  // ---- base plate and bolts ------------------------------------------------------
  add(B(0.62, 0.05, 0.62), GALVD, 0, 0.025, 0);
  add(B(0.5, 0.04, 0.5), RUSTD, 0, 0.06, 0);                                    // grouted plinth, grounding-dark
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(CYL(0.022, 0.022, 0.09, 6), BOLT, sx * 0.24, 0.09, sz * 0.24);
    add(CYL(0.03, 0.03, 0.025, 6), RUST, sx * 0.24, 0.135, sz * 0.24);
  }
  // ---- square base section with the access hatch ---------------------------------
  add(B(0.34, 1.5, 0.34), GALV, 0, 0.83, 0);
  add(B(0.38, 0.06, 0.38), GALVD, 0, 1.6, 0);                                    // cap collar
  add(B(0.2, 0.55, 0.02), GALVD, 0, 0.85, 0.175);                                // hatch door (+Z)
  add(B(0.22, 0.03, 0.03), GALVD, 0, 1.14, 0.18); add(B(0.22, 0.03, 0.03), GALVD, 0, 0.56, 0.18);
  for (const sy of [0.72, 1.0]) { add(B(0.05, 0.07, 0.03), RUST, -0.08, sy, 0.19); add(CYL(0.012, 0.012, 0.05, 6), BOLT, -0.08, sy, 0.21, Math.PI / 2, 0, 0); }
  add(B(0.05, 0.1, 0.03), RUST, 0.07, 0.86, 0.19);                               // latch
  add(B(0.36, 0.14, 0.36), RUST, 0, 0.16, 0);                                    // rust at the base joint
  // ---- column: stepped cylinders ---------------------------------------------------
  add(CYL(0.13, 0.15, 3.2, 12), GALV, 0, 3.23, 0);
  add(CYL(0.1, 0.13, 3.3, 12), GALV, 0, 6.48, 0);
  add(CYL(0.09, 0.1, 1.5, 12), GALV, 0, 8.85, 0);
  for (const y of [1.66, 4.85, 8.13]) { add(CYL(0.155, 0.155, 0.08, 12), GALVD, 0, y, 0); add(CYL(0.158, 0.158, 0.03, 12), RUST, 0, y + 0.05, 0); }  // rust at the joints
  add(B(0.14, 0.3, 0.04), GALVD, 0, 2.4, 0.15);                                  // cable clip plate
  add(CYL(0.012, 0.012, 2.6, 6), DARK, 0, 3.6, 0.14);                             // external cable run
  // ---- curved arm over the road (+Z), TubeGeometry ------------------------------------
  tube([[0, 9.55, 0], [0, 10.0, 0.06], [0, 10.18, 0.45], [0, 10.2, 1.1], [0, 10.18, 1.62]], 0.055, GALV, 14);
  add(CYL(0.075, 0.075, 0.12, 10), GALVD, 0, 9.58, 0);                            // arm root sleeve
  add(CYL(0.078, 0.078, 0.05, 10), RUST, 0, 9.66, 0);
  // ---- rectangular sodium head ---------------------------------------------------------
  add(B(0.3, 0.16, 0.66), GALV, 0, 10.14, 1.94);                                  // canister body
  add(B(0.32, 0.05, 0.68), GALVD, 0, 10.23, 1.94);                                // lid
  add(B(0.26, 0.1, 0.6), SODIUM, 0, 10.02, 1.94);                                 // glowing underside
  add(B(0.3, 0.03, 0.62), DARK, 0, 9.96, 1.94);                                   // lens rim, dark
  for (const sx of [-1, 1]) add(B(0.02, 0.08, 0.5), GALVD, sx * 0.155, 10.06, 1.94);
  add(B(0.12, 0.06, 0.06), GALVD, 0, 10.2, 1.6);                                  // gear box behind the head
  for (let i = 0; i < 3; i++) add(B(0.16, 0.012, 0.012), GALVD, 0, 10.22, 1.78 + i * 0.12);   // ribs
  add(B(0.2, 0.06, 0.02), RUST, 0.04, 10.1, 2.26);                                 // rust streak on the nose
  lights.push({ x: 0, y: 9.9, z: 1.94, color: 0xe5b055, intensity: 1.2, range: 12 });
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
