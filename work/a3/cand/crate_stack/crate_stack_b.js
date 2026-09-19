// crate_stack — arm B: profiles. Each crate wall is one THREE.Shape (a panel
// with slot holes and a hand hole cut out) extruded 2 cm, four walls plus a
// floor and corner posts per crate; bottles are a LatheGeometry profile.
// Four crates 0.5 × 0.35 × 0.3 m, white / yellow / yellow / white from the
// bottom with dirt as colour variation, stacked with small offsets. Bottom
// wall band of the lowest crate is the black grounding band. Jump obstacle.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  // two yellows, two whites, each with its own dirt level (wear as colour variation)
  const YEL = mk(0xf8e845, "plaster", { roughness: 0.75 });
  const YEL2 = mk(0xd9c73a, "plaster", { roughness: 0.85 });
  const WHT = mk(0xeee2c8, "plaster", { roughness: 0.8 });
  const WHT2 = mk(0xc9bda3, "plaster", { roughness: 0.9 });
  const GRIME = mk(0x8b6141, "plaster", { roughness: 0.95 });
  const BLACK = mk(0x110f12, "plaster", { roughness: 0.95 });
  const GLASS = mk(0x4a2a12, "metal", { roughness: 0.35, metalness: 0.1 });
  const GLASS2 = mk(0x5a3416, "metal", { roughness: 0.35, metalness: 0.1 });
  const CAP = mk(0xbf7c42, "metal", { roughness: 0.5, metalness: 0.4 });
  const LABEL = mk(0xb8302a, "plaster", { roughness: 0.9 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]);
      for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  const ex = (shape, depth) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 2, steps: 1 });
    geo.translate(0, 0, -depth / 2); return geo;
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  const CW = 0.5, CD = 0.35, CH = 0.3, T = 0.02, P = 0.035;
  // long wall: 3 tall slots over a 4 cm bottom band; short wall: 2 slots + a hand hole
  const longWall = poly(rect(-CW / 2 + P, 0, CW / 2 - P, CH), [
    rect(-0.19, 0.05, -0.07, 0.25), rect(-0.05, 0.05, 0.05, 0.25), rect(0.07, 0.05, 0.19, 0.25)]);
  const shortWall = poly(rect(-CD / 2 + P, 0, CD / 2 - P, CH), [
    rect(-0.13, 0.05, -0.05, 0.13), rect(0.05, 0.05, 0.13, 0.13), rect(-0.12, 0.16, 0.12, 0.25)]);
  const LG = ex(longWall, T), SG = ex(shortWall, T);
  function crate(body, rail, x, y, z, ry, bottom) {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c);
    const A = (geo, mat, px, py, pz, rx, ryy, rz) => add(geo, mat, px, py, pz, rx, ryy, rz, c);
    A(new THREE.BoxGeometry(CW - 0.06, 0.02, CD - 0.06), rail, 0, 0.035, 0);
    for (const sz of [-1, 1]) A(LG, body, 0, 0, sz * (CD / 2 - T / 2));
    for (const sx of [-1, 1]) A(SG, body, sx * (CW / 2 - T / 2), 0, 0, 0, Math.PI / 2, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) A(new THREE.BoxGeometry(P, CH, P), rail, sx * (CW / 2 - P / 2), CH / 2, sz * (CD / 2 - P / 2));
    // bottom band strip (grime, or black on the ground crate) and a top lip
    for (const sz of [-1, 1]) A(new THREE.BoxGeometry(CW - 2 * P, 0.04, 0.006), bottom ? BLACK : GRIME, 0, 0.02, sz * (CD / 2 + 0.003));
    for (const sx of [-1, 1]) A(new THREE.BoxGeometry(0.006, 0.04, CD - 2 * P), bottom ? BLACK : GRIME, sx * (CW / 2 + 0.003), 0.02, 0);
    A(new THREE.BoxGeometry(CW, 0.02, 0.03), rail, 0, CH - 0.01, CD / 2 - 0.015);
    A(new THREE.BoxGeometry(CW, 0.02, 0.03), rail, 0, CH - 0.01, -CD / 2 + 0.015);
    return c;
  }
  crate(WHT2, GRIME, 0.0, 0.0, 0.0, 0.0, true);
  crate(YEL2, YEL2, -0.02, 0.30, 0.015, -0.05, false);
  crate(YEL, YEL2, 0.02, 0.60, -0.01, 0.04, false);
  const top = crate(WHT, WHT2, -0.01, 0.90, 0.01, -0.02, false);
  // bottles: one lathe profile, six placed with slight leans
  const BP = [[0, 0], [0.03, 0], [0.03, 0.17], [0.02, 0.2], [0.012, 0.215], [0.012, 0.28], [0.014, 0.28], [0.014, 0.295], [0, 0.295]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const bg = new THREE.LatheGeometry(BP, 8);
  [[-0.16, -0.09, 0.05, 0.1, GLASS], [-0.05, -0.1, 0, -0.06, GLASS2], [0.07, -0.08, -0.04, 0.02, GLASS],
   [0.17, 0.02, 0.08, -0.05, GLASS2], [-0.1, 0.08, -0.06, 0.04, GLASS], [0.04, 0.1, 0.03, 0.09, GLASS]].forEach(([x, z, rx, rz, mat]) => {
    const b = add(bg, mat, x, 0.05, z, rx, 0, rz, top);
    add(new THREE.CylinderGeometry(0.031, 0.031, 0.05, 8), LABEL, 0, 0.1, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 6), CAP, 0, 0.297, 0, 0, 0, 0, b);
  });
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.obstacle = { kind: "jump", lanes: 1 };
  return g;
}
