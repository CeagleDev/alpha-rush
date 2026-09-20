/**
 * concrete_divider — arm A: primitives. A jersey-style divider built from stacked boxes: a wide
 * base plinth, a mid box, two sloped shoulder slabs (rotated boxes) and a narrow top, plus a faded
 * yellow strip along the top, chipped corners (dark inset boxes), a crack band, and round side
 * reflectors. 1.8 m along X (across one lane), 0.5 m along Z, 1.0 m tall. Weathered concrete
 * 0x8a8378 / 0x4a4a4c. userData.obstacle = {kind:'block', lanes:1}.
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
  const yellow = M(0xb9a24a, 'stone', 0.9);          // faded hazard strip
  const steel = M(0x6e6a62, 'metal', 0.6, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const reflMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xd8ae70, emissiveIntensity: 1.8, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  const L = 1.80;
  // grounding band + base plinth (0.5 deep), mid, shoulders, top
  B(L, 0.06, 0.50, 0, 0.03, 0, dark);
  B(L, 0.20, 0.50, 0, 0.16, 0, concShade);                             // base, stained darker
  B(L, 0.12, 0.44, 0, 0.32, 0, conc);                                  // kick-step
  for (const s of [-1, 1]) { const sl = B(L, 0.62, 0.05, 0, 0.66, s * 0.145, conc); sl.rotation.x = s * -0.12; }   // sloped faces
  B(L, 0.60, 0.26, 0, 0.66, 0, conc);                                  // core
  B(L - 0.02, 0.05, 0.22, 0, 0.975, 0, conc);                          // crown
  B(L - 0.06, 0.012, 0.16, 0, 1.003, 0, yellow);                       // faded yellow strip along the top
  B(0.30, 0.014, 0.10, 0.40, 1.004, 0.02, concShade);                  // the strip worn through
  // chipped corners: dark inset boxes cutting the top corners and one base corner
  B(0.10, 0.08, 0.14, -L / 2 + 0.03, 0.97, 0.06, concDark);
  B(0.07, 0.06, 0.10, L / 2 - 0.02, 0.985, -0.05, concDark);
  B(0.08, 0.10, 0.06, L / 2 - 0.02, 0.22, 0.24, concDark);
  // crack and stain bands on the faces
  const cr = B(0.35, 0.008, 0.008, -0.20, 0.55, 0.196, concDark); cr.rotation.z = 0.5; cr.rotation.x = -0.12;
  B(0.10, 0.008, 0.008, -0.05, 0.62, 0.20, concDark).rotation.z = -0.3;
  B(0.50, 0.10, 0.006, 0.30, 0.30, 0.221, concDark);                   // tyre scuff band
  B(0.006, 0.30, 0.20, -L / 2 - 0.003, 0.55, 0.05, concShade);          // end face stain
  B(0.40, 0.06, 0.006, -0.50, 0.80, -0.20 + 0.0, concShade).rotation.x = 0.12;   // back face stain
  // side reflectors: two round lenses per face on steel bases, near each end
  g.userData.lights = [];
  for (const s of [-1, 1]) for (const x of [-0.65, 0.65]) {
    const z = s * (0.20 + 0.03);
    MESH(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 12), steel, g, x, 0.78, z).rotation.x = Math.PI / 2;
    MESH(new THREE.SphereGeometry(0.038, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), reflMat, g, x, 0.78, z + s * 0.004).rotation.x = s * Math.PI / 2;
    MESH(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 10), steel, g, x, 0.66, z - s * 0.005).rotation.x = Math.PI / 2;
    MESH(new THREE.SphereGeometry(0.02, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), reflMat, g, x, 0.66, z).rotation.x = s * Math.PI / 2;
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
