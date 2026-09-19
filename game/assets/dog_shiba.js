/**
 * dog_shiba — the winner (arm B: profiles). Body, neck, head, muzzle, legs and ears are LatheGeometry
 * sweeps (the body and head lathed along their own axis and rotated to lie along z), the tail
 * is a torus arc. 0.55 m at the shoulder, facing +Z. Pivots AT the joints; legs hang down
 * local -Y so +rotation.x swings a leg BACKWARD.
 * Anchors (world m): paw 0, knee 0.24, hip/shoulder 0.42, back 0.53, withers 0.55.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.9, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const fur = M(0xc98a45, 'fabric', 0.95);
  const furDark = M(0xb0743a, 'fabric', 0.95);
  const cream = M(0xe9dcc4, 'fabric', 0.95);
  const mud = M(0x5a4a3c, 'fabric', 0.95);
  const collar = M(0xb8302a, 'fabric', 0.7);
  const buckle = M(0x9a9ea3, 'metal', 0.45, 0.3);
  const dark = M(0x110f12, undefined, 0.6);

  // lathe from [radius, y] pairs swept about Y; profiles must climb +Y to wind outward
  const LATHE = (pts, mat, parent, x, y, z, seg = 12, phiStart = 0, phiLen = Math.PI * 2) => {
    if (pts[pts.length - 1][1] < pts[0][1]) pts = pts.slice().reverse();
    const geo = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg, phiStart, phiLen);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.42, 0, root);
  // body: rump (-0.27) to chest (+0.27) along the lathe axis, then rotated to lie along +z
  const body = LATHE([[0.0, -0.27], [0.08, -0.26], [0.115, -0.18], [0.115, -0.05], [0.12, 0.08],
    [0.135, 0.18], [0.12, 0.25], [0.0, 0.28]], fur, spine, 0, 0.0, 0, 14);
  body.rotation.x = Math.PI / 2; body.scale.set(1.1, 1.0, 0.95);
  // cream underside: a narrower sweep hung lower, chest to belly
  const under = LATHE([[0.0, -0.22], [0.08, -0.2], [0.095, -0.05], [0.105, 0.12], [0.09, 0.22], [0.0, 0.24]], cream, spine, 0, -0.055, 0.02, 12);
  under.rotation.x = Math.PI / 2; under.scale.set(1.0, 1.0, 0.85);
  // darker saddle band: an open half-lathe shell over the top of the barrel, 6 mm proud of it
  const saddle = LATHE([[0.117, -0.11], [0.121, -0.05], [0.126, 0.08], [0.128, 0.13]], furDark, spine, 0, 0.0, 0.0, 12, Math.PI / 2, Math.PI);
  saddle.rotation.x = Math.PI / 2; saddle.scale.set(1.1, 1.0, 0.95);
  B(0.07, 0.05, 0.02, -0.12, -0.02, -0.06, mud, spine);                 // mud smear on the flank

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.05, 0.22, spine);
  const nk = LATHE([[0.0, -0.02], [0.07, 0.0], [0.075, 0.08], [0.065, 0.16], [0.0, 0.18]], fur, neck, 0, 0.0, 0.0, 12);
  nk.rotation.x = -Math.PI / 4;                                          // up and forward
  const ruff = LATHE([[0.0, -0.01], [0.085, 0.0], [0.09, 0.05], [0.0, 0.06]], cream, neck, 0, -0.05, 0.05, 12);
  ruff.rotation.x = -Math.PI / 4;
  const cl = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.013, 6, 14), collar);
  cl.position.set(0, 0.04, 0.05); cl.rotation.x = Math.PI / 4; neck.add(cl);
  B(0.03, 0.028, 0.012, 0.0, 0.0, 0.135, buckle, neck);

  const head = J(0, 0.09, 0.11, neck);
  // skull: egg lathed along its axis, rotated to point +z, brow high, occiput low
  const sk = LATHE([[0.0, -0.09], [0.06, -0.08], [0.085, -0.03], [0.085, 0.03], [0.06, 0.07], [0.0, 0.08]], fur, head, 0, 0.0, 0.0, 12);
  sk.rotation.x = Math.PI / 2; sk.scale.set(1.0, 0.95, 1.0);
  const mz = LATHE([[0.0, 0.0], [0.055, 0.0], [0.045, 0.06], [0.03, 0.10], [0.0, 0.105]], fur, head, 0, -0.005, 0.06, 10);
  mz.rotation.x = Math.PI / 2;                                           // muzzle, tip at +z
  const chin = LATHE([[0.0, 0.0], [0.045, 0.0], [0.035, 0.07], [0.0, 0.08]], cream, head, 0, -0.035, 0.06, 10);
  chin.rotation.x = Math.PI / 2;
  const cheeks = LATHE([[0.0, -0.05], [0.07, -0.04], [0.075, 0.01], [0.0, 0.03]], cream, head, 0, -0.03, 0.05, 12);
  cheeks.rotation.x = Math.PI / 2;
  const nose = LATHE([[0.0, -0.015], [0.018, -0.008], [0.016, 0.012], [0.0, 0.018]], dark, head, 0, 0.015, 0.165, 8);
  nose.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    const eye = LATHE([[0.0, -0.01], [0.012, -0.004], [0.01, 0.008], [0.0, 0.012]], dark, head, s * 0.04, 0.03, 0.075, 8);
    eye.rotation.x = Math.PI / 2;
    const ear = LATHE([[0.0, 0.0], [0.032, 0.0], [0.012, 0.045], [0.0, 0.065]], fur, head, s * 0.05, 0.065, -0.01, 6);
    ear.rotation.z = s * -0.25; ear.rotation.x = -0.15;
    const inner = LATHE([[0.0, 0.0], [0.018, 0.0], [0.006, 0.04], [0.0, 0.05]], cream, head, s * 0.05, 0.075, 0.005, 5);
    inner.rotation.z = s * -0.25; inner.rotation.x = -0.15;
  }

  // ---- tail ----------------------------------------------------------------
  const tail = J(0, 0.08, -0.26, spine);
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.032, 8, 14, 4.6), fur);
  curl.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
  curl.position.set(0, 0.065, 0.0); tail.add(curl);
  const tip = LATHE([[0.0, -0.035], [0.04, -0.02], [0.04, 0.02], [0.0, 0.035]], cream, tail, 0, 0.06, 0.06, 10);
  tip.scale.set(1, 0.8, 1);

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.095, 0.0, z, spine);                              // world y 0.42
    // thigh / shoulder mass and the upper leg in one tapered sweep, hanging -Y
    LATHE([[0.0, 0.07], [front ? 0.06 : 0.078, 0.04], [front ? 0.058 : 0.072, -0.03], [0.045, -0.12], [0.04, -0.18], [0.0, -0.20]], fur, hp, 0, 0, front ? 0 : -0.01, 10);
    const kn = J(0, -0.18, 0, hp);                                         // world y 0.24
    LATHE([[0.0, 0.03], [0.042, 0.02], [0.036, -0.08], [0.03, -0.20], [0.0, -0.215]], cream, kn, 0, 0, 0, 10);
    B(0.05, 0.05, 0.02, 0, -0.14, 0.03, mud, kn);                          // mud splash
    // paw: a squashed lathe dome, pad slab underneath as the grounding band
    const paw = LATHE([[0.0, -0.045], [0.04, -0.045], [0.045, -0.02], [0.035, 0.0], [0.0, 0.005]], cream, kn, 0, -0.195, 0.015, 10);
    paw.scale.set(0.9, 1.0, 1.1);
    B(0.075, 0.02, 0.09, 0, -0.23, 0.015, dark, kn);                       // pad 0–0.02
    return { hp, kn };
  }
  const FL = leg(1, 0.17, true), FR = leg(-1, 0.17, true);
  const BL = leg(1, -0.19, false), BR = leg(-1, -0.19, false);

  g.userData.joints = {
    spine, neck, head, tail,
    fl_hip: FL.hp, fl_knee: FL.kn, fr_hip: FR.hp, fr_knee: FR.kn,
    bl_hip: BL.hp, bl_knee: BL.kn, br_hip: BR.hp, br_knee: BR.kn,
  };
  g.userData.jointHints = {
    legSwingForward: '-rotation.x on any *_hip',
    kneeFlex: '+rotation.x  (paw goes back and up)',
    headNod: '+rotation.x looks down',
    headTurn: 'rotation.y on joints.head',
    tailWag: 'rotation.y on joints.tail',
    left: '+X (fl_/bl_ are on +X)',
  };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
