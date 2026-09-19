/**
 * dog_spitz — arm B: lathe profiles. Body, neck, ruff, skull, muzzle, ears, legs and paws are
 * LatheGeometry sweeps (body and skull lathed along their own axis then rotated to lie along z);
 * the plumed tail is a fat torus arc curling forward over the back with a lathed plume tip.
 * 0.50 m at the shoulder, facing +Z. Pivots AT the joints; legs hang down local -Y so
 * +rotation.x swings a leg BACKWARD.
 * Anchors (world m): paw 0, knee 0.20, hip/shoulder 0.36, back 0.50, ear tips ~0.66.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.95, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const fur = M(0xe6ddd0, 'fabric');
  const furShade = M(0xd4c9b9, 'fabric');
  const dirt = M(0x8b6141, 'fabric');
  const mud = M(0x5a4a3c, 'fabric');
  const pinkEar = M(0x9a6a62, 'fabric');
  const collar = M(0x40559f, 'fabric', 0.7);
  const buckle = M(0x9a9ea3, 'metal', 0.45, 0.3);
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
  const spine = J(0, 0.36, 0, root);
  // fluffy barrel: rump (-0.26) to chest (+0.24), rotated to lie along +z; wider than tall for the coat
  const body = LATHE([[0.0, -0.27], [0.09, -0.25], [0.13, -0.16], [0.135, -0.02], [0.14, 0.10], [0.135, 0.20], [0.10, 0.26], [0.0, 0.28]], fur, spine, 0, 0.03, 0, 14);
  body.rotation.x = Math.PI / 2; body.scale.set(1.15, 1.0, 1.0);
  // belly feathering: a shaded narrower sweep hung under the barrel, open-ended fringe shape
  const under = LATHE([[0.0, -0.20], [0.09, -0.18], [0.11, 0.0], [0.10, 0.16], [0.0, 0.20]], furShade, spine, 0, -0.05, 0.0, 12);
  under.rotation.x = Math.PI / 2; under.scale.set(1.0, 1.0, 0.9);
  B(0.06, 0.04, 0.025, 0.155, -0.05, 0.05, dirt, spine);                    // dirt smear, low flank

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.06, 0.21, spine);
  const nk = LATHE([[0.0, -0.02], [0.075, 0.0], [0.08, 0.08], [0.07, 0.15], [0.0, 0.17]], fur, neck, 0, 0.0, 0.0, 12);
  nk.rotation.x = -Math.PI / 4;
  // the mane: a wide short lathe collar of fur, chest to ears
  const ruff = LATHE([[0.0, -0.06], [0.11, -0.05], [0.135, 0.02], [0.12, 0.09], [0.0, 0.11]], fur, neck, 0, 0.0, 0.03, 14);
  ruff.rotation.x = -Math.PI / 4;
  const cl = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.014, 6, 16), collar);
  cl.position.set(0, 0.05, 0.05); cl.rotation.x = Math.PI / 4; neck.add(cl);
  B(0.03, 0.03, 0.014, 0.0, 0.01, 0.15, buckle, neck);

  const head = J(0, 0.12, 0.12, neck);
  const sk = LATHE([[0.0, -0.085], [0.06, -0.075], [0.085, -0.03], [0.085, 0.03], [0.065, 0.065], [0.0, 0.075]], fur, head, 0, 0.0, 0.0, 12);
  sk.rotation.x = Math.PI / 2;
  const mz = LATHE([[0.0, 0.0], [0.052, 0.0], [0.042, 0.06], [0.028, 0.10], [0.0, 0.105]], fur, head, 0, -0.01, 0.055, 10);
  mz.rotation.x = Math.PI / 2;
  const cheeks = LATHE([[0.0, -0.05], [0.075, -0.04], [0.08, 0.01], [0.0, 0.03]], fur, head, 0, -0.03, 0.045, 12);
  cheeks.rotation.x = Math.PI / 2; cheeks.scale.set(1.15, 0.9, 1.0);
  const nose = LATHE([[0.0, -0.015], [0.018, -0.008], [0.016, 0.012], [0.0, 0.018]], dark, head, 0, 0.005, 0.16, 8);
  nose.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    const eye = LATHE([[0.0, -0.01], [0.012, -0.004], [0.01, 0.008], [0.0, 0.012]], dark, head, s * 0.038, 0.025, 0.075, 8);
    eye.rotation.x = Math.PI / 2;
    const ear = LATHE([[0.0, 0.0], [0.034, 0.0], [0.014, 0.05], [0.0, 0.09]], fur, head, s * 0.05, 0.06, -0.01, 6);
    ear.rotation.z = s * -0.28; ear.rotation.x = -0.2;
    const inner = LATHE([[0.0, 0.0], [0.018, 0.0], [0.007, 0.04], [0.0, 0.06]], pinkEar, head, s * 0.05, 0.068, 0.006, 5);
    inner.rotation.z = s * -0.28; inner.rotation.x = -0.2;
  }

  // ---- tail: fat plume curled over the back ---------------------------------
  const tail = J(0, 0.10, -0.23, spine);
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.045, 8, 14, 4.4), fur);
  curl.rotation.set(0, Math.PI / 2, Math.PI * 0.15);
  curl.position.set(0, 0.06, 0.02); tail.add(curl);
  const tip = LATHE([[0.0, -0.05], [0.05, -0.03], [0.045, 0.03], [0.0, 0.05]], fur, tail, 0, 0.09, 0.11, 10);
  tip.rotation.x = Math.PI / 2; tip.scale.set(1.1, 0.8, 1.0);

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.085, 0.0, z, spine);                                 // world y 0.36
    LATHE([[0.0, 0.07], [front ? 0.065 : 0.085, 0.04], [front ? 0.06 : 0.08, -0.03], [0.045, -0.10], [0.04, -0.15], [0.0, -0.17]], fur, hp, 0, 0, front ? 0 : -0.01, 10);
    const kn = J(0, -0.16, 0, hp);                                           // world y 0.20
    LATHE([[0.0, 0.03], [0.04, 0.02], [0.034, -0.07], [0.03, -0.16], [0.0, -0.175]], furShade, kn, 0, 0, 0.005, 10);
    B(0.045, 0.06, 0.02, 0, -0.11, 0.03, dirt, kn);                          // dirt splash on the shin
    const paw = LATHE([[0.0, -0.04], [0.038, -0.04], [0.042, -0.015], [0.032, 0.0], [0.0, 0.005]], dirt, kn, 0, -0.16, 0.015, 10);
    paw.scale.set(0.95, 1.0, 1.15);
    B(0.07, 0.02, 0.09, 0, -0.19, 0.015, dark, kn);                          // pad 0–0.02 (grounding)
    return { hp, kn };
  }
  const FL = leg(1, 0.15, true), FR = leg(-1, 0.15, true);
  const BL = leg(1, -0.16, false), BR = leg(-1, -0.16, false);

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
