/**
 * dog_spitz — arm C: a different part breakdown. The coat is read as three overlapping fluff
 * masses (chest ball, mid barrel, rump ball) as scaled spheres with an extruded side-profile
 * "coat slab" through them for the tuck-up; the ruff is a half-open sphere shell; ears are
 * extruded triangles; the tail is a TubeGeometry along a curled CatmullRom path lying on the back.
 * 0.50 m at the shoulder, facing +Z. Pivots AT the joints; legs hang down local -Y.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.95, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const fur = M(0xe6ddd0, 'fabric');
  const furShade = M(0xd4c9b9, 'fabric');
  const furDS = M(0xe6ddd0, 'fabric', 0.95, 0, { side: THREE.DoubleSide });
  const dirt = M(0x8b6141, 'fabric');
  const pinkEar = M(0x9a6a62, 'fabric');
  const collar = M(0x40559f, 'fabric', 0.7);
  const buckle = M(0x9a9ea3, 'metal', 0.45, 0.3);
  const dark = M(0x110f12, undefined, 0.6);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const SPH = (r, x, y, z, mat, parent, ws = 12, hs = 8) => MESH(new THREE.SphereGeometry(r, ws, hs), mat, parent, x, y, z);
  const B = (w, h, d, x, y, z, mat, parent) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const EXT = (pts, depth, mat, parent, x, y, z) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); geo.translate(0, 0, -depth / 2);
    return MESH(geo, mat, parent, x, y, z);
  };

  const root = new THREE.Object3D(); g.add(root);

  // ---- spine (root) --------------------------------------------------------
  const spine = J(0, 0.36, 0, root);
  SPH(0.135, 0, 0.03, 0.13, fur, spine).scale.set(1.05, 1.0, 1.0);          // chest fluff
  SPH(0.125, 0, 0.04, -0.02, fur, spine).scale.set(1.1, 1.0, 1.2);          // mid barrel
  SPH(0.12, 0, 0.04, -0.15, fur, spine).scale.set(1.0, 1.0, 1.0);           // rump fluff
  // side-profile coat slab (z along the shape's x, y up), extruded across the body for the tuck-up line
  const slab = EXT([[-0.24, -0.02], [-0.20, -0.09], [-0.05, -0.11], [0.12, -0.10], [0.22, -0.04], [0.22, 0.10], [0.0, 0.14], [-0.22, 0.12]], 0.20, furShade, spine, 0, 0.0, 0);
  slab.rotation.y = -Math.PI / 2;
  B(0.06, 0.04, 0.025, 0.14, -0.06, 0.06, dirt, spine);                     // dirt smear

  // ---- neck / head ---------------------------------------------------------
  const neck = J(0, 0.06, 0.21, spine);
  const nk = MESH(new THREE.CylinderGeometry(0.06, 0.075, 0.16, 10), fur, neck, 0, 0.05, 0.03); nk.rotation.x = -0.6;
  // the mane: an open sphere shell (front 3/4) around the neck base
  const ruff = MESH(new THREE.SphereGeometry(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.72), furDS, neck, 0, 0.03, 0.02);
  ruff.rotation.x = -0.9; ruff.scale.set(1.0, 0.9, 0.9);
  const cl = MESH(new THREE.TorusGeometry(0.10, 0.014, 6, 16), collar, neck, 0, 0.05, 0.05); cl.rotation.x = Math.PI / 4;
  B(0.03, 0.03, 0.014, 0.0, 0.01, 0.15, buckle, neck);

  const head = J(0, 0.12, 0.12, neck);
  SPH(0.085, 0, 0.0, 0.0, fur, head).scale.set(1.0, 0.95, 1.0);             // skull
  SPH(0.07, 0, -0.03, 0.04, fur, head).scale.set(1.2, 0.8, 1.0);            // cheeks
  const mz = MESH(new THREE.CylinderGeometry(0.025, 0.048, 0.10, 10), fur, head, 0, -0.015, 0.10); mz.rotation.x = Math.PI / 2;
  SPH(0.02, 0, -0.005, 0.155, dark, head, 8, 6);                            // nose
  for (const s of [-1, 1]) {
    SPH(0.012, s * 0.038, 0.025, 0.072, dark, head, 8, 6);                   // eye
    const ear = EXT([[-0.034, 0], [0.034, 0], [0.0, 0.09]], 0.02, fur, head, s * 0.05, 0.055, -0.01); ear.rotation.z = s * -0.28; ear.rotation.x = -0.2;
    const inner = EXT([[-0.018, 0], [0.018, 0], [0.0, 0.055]], 0.006, pinkEar, head, s * 0.05, 0.062, 0.006); inner.rotation.z = s * -0.28; inner.rotation.x = -0.2;
  }

  // ---- tail: a tube along a curl lying forward over the back ---------------
  const tail = J(0, 0.10, -0.23, spine);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.0, 0.0), new THREE.Vector3(0, 0.08, -0.03), new THREE.Vector3(0.01, 0.15, 0.02),
    new THREE.Vector3(0.02, 0.15, 0.10), new THREE.Vector3(0.03, 0.10, 0.17), new THREE.Vector3(0.03, 0.09, 0.22)]);
  MESH(new THREE.TubeGeometry(path, 12, 0.042, 8, false), fur, tail, 0, 0, 0);
  SPH(0.05, 0.03, 0.09, 0.22, fur, tail).scale.set(1.1, 0.8, 1.0);          // plume end

  // ---- legs ----------------------------------------------------------------
  function leg(sx, z, front) {
    const hp = J(sx * 0.085, 0.0, z, spine);                                 // world y 0.36
    SPH(front ? 0.07 : 0.085, 0, 0.0, front ? 0 : -0.01, fur, hp).scale.set(0.85, 1.05, 1.0);
    MESH(new THREE.CylinderGeometry(0.038, 0.045, 0.14, 10), fur, hp, 0, -0.09, 0);
    const kn = J(0, -0.16, 0, hp);                                           // world y 0.20
    MESH(new THREE.CylinderGeometry(0.03, 0.036, 0.15, 10), furShade, kn, 0, -0.085, 0.005);
    B(0.045, 0.06, 0.02, 0, -0.11, 0.03, dirt, kn);                          // dirt splash
    B(0.06, 0.035, 0.09, 0, -0.17, 0.02, dirt, kn);                          // muddy paw block
    B(0.07, 0.02, 0.095, 0, -0.19, 0.02, dark, kn);                          // pad 0–0.02 (grounding)
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
