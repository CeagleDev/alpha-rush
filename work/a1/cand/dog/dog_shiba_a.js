/**
 * dog_shiba — arm A: primitives (capsule body, sphere head, cone ears, torus tail curl).
 * 0.55 m at the shoulder, facing +Z (nose at +Z). Pivots AT the joints; every leg hangs down
 * its joint's local -Y, so +rotation.x swings it BACKWARD.
 * Anchors (world m): paw 0, knee 0.24, hip/shoulder 0.42, back 0.53, withers 0.55, head 0.54.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.9, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const fur = M(0xc98a45, 'fabric', 0.95);
  const furDark = M(0xb0743a, 'fabric', 0.95);          // saddle / grime band
  const cream = M(0xe9dcc4, 'fabric', 0.95);
  const mud = M(0x5a4a3c, 'fabric', 0.95);
  const collar = M(0xb8302a, 'fabric', 0.7);
  const buckle = M(0x9a9ea3, 'metal', 0.45, 0.3);
  const dark = M(0x110f12, undefined, 0.6);             // nose, eyes, paw pads (grounding band)

  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const CAP = (r, len, x, y, z, mat, parent, rx = 0) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), mat);
    m.position.set(x, y, z); m.rotation.x = rx; parent.add(m); return m;
  };
  const SPH = (r, x, y, z, mat, parent, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 7), mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.42, 0, root);
  const body = CAP(0.12, 0.30, 0, 0.0, -0.02, fur, spine, Math.PI / 2);   // barrel, along z
  body.scale.set(1.08, 1.0, 1.0);
  CAP(0.095, 0.26, 0, -0.06, 0.0, cream, spine, Math.PI / 2);             // cream underside
  SPH(0.13, 0, 0.03, 0.14, fur, spine, 1.15, 1.0, 1.0);                    // chest / shoulders
  SPH(0.10, 0, -0.06, 0.16, cream, spine, 1.1, 1.0, 1.0);                  // cream chest bib
  SPH(0.11, 0, 0.02, -0.16, fur, spine, 1.05, 1.0, 1.0);                   // rump
  SPH(0.115, 0, 0.06, 0.02, furDark, spine, 0.95, 0.5, 1.4);               // darker saddle band
  B(0.07, 0.05, 0.02, 0.12, -0.02, -0.06, mud, spine);                     // mud smear on the flank

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.05, 0.22, spine);                                    // world (0,0.48,0.22)
  const nk = CAP(0.07, 0.10, 0, 0.05, 0.05, fur, neck, -Math.PI / 4);      // angled up-forward
  nk.scale.set(1.0, 1.0, 1.0);
  SPH(0.075, 0, 0.0, 0.03, cream, neck, 1.0, 0.8, 0.9);                    // ruff under the throat
  const cl = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.013, 6, 14), collar);
  cl.position.set(0, 0.04, 0.05); cl.rotation.x = Math.PI / 4; neck.add(cl);
  B(0.03, 0.028, 0.012, 0.0, 0.0, 0.135, buckle, neck);

  const head = J(0, 0.09, 0.11, neck);                                     // world (0,0.60,0.34)
  SPH(0.085, 0, 0.0, 0.0, fur, head, 1.0, 0.95, 1.05);                     // skull
  SPH(0.07, 0, -0.03, 0.05, cream, head, 1.0, 0.8, 1.0);                   // cheeks
  const mz = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.10, 10, 1), fur);
  mz.position.set(0, -0.005, 0.11); mz.rotation.x = Math.PI / 2; head.add(mz);   // muzzle, tip at +z
  SPH(0.04, 0, -0.03, 0.10, cream, head, 1.0, 0.7, 1.1);                   // cream lower muzzle
  SPH(0.018, 0, 0.015, 0.165, dark, head);                                 // nose
  for (const s of [-1, 1]) {
    SPH(0.012, s * 0.04, 0.03, 0.07, dark, head);                          // eyes
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.065, 6), fur);
    ear.position.set(s * 0.05, 0.095, -0.01); ear.rotation.z = s * -0.25; ear.rotation.x = -0.15; head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 5), cream);
    inner.position.set(s * 0.05, 0.092, 0.005); inner.rotation.z = s * -0.25; inner.rotation.x = -0.15; head.add(inner);
  }

  // ---- tail: a curl over the rump ------------------------------------------
  const tail = J(0, 0.08, -0.26, spine);                                   // world (0,0.50,-0.26)
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.032, 8, 14, 4.6), fur);
  curl.rotation.set(-Math.PI / 2, Math.PI / 2, 0);                                 // loop in the y-z plane, root at the bottom
  curl.position.set(0, 0.065, 0.0); tail.add(curl);
  SPH(0.04, 0, 0.06, 0.06, cream, tail, 1.0, 0.8, 1.0);                    // cream inner curl
  SPH(0.03, 0, 0.0, 0.02, fur, tail);                                      // tail root

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.095, 0.0, z, spine);                               // world y 0.42
    SPH(front ? 0.06 : 0.075, 0, 0.0, front ? 0 : -0.02, fur, hp, 1, 1.2, 1.1);   // shoulder / thigh mass
    CAP(0.042, 0.12, 0, -0.10, 0, fur, hp);                                 // upper leg
    const kn = J(0, -0.18, 0, hp);                                          // world y 0.24
    SPH(0.045, 0, 0, 0, fur, kn);
    CAP(0.032, 0.16, 0, -0.11, 0, cream, kn);                               // lower leg, cream
    B(0.05, 0.05, 0.02, 0, -0.14, 0.03, mud, kn);                           // mud splash
    B(0.075, 0.045, 0.09, 0, -0.215, 0.015, cream, kn);                     // paw
    B(0.075, 0.02, 0.09, 0, -0.23, 0.015, dark, kn);                        // pad: grounding band 0–0.02
    for (let i = 0; i < 3; i++) SPH(0.012, -0.024 + i * 0.024, -0.215, 0.06, cream, kn);   // toes
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
