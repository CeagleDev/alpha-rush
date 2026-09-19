/**
 * dog_mutt — arm B: lathe profiles. Body, neck, skull, muzzle, legs and paws are LatheGeometry
 * sweeps (body and skull lathed along their own axis and rotated to lie along z); the tail is a
 * tapered lathe pitched back; the rope collar is a torus. Lean dark-brown mongrel 0.60 m at the
 * shoulder, black muzzle/ears, tan legs, one ear folded. Faces +Z. Pivots AT the joints; legs hang
 * down local -Y so +rotation.x swings a leg BACKWARD.
 * Anchors (world m): paw 0, knee 0.25, hip/shoulder 0.46, back 0.59, head top ~0.72.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.92, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const fur = M(0x3a2a22, 'fabric');
  const furLight = M(0x4a372c, 'fabric');
  const tan = M(0x8b6141, 'fabric');
  const black = M(0x1a1512, 'fabric');
  const rope = M(0xbfa77a, 'fabric', 0.98);
  const dark = M(0x110f12, undefined, 0.6);

  const LATHE = (pts, mat, parent, x, y, z, seg = 12, phiStart = 0, phiLen = Math.PI * 2) => {
    if (pts[pts.length - 1][1] < pts[0][1]) pts = pts.slice().reverse();
    const geo = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg, phiStart, phiLen);
    const m = new THREE.Mesh(geo, mat); if (phiLen < Math.PI * 2) { m.material = mat.clone(); m.material.side = THREE.DoubleSide; m.material.name = mat.name; }
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.46, 0, root);
  // lean barrel: deep chest at +z, tucked loin at -z; rump -0.32 to chest +0.26
  const body = LATHE([[0.0, -0.32], [0.07, -0.31], [0.095, -0.22], [0.09, -0.10], [0.10, 0.02], [0.115, 0.14], [0.105, 0.23], [0.0, 0.27]], fur, spine, 0, 0.03, 0, 14);
  body.rotation.x = Math.PI / 2; body.scale.set(0.9, 1.15, 1.0);
  // ribcage / keel: a narrower sweep hung lower under the chest, giving the tuck-up from the side
  const keel = LATHE([[0.0, -0.06], [0.07, -0.04], [0.085, 0.08], [0.075, 0.20], [0.0, 0.23]], fur, spine, 0, -0.06, 0.02, 12);
  keel.rotation.x = Math.PI / 2; keel.scale.set(0.85, 1.0, 1.0);
  // faded patch band on the back (wear): an open half-shell over the loin
  const patch = LATHE([[0.098, -0.24], [0.102, -0.16], [0.10, -0.08]], furLight, spine, 0, 0.03, 0, 12, Math.PI * 0.6, Math.PI * 0.55);
  patch.rotation.x = Math.PI / 2; patch.scale.set(0.9, 1.15, 1.0);
  B(0.045, 0.02, 0.06, -0.085, -0.02, -0.14, tan, spine);                   // tan stain on the haunch

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.07, 0.22, spine);
  const nk = LATHE([[0.0, -0.02], [0.075, 0.0], [0.07, 0.10], [0.058, 0.20], [0.0, 0.22]], fur, neck, 0, 0.0, 0.0, 12);
  nk.rotation.x = -0.55;
  const cl = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 6, 16), rope);
  cl.position.set(0, 0.05, 0.04); cl.rotation.x = Math.PI / 2 - 0.55; neck.add(cl);
  const cl2 = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.011, 5, 16), rope);            // second strand
  cl2.position.set(0, 0.075, 0.045); cl2.rotation.x = Math.PI / 2 - 0.55; neck.add(cl2);
  const fray = LATHE([[0.0, 0.0], [0.012, 0.0], [0.008, 0.06], [0.0, 0.07]], rope, neck, 0.03, -0.05, 0.11, 6);

  const head = J(0, 0.19, 0.16, neck);
  const sk = LATHE([[0.0, -0.085], [0.06, -0.07], [0.078, -0.02], [0.075, 0.04], [0.055, 0.075], [0.0, 0.085]], fur, head, 0, 0.0, 0.0, 12);
  sk.rotation.x = Math.PI / 2; sk.scale.set(0.95, 0.95, 1.05);
  const mz = LATHE([[0.0, 0.0], [0.05, 0.0], [0.042, 0.06], [0.032, 0.11], [0.0, 0.115]], black, head, 0, -0.02, 0.05, 10);
  mz.rotation.x = Math.PI / 2;
  const jaw = LATHE([[0.0, 0.0], [0.04, 0.0], [0.03, 0.08], [0.0, 0.09]], black, head, 0, -0.045, 0.05, 8);
  jaw.rotation.x = Math.PI / 2;
  B(0.07, 0.02, 0.03, 0, 0.055, 0.045, tan, head);                          // tan brow band
  const nose = LATHE([[0.0, -0.015], [0.02, -0.008], [0.018, 0.012], [0.0, 0.018]], dark, head, 0, 0.0, 0.16, 8);
  nose.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    const eye = LATHE([[0.0, -0.01], [0.011, -0.004], [0.009, 0.008], [0.0, 0.012]], dark, head, s * 0.035, 0.03, 0.068, 8);
    eye.rotation.x = Math.PI / 2;
    const brow = LATHE([[0.0, -0.005], [0.012, 0.0], [0.0, 0.008]], tan, head, s * 0.035, 0.052, 0.062, 6);
    brow.rotation.x = Math.PI / 2;
  }
  // ears: pricked on +X, folded over on -X
  const earUp = LATHE([[0.0, 0.0], [0.03, 0.0], [0.014, 0.05], [0.0, 0.085]], black, head, 0.05, 0.06, -0.01, 6);
  earUp.rotation.z = -0.28; earUp.rotation.x = -0.2; earUp.scale.set(1.0, 1.0, 0.5);
  const earFold = LATHE([[0.0, 0.0], [0.03, 0.0], [0.02, 0.045], [0.0, 0.06]], black, head, -0.05, 0.06, -0.005, 6);
  earFold.rotation.z = 1.1; earFold.rotation.x = -0.3; earFold.scale.set(1.0, 1.0, 0.5);

  // ---- tail: tapered lathe pitched back and up, dark tip -------------------
  const tail = J(0, 0.06, -0.31, spine);
  const tl = LATHE([[0.0, 0.0], [0.028, 0.0], [0.022, 0.12], [0.014, 0.24], [0.0, 0.28]], fur, tail, 0, 0.0, 0.0, 8);
  tl.rotation.x = 0.55;
  const tip = LATHE([[0.0, 0.0], [0.014, 0.0], [0.0, 0.03]], black, tail, 0, 0.235, -0.145, 6);
  tip.rotation.x = 0.55;

  // ---- legs: long and lean --------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.075, 0.0, z, spine);                                 // world y 0.46
    LATHE([[0.0, 0.08], [front ? 0.055 : 0.075, 0.04], [front ? 0.05 : 0.068, -0.04], [0.036, -0.13], [0.032, -0.20], [0.0, -0.22]], fur, hp, 0, 0, front ? 0 : -0.01, 10);
    const kn = J(0, -0.21, 0, hp);                                           // world y 0.25
    LATHE([[0.0, 0.03], [0.034, 0.02], [0.028, -0.08], [0.024, -0.20], [0.0, -0.215]], tan, kn, 0, 0, 0.004, 10);
    B(0.045, 0.06, 0.02, 0, -0.05, 0.025, fur, kn);                          // dark scuff below the joint
    const paw = LATHE([[0.0, -0.035], [0.032, -0.035], [0.036, -0.012], [0.028, 0.0], [0.0, 0.005]], tan, kn, 0, -0.205, 0.015, 10);
    paw.scale.set(0.95, 1.0, 1.2);
    B(0.06, 0.02, 0.08, 0, -0.24, 0.015, dark, kn);                          // pad 0–0.02 (grounding)
    return { hp, kn };
  }
  const FL = leg(1, 0.19, true), FR = leg(-1, 0.19, true);
  const BL = leg(1, -0.22, false), BR = leg(-1, -0.22, false);

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
