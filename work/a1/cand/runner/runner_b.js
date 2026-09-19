/**
 * runner — arm B: profiles. Torso, limbs and head are LatheGeometry sweeps (an elliptical
 * scale on z makes them body-shaped), trainers are an ExtrudeGeometry side profile.
 * 1.72 m, slim. Facing +Z; the figure's LEFT is +X. Pivots AT the joints.
 * Anchors (world m): sole 0, ankle 0.08, knee 0.48, hip 0.90, hips-root 0.95, spine 1.02,
 * chest 1.20, shoulder 1.42, neck 1.47, head 1.52, crown 1.72.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xe8852a, 'fabric', 0.9);
  const jacketWorn = M(0xd0752a, 'fabric', 0.92);
  const rib = M(0xc96a24, 'fabric', 0.95);
  const trouser = M(0x2e2f33, 'fabric', 0.92);
  const stain = M(0x3d352f, 'fabric', 0.95);
  const strap = M(0x3a3a3c, 'fabric', 0.9);
  const pouch = M(0x4a4b4d, 'fabric', 0.9);
  const buckle = M(0x8a8f94, 'metal', 0.5, 0.3);
  const shoe = M(0xd9d4ca, 'fabric', 0.85);
  const shoeMud = M(0x8b6141, 'fabric', 0.95);
  const sole = M(0x110f12, undefined, 0.9);
  const skin = new THREE.MeshStandardMaterial({ color: 0xc9a07a, roughness: 0.8 });
  const hair = M(0x1a1614, 'fabric', 0.85);

  // a lathe from [radius, y] pairs, swept about Y, optionally squashed on z
  // a lathe winds outward only when the profile climbs +Y, so descending profiles are reversed
  const LATHE = (pts, mat, parent, x, y, z, sz = 1, seg = 30) => {
    if (pts[pts.length - 1][1] < pts[0][1]) pts = pts.slice().reverse();
    const geo = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.scale.set(1, 1, sz); parent.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- hips ----------------------------------------------------------------
  const hips = J(0, 0.95, 0, root);
  // pelvis: a lathe from the crotch up to the waist, elliptical
  LATHE([[0.06, -0.12], [0.15, -0.09], [0.165, -0.02], [0.16, 0.05], [0.155, 0.07]], trouser, hips, 0, 0, 0, 0.68);
  LATHE([[0.0, 0.01], [0.168, 0.01], [0.172, 0.06], [0.0, 0.06]], rib, hips, 0, 0, 0, 0.7);   // hem rib
  B(0.06, 0.03, 0.012, 0, 0.03, 0.115, buckle, hips);
  B(0.09, 0.08, 0.02, 0.09, -0.05, -0.105, trouser, hips);                                      // back pocket
  B(0.09, 0.08, 0.02, -0.09, -0.05, -0.105, trouser, hips);

  // ---- spine (abdomen) -----------------------------------------------------
  const spine = J(0, 0.07, 0, hips);                                                            // world 1.02
  LATHE([[0.15, -0.01], [0.155, 0.06], [0.16, 0.14], [0.17, 0.19]], jacket, spine, 0, 0, 0, 0.68);
  B(0.016, 0.19, 0.012, 0, 0.09, 0.106, rib, spine);                                            // zip
  for (const s of [-1, 1]) { const p = B(0.07, 0.11, 0.014, s * 0.10, 0.08, 0.104, jacketWorn, spine); p.rotation.z = s * 0.35; }
  B(0.16, 0.06, 0.02, -0.02, 0.10, -0.104, jacketWorn, spine);                                  // grime panel

  // ---- chest ---------------------------------------------------------------
  const chest = J(0, 0.18, 0, spine);                                                           // world 1.20
  LATHE([[0.17, 0.0], [0.18, 0.10], [0.19, 0.19], [0.20, 0.235], [0.16, 0.26], [0.0, 0.265]], jacket, chest, 0, 0, 0, 0.62);
  B(0.016, 0.23, 0.012, 0, 0.115, 0.115, rib, chest);                                           // zip
  B(0.11, 0.06, 0.012, 0.07, 0.17, 0.114, jacketWorn, chest);                                   // chest pocket
  for (const s of [-1, 1]) B(0.008, 0.12, 0.008, s * 0.035, 0.16, 0.122, rib, chest);           // drawstrings
  // collar (open lathe) and hood, a lathe shell tipped back onto the shoulders
  const col = LATHE([[0.075, 0.25], [0.085, 0.30]], rib, chest, 0, 0, -0.01, 0.9, 12);
  col.material = rib.clone(); col.material.side = THREE.DoubleSide; col.material.name = 'fabric';
  const hood = LATHE([[0.0, 0.0], [0.10, 0.02], [0.13, 0.06], [0.12, 0.10], [0.0, 0.12]], jacket, chest, 0, 0.22, -0.11, 0.75, 20);
  hood.rotation.x = 0.55;
  B(0.20, 0.04, 0.05, 0, 0.215, -0.135, jacketWorn, chest);                                     // fold of the hood
  // strap: LEFT shoulder to right hip, buckle and a pouch on the back
  const st = B(0.05, 0.50, 0.016, 0.03, 0.10, 0.12, strap, chest); st.rotation.z = 0.62;
  const bk = B(0.045, 0.06, 0.02, 0.045, 0.12, 0.128, buckle, chest); bk.rotation.z = 0.62;
  B(0.05, 0.40, 0.016, -0.03, 0.10, -0.116, strap, chest);
  B(0.10, 0.20, 0.07, 0.14, 0.20, -0.12, pouch, chest);
  B(0.09, 0.03, 0.06, 0.14, 0.31, -0.12, buckle, chest);

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.27, 0, chest);                                                            // world 1.47
  LATHE([[0.05, 0.0], [0.05, 0.07], [0.055, 0.09]], skin, neck, 0, -0.01, -0.005, 1, 18);
  const head = J(0, 0.05, 0, neck);                                                             // world 1.52
  // egg profile: chin at 0, crown at 0.205
  LATHE([[0.0, 0.0], [0.05, 0.01], [0.075, 0.05], [0.09, 0.10], [0.095, 0.15], [0.07, 0.19], [0.0, 0.205]], skin, head, 0, 0, 0, 1.05, 22);
  B(0.03, 0.035, 0.025, 0, 0.09, 0.095, skin, head);                                            // nose
  for (const s of [-1, 1]) B(0.018, 0.035, 0.02, s * 0.092, 0.10, 0, skin, head);
  // hair: a lathe cap over the crown, and a swept fringe
  LATHE([[0.0, 0.205], [0.07, 0.20], [0.10, 0.16], [0.10, 0.11], [0.09, 0.09], [0.0, 0.09]], hair, head, 0, 0.005, -0.01, 1.08, 22);
  B(0.16, 0.04, 0.05, 0, 0.145, 0.07, hair, head);
  B(0.06, 0.05, 0.03, -0.055, 0.125, 0.085, hair, head);

  // ---- arms ----------------------------------------------------------------
  function arm(side) {
    const sh = J(side * 0.20, 0.22, 0, chest);                                                  // world 1.42
    sh.rotation.z = side * 0.18;
    // deltoid + upper arm as one tapered sweep, hanging down -Y
    LATHE([[0.0, 0.06], [0.06, 0.04], [0.065, 0.0], [0.055, -0.15], [0.048, -0.29], [0.0, -0.31]], jacket, sh, 0, 0, 0, 1, 24);
    if (side > 0) B(0.05, 0.07, 0.012, 0.045, -0.12, 0.02, jacketWorn, sh);
    if (side < 0) B(0.06, 0.05, 0.01, -0.045, -0.20, 0.0, jacketWorn, sh);
    const el = J(0, -0.30, 0, sh);
    el.rotation.x = -0.12;
    LATHE([[0.0, 0.02], [0.045, 0.0], [0.048, -0.08], [0.04, -0.21], [0.0, -0.23]], jacket, el, 0, 0, 0, 1, 24);
    LATHE([[0.0, -0.20], [0.047, -0.20], [0.047, -0.25], [0.0, -0.25]], rib, el, 0, 0, 0, 1, 18);   // cuff
    B(0.07, 0.085, 0.035, 0, -0.30, 0.005, skin, el);
    B(0.065, 0.06, 0.03, 0, -0.365, 0.008, skin, el);
    B(0.022, 0.05, 0.025, side * -0.04, -0.31, 0.015, skin, el);
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  // ---- legs ----------------------------------------------------------------
  // trainer side profile in (z, y): heel at the back, rocker toe at the front
  const shoeShape = new THREE.Shape();
  shoeShape.moveTo(-0.10, 0.0); shoeShape.lineTo(0.15, 0.0);
  shoeShape.quadraticCurveTo(0.185, 0.0, 0.18, 0.04);
  shoeShape.quadraticCurveTo(0.16, 0.085, 0.09, 0.09);
  shoeShape.lineTo(0.03, 0.11); shoeShape.lineTo(-0.05, 0.12);
  shoeShape.quadraticCurveTo(-0.11, 0.11, -0.10, 0.0);
  const shoeGeo = new THREE.ExtrudeGeometry(shoeShape, { depth: 0.095, bevelEnabled: false, curveSegments: 7 });
  shoeGeo.rotateY(-Math.PI / 2);                                      // shape x -> world z (toe at +z), extruded along -x
  shoeGeo.translate(0.0475, 0, 0);

  function leg(side) {
    const hp = J(side * 0.10, -0.05, 0, hips);                                                  // world 0.90
    LATHE([[0.0, 0.05], [0.07, 0.03], [0.078, -0.05], [0.07, -0.25], [0.062, -0.40], [0.0, -0.43]], trouser, hp, 0, 0, 0, 1, 24);
    B(0.05, 0.10, 0.02, side * 0.05, -0.20, 0.065, stain, hp);
    const kn = J(0, -0.42, 0, hp);                                                              // world 0.48
    LATHE([[0.0, 0.03], [0.058, 0.0], [0.062, -0.10], [0.052, -0.25], [0.046, -0.37], [0.0, -0.40]], trouser, kn, 0, 0, 0, 1, 24);
    B(0.06, 0.12, 0.02, side * -0.03, -0.25, 0.045, stain, kn);
    LATHE([[0.0, -0.40], [0.05, -0.40], [0.052, -0.345], [0.0, -0.345]], trouser, kn, 0, 0, 0, 1, 18);   // hem
    const an = J(0, -0.40, 0, kn);                                                              // world 0.08
    const s = new THREE.Mesh(shoeGeo, shoe); s.position.set(0, -0.05, 0.0); an.add(s);         // upper+sole profile
    B(0.10, 0.03, 0.27, 0, -0.065, 0.03, sole, an);                                             // outsole grounding band
    B(0.085, 0.045, 0.07, 0, -0.025, 0.14, shoeMud, an);                                        // scuffed toe
    B(0.10, 0.06, 0.03, 0, 0.0, -0.10, shoeMud, an);                                            // heel counter
    B(0.05, 0.03, 0.09, 0, 0.055, 0.05, shoe, an);                                              // laces
    return { hp, kn, an };
  }
  const LL = leg(1), RL = leg(-1);

  g.userData.joints = {
    hips, spine, chest, neck, head,
    l_shoulder: L.sh, l_elbow: L.el, r_shoulder: R.sh, r_elbow: R.el,
    l_hip: LL.hp, l_knee: LL.kn, l_ankle: LL.an, r_hip: RL.hp, r_knee: RL.kn, r_ankle: RL.an,
  };
  g.userData.jointHints = {
    kneeFlex: '+rotation.x  (heel goes back and up)',
    hipSwingForward: '-rotation.x',
    elbowFlex: '-rotation.x  (forearm comes forward)',
    shoulderSwingForward: '-rotation.x',
    shoulderRaiseOut: 'left +rotation.z, right -rotation.z',
    ankleToeDown: '-rotation.x',
    headTurn: 'rotation.y on joints.head',
    left: '+X',
  };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
