/**
 * runner — arm C: a different part breakdown. The jacket is an ExtrudeGeometry of a rounded
 * torso cross-section swept up Y in three stacked pieces (hem, body, chest), the hood is a
 * half-torus draped on the back, limbs are tapered cylinders with visible sphere joints, the
 * head is a rounded box. Arms slightly bent at the elbow, ready to run.
 * 1.72 m, slim. Facing +Z; LEFT is +X. Pivots AT the joints.
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

  // rounded-rectangle cross-section (w × d, corner r) extruded h up Y, base at y=0 of the mesh
  const RR = (w, d, r, h, mat, parent, x, y, z) => {
    const s = new THREE.Shape();
    const hw = w / 2, hd = d / 2;
    s.moveTo(-hw + r, -hd);
    s.lineTo(hw - r, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r);
    s.lineTo(hw, hd - r); s.quadraticCurveTo(hw, hd, hw - r, hd);
    s.lineTo(-hw + r, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r);
    s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
    const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);                                   // extrude along +Y; shape y -> world -z
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const CYL = (rt, rb, h, x, y, z, mat, parent, seg = 16) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const SPH = (r, x, y, z, mat, parent, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- hips ----------------------------------------------------------------
  const hips = J(0, 0.95, 0, root);
  RR(0.30, 0.20, 0.06, 0.17, trouser, hips, 0, -0.13, 0);       // pelvis 0.82–0.99
  RR(0.32, 0.22, 0.06, 0.05, rib, hips, 0, 0.01, 0);            // jacket hem rib 0.96–1.01
  B(0.06, 0.03, 0.012, 0, 0.035, 0.115, buckle, hips);
  for (const s of [-1, 1]) B(0.09, 0.08, 0.02, s * 0.09, -0.06, -0.105, trouser, hips);

  // ---- spine ---------------------------------------------------------------
  const spine = J(0, 0.07, 0, hips);                            // world 1.02
  RR(0.31, 0.21, 0.06, 0.19, jacket, spine, 0, -0.01, 0);       // abdomen 1.01–1.20
  B(0.016, 0.19, 0.012, 0, 0.085, 0.108, rib, spine);
  for (const s of [-1, 1]) { const p = B(0.07, 0.11, 0.014, s * 0.10, 0.08, 0.108, jacketWorn, spine); p.rotation.z = s * 0.35; }
  B(0.18, 0.07, 0.02, 0.02, 0.10, -0.108, jacketWorn, spine);

  // ---- chest ---------------------------------------------------------------
  const chest = J(0, 0.18, 0, spine);                           // world 1.20
  RR(0.35, 0.225, 0.07, 0.25, jacket, chest, 0, 0.0, 0);        // rib cage 1.20–1.45
  RR(0.40, 0.20, 0.08, 0.05, jacket, chest, 0, 0.20, 0);        // shoulder yoke 1.40–1.45
  B(0.016, 0.24, 0.012, 0, 0.12, 0.117, rib, chest);
  B(0.11, 0.06, 0.012, 0.07, 0.17, 0.117, jacketWorn, chest);
  for (const s of [-1, 1]) B(0.008, 0.12, 0.008, s * 0.035, 0.16, 0.124, rib, chest);
  // hood: a half torus draped over the shoulders behind the neck
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.045, 8, 12, Math.PI), jacket);
  hood.position.set(0, 0.23, -0.10); hood.rotation.set(0.5, 0, 0); chest.add(hood);
  const hoodBack = SPH(0.08, 0, 0.20, -0.15, jacket, chest, 1.4, 0.55, 0.8);
  hoodBack.rotation.x = 0.3;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.05, 12, 1, true), rib);
  collar.material = rib.clone(); collar.material.side = THREE.DoubleSide; collar.material.name = 'fabric';
  collar.position.set(0, 0.275, -0.01); chest.add(collar);
  // chest strap LEFT shoulder → right hip, buckle mid-chest, pouch at the left shoulder blade
  const st = B(0.05, 0.50, 0.016, 0.03, 0.10, 0.122, strap, chest); st.rotation.z = 0.62;
  const bk = B(0.045, 0.06, 0.02, 0.045, 0.12, 0.13, buckle, chest); bk.rotation.z = 0.62;
  B(0.05, 0.40, 0.016, -0.03, 0.10, -0.118, strap, chest);
  const roll = CYL(0.04, 0.04, 0.20, 0.14, 0.20, -0.13, pouch, chest, 10);  // rolled pouch
  roll.rotation.z = 0.1;
  B(0.09, 0.03, 0.06, 0.14, 0.31, -0.13, buckle, chest);

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.27, 0, chest);                            // world 1.47
  CYL(0.048, 0.055, 0.09, 0, 0.03, -0.005, skin, neck, 10);
  const head = J(0, 0.05, 0, neck);                             // world 1.52
  B(0.15, 0.20, 0.17, 0, 0.10, 0, skin, head);                  // rounded by the loader's chamfer
  SPH(0.085, 0, 0.15, -0.01, skin, head, 1.05, 0.85, 1.1);      // crown
  B(0.03, 0.035, 0.025, 0, 0.09, 0.095, skin, head);
  for (const s of [-1, 1]) B(0.018, 0.035, 0.02, s * 0.083, 0.10, 0, skin, head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
  cap.position.set(0, 0.115, -0.01); cap.scale.set(0.95, 1.05, 1.05); head.add(cap);
  B(0.17, 0.04, 0.05, 0, 0.15, 0.07, hair, head);
  B(0.06, 0.05, 0.03, -0.055, 0.13, 0.085, hair, head);
  B(0.17, 0.10, 0.03, 0, 0.12, -0.09, hair, head);              // back of the hair

  // ---- arms ----------------------------------------------------------------
  function arm(side) {
    const sh = J(side * 0.205, 0.22, 0, chest);
    sh.rotation.z = side * 0.20;
    SPH(0.062, 0, 0.0, 0, jacket, sh);
    CYL(0.055, 0.046, 0.28, 0, -0.15, 0, jacket, sh);           // upper arm
    if (side > 0) B(0.05, 0.07, 0.012, 0.05, -0.12, 0.02, jacketWorn, sh);
    if (side < 0) B(0.06, 0.05, 0.01, -0.05, -0.20, 0.0, jacketWorn, sh);
    const el = J(0, -0.30, 0, sh);
    el.rotation.x = -0.30;                                       // a readier bend than A/B
    SPH(0.048, 0, 0, 0, jacket, el);                            // elbow
    CYL(0.045, 0.038, 0.20, 0, -0.11, 0, jacket, el);           // forearm
    CYL(0.045, 0.043, 0.045, 0, -0.23, 0, rib, el, 10);         // cuff
    B(0.07, 0.085, 0.035, 0, -0.295, 0.005, skin, el);
    B(0.065, 0.06, 0.03, 0, -0.36, 0.008, skin, el);
    B(0.022, 0.05, 0.025, side * -0.04, -0.305, 0.015, skin, el);
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  // ---- legs ----------------------------------------------------------------
  function leg(side) {
    const hp = J(side * 0.10, -0.05, 0, hips);                  // world 0.90
    SPH(0.075, 0, 0.0, 0, trouser, hp);
    CYL(0.075, 0.062, 0.40, 0, -0.21, 0, trouser, hp);          // thigh
    B(0.05, 0.10, 0.02, side * 0.05, -0.20, 0.068, stain, hp);
    const kn = J(0, -0.42, 0, hp);                              // world 0.48
    SPH(0.06, 0, 0, 0, trouser, kn);
    CYL(0.06, 0.047, 0.36, 0, -0.19, 0, trouser, kn);           // shin
    B(0.06, 0.12, 0.02, side * -0.03, -0.25, 0.048, stain, kn);
    CYL(0.052, 0.052, 0.05, 0, -0.375, 0, trouser, kn, 10);     // hem
    const an = J(0, -0.40, 0, kn);                              // world 0.08
    B(0.10, 0.03, 0.27, 0, -0.065, 0.035, sole, an);            // outsole 0–0.03
    B(0.10, 0.03, 0.27, 0, -0.035, 0.035, shoe, an);            // midsole
    B(0.09, 0.07, 0.19, 0, 0.005, 0.02, shoe, an);              // upper
    const toe = CYL(0.045, 0.045, 0.085, 0, -0.005, 0.135, shoeMud, an, 10);  // rounded toe
    toe.rotation.z = Math.PI / 2; toe.scale.set(1, 1, 0.9);
    B(0.09, 0.06, 0.04, 0, 0.0, -0.095, shoeMud, an);
    B(0.05, 0.04, 0.10, 0, 0.05, 0.05, shoe, an);
    B(0.085, 0.05, 0.08, 0, 0.045, -0.04, shoe, an);
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
