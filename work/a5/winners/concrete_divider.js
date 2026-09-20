/**
 * concrete_divider — arm C: a different breakdown. The tapering shoulders are ONE box whose
 * top vertices are pulled inward in z (position attribute edited after construction), so the slope
 * is a true single-axis taper rather than tilted slabs; the two lifting-slot notches in
 * the base are dark recesses; the chips are one whole corner replaced by a smaller dark block; the
 * yellow strip is a thin box; reflectors are clipped spheres. 1.8 (X) × 0.5 (Z) × 1.0 m.
 * userData.obstacle = {kind:'block', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.92, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const conc = M(0x8a8378, 'stone', 0.95);
  const concShade = M(0x6b665d, 'stone', 0.95);
  const concDark = M(0x4a4a4c, 'stone', 0.95);
  const yellow = M(0xb9a24a, 'stone', 0.9);
  const steel = M(0x6e6a62, 'metal', 0.6, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const reflMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xd8ae70, emissiveIntensity: 1.8, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  // a box whose top vertices are pulled inward in z: a true single-axis taper (the jersey shoulder)
  const TAPER = (len, h, zBot, zTop, mat, x, y, z) => {
    const geo = new THREE.BoxGeometry(len, h, zBot); const P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) if (P.getY(i) > 0) P.setZ(i, Math.sign(P.getZ(i)) * zTop / 2);
    geo.computeVertexNormals();
    return MESH(geo, mat, g, x, y, z);
  };
  const L = 1.80;
  B(L, 0.06, 0.50, 0, 0.03, 0, dark);                                          // grounding
  B(L, 0.20, 0.50, 0, 0.16, 0, concShade);                                     // plinth
  for (const x of [-0.55, 0.55]) B(0.16, 0.06, 0.52, x, 0.09, 0, dark);        // forklift notches (dark recesses)
  B(L, 0.12, 0.44, 0, 0.32, 0, conc);                                          // kick-step
  TAPER(L, 0.60, 0.44, 0.22, conc, 0, 0.68, 0);                                // the taper: 0.44 → 0.22 over 0.6 m
  B(L - 0.02, 0.04, 0.22, 0, 0.99, 0, conc);                                   // crown
  B(L - 0.10, 0.012, 0.16, 0, 1.006, 0, yellow); B(0.30, 0.014, 0.10, 0.40, 1.007, 0.02, concShade);
  // chipped corners: cap each end of the crown with a smaller dark block, offset inward
  B(0.14, 0.09, 0.20, -L / 2 + 0.05, 0.975, 0.02, concDark); B(0.10, 0.07, 0.18, L / 2 - 0.03, 0.985, -0.03, concDark);
  B(0.08, 0.10, 0.06, L / 2 - 0.02, 0.22, 0.24, concDark);
  // cracks, scuff, stains
  const cr = B(0.35, 0.008, 0.008, -0.20, 0.55, 0.19, concDark); cr.rotation.z = 0.5; cr.rotation.x = -0.18;
  B(0.10, 0.008, 0.008, -0.05, 0.62, 0.185, concDark).rotation.z = -0.3;
  B(0.50, 0.10, 0.006, 0.30, 0.30, 0.221, concDark);
  B(0.006, 0.30, 0.20, -L / 2 - 0.003, 0.55, 0.05, concShade);
  const st = B(0.40, 0.06, 0.006, -0.50, 0.80, -0.155, concShade); st.rotation.x = 0.18;
  g.userData.lights = [];
  for (const s of [-1, 1]) for (const x of [-0.65, 0.65]) {
    const z = s * 0.23;
    MESH(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), steel, g, x, 0.78, z).rotation.x = Math.PI / 2;
    MESH(new THREE.SphereGeometry(0.038, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), reflMat, g, x, 0.78, z + s * 0.004).rotation.x = s * Math.PI / 2;
    MESH(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 6), steel, g, x, 0.66, z - s * 0.005).rotation.x = Math.PI / 2;
    MESH(new THREE.SphereGeometry(0.02, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), reflMat, g, x, 0.66, z).rotation.x = s * Math.PI / 2;
    g.userData.lights.push({ x, y: 0.78, z: z + s * 0.05, color: 0xd8ae70, intensity: 0.25, range: 0.8 });
  }

  g.userData.obstacle = { kind: 'block', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
