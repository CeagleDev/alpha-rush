/**
 * PLACEHOLDER jointed runner for E2's fixture ONLY (never shipped; A1's game/assets/runner.js replaces it).
 * Boxes on a real skeleton: every joint is an Object3D AT the anatomical joint with the limb geometry as
 * an offset child, so limbs pivot at joints. Joint keys exactly as ASSETS.md. Facing +Z; right = −X.
 * Anchors (m): sole 0, ankle 0.08, knee 0.50, hip 0.94, spine 1.04, chest 1.26, neck 1.50, crown 1.72.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }); if (name) m.name = name; return m; };
  const jacket = M(0xe8852a, 'fabric'), trousers = M(0x1d1a1f, 'fabric'), shoe = M(0xeee2c8, 'fabric', 0.7), skin = M(0x9c7a4e);
  const B = (w, h, d, x, y, z, mat, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  const hips = J(0, 0.94, 0, g);
  B(0.30, 0.16, 0.20, 0, 0.02, 0, trousers, hips);                 // pelvis
  const spine = J(0, 0.10, 0, hips);
  B(0.30, 0.22, 0.20, 0, 0.11, 0, jacket, spine);                  // abdomen
  const chest = J(0, 0.22, 0, spine);
  B(0.36, 0.26, 0.22, 0, 0.12, 0, jacket, chest);                  // chest
  B(0.20, 0.10, 0.06, 0, 0.20, 0.10, jacket, chest);               // zip flap
  const neck = J(0, 0.24, 0, chest);
  B(0.10, 0.08, 0.10, 0, 0.03, 0, skin, neck);
  const head = J(0, 0.06, 0, neck);
  B(0.18, 0.20, 0.20, 0, 0.11, 0, skin, head);                     // head
  B(0.22, 0.14, 0.23, 0, 0.16, -0.02, jacket, head);               // hood

  const arm = (sx, key) => {
    const sh = J(sx * 0.22, 0.20, 0, chest);
    B(0.09, 0.28, 0.09, 0, -0.14, 0, jacket, sh);                  // upper arm
    const el = J(0, -0.28, 0, sh);
    B(0.08, 0.26, 0.08, 0, -0.13, 0, jacket, el);                  // forearm
    B(0.08, 0.08, 0.06, 0, -0.29, 0, skin, el);                    // hand
    sh.rotation.z = sx * 0.12;                                     // arms slightly out
    return [sh, el];
  };
  const [l_shoulder, l_elbow] = arm(1), [r_shoulder, r_elbow] = arm(-1);

  const leg = (sx) => {
    const hip = J(sx * 0.10, -0.02, 0, hips);
    B(0.13, 0.42, 0.14, 0, -0.21, 0, trousers, hip);               // thigh
    const knee = J(0, -0.42, 0, hip);
    B(0.11, 0.40, 0.12, 0, -0.21, 0, trousers, knee);              // shin
    const ankle = J(0, -0.42, 0, knee);
    B(0.11, 0.08, 0.26, 0, -0.04, 0.05, shoe, ankle);              // trainer
    return [hip, knee, ankle];
  };
  const [l_hip, l_knee, l_ankle] = leg(1), [r_hip, r_knee, r_ankle] = leg(-1);

  g.userData.joints = { hips, spine, chest, neck, head, l_shoulder, l_elbow, r_shoulder, r_elbow, l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle };
  g.userData.jointHints = { kneeFlex: '+rotation.x (heel goes back and up)', hipSwingForward: '-rotation.x', elbowFlex: '-rotation.x (forearm comes forward)', shoulderRaiseOut: 'left +rotation.z, right -rotation.z', headTurn: 'rotation.y on joints.head' };
  g.userData.placeholder = true;
  return g;
}
