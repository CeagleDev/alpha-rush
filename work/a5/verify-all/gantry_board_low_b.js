/**
 * gantry_board_low — arm B: profiles. Columns are lattice towers of TubeGeometry members (four
 * corner tubes, horizontal rungs, zig-zag diagonals) with a corrugated skin as an ExtrudeGeometry
 * of a zigzag profile; the sign board is an ExtrudeGeometry rounded-rect (bevel accounted) with a
 * white border extruded as a frame Shape with a hole; the lamps are LatheGeometry cone shades
 * (open, DoubleSide) with lathe lenses. Plain green board (no text), bottom edge at 1.3 m, 2.6 m
 * wide, ≤ 0.6 deep. Faces +Z. userData.obstacle = {kind:'roll', lanes:1}.
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
  const tin = M(0x8b6141, 'metal', 0.85, 0.3, { side: THREE.DoubleSide });
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const green = M(0x2f6b3a, 'metal', 0.8, 0.2);
  const greenFade = M(0x3f7a48, 'metal', 0.85, 0.2);
  const white = M(0xd9d4c4, 'metal', 0.8, 0.2);
  const housing = M(0xb85a2a, 'metal', 0.7, 0.3, { side: THREE.DoubleSide });
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.2, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const V = (a) => new THREE.Vector3(...a);
  const LINE = (r, a, b, mat, seg = 6) => MESH(new THREE.TubeGeometry(new THREE.LineCurve3(V(a), V(b)), 1, r, seg, false), mat, g, 0, 0, 0);
  const LATHE = (pts, mat, x, y, z, seg = 12) => MESH(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), mat, g, x, y, z);
  const EXT = (shape, depth, mat, x, y, z, opts = {}) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, ...opts }); geo.translate(0, 0, -depth / 2); return MESH(geo, mat, g, x, y, z); };

  const W = 2.60, H = 2.30, D = 0.56, cw = 0.22;
  // ---- lattice columns --------------------------------------------------------
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - cw / 2);
    B(cw + 0.02, 0.06, D, x, 0.03, 0, dark);
    B(cw + 0.06, 0.04, D + 0.02, x, 0.08, 0, steelDark);                                       // base plate
    const corners = [[x - cw / 2 + 0.02, D / 2 - 0.02], [x + cw / 2 - 0.02, D / 2 - 0.02], [x - cw / 2 + 0.02, -D / 2 + 0.02], [x + cw / 2 - 0.02, -D / 2 + 0.02]];
    for (const [cx, cz] of corners) LINE(0.02, [cx, 0.10, cz], [cx, H - 0.08, cz], steel);
    for (let i = 0; i <= 5; i++) { const y = 0.30 + i * 0.36;
      LINE(0.01, [corners[0][0], y, corners[0][1]], [corners[1][0], y, corners[1][1]], steelDark);
      LINE(0.01, [corners[2][0], y, corners[2][1]], [corners[3][0], y, corners[3][1]], steelDark);
      LINE(0.01, [corners[0][0], y, corners[0][1]], [corners[2][0], y, corners[2][1]], steelDark);
      LINE(0.01, [corners[1][0], y, corners[1][1]], [corners[3][0], y, corners[3][1]], steelDark);
      if (i < 5) { const y2 = y + 0.36, f = i % 2 ? 1 : -1;
        LINE(0.008, [corners[f > 0 ? 0 : 2][0], y, corners[f > 0 ? 0 : 2][1]], [corners[f > 0 ? 2 : 0][0], y2, corners[f > 0 ? 2 : 0][1]], steel, 4);   // outer-face diagonal (in z)
        LINE(0.008, [corners[f > 0 ? 1 : 3][0], y, corners[f > 0 ? 1 : 3][1]], [corners[f > 0 ? 3 : 1][0], y2, corners[f > 0 ? 3 : 1][1]], steel, 4); }
    }
    // corrugated tin skin on the outer face and part of the front: zigzag profile extruded vertically
    const zig = new THREE.Shape(); zig.moveTo(-cw / 2, 0); for (let k = 0; k <= 8; k++) zig.lineTo(-cw / 2 + k * (cw / 8), k % 2 ? 0.015 : 0); zig.lineTo(cw / 2, 0.03); zig.lineTo(-cw / 2, 0.03); zig.closePath();
    const skinF = EXT(zig, 1.6, tin, x, 1.15, D / 2 + 0.01); skinF.rotation.x = -Math.PI / 2;                   // front skin, 1.6 tall, torn short
    const skinO = EXT(zig, 1.9, tin, x + s * (cw / 2 + 0.015), 1.10, 0); skinO.rotation.set(-Math.PI / 2, 0, s * Math.PI / 2);   // outer skin
    B(0.05, 0.7, 0.006, x - s * 0.04, 1.2, D / 2 + 0.05, rust);                                                  // rust run
    B(cw + 0.04, 0.08, D + 0.04, x, H - 0.04, 0, rust);                                                           // rusted cap
  }
  // ---- top beam: two pipes and a channel between ----------------------------------
  for (const z of [-0.18, 0.18]) { LINE(0.035, [-W / 2 + 0.1, H - 0.05, z], [W / 2 - 0.1, H - 0.05, z], steel, 12); for (const x of [-0.6, 0.6]) LINE(0.045, [x - 0.03, H - 0.05, z], [x + 0.03, H - 0.05, z], rust, 12); }
  B(W - 0.4, 0.05, 0.06, 0, H - 0.05, 0, steelDark);
  // ---- sign board: rounded-rect extrude, white frame with a hole ------------------------
  const bw = 1.90, bh = 0.80, by = 1.30 + bh / 2, bev = 0.01;
  const rr = (w, h, r) => { const s = new THREE.Shape(); const hw = w / 2, hh = h / 2; s.moveTo(-hw + r, -hh); s.lineTo(hw - r, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + r); s.lineTo(hw, hh - r); s.quadraticCurveTo(hw, hh, hw - r, hh); s.lineTo(-hw + r, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - r); s.lineTo(-hw, -hh + r); s.quadraticCurveTo(-hw, -hh, -hw + r, -hh); return s; };
  const board = new THREE.ExtrudeGeometry(rr(bw - 2 * bev, bh - 2 * bev, 0.03), { depth: 0.04 - 2 * bev, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 3 });
  board.translate(0, 0, -(0.04 - 2 * bev) / 2); MESH(board, green, g, 0, by, 0);
  const frame = rr(bw + 0.03, bh + 0.03, 0.04); frame.holes.push(rr(bw - 0.05, bh - 0.05, 0.02));
  EXT(frame, 0.05, white, 0, by, 0, { curveSegments: 3 });
  B(0.60, 0.30, 0.006, -0.30, by + 0.10, 0.023, greenFade); B(0.25, 0.12, 0.006, 0.55, by - 0.25, 0.023, rust); B(bw - 0.1, 0.03, 0.006, 0, by - bh / 2 + 0.06, -0.023, rust);
  for (const x of [-0.7, 0.7]) { LINE(0.012, [x, by + bh / 2, 0], [x, H - 0.05, 0], steel); B(0.06, 0.04, 0.06, x, by + bh / 2 + 0.02, 0, steelDark); }
  // ---- lamps: lathe cone shades + lenses ---------------------------------------------
  g.userData.lights = [];
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - 0.12), y = H + 0.02, z = D / 2 - 0.06;
    LINE(0.015, [x, H - 0.08, z - 0.06], [x, y + 0.06, z], steelDark);
    const shade = LATHE([[0.0, 0.0], [0.05, 0.0], [0.11, -0.10], [0.115, -0.11], [0.0, -0.11]], housing, x, y + 0.06, z, 12);
    shade.rotation.x = -0.5;
    const lens = LATHE([[0.0, 0.0], [0.07, 0.0], [0.05, 0.04], [0.0, 0.05]], lampMat, x, y - 0.03, z + 0.05, 10); lens.rotation.x = Math.PI - 0.5;
    g.userData.lights.push({ x, y: y - 0.06, z: z + 0.10, color: 0xe5b055, intensity: 1.0, range: 3.0 });
  }
  // ---- base sill ------------------------------------------------------------------------
  B(W - 2 * cw, 0.03, D - 0.1, 0, 0.015, 0, dark);
  for (const z of [-0.14, 0.0, 0.14]) LINE(0.03, [-W / 2 + cw, 0.06, z], [W / 2 - cw, 0.06, z], z === 0 ? rust : steel, 10);

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
