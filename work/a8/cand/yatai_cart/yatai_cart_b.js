// yatai_cart — arm B: profiles. The roof slopes are one scalloped Shape (pantile edge) extruded
// along Z; the cabinet is an extruded chamfered-rect section; wheels are lathed rims; pot, bowls
// and lanterns are lathes; the handle is a TubeGeometry on a curve; the lightbox frame is an
// extruded rectangle with a hole. Long axis Z, handle +Z, counter side +X. 1.2 x 2.1 x 2.4.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const EM = (hex, i) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(hex), emissiveIntensity: i || 2.2, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 12, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  // bevel off, always; centred on the sweep so placement means the middle
  const ex = (shape, depth, cs) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: cs || 6, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  const lights = [];

  const TIM = M(0x4f2d21, 'timber', 0.9);
  const TIMD = M(0x37201b, 'timber', 0.92);
  const TIML = M(0x6c4028, 'timber', 0.88);
  const PLANK = M(0x8b6141, 'timber', 0.9);
  const RUST = M(0x6e4128, 'metal', 0.92, 0.1);
  const STEEL = M(0x8a8d90, 'metal', 0.5, 0.3);
  const IRON = M(0x3a3a3c, 'metal', 0.7, 0.3);
  const TILE = M(0x3a3b3d, 'stone', 0.9);
  const RED = M(0xb8302a, 'fabric', 0.9, 0, { side: DS });
  const WHITE = M(0xeee2c8, 'fabric', 0.9, 0, { side: DS });
  const BOWL = M(0xeee2c8, 'plaster', 0.6, 0, { side: DS });
  const BOWLB = M(0x40559f, 'plaster', 0.6, 0, { side: DS });
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const LBOX = EM(0xd8ae70, 2.4);
  const LANT = EM(0xd8482a, 2.0);

  // ---- wheels: lathed rim (U section), spokes, hub -----------------------------
  const rimGeo = new THREE.LatheGeometry(V2([[0.35, -0.03], [0.385, -0.03], [0.385, 0.03], [0.35, 0.03], [0.36, 0.0]]), 24);
  const wheel = (x, y, z) => {
    const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.z = Math.PI / 2; g.add(w);   // lathe axis Y -> X
    add(rimGeo, DARK, 0, 0, 0, 0, 0, 0, w);
    add(new THREE.LatheGeometry(V2([[0.0, -0.05], [0.05, -0.05], [0.055, 0.0], [0.05, 0.05], [0.0, 0.05]]), 10), RUST, 0, 0, 0, 0, 0, 0, w);
    for (let i = 0; i < 12; i++) add(CYL(0.007, 0.007, 0.68, 5), IRON, 0, 0, 0, (i / 12) * Math.PI, 0, Math.PI / 2, w);
  };
  wheel(0.53, 0.4, -0.3); wheel(-0.53, 0.4, -0.3);
  add(CYL(0.02, 0.02, 1.14, 8), IRON, 0, 0.4, -0.3, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) add(B(0.05, 0.12, 0.08), IRON, s * 0.44, 0.44, -0.3);

  // ---- cabinet: chamfered section swept along Z, with plank grooves ---------------
  const cab = poly([[-0.46, 0.5], [0.46, 0.5], [0.46, 0.93], [0.43, 0.97], [-0.43, 0.97], [-0.46, 0.93]]);
  add(ex(cab, 1.4), TIM, 0, 0, -0.15);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) add(B(0.015, 0.012, 1.4), TIMD, s * 0.463, 0.56 + i * 0.07, -0.15);     // plank lines
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) add(B(0.03, 0.47, 0.04), TIMD, s * 0.47, 0.735, -0.8 + i * 0.44);         // studs
  add(ex(poly([[-0.12, 0.52], [0.12, 0.52], [0.13, 0.76], [-0.13, 0.76]]), 0.02), RUST, -0.47, 0, 0.1, 0, Math.PI / 2, 0);        // rust patch
  add(B(0.9, 0.04, 0.02), TIMD, 0, 0.62, 0.56);                                                                                    // stain band on +Z end
  add(B(0.06, 0.06, 0.06), TIMD, -0.44, 0.52, -0.83);                                                                              // chipped corner
  // ---- counter ---------------------------------------------------------------------
  add(B(1.12, 0.04, 1.5), STEEL, 0.05, 0.99, -0.15);
  add(ex(poly([[0, 0], [0.05, 0], [0.05, 0.14], [0.02, 0.17], [0, 0.17]]), 1.3), STEEL, -0.52, 1.01, -0.15);   // back splash
  add(B(0.36, 0.02, 0.36), DARK, -0.1, 1.015, 0.15);
  add(new THREE.LatheGeometry(V2([[0, 0], [0.12, 0], [0.13, 0.05], [0.13, 0.2], [0.125, 0.22]]), 14), STEEL, -0.1, 1.02, 0.15);
  add(new THREE.LatheGeometry(V2([[0, 0], [0.11, 0], [0.135, 0.01], [0.13, 0.03], [0.03, 0.04], [0.02, 0.07], [0, 0.07]]), 14), STEEL, -0.1, 1.24, 0.15);
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.03, 0.007, 5, 10, Math.PI), IRON, -0.1 + s * 0.14, 1.2, 0.15, 0, s * Math.PI / 2, 0);
  const bowlGeo = new THREE.LatheGeometry(V2([[0.02, 0], [0.05, 0.005], [0.068, 0.03], [0.07, 0.045]]), 8);
  const stacks = [[0.3, -0.6, 4], [0.32, -0.42, 3], [0.15, -0.55, 5], [0.35, 0.35, 4], [0.2, 0.5, 3], [0.38, 0.55, 2]];
  stacks.forEach(([x, z, n], k) => { for (let i = 0; i < n; i++) add(bowlGeo, (i + k) % 3 === 0 ? BOWLB : BOWL, x, 1.01 + i * 0.022, z); });

  // ---- posts + canopy: scalloped slope profile extruded along Z ---------------------
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(CYL(0.025, 0.025, 0.86, 8), IRON, s * 0.42, 1.44, -0.15 + t * 0.62);
  for (const s of [-1, 1]) add(B(0.06, 0.06, 1.82), TIMD, s * 0.58, 1.86, -0.1);
  for (const t of [-1, 1]) add(B(1.2, 0.05, 0.05), TIMD, 0, 1.86, -0.1 + t * 0.9);
  add(B(0.06, 0.08, 1.82), TIMD, 0, 2.02, -0.1);
  // slope profile in (u along slope, v up): flat underside, top edge is 6 half-round tiles
  const slope = new THREE.Shape(); slope.moveTo(0, 0); slope.lineTo(0.66, 0); slope.lineTo(0.66, 0.03);
  for (let i = 5; i >= 0; i--) slope.absarc(0.055 + i * 0.11, 0.03, 0.055, 0, Math.PI, false);
  slope.lineTo(0, 0.03); slope.closePath();
  const slopeGeo = ex(slope, 1.84, 5);
  const pitch = Math.atan2(0.2, 0.62);
  const sl = add(slopeGeo, TILE, -0.6, 1.9, -0.1, 0, 0, pitch);           // -X slope: u runs +X, rising to the ridge
  // +X slope: Rz(pitch) first (rising, tiles up), then Ry(PI) turns it to run -X; XYZ order applies Z first
  const sr = add(slopeGeo, TILE, 0.6, 1.9, -0.1); sr.rotation.set(0, Math.PI, pitch);
  add(CYL(0.05, 0.05, 1.86, 8), TILE, 0, 2.06, -0.1, Math.PI / 2, 0, 0);
  // ---- lightbox (+X) as an extruded frame with a hole, emissive face inside ----------
  add(ex(poly([[-0.48, -0.18], [0.48, -0.18], [0.48, 0.18], [-0.48, 0.18]], [[[-0.44, -0.14], [0.44, -0.14], [0.44, 0.14], [-0.44, 0.14]]]), 0.06), TIMD, 0.46, 1.66, -0.15, 0, Math.PI / 2, 0);
  add(B(0.03, 0.3, 0.9), LBOX, 0.465, 1.66, -0.15);
  lights.push({ x: 0.62, y: 1.66, z: -0.15, color: 0xd8ae70, intensity: 0.9, range: 3.5 });
  add(B(0.04, 0.3, 0.9), PLANK, -0.44, 1.66, -0.15);
  add(B(0.02, 0.1, 0.5), TIMD, -0.46, 1.66, -0.15);
  // ---- curtain: strips with a notched hem, extruded thin -------------------------------
  const strip = poly([[0, 0], [0.125, 0], [0.125, 0.3], [0, 0.3], [0, 0.03], [0.03, 0.03], [0.03, 0]]);
  const stripGeo = ex(strip, 0.02);
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) add(stripGeo, i % 2 ? WHITE : RED, s * 0.6, 1.55, -0.82 + i * 0.13, 0, Math.PI / 2, 0);
  for (const t of [-1, 1]) for (let i = 0; i < 8; i++) add(stripGeo, i % 2 ? RED : WHITE, -0.55 + i * 0.14, 1.55, -0.1 + t * 0.9);
  // ---- lanterns: lathed lit bodies with dark ribs --------------------------------------
  const lantGeo = new THREE.LatheGeometry(V2([[0.04, 0], [0.1, 0.03], [0.13, 0.1], [0.13, 0.24], [0.1, 0.31], [0.04, 0.34]]), 12);
  for (const t of [-1, 1]) {
    const z = -0.1 + t * 0.95, x = 0.6;
    add(CYL(0.006, 0.006, 0.08, 5), IRON, x, 1.82, z);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.77, z);
    add(lantGeo, LANT, x, 1.43, z);
    for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.132 - Math.abs(i - 1.5) * 0.015, 0.006, 4, 10), DARK, x, 1.52 + i * 0.055, z, Math.PI / 2, 0, 0);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.42, z);
    lights.push({ x, y: 1.6, z, color: 0xe0482a, intensity: 0.8, range: 3 });
  }
  // ---- handle: two tubes on a curve, grip, caster leg ---------------------------------
  for (const s of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.3, 0.62, 0.55), new THREE.Vector3(s * 0.3, 0.55, 0.85), new THREE.Vector3(s * 0.26, 0.5, 1.15), new THREE.Vector3(s * 0.25, 0.5, 1.36)]);
    add(new THREE.TubeGeometry(curve, 8, 0.02, 6, false), IRON, 0, 0, 0);
  }
  add(CYL(0.02, 0.02, 0.54, 7), IRON, 0, 0.5, 1.36, 0, 0, Math.PI / 2);
  const leg = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.5, 1.22), new THREE.Vector3(0, 0.3, 1.2), new THREE.Vector3(0, 0.1, 1.1)]);
  add(new THREE.TubeGeometry(leg, 6, 0.018, 6, false), IRON, 0, 0, 0);
  add(CYL(0.012, 0.012, 0.66, 6), IRON, 0, 0.5, 0.88, Math.PI / 2, 0, 0);
  add(CYL(0.07, 0.07, 0.04, 12), DARK, 0, 0.07, 1.1, 0, 0, Math.PI / 2);

  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  g.userData.obstacle = { kind: 'block', lanes: 1 };
  return g;
}
