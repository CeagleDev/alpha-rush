/**
 * roadworks_barrier — arm C: a different breakdown, closer to the reference: each A-frame is a
 * proper trestle (two splayed legs, a horizontal foot-level tie, a diagonal brace, castors on the
 * feet), the bar is a plank box whose stripes are extruded parallelogram panels with a hinged
 * bracket plate at each end, the lamps are clipped spheres (thetaLength) on cylinder collars with
 * a wire cable strung between them. Faces +Z. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const steel = M(0x7a766e, 'metal', 0.6, 0.3);
  const steelDark = M(0x4a4744, 'metal', 0.7, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const rustLight = M(0x6c4028, 'metal', 0.95, 0.3);
  const yellow = M(0xf8e845, 'metal', 0.8, 0.3);
  const black = M(0x231718, 'metal', 0.85, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.4, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const V = (a) => new THREE.Vector3(...a);
  const TUBE = (r, a, b, mat, seg = 8) => {
    const A = V(a), Bv = V(b), d = Bv.clone().sub(A), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.add(m); return m;
  };
  const PARA = (w, h, skew, depth, mat, x, y, z) => {
    const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2 + skew, h / 2); s.lineTo(-w / 2 + skew, h / 2); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }); geo.translate(0, 0, -depth / 2);
    return MESH(geo, mat, g, x, y, z);
  };

  // ---- trestles at x = ±0.72 --------------------------------------------------
  for (const sx of [-0.72, 0.72]) {
    for (const sz of [-1, 1]) {
      TUBE(0.02, [sx, 0.96, sz * 0.03], [sx, 0.05, sz * 0.34], steel);                    // splayed leg
      TUBE(0.021, [sx, 0.28, sz * 0.245], [sx, 0.07, sz * 0.33], rust);                    // rust at the foot
      TUBE(0.021, [sx, 0.80, sz * 0.08], [sx, 0.70, sz * 0.11], rustLight);                // rust band higher up
      const castor = MESH(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 10), steelDark, g, sx, 0.03, sz * 0.36); castor.rotation.z = Math.PI / 2;
      B(0.08, 0.03, 0.09, sx, 0.015, sz * 0.36, dark);                                   // grounding pad
    }
    TUBE(0.014, [sx, 0.36, -0.245], [sx, 0.36, 0.245], steel);                              // tie
    TUBE(0.012, [sx, 0.36, -0.245], [sx, 0.90, 0.02], steel, 6);                            // diagonal brace
    B(0.06, 0.10, 0.06, sx, 0.93, 0, steelDark);                                             // apex block
    B(0.04, 0.06, 0.12, sx, 1.02, 0, rust);                                                  // bracket plate holding the bar
  }
  TUBE(0.012, [-0.72, 0.36, 0.245], [0.72, 0.36, 0.245], steel); TUBE(0.012, [-0.72, 0.36, -0.245], [0.72, 0.36, -0.245], rust);

  // ---- the bar: 1.8 × 0.18 × 0.09 at y 0.91–1.09 -------------------------------
  const by = 1.00, BH = 0.18, BD = 0.09;
  B(1.80, BH, BD, 0, by, 0, black);
  for (const sz of [-1, 1]) {
    for (let i = 0; i < 10; i++) PARA(0.09, BH - 0.02, sz * 0.09, 0.006, yellow, -0.81 + i * 0.18, by, sz * (BD / 2 + 0.003));
    B(1.80, 0.02, 0.012, 0, by + BH / 2 - 0.01, sz * (BD / 2 + 0.004), rust);              // rust along the top edge
  }
  B(0.03, BH + 0.02, BD + 0.02, -0.905, by, 0, rust); B(0.03, BH + 0.02, BD + 0.02, 0.905, by, 0, rust);
  B(0.24, 0.08, 0.006, -0.30, by - 0.02, BD / 2 + 0.010, rust);                             // rust bloom over the stripes
  B(0.06, 0.06, 0.006, 0.42, by + 0.03, BD / 2 + 0.010, steelDark);                          // a bolt plate

  // ---- lamps: clipped spheres on collars, cable between ------------------------
  g.userData.lights = [];
  for (const x of [-0.66, 0, 0.66]) {
    const base = by + BH / 2;
    MESH(new THREE.CylinderGeometry(0.05, 0.058, 0.035, 12), steelDark, g, x, base + 0.0175, 0);
    const dome = MESH(new THREE.SphereGeometry(0.056, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), lampMat, g, x, base + 0.055, 0);
    dome.scale.set(1, 1.25, 1);
    MESH(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 8), rust, g, x, base + 0.125, 0);
    g.userData.lights.push({ x, y: base + 0.08, z: 0, color: 0xe5b055, intensity: 1.2, range: 3.0 });
  }
  const cable = new THREE.CatmullRomCurve3([V([-0.66, by + BH / 2 + 0.02, 0.05]), V([-0.33, by + BH / 2 + 0.06, 0.06]), V([0, by + BH / 2 + 0.02, 0.05]), V([0.33, by + BH / 2 + 0.06, 0.06]), V([0.66, by + BH / 2 + 0.02, 0.05])]);
  MESH(new THREE.TubeGeometry(cable, 16, 0.005, 4, false), dark, g, 0, 0, 0);

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
