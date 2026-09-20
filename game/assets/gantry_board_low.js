/**
 * gantry_board_low — arm C: a different breakdown. Columns are extruded I-beam sections (one
 * Shape swept up 2.3 m) with patchwork plank and tin panels bolted over them, the beam is an
 * extruded channel, the sign is a thicker box sign with a raised white rim and hangs on two short
 * chains (small torus links) from the beam, the lamps are cylinder cans with emissive front discs
 * on swing brackets, and the base is a grating (slats) between the columns. 2.6 wide, bottom of
 * the board at 1.3 m, ≤ 0.6 deep. Faces +Z. userData.obstacle = {kind:'roll', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const steel = M(0x7a766e, 'metal', 0.6, 0.3);
  const steelDark = M(0x4a4744, 'metal', 0.7, 0.3);
  const tin = M(0x8b6141, 'metal', 0.85, 0.3);
  const plank = M(0x4f2d21, 'timber', 0.9);
  const plankLit = M(0x6c4028, 'timber', 0.9);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const green = M(0x2f6b3a, 'metal', 0.8, 0.2);
  const greenFade = M(0x3f7a48, 'metal', 0.85, 0.2);
  const white = M(0xd9d4c4, 'metal', 0.8, 0.2);
  const housing = M(0xb85a2a, 'metal', 0.7, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.2, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const CYL = (r, h, x, y, z, mat, axis = 'y', seg = 10) => { const m = MESH(new THREE.CylinderGeometry(r, r, h, seg), mat, g, x, y, z); if (axis === 'x') m.rotation.z = Math.PI / 2; if (axis === 'z') m.rotation.x = Math.PI / 2; return m; };
  const SHAPE = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };

  const W = 2.60, H = 2.30, D = 0.56;
  // I-beam profile (flange 0.20 in z, web 0.02 in x... drawn in shape (x, y) = (world x, world z)) extruded up y
  const ib = SHAPE([[-0.10, -0.20], [0.10, -0.20], [0.10, -0.17], [0.015, -0.17], [0.015, 0.17], [0.10, 0.17], [0.10, 0.20], [-0.10, 0.20], [-0.10, 0.17], [-0.015, 0.17], [-0.015, -0.17], [-0.10, -0.17]]);
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - 0.12);
    B(0.26, 0.06, D, x, 0.03, 0, dark);
    B(0.30, 0.04, D, x, 0.08, 0, steelDark);
    const col = MESH(new THREE.ExtrudeGeometry(ib, { depth: H - 0.10, bevelEnabled: false }), steel, g, x, 0.10, 0); col.rotation.x = -Math.PI / 2;
    // patchwork panels bolted over the front and outer faces at staggered heights
    const panels = [[0.30, 0.55, plank], [0.95, 0.40, tin], [1.45, 0.70, plankLit], [2.0, 0.35, tin]];
    for (const [y, h, mat] of panels) { B(0.26, h, 0.02, x + s * 0.01, y, D / 2 - 0.05, mat); B(0.02, h * 0.8, D - 0.10, x + s * 0.12, y + 0.05, 0, mat === tin ? plank : tin); }
    for (const y of [0.55, 1.2, 1.8]) for (const dz of [-0.08, 0.08]) CYL(0.012, 0.02, x + s * 0.06, y, D / 2 - 0.03 + 0.0, steelDark, 'z', 6).position.x = x - s * 0.06 + dz;
    B(0.04, 0.8, 0.006, x - s * 0.06, 1.0, D / 2 - 0.036, rust);                       // rust run
    B(0.30, 0.10, D + 0.02, x, H - 0.05, 0, rust);                                      // rusted cap
  }
  // ---- top beam: extruded channel along x -------------------------------------------
  const chan = SHAPE([[-0.14, 0.06], [0.14, 0.06], [0.14, -0.06], [0.11, -0.06], [0.11, 0.03], [-0.11, 0.03], [-0.11, -0.06], [-0.14, -0.06]]);   // (world z, world y)
  const beam = MESH(new THREE.ExtrudeGeometry(chan, { depth: W - 0.5, bevelEnabled: false }), steelDark.clone(), g, -(W - 0.5) / 2, H - 0.10, 0);
  beam.material.side = THREE.DoubleSide; beam.material.name = 'metal'; beam.rotation.y = Math.PI / 2;
  for (const x of [-0.8, 0.8]) B(0.06, 0.14, 0.30, x, H - 0.10, 0, rust);              // rust bands on the beam
  // ---- sign board on chains ----------------------------------------------------------
  const bw = 1.90, bh = 0.80, by = 1.30 + bh / 2;
  B(bw, bh, 0.06, 0, by, 0, green);
  B(bw + 0.04, 0.05, 0.07, 0, by + bh / 2, 0, white); B(bw + 0.04, 0.05, 0.07, 0, by - bh / 2, 0, white);
  B(0.05, bh + 0.04, 0.07, -bw / 2, by, 0, white); B(0.05, bh + 0.04, 0.07, bw / 2, by, 0, white);
  B(0.60, 0.30, 0.006, -0.30, by + 0.10, 0.033, greenFade); B(0.25, 0.12, 0.006, 0.55, by - 0.25, 0.033, rust);
  B(bw - 0.1, 0.03, 0.006, 0, by - bh / 2 + 0.06, -0.033, rust);
  for (const x of [-0.75, 0.75]) {
    B(0.06, 0.04, 0.06, x, by + bh / 2 + 0.03, 0, steelDark);
    for (let k = 0; k < 3; k++) { const l = MESH(new THREE.TorusGeometry(0.02, 0.006, 4, 6), steel, g, x, by + bh / 2 + 0.07 + k * 0.035, 0); l.rotation.y = k % 2 ? Math.PI / 2 : 0; }
  }
  // ---- lamps: cans on swing brackets, emissive front discs --------------------------
  g.userData.lights = [];
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - 0.14), y = H + 0.02, z = D / 2 - 0.10;
    CYL(0.015, 0.20, x, H - 0.02, z - 0.04, steelDark, 'y', 5);
    const can = CYL(0.07, 0.16, x, y, z, housing, 'y', 8); can.rotation.x = Math.PI / 2 + 0.5;
    const disc = CYL(0.06, 0.012, x, y - 0.075, z + 0.045, lampMat, 'y', 8); disc.rotation.x = Math.PI / 2 + 0.5;
    g.userData.lights.push({ x, y: y - 0.10, z: z + 0.10, color: 0xe5b055, intensity: 1.0, range: 3.0 });
  }
  // ---- base grating: slats between the columns ------------------------------------------
  B(W - 0.5, 0.03, D - 0.1, 0, 0.015, 0, dark);
  for (let i = 0; i < 9; i++) B(W - 0.5, 0.04, 0.025, 0, 0.05, -0.20 + i * 0.05, i % 3 === 1 ? rust : steel);
  for (const x of [-0.6, 0, 0.6]) B(0.03, 0.05, D - 0.12, x, 0.045, 0, steelDark);

  g.userData.obstacle = { kind: 'roll', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
