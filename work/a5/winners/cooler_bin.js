/**
 * cooler_bin — arm B: profiles. The cooler body and lid are ExtrudeGeometry sweeps of a
 * rounded-rectangle Shape (the bevel is subtracted from the drawn profile so the box measures
 * 0.6 × 0.4 × 0.4); the crack is an extruded zigzag Shape; the bucket is one LatheGeometry
 * (floor, tapered wall, rolled rim) with a dent pushed into its vertices; the handle is a
 * TubeGeometry arc. Together 0.98 m wide. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.9, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const foam = M(0xeee2c8, 'plaster', 0.95);
  const foamShade = M(0xd9ccb0, 'plaster', 0.95);
  const scuff = M(0x8a8378, 'plaster', 0.95);
  const steel = M(0x8a8a86, 'metal', 0.55, 0.3, { side: THREE.DoubleSide });
  const steelDark = M(0x5c5c5a, 'metal', 0.6, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const timber = M(0x4f2d21, 'timber', 0.9);
  const dark = M(0x110f12, undefined, 0.6);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  // rounded rectangle w × h (final size, bevel included), extruded to depth (final), axis along z
  const RBOX = (w, h, depth, r, mat, x, y, z, bevel = 0.012) => {
    const hw = w / 2 - bevel, hh = h / 2 - bevel, rr = Math.max(0.001, r - bevel);
    const s = new THREE.Shape();
    s.moveTo(-hw + rr, -hh); s.lineTo(hw - rr, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + rr); s.lineTo(hw, hh - rr);
    s.quadraticCurveTo(hw, hh, hw - rr, hh); s.lineTo(-hw + rr, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - rr); s.lineTo(-hw, -hh + rr); s.quadraticCurveTo(-hw, -hh, -hw + rr, -hh);
    const geo = new THREE.ExtrudeGeometry(s, { depth: depth - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 2 });
    geo.translate(0, 0, -(depth - 2 * bevel) / 2);
    return MESH(geo, mat, g, x, y, z);
  };

  // ---- cooler at x = -0.16: body 0.6 × 0.31 × 0.4 then lid 0.62 × 0.09 × 0.42 ----------
  const cx = -0.16;
  B(0.58, 0.04, 0.38, cx, 0.02, 0, dark);                                     // grounding band
  const body = RBOX(0.60, 0.40, 0.29, 0.03, foam, cx, 0.185, 0); body.rotation.x = Math.PI / 2;   // profile in x/z, swept up y
  const lid = RBOX(0.62, 0.42, 0.09, 0.035, foam, cx, 0.355, 0); lid.rotation.x = Math.PI / 2;
  B(0.60, 0.012, 0.40, cx, 0.31, 0, foamShade);                              // seam
  const recess = RBOX(0.42, 0.28, 0.012, 0.03, foamShade, cx, 0.404, 0); recess.rotation.x = Math.PI / 2;
  // crack: an extruded zigzag ribbon across the lid, 6 mm wide, sunk 2 mm
  const zz = new THREE.Shape(); const pts = [[-0.22, 0.03], [-0.10, 0.0], [0.0, 0.05], [0.09, -0.01], [0.20, 0.02]];
  zz.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) zz.lineTo(pts[i][0], pts[i][1]);
  for (let i = pts.length - 1; i >= 0; i--) zz.lineTo(pts[i][0], pts[i][1] + 0.007); zz.closePath();
  const crack = MESH(new THREE.ExtrudeGeometry(zz, { depth: 0.006, bevelEnabled: false }), dark, g, cx - 0.02, 0.405, 0.02); crack.rotation.x = -Math.PI / 2;
  const crack2 = B(0.012, 0.10, 0.008, cx + 0.16, 0.35, 0.21, dark); crack2.rotation.z = 0.3;   // running down the front of the lid
  for (const s of [-1, 1]) { B(0.02, 0.09, 0.16, cx + s * 0.295, 0.20, 0, dark); B(0.02, 0.03, 0.16, cx + s * 0.302, 0.235, 0, foam); }   // handle slots
  const label = RBOX(0.16, 0.06, 0.012, 0.01, foamShade, cx + 0.10, 0.17, 0.20);   // raised label panel
  B(0.10, 0.05, 0.006, cx - 0.16, 0.10, 0.203, scuff); B(0.05, 0.12, 0.006, cx + 0.22, 0.20, 0.203, scuff);
  B(0.006, 0.08, 0.12, cx - 0.303, 0.14, -0.08, scuff); B(0.07, 0.006, 0.06, cx + 0.14, 0.412, 0.09, scuff);

  // ---- bucket at x = +0.36: one lathe, dented -------------------------------
  const bx = 0.36, br = 0.15, bh = 0.30;
  const prof = [[0.0, 0.012], [0.12, 0.012], [0.125, 0.0], [0.125, 0.03], [0.14, 0.20], [0.142, 0.21], [0.146, 0.27], [0.15, 0.29], [0.158, 0.30], [0.15, 0.31], [0.142, 0.30], [0.14, 0.28], [0.128, 0.03], [0.125, 0.03]];
  const geo = new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), 18);
  // the dent: push vertices on the -x side, mid-height, inward by up to 2 cm
  const P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const d = Math.hypot(x + 0.14, y - 0.15, z - 0.03); if (d < 0.09 && x < -0.08) { const k = (1 - d / 0.09) * 0.02; P.setX(i, x + k); } }
  geo.computeVertexNormals();
  MESH(geo, steel, g, bx, 0, 0);
  MESH(new THREE.CylinderGeometry(0.124, 0.124, 0.03, 12, 1, true), dark, g, bx, 0.015, 0);   // grounding ring
  for (const s of [-1, 1]) B(0.02, 0.03, 0.025, bx + s * (br + 0.005), bh - 0.03, 0, steelDark);
  const arc = new THREE.EllipseCurve(0, 0, br + 0.01, br + 0.01, 0, Math.PI, false);
  const pts3 = arc.getPoints(10).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const handle = MESH(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 10, 0.005, 4, false), steelDark, g, bx, bh - 0.02, 0); handle.rotation.z = -0.35;
  MESH(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6), timber, g, bx - 0.05, bh - 0.02 + (br + 0.01) * Math.cos(0.35) - 0.01, 0).rotation.z = Math.PI / 2;
  B(0.006, 0.10, 0.06, bx + br - 0.001, 0.09, -0.02, rust); B(0.06, 0.03, 0.006, bx - 0.03, 0.26, br - 0.004, rust);

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
