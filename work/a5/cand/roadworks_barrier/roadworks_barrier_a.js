/**
 * roadworks_barrier — arm A: primitives. Two A-frame steel stands 1.0 m tall (cylinder legs,
 * cross tubes, wheel-foot discs) carrying a 1.8 m bar box in yellow-and-black diagonal stripes
 * (thin rotated boxes, capped by top and bottom lip rails), three amber dome lamps (half-spheres
 * on cylinder bases, emissive + userData.lights), rust sleeves. Faces +Z (the bar runs along X).
 * userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const steel = M(0x6e6a62, 'metal', 0.6, 0.3);
  const steelDark = M(0x4a4744, 'metal', 0.7, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const yellow = M(0xf8e845, 'metal', 0.8, 0.3);
  const black = M(0x231718, 'metal', 0.85, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.4, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const V = (a) => new THREE.Vector3(...a);
  const TUBE = (r, a, b, mat, parent = g, seg = 8) => {
    const A = V(a), Bv = V(b), d = Bv.clone().sub(A), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(m); return m;
  };

  // ---- two A-frame stands at x = ±0.70, legs splay in z, 1.0 m to the top ----
  for (const sx of [-0.70, 0.70]) {
    const top = [sx, 0.98, 0];
    for (const sz of [-1, 1]) {
      TUBE(0.02, top, [sx, 0.04, sz * 0.32], steel);                       // leg
      TUBE(0.021, [sx, 0.30, sz * 0.23], [sx, 0.06, sz * 0.31], rust);      // rust sleeve at the foot
      const foot = MESH(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), steelDark, g, sx, 0.035, sz * 0.33); foot.rotation.z = Math.PI / 2;   // caster wheel
      B(0.08, 0.03, 0.10, sx, 0.015, sz * 0.33, dark);                     // grounding pad
    }
    TUBE(0.014, [sx, 0.42, -0.19], [sx, 0.42, 0.19], steel);                // cross tube
    B(0.06, 0.08, 0.05, sx, 0.94, 0, steelDark);                             // hinge block at the apex
  }
  // long low brace between the stands, front and back
  TUBE(0.012, [-0.70, 0.40, 0.19], [0.70, 0.40, 0.19], steel); TUBE(0.012, [-0.70, 0.40, -0.19], [0.70, 0.40, -0.19], rust);

  // ---- the bar: 1.8 × 0.16 × 0.10 at y 0.90–1.06 ---------------------------
  const by = 0.98, BH = 0.16, BD = 0.10;
  B(1.80, BH, BD, 0, by, 0, black);
  // diagonal stripes on front and back: thin yellow boxes rotated 45° in the face plane, overhang hidden by lips
  for (const sz of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const s = B(0.075, 0.25, 0.008, -0.85 + i * 0.155, by, sz * (BD / 2 + 0.003), yellow);
      s.rotation.z = sz * Math.PI / 4;
    }
    B(1.82, 0.03, 0.02, 0, by + BH / 2 + 0.005, sz * (BD / 2 - 0.005), rust);     // top lip rail
    B(1.82, 0.03, 0.02, 0, by - BH / 2 - 0.005, sz * (BD / 2 - 0.005), rust);     // bottom lip rail
  }
  B(0.03, BH + 0.02, BD + 0.02, -0.905, by, 0, rust); B(0.03, BH + 0.02, BD + 0.02, 0.905, by, 0, rust);   // end caps
  B(0.20, 0.10, 0.006, 0.55, by, BD / 2 + 0.012, rust);                      // a rusted-through patch on the front
  for (const x of [-0.70, 0.70]) B(0.10, BH + 0.03, BD + 0.03, x, by, 0, steelDark);   // clamp brackets over the stands

  // ---- three amber dome lamps -------------------------------------------------
  g.userData.lights = [];
  for (const x of [-0.65, 0, 0.65]) {
    MESH(new THREE.CylinderGeometry(0.055, 0.06, 0.03, 12), steelDark, g, x, by + BH / 2 + 0.03, 0);
    const dome = MESH(new THREE.SphereGeometry(0.055, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lampMat, g, x, by + BH / 2 + 0.045, 0);
    dome.scale.set(1, 1.3, 1);
    MESH(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), rust, g, x, by + BH / 2 + 0.117, 0);   // cap
    g.userData.lights.push({ x, y: by + BH / 2 + 0.08, z: 0, color: 0xe5b055, intensity: 1.2, range: 3.0 });
  }
  TUBE(0.005, [-0.65, by + BH / 2 + 0.03, 0.05], [0.0, by + BH / 2 + 0.03, 0.05], dark, g, 4);   // cable
  TUBE(0.005, [0.0, by + BH / 2 + 0.03, 0.05], [0.65, by + BH / 2 + 0.03, 0.05], dark, g, 4);

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
