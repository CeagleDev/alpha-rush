// sign_gantry — WINNER (arm A: primitives). 8 m span. Crossbeam as a box frame (four chords, verticals and
// a few diagonals), two lattice posts on bolted base plates, two PLAIN green boards with white
// borders facing +Z, a row of lamps under them, and a grated walkway with a handrail behind (-Z).
// Height 7.5 m, board bottom edge 5.35 m.
export default function (THREE) {
  const g = new THREE.Group();
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
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const lights = [];
  const GALV = M(0x9aa0a3, 'metal', 0.62, 0.3);
  const GALVD = M(0x7e8487, 'metal', 0.72, 0.3);
  const STEEL = M(0x6a7073, 'metal', 0.75, 0.3);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const BOLT = M(0x5f6468, 'metal', 0.6, 0.3);
  const GREEN = M(0x2f6b3a, 'metal', 0.85, 0.05);
  const GREEND = M(0x265731, 'metal', 0.88, 0.05);
  const WHITE = M(0xd8d2c4, 'metal', 0.8, 0.05);
  const LAMP = EM(0xe5b055, 2.2);
  const POSTX = 3.9, TRUSS_Y = 6.55, TRUSS_H = 1.0, TRUSS_D = 0.7;
  // ---- posts: four corner legs with X bracing, on base plates -------------------------
  for (const sx of [-1, 1]) {
    const px = sx * POSTX;
    add(B(1.0, 0.07, 1.0), GALVD, px, 0.035, 0);                                    // base plate
    add(B(0.84, 0.1, 0.84), RUSTD, px, 0.1, 0);                                     // grout pad, grounding-dark
    for (const ax of [-1, 1]) for (const az of [-1, 1]) {
      add(CYL(0.032, 0.032, 0.14, 6), BOLT, px + ax * 0.38, 0.16, az * 0.38);
      add(B(0.1, 0.5, 0.1), STEEL, px + ax * 0.3, 0.38, az * 0.3);                  // leg feet, splayed base
      add(B(0.09, 5.6, 0.09), GALV, px + ax * 0.24, 3.4, az * 0.24);                // legs
    }
    add(B(0.62, 0.5, 0.62), RUST, px, 0.42, 0);                                     // rust at the foot
    // lacing: horizontals every 1.1 m and one diagonal per bay per face
    for (let i = 0; i < 6; i++) {
      const y = 0.8 + i * 1.05;
      add(B(0.53, 0.05, 0.05), GALVD, px, y, 0.24); add(B(0.53, 0.05, 0.05), GALVD, px, y, -0.24);
      add(B(0.05, 0.05, 0.53), GALVD, px + 0.24, y, 0); add(B(0.05, 0.05, 0.53), GALVD, px - 0.24, y, 0);
      if (i < 5) {
        const a = Math.atan2(1.05, 0.48);
        add(B(0.045, 1.16, 0.045), GALVD, px, y + 0.52, 0.24, 0, 0, (i % 2 ? 1 : -1) * (Math.PI / 2 - a));
        add(B(0.045, 1.16, 0.045), GALVD, px, y + 0.52, -0.24, 0, 0, (i % 2 ? -1 : 1) * (Math.PI / 2 - a));
        add(B(0.045, 0.045, 1.16), GALVD, px + 0.24, y + 0.52, 0, (i % 2 ? 1 : -1) * (Math.PI / 2 - a), 0, 0);
      }
    }
    add(B(0.62, 0.1, 0.62), GALVD, px, 6.05, 0);                                     // post cap
    add(B(0.3, 0.9, 0.06), RUST, px + 0.2, 2.2, 0.28);                               // rust run down one face
  }
  // ---- crossbeam: four chords, verticals, diagonals ---------------------------------------
  const SPAN = POSTX * 2;
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) add(B(SPAN, 0.1, 0.1), GALV, 0, TRUSS_Y + sy * TRUSS_H / 2, sz * TRUSS_D / 2);
  for (let i = 0; i <= 8; i++) {
    const x = -POSTX + i * (SPAN / 8);
    add(B(0.055, TRUSS_H, 0.055), GALVD, x, TRUSS_Y, TRUSS_D / 2);
    add(B(0.055, TRUSS_H, 0.055), GALVD, x, TRUSS_Y, -TRUSS_D / 2);
    if (i < 8) {
      const a = Math.atan2(SPAN / 8, TRUSS_H);
      add(B(0.05, 1.28, 0.05), GALVD, x + SPAN / 16, TRUSS_Y, TRUSS_D / 2, 0, 0, (i % 2 ? -a : a));
      add(B(0.05, 1.28, 0.05), GALVD, x + SPAN / 16, TRUSS_Y, -TRUSS_D / 2, 0, 0, (i % 2 ? a : -a));
    }
  }
  for (let i = 0; i <= 4; i++) { const x = -POSTX + i * (SPAN / 4); add(B(0.05, 0.05, TRUSS_D), GALVD, x, TRUSS_Y + TRUSS_H / 2, 0); add(B(0.05, 0.05, TRUSS_D), GALVD, x, TRUSS_Y - TRUSS_H / 2, 0); }
  add(B(SPAN, 0.12, 0.12), RUST, 0, TRUSS_Y + TRUSS_H / 2 + 0.02, -TRUSS_D / 2);      // weather streak along the top chord
  // ---- boards: PLAIN green with white borders, facing +Z -------------------------------------
  const BW = 3.3, BH = 1.85, BY = 5.35 + BH / 2, BZ = 0.42;
  for (const sx of [-1, 1]) {
    const cx = sx * (BW / 2 + 0.12);
    add(B(BW, BH, 0.05), GREEN, cx, BY, BZ);
    add(B(BW + 0.1, 0.09, 0.07), WHITE, cx, BY + BH / 2 - 0.02, BZ + 0.02);          // white border
    add(B(BW + 0.1, 0.09, 0.07), WHITE, cx, BY - BH / 2 + 0.02, BZ + 0.02);
    add(B(0.09, BH, 0.07), WHITE, cx - BW / 2 + 0.02, BY, BZ + 0.02);
    add(B(0.09, BH, 0.07), WHITE, cx + BW / 2 - 0.02, BY, BZ + 0.02);
    add(B(BW + 0.12, BH + 0.12, 0.04), GREEND, cx, BY, BZ - 0.05);                    // backing panel
    add(B(0.5, 0.42, 0.03), GREEND, cx + sx * 0.9, BY - 0.35, BZ + 0.03);             // faded patch
    add(B(0.2, 0.5, 0.03), RUST, cx - sx * 1.2, BY + 0.2, BZ + 0.03);                 // rust bleed from a fixing
    for (const by of [BY - BH / 2 - 0.1, BY + BH / 2 + 0.1]) add(B(BW, 0.08, 0.5), GALVD, cx, by, BZ - 0.28);   // board rails back to the truss
  }
  // ---- lamps under the boards ------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    const x = -3.0 + i * 2.0;
    add(B(0.26, 0.2, 0.22), GALVD, x, 5.18, 0.34);
    add(CYL(0.11, 0.13, 0.16, 10), GALVD, x, 5.02, 0.4, Math.PI / 2, 0, 0);
    add(CYL(0.1, 0.1, 0.03, 10), LAMP, x, 4.95, 0.42, 0, 0, 0);
    add(B(0.06, 0.16, 0.06), STEEL, x, 5.3, 0.28);
    add(B(0.1, 0.06, 0.05), RUST, x + 0.1, 5.18, 0.45);
    lights.push({ x, y: 4.88, z: 0.45, color: 0xe5b055, intensity: 0.7, range: 6 });
  }
  // ---- walkway with handrail, behind the boards (-Z) ------------------------------------------------
  const WZ = -0.62;
  add(B(SPAN, 0.05, 0.75), STEEL, 0, 5.1, WZ);                                        // grating deck
  for (let i = 0; i < 22; i++) add(B(0.03, 0.06, 0.75), GALVD, -POSTX + 0.18 + i * 0.35, 5.13, WZ);   // grating bars
  add(B(SPAN, 0.06, 0.06), GALVD, 0, 5.07, WZ - 0.36);                                 // toe board
  for (let i = 0; i <= 8; i++) add(B(0.05, 1.05, 0.05), GALVD, -POSTX + i * (SPAN / 8), 5.65, WZ - 0.34);   // stanchions
  add(B(SPAN, 0.055, 0.055), GALV, 0, 6.15, WZ - 0.34);                                 // top rail
  add(B(SPAN, 0.045, 0.045), GALV, 0, 5.72, WZ - 0.34);                                 // mid rail
  for (const sx of [-1, 1]) { add(B(0.05, 0.05, 0.6), GALVD, sx * POSTX, 6.15, WZ - 0.04); add(B(0.05, 0.05, 0.6), GALVD, sx * POSTX, 5.72, WZ - 0.04); }
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) add(B(0.06, 0.06, 0.4), STEEL, sx * (POSTX - 0.3), 5.05, WZ + 0.2 - i * 0.3);   // deck brackets
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
