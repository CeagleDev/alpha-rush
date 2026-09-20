/**
 * concrete_divider — arm B: profiles. The jersey cross-section (base, kick-step, sloped shoulders,
 * crown) is one Shape extruded along X in three segments: two short end segments whose profile is
 * cut down at one top corner (the chips) and the long middle. The yellow strip is a thin extruded
 * strip, reflectors are lathe lenses on lathe bezels, cracks are extruded thin polylines.
 * 1.8 (X) × 0.5 (Z) × 1.0 m. userData.obstacle = {kind:'block', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.92, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const conc = M(0x8a8378, 'stone', 0.95);
  const concShade = M(0x6b665d, 'stone', 0.95);
  const concDark = M(0x4a4a4c, 'stone', 0.95);
  const yellow = M(0xb9a24a, 'stone', 0.9);
  const steel = M(0x6e6a62, 'metal', 0.6, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const reflMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xd8ae70, emissiveIntensity: 1.8, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  // profile in (shape.x = world z, shape.y = world y), extruded along local z; rotation.y = -90° sends local z to world -x
  const PROFILE = (pts, len, mat, x0) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    const m = MESH(new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }), mat, g, x0, 0, 0);
    m.rotation.y = -Math.PI / 2;   // local z → world -x, local x → world +z
    return m;
  };
  // jersey profile: half-width at each height. Full profile symmetric in z.
  const jersey = (topCutL = 0, topCutR = 0) => [
    [-0.25, 0.06], [0.25, 0.06], [0.25, 0.26], [0.22, 0.32], [0.22, 0.38], [0.13, 0.92], [0.11 - topCutR, 1.0 - topCutR * 0.6], [-0.11 + topCutL, 1.0 - topCutL * 0.6], [-0.13, 0.92], [-0.22, 0.38], [-0.22, 0.32], [-0.25, 0.26]];
  B(1.80, 0.06, 0.50, 0, 0.03, 0, dark);                                       // grounding band
  PROFILE(jersey(0, 0), 1.50, conc, 0.75);                                    // middle, x 0.75 → -0.75
  PROFILE(jersey(0.06, 0), 0.15, concDark, 0.90);                             // +x end, chipped on the -z corner
  PROFILE(jersey(0, 0.05), 0.15, concDark, -0.75);                            // -x end, chipped on the +z corner
  // base stain band: a darker profile skin over the plinth
  PROFILE([[-0.252, 0.06], [0.252, 0.06], [0.252, 0.26], [-0.252, 0.26]], 1.80, concShade, 0.90);
  // faded yellow strip along the crown, worn through in one place
  B(1.70, 0.012, 0.16, 0, 1.003, 0, yellow); B(0.30, 0.014, 0.10, 0.40, 1.004, 0.02, concShade);
  // cracks: thin extruded polylines on the front face, following the slope
  const crack = (pts, x, y, z, rot) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][0], pts[i][1] + 0.008); s.closePath();
    const m = MESH(new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: false }), concDark, g, x, y, z); m.rotation.x = rot; return m; };
  crack([[-0.30, 0.0], [-0.15, 0.06], [0.0, 0.03], [0.12, 0.10], [0.25, 0.08]], -0.10, 0.50, 0.195, -0.165);
  crack([[-0.10, 0.0], [0.0, -0.05], [0.10, -0.02]], 0.55, 0.80, 0.147, -0.165);
  B(0.50, 0.10, 0.006, 0.30, 0.30, 0.224, concDark);                          // tyre scuff band on the kick-step
  B(0.006, 0.30, 0.20, -0.903, 0.55, 0.05, concShade);                        // end stain
  // reflectors
  g.userData.lights = [];
  const LATHE = (pts, mat, x, y, z, seg = 12) => MESH(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), mat, g, x, y, z);
  for (const s of [-1, 1]) for (const x of [-0.65, 0.65]) {
    const z = s * (0.20 + 0.03);
    const bez = LATHE([[0.0, 0.0], [0.05, 0.0], [0.048, 0.012], [0.04, 0.014], [0.0, 0.014]], steel, x, 0.78, z, 12); bez.rotation.x = s * Math.PI / 2;
    const lens = LATHE([[0.0, 0.0], [0.036, 0.0], [0.03, 0.02], [0.015, 0.03], [0.0, 0.032]], reflMat, x, 0.78, z + s * 0.01, 12); lens.rotation.x = s * Math.PI / 2;
    const bez2 = LATHE([[0.0, 0.0], [0.028, 0.0], [0.022, 0.01], [0.0, 0.01]], steel, x, 0.66, z - s * 0.006, 10); bez2.rotation.x = s * Math.PI / 2;
    const lens2 = LATHE([[0.0, 0.0], [0.02, 0.0], [0.014, 0.014], [0.0, 0.016]], reflMat, x, 0.66, z + s * 0.002, 10); lens2.rotation.x = s * Math.PI / 2;
    g.userData.lights.push({ x, y: 0.78, z: z + s * 0.05, color: 0xd8ae70, intensity: 0.25, range: 0.8 });
  }

  g.userData.obstacle = { kind: 'block', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
