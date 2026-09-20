/**
 * dog_mutt — arm A: primitives (capsules, spheres, cylinders, cones, torus).
 * Lean dark-brown mongrel, 0.60 m at the shoulder (fur 0x3a2a22, black muzzle and ears, tan
 * points on the legs and brows), rope collar, one ear folded. Faces +Z. Pivots AT the joints;
 * legs hang down local -Y so +rotation.x swings a leg BACKWARD.
 * Anchors (world m): paw 0, knee 0.25, hip/shoulder 0.46, back 0.58, head top ~0.72.
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
  const eyeAmber = M(0x110f12, undefined, 0.4);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const SPH = (r, x, y, z, mat, parent, ws = 12, hs = 8) => MESH(new THREE.SphereGeometry(r, ws, hs), mat, parent, x, y, z);
  const CAP = (r, len, x, y, z, mat, parent) => MESH(new THREE.CapsuleGeometry(r, len, 4, 10), mat, parent, x, y, z);
  const CYL = (rt, rb, h, x, y, z, mat, parent, seg = 10) => MESH(new THREE.CylinderGeometry(rt, rb, h, seg), mat, parent, x, y, z);
  const B = (w, h, d, x, y, z, mat, parent) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.46, 0, root);
  const chest = CAP(0.105, 0.16, 0, 0.02, 0.10, fur, spine); chest.rotation.x = Math.PI / 2; chest.scale.set(0.95, 1.15, 1.0);
  const loin = CAP(0.085, 0.16, 0, 0.04, -0.14, fur, spine); loin.rotation.x = Math.PI / 2; loin.scale.set(0.95, 1.05, 1.0);
  SPH(0.09, 0, -0.02, -0.26, fur, spine).scale.set(1.0, 1.1, 0.9);          // rump / haunch
  B(0.05, 0.03, 0.10, 0.10, -0.02, 0.0, furLight, spine);                   // faded patch on the flank (wear)
  B(0.045, 0.02, 0.06, -0.09, -0.04, -0.16, tan, spine);                    // tan stain on the haunch

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.06, 0.22, spine);
  const nk = CYL(0.055, 0.08, 0.20, 0, 0.07, 0.04, fur, neck); nk.rotation.x = -0.55;
  // rope collar: a torus with three strand bumps and a hanging frayed end
  const cl = MESH(new THREE.TorusGeometry(0.085, 0.016, 6, 16), rope, neck, 0, 0.05, 0.04); cl.rotation.x = Math.PI / 2 - 0.55;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const b = SPH(0.014, Math.cos(a) * 0.085, 0.05 + Math.sin(a) * 0.085 * 0.52, 0.04 + Math.sin(a) * 0.085 * 0.85, rope, neck, 6, 5); }
  CYL(0.008, 0.012, 0.07, 0.03, -0.01, 0.12, rope, neck, 6);                // frayed end hanging

  const head = J(0, 0.16, 0.16, neck);
  SPH(0.078, 0, 0.0, 0.0, fur, head).scale.set(1.0, 0.95, 1.15);            // skull
  B(0.07, 0.02, 0.03, 0, 0.055, 0.045, tan, head);                          // tan brow band
  const mz = CYL(0.032, 0.05, 0.11, 0, -0.02, 0.10, black, head); mz.rotation.x = Math.PI / 2;   // black muzzle
  B(0.06, 0.03, 0.06, 0, -0.045, 0.08, black, head);                        // jaw
  SPH(0.02, 0, 0.0, 0.16, dark, head, 8, 6);                                // nose
  for (const s of [-1, 1]) {
    SPH(0.011, s * 0.035, 0.03, 0.065, eyeAmber, head, 8, 6);                // eye
    SPH(0.012, s * 0.035, 0.05, 0.062, tan, head, 6, 4);                     // tan eyebrow dot
  }
  // ears: one pricked (+X), one folded over (-X), both black
  const earUp = B(0.05, 0.08, 0.015, 0.05, 0.085, -0.01, black, head); earUp.rotation.z = -0.25; earUp.rotation.x = -0.2;
  const earFold = B(0.05, 0.05, 0.015, -0.055, 0.06, -0.005, black, head); earFold.rotation.z = 1.0; earFold.rotation.x = -0.3;
  B(0.045, 0.03, 0.015, -0.085, 0.045, 0.01, black, head).rotation.z = 1.4; // the flap

  // ---- tail: raised, a slight curve back and up ----------------------------
  const tail = J(0, 0.06, -0.31, spine);
  const t1 = CYL(0.02, 0.028, 0.14, 0, 0.05, -0.05, fur, tail); t1.rotation.x = 0.7;
  const t2 = CYL(0.012, 0.02, 0.13, 0, 0.15, -0.11, fur, tail); t2.rotation.x = 0.35;
  SPH(0.016, 0, 0.21, -0.13, black, tail, 6, 5);                            // dark tip

  // ---- legs: long, lean ----------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.075, 0.0, z, spine);                                 // world y 0.46
    SPH(front ? 0.055 : 0.075, 0, 0.0, front ? 0 : -0.01, fur, hp).scale.set(0.8, 1.2, 1.0);   // shoulder / thigh
    CAP(0.033, 0.13, 0, -0.11, 0, fur, hp);                                  // upper leg
    const kn = J(0, -0.21, 0, hp);                                           // world y 0.25
    CAP(0.026, 0.14, 0, -0.11, 0.005, tan, kn);                              // tan lower leg
    B(0.045, 0.06, 0.02, 0, -0.05, 0.025, fur, kn);                          // dark scuff at the hock
    SPH(0.032, 0, -0.215, 0.02, tan, kn).scale.set(1.0, 0.7, 1.3);           // paw
    B(0.06, 0.02, 0.08, 0, -0.24, 0.02, dark, kn);                           // pad 0–0.02 (grounding)
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
