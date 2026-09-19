/** PLACEHOLDER jointed dog (fixture only). Joint keys per ASSETS.md; facing +Z; legs hang −Y from hips. */
export function buildDog(THREE, { color, shoulder = 0.55, len = 0.62, name }) {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 }); fur.name = 'fabric';
  const dark = new THREE.MeshStandardMaterial({ color: 0x110f12, roughness: 0.8 });
  const B = (w, h, d, x, y, z, mat, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const bodyY = shoulder * 0.78, legLen = bodyY - 0.03, half = legLen / 2;
  const spine = J(0, bodyY, 0, g);                                 // mid-back; front body and neck hang off it
  B(0.22, 0.24, len * 0.5, 0, 0.0, -len * 0.25, fur, g);           // hindquarters (rigid to root)
  B(0.24, 0.26, len * 0.5, 0, 0.02, len * 0.25, fur, spine);       // chest
  const neck = J(0, 0.10, len * 0.5, spine);
  B(0.12, 0.12, 0.16, 0, 0.06, 0.04, fur, neck);
  const head = J(0, 0.10, 0.10, neck);
  B(0.16, 0.14, 0.20, 0, 0.03, 0.08, fur, head);
  B(0.08, 0.06, 0.08, 0, 0.0, 0.20, dark, head);                   // muzzle tip
  B(0.04, 0.07, 0.03, 0.05, 0.12, 0.02, fur, head); B(0.04, 0.07, 0.03, -0.05, 0.12, 0.02, fur, head); // ears
  const tail = J(0, 0.10, -len * 0.5, g);
  B(0.05, 0.05, 0.22, 0, 0.06, -0.10, fur, tail);
  const leg = (x, z, parent) => {
    const hip = J(x, -0.03, z, parent);
    B(0.08, half, 0.09, 0, -half / 2, 0, fur, hip);
    const knee = J(0, -half, 0, hip);
    B(0.06, half, 0.07, 0, -half / 2 + 0.01, 0, fur, knee);
    B(0.07, 0.03, 0.09, 0, -half + 0.01, 0.02, dark, knee);        // paw
    return [hip, knee];
  };
  const [fl_hip, fl_knee] = leg(0.09, len * 0.32, spine), [fr_hip, fr_knee] = leg(-0.09, len * 0.32, spine);
  const [bl_hip, bl_knee] = leg(0.09, -len * 0.32, g), [br_hip, br_knee] = leg(-0.09, -len * 0.32, g);
  // the hind hips sit at bodyY like the front ones (root-parented)
  for (const h of [bl_hip, br_hip]) h.position.y = bodyY - 0.03;
  g.userData.joints = { spine, neck, head, tail, fl_hip, fl_knee, fr_hip, fr_knee, bl_hip, bl_knee, br_hip, br_knee };
  g.userData.jointHints = { kneeFlex: '+rotation.x', hipSwingForward: '-rotation.x', headTurn: 'rotation.y on joints.head' };
  g.userData.placeholder = true;
  g.name = name;
  return g;
}
