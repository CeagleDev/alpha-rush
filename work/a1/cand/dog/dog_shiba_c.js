/**
 * dog_shiba — arm C: a different part breakdown. Two-mass body (chest barrel + hindquarters
 * with a tuck-up), a boxy skull with a wedge muzzle (the loader rounds boxes), ears as thin
 * extruded triangles, tail as a chain of spheres along a spiral, a fluffy torus ruff, tapered
 * cylinder legs with sphere knees and toed paws. 0.55 m at the shoulder, facing +Z.
 * Pivots AT the joints; legs hang down local -Y so +rotation.x swings a leg BACKWARD.
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

  const B = (w, h, d, x, y, z, mat, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const CYL = (rt, rb, h, x, y, z, mat, parent, seg = 8) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const SPH = (r, x, y, z, mat, parent, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m;
  };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.42, 0, root);
  SPH(0.14, 0, 0.0, 0.12, fur, spine, 1.0, 0.95, 1.25);                  // chest barrel
  SPH(0.12, 0, 0.0, -0.14, fur, spine, 0.95, 1.0, 1.15);                 // hindquarters
  const loin = CYL(0.10, 0.125, 0.16, 0, 0.02, -0.02, fur, spine, 12);   // loin, narrower: the tuck-up
  loin.rotation.x = Math.PI / 2; loin.scale.set(1.0, 1.0, 0.85);
  SPH(0.11, 0, -0.055, 0.13, cream, spine, 1.0, 0.9, 1.15);              // cream chest / belly
  SPH(0.085, 0, -0.045, -0.12, cream, spine, 0.9, 0.8, 1.0);             // cream under the loin
  B(0.22, 0.03, 0.30, 0, 0.115, -0.02, furDark, spine);                  // darker back stripe (rounded by loader)
  B(0.07, 0.05, 0.02, 0.135, -0.02, 0.0, mud, spine);                    // mud smear, flank

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.05, 0.22, spine);
  const nk = CYL(0.065, 0.08, 0.16, 0, 0.05, 0.05, fur, neck, 12);
  nk.rotation.x = -Math.PI / 4;
  const ruff = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.035, 8, 14), cream);
  ruff.position.set(0, 0.0, 0.02); ruff.rotation.x = Math.PI / 4; neck.add(ruff);
  const cl = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.013, 6, 14), collar);
  cl.position.set(0, 0.045, 0.06); cl.rotation.x = Math.PI / 4; neck.add(cl);
  B(0.03, 0.028, 0.012, 0.0, 0.005, 0.145, buckle, neck);

  const head = J(0, 0.09, 0.11, neck);
  B(0.15, 0.13, 0.15, 0, 0.005, -0.005, fur, head);                      // skull block
  SPH(0.07, 0, 0.045, -0.02, fur, head, 1.1, 0.8, 1.0);                  // dome
  B(0.09, 0.075, 0.10, 0, -0.01, 0.11, fur, head);                       // muzzle wedge
  B(0.07, 0.05, 0.09, 0, -0.04, 0.115, cream, head);                     // cream lower muzzle
  B(0.13, 0.06, 0.07, 0, -0.04, 0.045, cream, head);                     // cream cheeks
  SPH(0.018, 0, 0.02, 0.165, dark, head);                                // nose
  for (const s of [-1, 1]) SPH(0.012, s * 0.04, 0.035, 0.072, dark, head);
  // ears: thin extruded triangles standing up from the skull
  const tri = new THREE.Shape();
  tri.moveTo(-0.035, 0); tri.lineTo(0.035, 0); tri.lineTo(0.0, 0.07); tri.closePath();
  const earGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.018, bevelEnabled: false });
  earGeo.translate(0, 0, -0.009);
  const inTri = new THREE.Shape();
  inTri.moveTo(-0.02, 0.008); inTri.lineTo(0.02, 0.008); inTri.lineTo(0.0, 0.055); inTri.closePath();
  const inGeo = new THREE.ExtrudeGeometry(inTri, { depth: 0.006, bevelEnabled: false });
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, fur);
    ear.position.set(s * 0.05, 0.06, -0.01); ear.rotation.set(-0.2, 0, s * -0.22); head.add(ear);
    const inner = new THREE.Mesh(inGeo, cream);
    inner.position.set(s * 0.05, 0.06, -0.01 + 0.006); inner.rotation.set(-0.2, 0, s * -0.22); head.add(inner);
  }

  // ---- tail: a chain of spheres along a spiral over the rump ---------------
  const tail = J(0, 0.08, -0.26, spine);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const a = -Math.PI / 2 + t * 4.4;                                     // start at the root (bottom), sweep up and over
    const r = 0.065 - t * 0.012;                                          // tighten toward the tip
    const y = 0.065 + r * Math.sin(a), z = -r * Math.cos(a);
    SPH(0.034 - t * 0.008, 0, y, z, t > 0.55 ? cream : fur, tail);
  }

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.095, 0.0, z, spine);
    SPH(front ? 0.06 : 0.078, 0, 0.0, front ? 0 : -0.02, fur, hp, 1, 1.25, 1.1);
    CYL(0.045, 0.038, 0.16, 0, -0.10, 0, fur, hp);                       // upper leg
    const kn = J(0, -0.18, 0, hp);
    SPH(0.042, 0, 0, 0, fur, kn);
    CYL(0.036, 0.03, 0.18, 0, -0.11, 0, cream, kn);                       // lower leg
    B(0.05, 0.05, 0.02, 0, -0.14, 0.03, mud, kn);
    B(0.075, 0.045, 0.085, 0, -0.215, 0.012, cream, kn);                  // paw
    for (let i = 0; i < 3; i++) B(0.02, 0.03, 0.03, -0.025 + i * 0.025, -0.22, 0.06, cream, kn);   // toes
    B(0.078, 0.02, 0.10, 0, -0.23, 0.02, dark, kn);                       // pad 0–0.02
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
