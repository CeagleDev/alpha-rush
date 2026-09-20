/**
 * dog_mutt — arm C: a different breakdown. The body is an extruded side-profile Shape (the lean
 * silhouette with the tuck-up drawn directly) scaled narrow across x, with a rib capsule for the
 * chest; the head is a sphere + box muzzle; ears are extruded flaps; the tail is a TubeGeometry
 * along a raised curve. Lean dark-brown mongrel 0.60 m at the shoulder. Faces +Z. Pivots AT the
 * joints; legs hang down local -Y so +rotation.x swings a leg BACKWARD.
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

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const SPH = (r, x, y, z, mat, parent, ws = 12, hs = 8) => MESH(new THREE.SphereGeometry(r, ws, hs), mat, parent, x, y, z);
  const CAP = (r, len, x, y, z, mat, parent) => MESH(new THREE.CapsuleGeometry(r, len, 4, 10), mat, parent, x, y, z);
  const CYL = (rt, rb, h, x, y, z, mat, parent, seg = 10) => MESH(new THREE.CylinderGeometry(rt, rb, h, seg), mat, parent, x, y, z);
  const B = (w, h, d, x, y, z, mat, parent) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const EXT = (pts, depth, mat, parent, x, y, z) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    geo.translate(0, 0, -depth / 2);
    return MESH(geo, mat, parent, x, y, z);
  };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.46, 0, root);
  // side profile in (z, y): rump at -0.30, chest at +0.24; bevel grows it 2 cm all round (accounted)
  const body = EXT([[-0.28, -0.03], [-0.25, -0.07], [-0.12, -0.05], [0.02, -0.08], [0.16, -0.12], [0.22, -0.06], [0.22, 0.06], [0.10, 0.10], [-0.10, 0.10], [-0.26, 0.08]], 0.12, fur, spine, 0, 0.0, 0);
  body.rotation.y = -Math.PI / 2;
  const ribs = CAP(0.095, 0.10, 0, 0.0, 0.10, fur, spine); ribs.rotation.x = Math.PI / 2; ribs.scale.set(1.0, 1.1, 1.0);   // chest barrel
  B(0.05, 0.03, 0.10, 0.10, -0.02, 0.0, furLight, spine);                   // faded patch
  B(0.045, 0.02, 0.06, -0.085, -0.03, -0.14, tan, spine);                   // tan stain

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.06, 0.22, spine);
  const nk = CYL(0.055, 0.08, 0.20, 0, 0.07, 0.04, fur, neck); nk.rotation.x = -0.55;
  const cl = MESH(new THREE.TorusGeometry(0.085, 0.016, 6, 16), rope, neck, 0, 0.05, 0.04); cl.rotation.x = Math.PI / 2 - 0.55;
  const cl2 = MESH(new THREE.TorusGeometry(0.086, 0.011, 5, 16), rope, neck, 0, 0.075, 0.045); cl2.rotation.x = Math.PI / 2 - 0.55;
  CYL(0.008, 0.012, 0.07, 0.03, -0.01, 0.12, rope, neck, 6);

  const head = J(0, 0.16, 0.16, neck);
  SPH(0.078, 0, 0.0, 0.0, fur, head).scale.set(0.95, 0.95, 1.15);           // skull
  B(0.07, 0.02, 0.03, 0, 0.055, 0.045, tan, head);                          // brow band
  B(0.075, 0.065, 0.12, 0, -0.02, 0.10, black, head);                       // box muzzle (loader rounds it)
  B(0.06, 0.03, 0.09, 0, -0.06, 0.08, black, head);                         // jaw
  SPH(0.02, 0, 0.0, 0.165, dark, head, 8, 6);                               // nose
  for (const s of [-1, 1]) { SPH(0.011, s * 0.035, 0.03, 0.065, dark, head, 8, 6); SPH(0.012, s * 0.035, 0.05, 0.062, tan, head, 6, 4); }
  const earUp = EXT([[-0.028, 0], [0.028, 0], [0.0, 0.085]], 0.006, black, head, 0.05, 0.05, -0.01); earUp.rotation.z = -0.28; earUp.rotation.x = -0.2;
  const earFold = EXT([[-0.028, 0], [0.028, 0], [0.012, 0.06], [-0.012, 0.06]], 0.006, black, head, -0.05, 0.05, -0.005); earFold.rotation.z = 1.2; earFold.rotation.x = -0.3;

  // ---- tail: tube along a raised curve --------------------------------------
  const tail = J(0, 0.06, -0.31, spine);
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.08, -0.06), new THREE.Vector3(0, 0.17, -0.10), new THREE.Vector3(0, 0.26, -0.11)]);
  MESH(new THREE.TubeGeometry(path, 8, 0.024, 7, false), fur, tail, 0, 0, 0);
  SPH(0.016, 0, 0.26, -0.11, black, tail, 6, 5);

  // ---- legs -----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.075, 0.0, z, spine);                                 // world y 0.46
    SPH(front ? 0.055 : 0.075, 0, 0.0, front ? 0 : -0.01, fur, hp).scale.set(0.8, 1.2, 1.0);
    CYL(0.03, 0.038, 0.16, 0, -0.11, 0, fur, hp);
    const kn = J(0, -0.21, 0, hp);                                           // world y 0.25
    CYL(0.024, 0.03, 0.18, 0, -0.10, 0.005, tan, kn);
    B(0.045, 0.06, 0.02, 0, -0.05, 0.025, fur, kn);
    B(0.055, 0.035, 0.08, 0, -0.215, 0.02, tan, kn);                         // paw
    B(0.06, 0.02, 0.085, 0, -0.24, 0.02, dark, kn);                          // pad 0–0.02 (grounding)
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
