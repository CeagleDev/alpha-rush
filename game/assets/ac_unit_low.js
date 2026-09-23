// ac_unit_low — JUMP obstacle from the rooftops board: an outdoor condenser unit 1.9 m wide x 1.0 m
// tall on a concrete plinth, the big round fan grille facing the runner (+Z), louvred side panels, a
// service panel with screws, a rusted drip tray, and two insulated refrigerant hoses that come out of
// the side and coil on the roof beside it (TubeGeometry). Dented top corner, rust bands, a grounding
// band at the plinth. userData.obstacle = { kind: 'jump', lanes: 1 }. Base y = 0, centred.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open);
  const hash = (i, j) => { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };

  const SHELL = M(0xd8d3c6, 'metal', { roughness: 0.75, metalness: 0.3 });     // painted steel, gone chalky
  const SHELL2 = M(0xbfb9ab, 'metal', { roughness: 0.8, metalness: 0.3 });
  const DARK = M(0x2a2a2e, 'metal', { roughness: 0.8, metalness: 0.3, side: DS });
  const GRILLE = M(0x4a4a4c, 'metal', { roughness: 0.7, metalness: 0.4 });
  const FAN = M(0x3a3a3c, 'metal', { roughness: 0.6, metalness: 0.4, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const CONC = M(0x8a8378, 'stone', { roughness: 0.9 });
  const BLACK = M(0x110f12, 'stone', { roughness: 0.95 });
  const HOSE = M(0x231718, 'fabric', { roughness: 0.95 });
  const HOSE2 = M(0x8a8378, 'fabric', { roughness: 0.95 });   // foam-lagged pipe, grubby white
  const COPPER = M(0x8b5a2b, 'metal', { roughness: 0.6, metalness: 0.5 });

  const W = 1.9, H = 0.82, D = 0.42, PY = 0.16;   // body over a 16 cm plinth: 0.98 tall
  // plinth with a grounding band
  add(B(W - 0.2, PY, D + 0.1), CONC, 0, PY / 2, 0);
  add(B(W - 0.18, 0.05, D + 0.12), BLACK, 0, 0.025, 0);
  // body: shell, a darker back and base, a top with a dented corner
  add(B(W, H, D), SHELL, 0, PY + H / 2, 0);
  add(B(W + 0.01, 0.06, D + 0.01), SHELL2, 0, PY + 0.03, 0);
  add(B(W + 0.02, 0.025, D + 0.02), SHELL2, 0, PY + H - 0.0125, 0);
  add(B(0.36, 0.03, 0.2), RUSTD, W / 2 - 0.16, PY + H - 0.01, -D / 2 + 0.12, 0.06, 0, -0.10);   // dented, rusted top corner
  // fan grilles on the front (+Z): two fans, a ring bezel, radial guard wires, hub and blades
  for (const fx of [-0.45, 0.45]) {
    const R = 0.30, zf = D / 2;
    add(new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.10, 20, 1, true), DARK, fx, PY + 0.43, zf - 0.05, Math.PI / 2, 0, 0);   // recess wall
    add(new THREE.CircleGeometry(R + 0.02, 20), DARK, fx, PY + 0.43, zf - 0.10);
    add(new THREE.TorusGeometry(R + 0.03, 0.012, 4, 20), GRILLE, fx, PY + 0.43, zf + 0.005);
    add(new THREE.TorusGeometry(R * 0.55, 0.008, 3, 14), GRILLE, fx, PY + 0.43, zf + 0.005);
    for (let k = 0; k < 8; k++) add(B(0.012, R * 2 + 0.04, 0.012), GRILLE, fx, PY + 0.43, zf + 0.005, 0, 0, k * Math.PI / 8);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10), FAN, fx, PY + 0.43, zf - 0.07, Math.PI / 2, 0, 0);
    for (let k = 0; k < 3; k++) { const bl = add(B(0.12, 0.22, 0.01), FAN, fx, PY + 0.43, zf - 0.06, 0, 0, k * Math.PI * 2 / 3); bl.geometry = bl.geometry.clone(); bl.geometry.translate(0, 0.16, 0); bl.geometry.rotateY(0.6); }
  }
  // louvred side panels, both ends, and a louvred strip on the back
  for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) add(B(0.02, 0.025, D - 0.1), GRILLE, sx * (W / 2 + 0.005), PY + 0.16 + k * 0.07, 0, 0.5, 0, 0);
  for (let k = 0; k < 12; k++) add(B(0.05, H - 0.2, 0.012), GRILLE, -0.8 + k * 0.145, PY + H / 2, -D / 2 - 0.006);
  add(B(W - 0.1, 0.04, 0.02), RUST, 0, PY + 0.10, -D / 2 - 0.006);                                   // rust along the back
  // service panel with screws, a maker's plate left blank, a rust band at the bottom edge
  add(B(0.34, 0.5, 0.012), SHELL2, W / 2 - 0.20, PY + 0.40, D / 2 + 0.006);
  for (const [px, py] of [[-0.14, -0.22], [0.14, -0.22], [-0.14, 0.22], [0.14, 0.22]]) add(C(0.012, 0.012, 0.01, 6), DARK, W / 2 - 0.20 + px, PY + 0.40 + py, D / 2 + 0.014, Math.PI / 2, 0, 0);
  add(B(0.12, 0.07, 0.006), GRILLE, W / 2 - 0.20, PY + 0.10, D / 2 + 0.01);
  add(B(W, 0.05, 0.006), RUST, 0, PY + 0.02, D / 2 + 0.004);
  for (let i = 0; i < 4; i++) add(B(0.03, 0.15 + hash(i, 1) * 0.3, 0.006), RUST, -0.85 + hash(i, 2) * 1.7, PY + H - 0.1 - hash(i, 3) * 0.15, (hash(i, 4) < 0.5 ? 1 : -1) * (D / 2 + 0.004));
  // pipe stubs low on the front-left, valves, and two lagged hoses coiling on the roof in front
  const ex = -W / 2;
  for (const [y, r, m] of [[0.42, 0.02, COPPER], [0.52, 0.03, COPPER]]) { add(C(r, r, 0.12, 8), m, ex + 0.16, PY + y, D / 2 + 0.05, Math.PI / 2, 0, 0); add(C(r + 0.015, r + 0.015, 0.04, 8), RUSTD, ex + 0.16, PY + y, D / 2 + 0.10, Math.PI / 2, 0, 0); }
  const coil = (pts, r, m) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 6, false), m, 0, 0, 0);
  coil([[ex + 0.16, PY + 0.52, D / 2 + 0.1], [ex + 0.12, PY + 0.5, D / 2 + 0.22], [ex + 0.08, 0.24, D / 2 + 0.3], [ex + 0.1, 0.05, D / 2 + 0.36], [ex + 0.4, 0.04, D / 2 + 0.42], [ex + 0.7, 0.05, D / 2 + 0.36], [ex + 0.9, 0.04, D / 2 + 0.26]], 0.032, HOSE2);
  coil([[ex + 0.16, PY + 0.42, D / 2 + 0.1], [ex + 0.2, PY + 0.4, D / 2 + 0.18], [ex + 0.26, 0.14, D / 2 + 0.2], [ex + 0.3, 0.04, D / 2 + 0.3], [ex + 0.55, 0.035, D / 2 + 0.22], [ex + 0.75, 0.04, D / 2 + 0.16], [ex + 0.85, 0.035, D / 2 + 0.3]], 0.024, HOSE);
  add(C(0.045, 0.045, 0.05, 8), RUST, ex + 0.55, 0.045, D / 2 + 0.40, 0, 0, Math.PI / 2);      // a clip band on the hose

  g.userData.obstacle = { kind: 'jump', lanes: 1 };
  g.userData.lights = [];
  place(THREE, g);
  return g;
}
function place(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  if (g.userData.lights) g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
}
