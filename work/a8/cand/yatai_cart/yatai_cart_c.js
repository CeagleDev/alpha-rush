// yatai_cart — arm C: a different breakdown. Hipped canopy (two trapezoid slopes + two triangular
// ends), tiles as three staggered cylinder rows, a lower cabinet with drawer fronts and a
// recessed door, an upper serving shelf on brackets, flat-spoke timber wheels with a steel tyre,
// a single U-yoke handle, curtain as one red band with white stripes proud. Long axis Z, handle +Z,
// counter side +X. 1.2 x 2.1 x 2.4.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, roughness, metalness, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: roughness === undefined ? 0.85 : roughness, metalness: metalness || 0 }, extra || {}));
    if (name) m.name = name;
    return m;
  };
  const EM = (hex, i) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(hex), emissiveIntensity: i || 2.2, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 12, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const tri = (a, b, c2, depth) => { const s = new THREE.Shape(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.lineTo(c2[0], c2[1]); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, steps: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  const bar = (a, b, r, mat, s) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]), Bv = new THREE.Vector3(b[0], b[1], b[2]);
    const d = new THREE.Vector3().subVectors(Bv, A), L = d.length();
    const m = new THREE.Mesh(CYL(r, r, L, s || 6), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.add(m); return m;
  };
  const lights = [];

  const TIM = M(0x4f2d21, 'timber', 0.9);
  const TIMD = M(0x37201b, 'timber', 0.92);
  const TIML = M(0x6c4028, 'timber', 0.88);
  const PLANK = M(0x8b6141, 'timber', 0.9);
  const RUST = M(0x6e4128, 'metal', 0.92, 0.1);
  const STEEL = M(0x8a8d90, 'metal', 0.5, 0.3);
  const IRON = M(0x3a3a3c, 'metal', 0.7, 0.3);
  const TILE = M(0x3a3b3d, 'stone', 0.9);
  const TILEM = M(0x4a4d48, 'stone', 0.9);
  const RED = M(0xb8302a, 'fabric', 0.9, 0, { side: DS });
  const WHITE = M(0xeee2c8, 'fabric', 0.9, 0, { side: DS });
  const BOWL = M(0xeee2c8, 'plaster', 0.6, 0, { side: DS });
  const BOWLB = M(0x40559f, 'plaster', 0.6, 0, { side: DS });
  const DARK = M(0x110f12, 'metal', 0.9, 0.2);
  const LBOX = EM(0xd8ae70, 2.4);
  const LANT = EM(0xd8482a, 2.0);

  // ---- timber wheels: fat rim torus, steel tyre, 8 flat spokes -------------------
  const wheel = (x, y, z) => {
    const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = Math.PI / 2; g.add(w);
    add(new THREE.TorusGeometry(0.36, 0.028, 6, 22), DARK, 0, 0, 0, 0, 0, 0, w);         // steel tyre
    add(new THREE.TorusGeometry(0.33, 0.03, 6, 22), TIML, 0, 0, 0, 0, 0, 0, w);          // timber felloe
    add(CYL(0.06, 0.06, 0.1, 10), TIMD, 0, 0, 0, Math.PI / 2, 0, 0, w);
    for (let i = 0; i < 8; i++) add(B(0.03, 0.62, 0.02), TIML, 0, 0, 0, 0, 0, (i / 8) * Math.PI, w);
  };
  wheel(0.54, 0.38, -0.3); wheel(-0.54, 0.38, -0.3);
  add(CYL(0.02, 0.02, 1.16, 8), IRON, 0, 0.38, -0.3, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) add(B(0.05, 0.14, 0.08), IRON, s * 0.45, 0.43, -0.3);

  // ---- cabinet with drawer fronts (+X) and a recessed door (-X) ------------------
  add(B(0.9, 0.5, 1.4), TIM, 0, 0.72, -0.15);
  add(B(0.94, 0.05, 1.44), TIMD, 0, 0.495, -0.15);                                  // skirt
  add(B(0.94, 0.04, 1.44), TIMD, 0, 0.955, -0.15);                                  // top rail
  for (let i = 0; i < 3; i++) {                                                     // drawer fronts, one faded
    add(B(0.02, 0.16, 0.4), i === 1 ? PLANK : TIML, 0.46, 0.66 + (i % 2) * 0.18, -0.6 + i * 0.44);
    add(CYL(0.012, 0.012, 0.06, 6), IRON, 0.475, 0.66 + (i % 2) * 0.18, -0.6 + i * 0.44, 0, 0, Math.PI / 2);
  }
  add(B(0.02, 0.36, 0.5), TIMD, -0.445, 0.72, -0.05);                                // door recess (darker, sunk)
  add(B(0.025, 0.36, 0.03), TIML, -0.46, 0.72, -0.32); add(B(0.025, 0.36, 0.03), TIML, -0.46, 0.72, 0.22);
  add(B(0.02, 0.2, 0.3), RUST, -0.462, 0.6, 0.35);                                   // rust panel
  add(B(0.04, 0.1, 0.05), TIMD, 0.45, 0.52, 0.53);                                  // chipped corner
  add(B(0.3, 0.02, 0.02), TIMD, 0.2, 0.9, 0.56);                                     // stain band on +Z end
  add(B(0.06, 0.5, 0.06), TIMD, -0.44, 0.72, -0.83);
  // ---- counter and upper serving shelf ---------------------------------------------
  add(B(1.14, 0.04, 1.5), STEEL, 0.06, 0.99, -0.15);
  add(B(0.05, 0.12, 1.3), STEEL, -0.52, 1.06, -0.15);
  add(B(0.3, 0.03, 1.2), TIML, -0.35, 1.3, -0.15);                                   // upper shelf
  for (const t of [-1, 1]) add(tri([0, 0], [0.26, 0], [0, -0.16], 0.03), TIMD, -0.47, 1.28, -0.15 + t * 0.5);
  // stove ring, pot, bowls
  add(CYL(0.17, 0.19, 0.06, 14, true), DARK, -0.1, 1.04, 0.15);
  add(new THREE.LatheGeometry(V2([[0, 0], [0.13, 0], [0.14, 0.06], [0.13, 0.2], [0.14, 0.22], [0.12, 0.24]]), 14), STEEL, -0.1, 1.07, 0.15);
  add(CYL(0.13, 0.1, 0.03, 14), STEEL, -0.1, 1.31, 0.15);
  add(new THREE.SphereGeometry(0.02, 6, 5), IRON, -0.1, 1.33, 0.15);
  const bowlGeo = new THREE.LatheGeometry(V2([[0.025, 0], [0.055, 0.005], [0.07, 0.035], [0.072, 0.045]]), 8);
  const stacks = [[0.28, -0.62, 5], [0.32, -0.4, 3], [0.12, -0.6, 4], [0.36, 0.38, 4], [0.22, 0.55, 3], [-0.35, -0.5, 3], [-0.35, 0.2, 4]];
  stacks.forEach(([x, z, n], k) => { const y0 = x < -0.3 ? 1.315 : 1.01; for (let i = 0; i < n; i++) add(bowlGeo, (i + k) % 3 === 0 ? BOWLB : BOWL, x, y0 + i * 0.022, z); });
  add(CYL(0.02, 0.02, 0.22, 6), TIML, -0.35, 1.44, -0.15, 0, 0, 0.3);                // ladle hung on the shelf
  add(new THREE.SphereGeometry(0.035, 8, 6), STEEL, -0.3, 1.34, -0.15);

  // ---- posts + hipped canopy -----------------------------------------------------------
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(CYL(0.025, 0.025, 0.86, 8), IRON, s * 0.42, 1.44, -0.15 + t * 0.62);
  for (const s of [-1, 1]) add(B(0.06, 0.06, 1.82), TIMD, s * 0.58, 1.86, -0.1);
  for (const t of [-1, 1]) add(B(1.2, 0.05, 0.05), TIMD, 0, 1.86, -0.1 + t * 0.9);
  add(B(0.06, 0.06, 1.2), TIMD, 0, 2.04, -0.1);                                       // short ridge
  const pitch = Math.atan2(0.2, 0.62);
  for (const s of [-1, 1]) {                                                          // long slopes (trapezoids as boxes)
    add(B(0.66, 0.03, 1.82), TIML, s * 0.31, 1.97, -0.1, 0, 0, -s * pitch);
    for (let i = 0; i < 3; i++) {
      const u = 0.08 + i * 0.2;
      add(CYL(0.035, 0.035, 1.82 - u * 0.6, 7), i % 2 ? TILEM : TILE, s * (0.62 - u), 1.9 + u * 0.33 + 0.02, -0.1, Math.PI / 2, 0, 0);
    }
  }
  const ep = Math.atan2(0.2, 0.32);
  for (const t of [-1, 1]) {                                                          // hip ends: triangles
    const geo = tri([-0.62, 0], [0.62, 0], [0, 0.32], 0.03);
    add(geo, TIML, 0, 1.88, -0.1 + t * 0.75, -t * (Math.PI / 2 - ep), 0, 0);
    add(CYL(0.035, 0.035, 0.7, 7), TILE, 0, 1.95, -0.1 + t * 0.7, 0, 0, Math.PI / 2);
  }
  add(CYL(0.05, 0.05, 1.24, 8), TILE, 0, 2.08, -0.1, Math.PI / 2, 0, 0);
  // ---- lightboxes on both long sides ---------------------------------------------------
  for (const s of [-1, 1]) {
    add(B(0.05, 0.36, 0.96), TIMD, s * 0.44, 1.66, -0.15);
    add(B(0.03, 0.3, 0.9), s > 0 ? LBOX : PLANK, s * 0.475, 1.66, -0.15);
  }
  lights.push({ x: 0.62, y: 1.66, z: -0.15, color: 0xd8ae70, intensity: 0.9, range: 3.5 });
  // ---- curtain: one red band per long side with white stripes proud ---------------------
  for (const s of [-1, 1]) {
    add(B(0.02, 0.3, 1.56), RED, s * 0.6, 1.7, -0.1);
    for (let i = 0; i < 6; i++) add(B(0.025, 0.3, 0.12), WHITE, s * 0.6, 1.7, -0.82 + 0.06 + i * 0.26 + 0.07);
  }
  for (const t of [-1, 1]) { add(B(1.12, 0.3, 0.02), RED, 0, 1.7, -0.1 + t * 0.9); for (let i = 0; i < 4; i++) add(B(0.12, 0.3, 0.025), WHITE, -0.42 + i * 0.28, 1.7, -0.1 + t * 0.9); }
  // ---- lanterns (scaled spheres) at +X corners ---------------------------------------------
  for (const t of [-1, 1]) {
    const z = -0.1 + t * 0.95, x = 0.6;
    add(CYL(0.006, 0.006, 0.08, 5), IRON, x, 1.82, z);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.77, z);
    const l = add(new THREE.SphereGeometry(0.13, 12, 10), LANT, x, 1.6, z); l.scale.set(1, 1.35, 1);
    for (let i = 0; i < 5; i++) add(new THREE.TorusGeometry(0.128 - Math.abs(i - 2) * 0.022, 0.006, 4, 10), DARK, x, 1.5 + i * 0.05, z, Math.PI / 2, 0, 0);
    add(CYL(0.05, 0.05, 0.03, 10), DARK, x, 1.43, z);
    lights.push({ x, y: 1.6, z, color: 0xe0482a, intensity: 0.8, range: 3 });
  }
  // ---- U-yoke handle at +Z with caster ----------------------------------------------------
  for (const s of [-1, 1]) bar([s * 0.32, 0.56, 0.55], [s * 0.32, 0.52, 1.3], 0.02, IRON, 7);
  bar([-0.32, 0.52, 1.3], [-0.2, 0.52, 1.38], 0.02, IRON, 6); bar([0.32, 0.52, 1.3], [0.2, 0.52, 1.38], 0.02, IRON, 6);
  add(CYL(0.02, 0.02, 0.42, 7), TIML, 0, 0.52, 1.38, 0, 0, Math.PI / 2);
  add(CYL(0.018, 0.018, 0.68, 7), IRON, 0, 0.55, 0.9, 0, 0, Math.PI / 2);          // cross tie
  bar([0, 0.55, 0.9], [0, 0.1, 0.95], 0.018, IRON, 6);
  add(CYL(0.07, 0.07, 0.04, 12), DARK, 0, 0.07, 0.95, 0, 0, Math.PI / 2);

  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  g.userData.obstacle = { kind: 'block', lanes: 1 };
  return g;
}
