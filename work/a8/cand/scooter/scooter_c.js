// scooter — arm C: a different reading. Read as a spine with bolted-on panels: a separate front
// fender on a leading link, a taller narrow leg shield with a cut-out, twin side covers, the cargo
// box strapped on with visible straps and a crate lip, engine hung low, on its centre stand with the
// bars turned slightly to the left. Front +Z. 0.7 x 1.1 x 1.9.
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
  const CYL = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s || 8, 1, !!open);
  const V2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const bar = (a, b, r, mat, s, parent) => {
    const A = V3(a), Bv = V3(b), d = new THREE.Vector3().subVectors(Bv, A), L = d.length();
    const m = new THREE.Mesh(CYL(r, r, L, s || 7), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    (parent || g).add(m); return m;
  };
  const lights = [];
  // faded, desaturated 0x40559f; the cream panels are the worn factory second colour
  const BLUE = M(0x4a5683, 'metal', 0.85, 0.1);
  const BLUED = M(0x3b4568, 'metal', 0.88, 0.1);
  const CREAM = M(0xbfb5a2, 'metal', 0.88, 0.05);
  const CREAMD = M(0xa1957f, 'metal', 0.9, 0.05);
  const RUST = M(0x6e4128, 'metal', 0.95, 0.05);
  const RUSTD = M(0x37201b, 'metal', 0.95, 0.05);
  const CHROME = M(0x8a8d90, 'metal', 0.5, 0.3);
  const WIRE = M(0x9a9ea3, 'metal', 0.6, 0.3);
  const ENG = M(0x5f6468, 'metal', 0.7, 0.3);
  const RUB = M(0x110f12, 'metal', 0.95, 0);
  const SEAT = M(0x231718, 'fabric', 0.9);
  const AMBER = M(0xbf7c42, 'metal', 0.5, 0.1);
  const HEAD = EM(0xf1d899, 2.4);
  const TAIL = EM(0xb8302a, 1.8);
  const front = new THREE.Group(); g.add(front); front.rotation.y = 0.12;                     // bars and front wheel turned
  const wheel = (z, parent, rusty) => {
    const w = new THREE.Group(); w.position.set(0, 0.23, z); w.rotation.y = Math.PI / 2; (parent || g).add(w);
    add(new THREE.TorusGeometry(0.2, 0.036, 5, 18), RUB, 0, 0, 0, 0, 0, 0, w);
    add(new THREE.TorusGeometry(0.15, 0.018, 4, 14), rusty ? RUST : CHROME, 0, 0, 0, 0, 0, 0, w);
    add(CYL(0.05, 0.05, 0.12, 8), ENG, 0, 0, 0, Math.PI / 2, 0, 0, w);
    add(CYL(0.065, 0.065, 0.06, 8), CHROME, 0.06, 0, 0, Math.PI / 2, 0, 0, w);                 // brake plate
    for (let i = 0; i < 8; i++) add(CYL(0.0035, 0.0035, 0.28, 4, true), WIRE, 0, 0, 0, 0, 0, (i / 8) * Math.PI, w);
  };
  wheel(0, front, false); front.position.set(0, 0, 0.62);
  wheel(-0.6, null, true);
  // ---- leading-link fork and a separate fender -----------------------------------------------------
  for (const s of [-1, 1]) {
    bar([s * 0.07, 0.23, 0], [s * 0.06, 0.62, -0.06], 0.02, CHROME, 7, front);
    bar([s * 0.07, 0.23, 0], [s * 0.07, 0.34, 0.06], 0.012, ENG, 6, front);                     // leading link
  }
  add(new THREE.TorusGeometry(0.26, 0.024, 4, 14, Math.PI * 0.6), BLUE, 0, 0.23, 0, 0, Math.PI / 2, -0.9, front);
  add(B(0.18, 0.02, 0.2), BLUED, 0, 0.44, 0.1, -0.35, 0, 0, front);
  add(CYL(0.032, 0.032, 0.3, 8), CHROME, 0, 0.7, -0.12, 0.22, 0, 0, front);
  // ---- tall narrow leg shield with a cut-out, twin side covers ---------------------------------------
  add(B(0.3, 0.5, 0.05), CREAM, 0, 0.6, 0.42, 0.1, 0, 0);
  add(B(0.34, 0.06, 0.06), BLUE, 0, 0.84, 0.38);
  for (const s of [-1, 1]) add(B(0.05, 0.46, 0.07), BLUE, s * 0.165, 0.6, 0.42, 0.1, 0, 0);
  add(B(0.14, 0.1, 0.06), BLUED, 0, 0.46, 0.45, 0.1, 0, 0);                                      // cut-out surround
  add(B(0.18, 0.1, 0.03), RUST, -0.05, 0.66, 0.44, 0.1, 0, 0);
  add(B(0.34, 0.05, 0.52), CREAMD, 0, 0.3, 0.14);                                                 // floor
  for (const s of [-1, 1]) { add(B(0.03, 0.1, 0.48), BLUED, s * 0.175, 0.28, 0.14); add(B(0.16, 0.24, 0.04), CREAM, s * 0.14, 0.44, -0.24); }  // side covers
  add(B(0.2, 0.26, 0.46), BLUE, 0, 0.52, -0.18);                                                   // spine
  add(B(0.26, 0.08, 0.4), BLUED, 0, 0.64, -0.2);
  add(CYL(0.038, 0.038, 0.05, 8), RUST, 0, 0.69, -0.04);
  add(B(0.3, 0.1, 0.4), SEAT, 0, 0.75, -0.3);
  add(B(0.32, 0.05, 0.42), RUB, 0, 0.7, -0.3);
  add(B(0.24, 0.03, 0.06), CREAMD, 0, 0.79, -0.12);                                                // worn seat patch
  // ---- engine hung low, upswept exhaust ------------------------------------------------------------------
  add(B(0.26, 0.16, 0.24), ENG, 0.02, 0.3, -0.28);
  add(CYL(0.075, 0.075, 0.18, 8), ENG, 0.04, 0.38, -0.18, 1.1, 0, 0);
  for (let i = 0; i < 5; i++) add(CYL(0.09, 0.09, 0.01, 8), ENG, 0.04, 0.33 + i * 0.028, -0.24 + i * 0.014, 1.1, 0, 0);
  add(CYL(0.032, 0.032, 0.42, 8), RUSTD, 0.14, 0.22, -0.38, -0.12, 0.2, 0);
  add(CYL(0.05, 0.05, 0.2, 8), RUST, 0.17, 0.3, -0.7, -0.12, 0.2, 0);
  for (const s of [-1, 1]) { add(B(0.035, 0.035, 0.12), ENG, s * 0.2, 0.3, -0.14); add(B(0.1, 0.03, 0.12), RUB, s * 0.26, 0.3, -0.14); }
  // centre stand: two legs and a foot bar, so it stands upright
  for (const s of [-1, 1]) bar([s * 0.09, 0.26, -0.36], [s * 0.15, 0.0, -0.5], 0.013, RUSTD);
  add(B(0.3, 0.014, 0.014), RUSTD, 0, 0.012, -0.5);
  add(B(0.08, 0.02, 0.1), RUSTD, 0.18, 0.02, -0.46);
  // ---- bars, headlamp, mirrors (turned with the front group) -----------------------------------------------
  add(B(0.24, 0.12, 0.12), BLUE, 0, 0.86, -0.16, 0, 0, 0, front);
  add(CYL(0.085, 0.08, 0.1, 14), CHROME, 0, 0.8, -0.08, Math.PI / 2, 0, 0, front);
  add(CYL(0.075, 0.075, 0.02, 14), HEAD, 0, 0.8, -0.02, Math.PI / 2, 0, 0, front);
  lights.push({ x: 0.02, y: 0.8, z: 0.72, color: 0xf1d899, intensity: 0.9, range: 6 });
  for (const s of [-1, 1]) {
    bar([0, 0.91, -0.16], [s * 0.27, 0.93, -0.22], 0.014, CHROME, 7, front);
    add(CYL(0.017, 0.017, 0.1, 7), RUB, s * 0.29, 0.93, -0.24, 0, -s * 0.5, 0, front);
    bar([s * 0.15, 0.93, -0.19], [s * 0.17, 1.03, -0.24], 0.008, CHROME, 5, front);
    add(B(0.11, 0.08, 0.015), CHROME, s * 0.18, 1.06, -0.25, 0, s * 0.3, 0, front);
    add(CYL(0.03, 0.03, 0.05, 8), AMBER, s * 0.17, 0.84, -0.06, Math.PI / 2, 0, 0, front);
  }
  // ---- cargo box strapped to the rack ----------------------------------------------------------------------
  for (const s of [-1, 1]) { bar([s * 0.13, 0.7, -0.46], [s * 0.1, 0.46, -0.6], 0.013, CHROME); add(B(0.022, 0.022, 0.32), CHROME, s * 0.14, 0.7, -0.62); }
  for (let i = 0; i < 3; i++) add(B(0.3, 0.015, 0.015), CHROME, 0, 0.7, -0.5 - i * 0.11);
  add(B(0.42, 0.32, 0.36), CREAM, 0, 0.88, -0.63);
  add(B(0.44, 0.06, 0.38), CREAMD, 0, 1.05, -0.63);                                                 // crate lip
  add(B(0.44, 0.02, 0.38), RUSTD, 0, 1.0, -0.63);
  for (const s of [-1, 1]) add(B(0.03, 0.34, 0.03), RUB, s * 0.13, 0.88, -0.45);                     // straps over the box
  add(B(0.3, 0.03, 0.03), RUB, 0, 1.06, -0.63);
  for (const s of [-1, 1]) add(B(0.02, 0.2, 0.04), RUST, s * 0.215, 0.86, -0.7);
  add(B(0.14, 0.08, 0.02), TAIL, 0, 0.7, -0.82);
  lights.push({ x: 0, y: 0.7, z: -0.9, color: 0xb8302a, intensity: 0.4, range: 2.5 });
  // ---- front basket, shallower and wider ---------------------------------------------------------------------
  const bw = 0.32, bd = 0.2, by0 = 0.58, by1 = 0.76, bz = 0.8;
  for (const y of [by0, by1]) { add(B(bw, 0.009, 0.009), WIRE, 0, y, bz + bd / 2); add(B(bw, 0.009, 0.009), WIRE, 0, y, bz - bd / 2); add(B(0.009, 0.009, bd), WIRE, bw / 2, y, bz); add(B(0.009, 0.009, bd), WIRE, -bw / 2, y, bz); }
  for (const s of [-1, 1]) for (const t of [-1, 1]) add(B(0.009, by1 - by0, 0.009), WIRE, s * bw / 2, (by0 + by1) / 2, bz + t * bd / 2);
  for (const s of [-1, 1]) add(B(0.005, 0.26, 0.005), WIRE, s * bw / 2, (by0 + by1) / 2, bz, s * 0.7, 0, 0);     // diagonal brace
  for (let i = 1; i < 3; i++) { const y = by0 + i * (by1 - by0) / 3; add(B(bw, 0.005, 0.005), WIRE, 0, y, bz + bd / 2); add(B(0.005, 0.005, bd), WIRE, bw / 2, y, bz); add(B(0.005, 0.005, bd), WIRE, -bw / 2, y, bz); }
  for (let i = 1; i < 4; i++) add(B(0.005, by1 - by0, 0.005), WIRE, -bw / 2 + i * bw / 4, (by0 + by1) / 2, bz + bd / 2);
  for (let i = 1; i < 3; i++) add(B(bw, 0.005, 0.005), WIRE, 0, by0, bz - bd / 2 + i * bd / 3);
  bar([0, 0.58, 0.72], [0, 0.62, 0.5], 0.007, CHROME, 5); bar([0, 0.76, 0.72], [0, 0.82, 0.5], 0.007, CHROME, 5);
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => Object.assign({}, l, { x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
