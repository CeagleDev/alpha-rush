/**
 * dog_spitz — arm A: primitives (capsules, spheres, cones, torus).
 * White spitz, 0.50 m at the shoulder, fluffy (fur 0xe6ddd0, dirt at the paws), pointed ears,
 * plumed tail curled over the back, blue collar. Faces +Z. Pivots AT the joints; legs hang down
 * local -Y so +rotation.x swings a leg BACKWARD.
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
  const furShade = M(0xd6cbbb, 'fabric');
  const dirt = M(0x8b6141, 'fabric');
  const mud = M(0x5a4a3c, 'fabric');
  const pinkEar = M(0x9a6a62, 'fabric');
  const collar = M(0x40559f, 'fabric', 0.7);
  const buckle = M(0x9a9ea3, 'metal', 0.45, 0.3);
  const dark = M(0x110f12, undefined, 0.6);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const SPH = (r, x, y, z, mat, parent, ws = 12, hs = 8) => MESH(new THREE.SphereGeometry(r, ws, hs), mat, parent, x, y, z);
  const CAP = (r, len, x, y, z, mat, parent) => MESH(new THREE.CapsuleGeometry(r, len, 4, 10), mat, parent, x, y, z);
  const CONE = (r, h, x, y, z, mat, parent, seg = 8) => MESH(new THREE.ConeGeometry(r, h, seg), mat, parent, x, y, z);
  const B = (w, h, d, x, y, z, mat, parent) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root joint) --------------------------------------------------
  const spine = J(0, 0.36, 0, root);
  // fluffy barrel: a capsule lying along z, plus chest and rump spheres to fatten the coat
  const body = CAP(0.12, 0.26, 0, 0.02, 0, fur, spine); body.rotation.x = Math.PI / 2; body.scale.set(1.15, 1.0, 1.0);
  SPH(0.125, 0, 0.03, 0.14, fur, spine).scale.set(1.15, 1.0, 1.0);          // chest coat
  SPH(0.12, 0, 0.03, -0.14, fur, spine).scale.set(1.1, 1.0, 1.0);           // rump coat
  SPH(0.10, 0, -0.06, 0.0, furShade, spine).scale.set(1.3, 1.0, 2.2);        // belly fringe, shaded
  B(0.06, 0.04, 0.03, 0.135, -0.04, 0.05, dirt, spine);                     // dirt smear on the flank

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.06, 0.22, spine);
  const nk = CAP(0.07, 0.08, 0, 0.04, 0.03, fur, neck); nk.rotation.x = -0.6;
  const ruff = SPH(0.13, 0, 0.02, 0.0, fur, neck); ruff.scale.set(1.0, 0.85, 0.9);   // the mane
  const cl = MESH(new THREE.TorusGeometry(0.105, 0.014, 6, 16), collar, neck, 0, 0.04, 0.04); cl.rotation.x = Math.PI / 2 - 0.5;
  B(0.03, 0.03, 0.014, 0, 0.0, 0.14, buckle, neck);

  const head = J(0, 0.13, 0.13, neck);
  SPH(0.085, 0, 0.0, 0.0, fur, head).scale.set(1.0, 0.95, 1.05);            // skull
  SPH(0.075, 0, -0.02, 0.03, fur, head).scale.set(1.15, 0.8, 1.0);          // cheeks
  const mz = CONE(0.045, 0.10, 0, -0.02, 0.10, fur, head, 10); mz.rotation.x = Math.PI / 2;   // muzzle
  SPH(0.02, 0, -0.005, 0.15, dark, head, 8, 6);                             // nose
  for (const s of [-1, 1]) {
    SPH(0.012, s * 0.038, 0.025, 0.07, dark, head, 8, 6);                    // eye
    const ear = CONE(0.032, 0.09, s * 0.05, 0.10, -0.01, fur, head, 6); ear.rotation.z = s * -0.25; ear.rotation.x = -0.2;
    const inner = CONE(0.016, 0.06, s * 0.05, 0.10, 0.005, pinkEar, head, 5); inner.rotation.z = s * -0.25; inner.rotation.x = -0.2;
  }

  // ---- tail: a fat plume curled forward over the back ----------------------
  const tail = J(0, 0.09, -0.22, spine);
  const curl = MESH(new THREE.TorusGeometry(0.075, 0.042, 8, 14, 4.2), fur, tail, 0, 0.06, 0.02);
  curl.rotation.set(0, Math.PI / 2, Math.PI * 0.12);
  SPH(0.05, 0, 0.09, 0.10, fur, tail).scale.set(1.0, 0.8, 1.3);              // plume tip lying on the back

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.085, 0.0, z, spine);                                 // world y 0.36
    SPH(front ? 0.065 : 0.08, 0, 0.0, front ? 0 : -0.01, fur, hp).scale.set(0.9, 1.1, 1.0);   // shoulder / thigh mass
    CAP(0.04, 0.09, 0, -0.09, 0, fur, hp);                                   // upper leg
    const kn = J(0, -0.16, 0, hp);                                           // world y 0.20
    CAP(0.032, 0.11, 0, -0.09, 0.01, furShade, kn);                          // lower leg
    B(0.045, 0.06, 0.03, 0, -0.10, 0.03, dirt, kn);                          // dirt splash
    SPH(0.038, 0, -0.165, 0.02, dirt, kn).scale.set(1.0, 0.7, 1.3);          // muddy paw
    B(0.065, 0.02, 0.085, 0, -0.19, 0.02, dark, kn);                         // pad 0–0.02 (grounding)
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
