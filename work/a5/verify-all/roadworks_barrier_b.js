/**
 * roadworks_barrier — arm B: profiles. The bar is an ExtrudeGeometry C-channel section swept along
 * X (open at the back, DoubleSide) with the stripes as extruded parallelogram Shapes on its face,
 * the stands are TubeGeometry legs with lathe wheel-feet, the lamps are LatheGeometry domes on
 * lathe bases. 1.8 m bar on two 1.0 m A-frames, three amber lamps (emissive + userData.lights).
 * Faces +Z. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const steel = M(0x6e6a62, 'metal', 0.6, 0.3);
  const steelDark = M(0x4a4744, 'metal', 0.7, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const yellow = M(0xf8e845, 'metal', 0.8, 0.3);
  const black = M(0x231718, 'metal', 0.85, 0.3, { side: THREE.DoubleSide });
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.4, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const V = (a) => new THREE.Vector3(...a);
  const LINE = (r, a, b, mat, seg = 8) => MESH(new THREE.TubeGeometry(new THREE.LineCurve3(V(a), V(b)), 1, r, seg, false), mat, g, 0, 0, 0);
  const LATHE = (pts, mat, x, y, z, seg = 12) => MESH(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), mat, g, x, y, z);
  const SHAPE = (pts, depth, mat, x, y, z) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    return MESH(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }), mat, g, x, y, z);
  };

  // ---- stands: tube legs, lathe wheel feet, cross tube --------------------
  for (const sx of [-0.70, 0.70]) {
    for (const sz of [-1, 1]) {
      LINE(0.02, [sx, 0.98, 0], [sx, 0.04, sz * 0.32], steel);
      LINE(0.021, [sx, 0.30, sz * 0.23], [sx, 0.06, sz * 0.31], rust);
      const foot = LATHE([[0.0, -0.015], [0.035, -0.015], [0.035, 0.015], [0.0, 0.015]], steelDark, sx, 0.035, sz * 0.33, 10); foot.rotation.z = Math.PI / 2;
      B(0.08, 0.03, 0.10, sx, 0.015, sz * 0.33, dark);
    }
    LINE(0.014, [sx, 0.42, -0.19], [sx, 0.42, 0.19], steel);
    const hinge = LATHE([[0.0, -0.04], [0.035, -0.04], [0.035, 0.04], [0.0, 0.04]], steelDark, sx, 0.95, 0, 10); hinge.rotation.z = Math.PI / 2;
  }
  LINE(0.012, [-0.70, 0.40, 0.19], [0.70, 0.40, 0.19], steel); LINE(0.012, [-0.70, 0.40, -0.19], [0.70, 0.40, -0.19], rust);

  // ---- the bar: a C-channel (profile in y/z) extruded 1.8 along x ----------
  const by = 0.98, BH = 0.16, BD = 0.10;
  // profile drawn with shape.x = -world z, shape.y = world y; rotation.y = +90° sends the extrusion (local z) along world +x
  const ch = SHAPE([[-BD / 2, BH / 2], [BD / 2, BH / 2], [BD / 2, -BH / 2], [BD / 2 - 0.025, -BH / 2], [BD / 2 - 0.025, BH / 2 - 0.03], [-BD / 2 + 0.025, BH / 2 - 0.03], [-BD / 2 + 0.025, -BH / 2], [-BD / 2, -BH / 2]], 1.80, black, -0.90, by, 0);
  ch.rotation.y = Math.PI / 2;
  B(1.78, 0.03, BD - 0.05, 0, by - BH / 2 + 0.015, 0, black);   // web plate along the bottom of the channel
  // stripes: parallelogram shapes 6 mm proud of the face, front and back
  for (const sz of [-1, 1]) {
    for (let i = 0; i < 11; i++) {
      const x0 = -0.84 + i * 0.16;
      const st = SHAPE([[x0, -BH / 2 + 0.005], [x0 + 0.08, -BH / 2 + 0.005], [x0 + 0.08 + 0.10, BH / 2 - 0.005], [x0 + 0.10, BH / 2 - 0.005]], 0.006, yellow, 0, by, sz * (BD / 2));
      if (sz < 0) { st.rotation.y = Math.PI; st.position.z = -BD / 2; }
    }
  }
  B(0.03, BH + 0.02, BD + 0.02, -0.905, by, 0, rust); B(0.03, BH + 0.02, BD + 0.02, 0.905, by, 0, rust);
  B(0.20, 0.10, 0.006, 0.55, by, BD / 2 + 0.008, rust);
  for (const x of [-0.70, 0.70]) B(0.10, BH + 0.03, BD + 0.03, x, by, 0, steelDark);

  // ---- lamps: lathe domes on lathe bases -------------------------------------
  g.userData.lights = [];
  for (const x of [-0.65, 0, 0.65]) {
    const base = by + BH / 2 + 0.015;
    LATHE([[0.0, 0.0], [0.06, 0.0], [0.058, 0.03], [0.05, 0.035], [0.0, 0.035]], steelDark, x, base, 0, 12);
    LATHE([[0.0, 0.0], [0.052, 0.0], [0.055, 0.03], [0.05, 0.06], [0.035, 0.08], [0.0, 0.085]], lampMat, x, base + 0.03, 0, 14);
    LATHE([[0.0, 0.0], [0.02, 0.0], [0.018, 0.012], [0.0, 0.012]], rust, x, base + 0.112, 0, 8);
    g.userData.lights.push({ x, y: base + 0.07, z: 0, color: 0xe5b055, intensity: 1.2, range: 3.0 });
  }
  LINE(0.005, [-0.65, by + BH / 2 + 0.03, 0.05], [0.65, by + BH / 2 + 0.03, 0.05], dark, 4);

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
