/**
 * runner — arm A: primitive assembly (boxes + capsules), skeleton with pivots AT the joints.
 * 1.72 m, slim. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.08, knee 0.48, hip 0.90, hips-root 0.95, spine 1.02,
 * chest 1.20, shoulder 1.42, neck 1.47, head 1.52, crown 1.72.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xe8852a, 'fabric', 0.9);          // hero orange — only this object
  const jacketWorn = M(0xd0752a, 'fabric', 0.92);      // faded / grimy panel of the same orange
  const rib = M(0xc96a24, 'fabric', 0.95);             // ribbed hem, cuffs, collar
  const trouser = M(0x2e2f33, 'fabric', 0.92);
  const stain = M(0x3d352f, 'fabric', 0.95);           // mud band on the trousers
  const strap = M(0x3a3a3c, 'fabric', 0.9);
  const pouch = M(0x4a4b4d, 'fabric', 0.9);
  const buckle = M(0x8a8f94, 'metal', 0.5, 0.3);
  const shoe = M(0xd9d4ca, 'fabric', 0.85);            // dirty white trainer
  const shoeMud = M(0x8b6141, 'fabric', 0.95);         // scuffed toe / mud
  const sole = M(0x110f12, undefined, 0.9);            // grounding band
  const skin = new THREE.MeshStandardMaterial({ color: 0xc9a07a, roughness: 0.8 });
  const hair = M(0x1a1614, 'fabric', 0.85);

  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const CAP = (r, len, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const CYL = (rt, rb, h, x, y, z, mat, parent, seg = 14) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const SPH = (r, x, y, z, mat, parent, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- hips (root joint) ----------------------------------------------------
  const hips = J(0, 0.95, 0, root);
  B(0.30, 0.16, 0.20, 0, -0.04, 0, trouser, hips);              // pelvis
  B(0.31, 0.035, 0.21, 0, 0.045, 0, trouser, hips);             // waistband
  B(0.315, 0.05, 0.215, 0, 0.035, 0, rib, hips);                // jacket hem rib (0.96–1.01)
  B(0.06, 0.03, 0.012, 0, 0.032, 0.11, buckle, hips);           // belt buckle
  B(0.09, 0.09, 0.02, 0, -0.06, -0.10, trouser, hips);          // back pocket
  B(0.09, 0.09, 0.02, 0.10, -0.04, -0.10, trouser, hips);

  // ---- spine ---------------------------------------------------------------
  const spine = J(0, 0.07, 0, hips);                            // world 1.02
  B(0.31, 0.20, 0.21, 0, 0.09, 0, jacket, spine);               // abdomen (jacket)
  B(0.016, 0.20, 0.012, 0, 0.09, 0.108, rib, spine);            // zip, lower run
  // hand pockets, slanted
  for (const s of [-1, 1]) {
    const p = B(0.075, 0.11, 0.014, s * 0.10, 0.08, 0.108, jacketWorn, spine);
    p.rotation.z = s * 0.35;
  }
  B(0.14, 0.05, 0.02, 0, 0.13, -0.108, jacketWorn, spine);      // faded panel on the back

  // ---- chest ---------------------------------------------------------------
  const chest = J(0, 0.18, 0, spine);                           // world 1.20
  B(0.34, 0.24, 0.22, 0, 0.12, 0, jacket, chest);               // rib cage
  B(0.38, 0.06, 0.21, 0, 0.23, 0, jacket, chest);               // yoke  -> top 1.46
  B(0.016, 0.24, 0.012, 0, 0.12, 0.113, rib, chest);            // zip, upper run
  B(0.11, 0.06, 0.012, 0.07, 0.17, 0.113, jacketWorn, chest);   // chest pocket flap
  B(0.34, 0.012, 0.012, 0, 0.21, 0.113, rib, chest);            // chest seam
  // drawstrings
  for (const s of [-1, 1]) B(0.008, 0.12, 0.008, s * 0.035, 0.16, 0.12, rib, chest);
  // collar ring + hood lying on the back
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 12, 1, true), rib);
  collar.material = rib.clone(); collar.material.side = THREE.DoubleSide; collar.material.name = 'fabric';
  collar.position.set(0, 0.275, -0.01); chest.add(collar);
  const hood = SPH(0.11, 0, 0.245, -0.10, jacket, chest, 1.25, 0.7, 0.9);   // bunched hood
  hood.rotation.x = 0.35;
  B(0.22, 0.05, 0.06, 0, 0.215, -0.13, jacketWorn, chest);      // hood fold
  // strap across the chest: from the LEFT shoulder (+X) down to the right hip (-X)
  const st = B(0.05, 0.48, 0.016, 0.03, 0.10, 0.118, strap, chest);
  st.rotation.z = 0.62;
  const bk = B(0.045, 0.06, 0.02, 0.045, 0.12, 0.125, buckle, chest);
  bk.rotation.z = 0.62;
  B(0.05, 0.42, 0.016, -0.03, 0.10, -0.116, strap, chest);      // strap over the back (vertical-ish)
  B(0.10, 0.20, 0.07, 0.14, 0.20, -0.12, pouch, chest);         // pouch at the left shoulder blade
  B(0.09, 0.03, 0.06, 0.14, 0.31, -0.12, buckle, chest);        // pouch clip

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.27, 0, chest);                            // world 1.47
  CYL(0.048, 0.055, 0.09, 0, 0.03, -0.005, skin, neck);
  const head = J(0, 0.05, 0, neck);                             // world 1.52
  SPH(0.098, 0, 0.098, 0, skin, head, 0.92, 1.12, 1.0);         // skull (top 1.73 → recentred)
  B(0.10, 0.08, 0.05, 0, 0.055, 0.06, skin, head);              // jaw / chin
  B(0.03, 0.035, 0.025, 0, 0.09, 0.098, skin, head);            // nose
  for (const s of [-1, 1]) B(0.018, 0.035, 0.02, s * 0.092, 0.10, 0, skin, head);   // ears
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.106, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  cap.position.set(0, 0.10, -0.01); cap.scale.set(0.93, 1.12, 1.02); head.add(cap);
  B(0.16, 0.04, 0.05, 0, 0.145, 0.07, hair, head);              // fringe, swept
  B(0.06, 0.05, 0.03, -0.055, 0.125, 0.085, hair, head);        // parted fringe lock

  // ---- arms ----------------------------------------------------------------
  function arm(side) {
    const sh = J(side * 0.20, 0.22, 0, chest);                  // world 1.42
    sh.rotation.z = side * 0.18;
    SPH(0.064, 0, 0.0, 0, jacket, sh);                          // deltoid
    CAP(0.048, 0.20, 0, -0.15, 0, jacket, sh);                  // upper arm
    if (side > 0) B(0.05, 0.07, 0.012, 0.045, -0.12, 0.02, jacketWorn, sh); // sleeve zip pocket
    if (side < 0) B(0.06, 0.05, 0.01, -0.045, -0.20, 0.0, jacketWorn, sh);  // scuffed sleeve
    const el = J(0, -0.30, 0, sh);                              // world ~1.12
    el.rotation.x = -0.12;
    CAP(0.042, 0.17, 0, -0.12, 0, jacket, el);                  // forearm
    CYL(0.048, 0.046, 0.045, 0, -0.235, 0, rib, el, 10);        // cuff
    B(0.07, 0.085, 0.035, 0, -0.30, 0.005, skin, el);           // hand
    B(0.065, 0.06, 0.03, 0, -0.365, 0.008, skin, el);           // fingers
    B(0.022, 0.05, 0.025, side * -0.04, -0.31, 0.015, skin, el); // thumb
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  // ---- legs ----------------------------------------------------------------
  function leg(side) {
    const hp = J(side * 0.10, -0.05, 0, hips);                  // world 0.90
    CAP(0.072, 0.30, 0, -0.20, 0, trouser, hp);                 // thigh
    B(0.05, 0.10, 0.02, side * 0.05, -0.20, 0.06, stain, hp);   // mud band on the thigh
    const kn = J(0, -0.42, 0, hp);                              // world 0.48
    SPH(0.062, 0, 0, 0, trouser, kn);                           // knee
    CYL(0.06, 0.048, 0.34, 0, -0.19, 0, trouser, kn);           // shin, tapering to the ankle
    B(0.06, 0.12, 0.02, side * -0.03, -0.25, 0.045, stain, kn); // splash stain on the shin
    B(0.10, 0.05, 0.10, 0, -0.375, 0, trouser, kn);             // trouser hem
    const an = J(0, -0.40, 0, kn);                              // world 0.08
    B(0.10, 0.03, 0.28, 0, -0.065, 0.03, sole, an);             // outsole  (0.0–0.03)
    B(0.10, 0.03, 0.28, 0, -0.035, 0.03, shoe, an);             // midsole (0.03–0.06)
    B(0.09, 0.07, 0.20, 0, 0.005, 0.02, shoe, an);              // upper
    B(0.085, 0.05, 0.08, 0, -0.01, 0.13, shoeMud, an);          // scuffed toe cap
    B(0.09, 0.06, 0.04, 0, 0.0, -0.09, shoeMud, an);            // heel counter
    B(0.05, 0.04, 0.10, 0, 0.05, 0.05, shoe, an);               // tongue / laces
    B(0.085, 0.05, 0.08, 0, 0.045, -0.04, shoe, an);            // ankle collar
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
