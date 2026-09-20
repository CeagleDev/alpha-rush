// plant_pots — arm C: a different reading. The whole group stands on a slatted timber duckboard
// (as the reference does); two of the pots are square timber planters, three are round; the
// plants are sphere clusters on crossed planes; the watering can has a boxy handle; the hose is
// a taller coil of three tori.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const TERRA = M(0xb06a45, 'stone', { roughness: 0.9, side: DS });
  const TERRA2 = M(0x9a5b3c, 'stone', { roughness: 0.9, side: DS });
  const GLAZE = M(0x2f4a3a, 'tile', { roughness: 0.5, side: DS });
  const SOIL = M(0x2b2118, 'ground', { roughness: 1.0 });
  const FOL = M(0x4d6b3a, 'foliage', { roughness: 0.9, side: DS });
  const FOL2 = M(0x3a5530, 'foliage', { roughness: 0.9, side: DS });
  const FOL3 = M(0x6c8a4a, 'foliage', { roughness: 0.9, side: DS });
  const STEM = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const WOOD = M(0x6c4028, 'timber', { roughness: 0.9 });
  const WOOD2 = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const WOOD3 = M(0x8b6141, 'timber', { roughness: 0.9 });
  const GALV = M(0x8d9093, 'metal', { roughness: 0.6, metalness: 0.3 });
  const GALV2 = M(0x6b6e6f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const HOSE = M(0x8b7a3a, 'metal', { roughness: 0.8 });
  const HOSE2 = M(0x6e6030, 'metal', { roughness: 0.85 });
  // duckboard 1.3 x 0.9, seven slats on two bearers
  add(B(1.30, 0.06, 0.90), GROUND, 0, 0.03, 0);
  for (let i = 0; i < 7; i++) add(B(1.28, 0.025, 0.11), [WOOD, WOOD2, WOOD3][i % 3], 0, 0.072, -0.39 + i * 0.13);
  add(B(0.30, 0.03, 0.12), RUST, 0.35, 0.075, 0.26);   // a rotten slat end
  const Y = 0.085;
  const rpot = (x, z, rt, rb, h, mat) => {
    add(C(rt, rb, h, 10, true), mat, x, Y + h / 2, z);
    add(C(rb, rb, 0.01, 10), mat, x, Y + 0.005, z);
    add(C(rt + 0.012, rt + 0.012, 0.035, 10, true), TERRA2, x, Y + h - 0.017, z);
    add(C(rt - 0.01, rt - 0.01, 0.01, 10), SOIL, x, Y + h - 0.03, z);
    add(C(rb + 0.003, rb + 0.003, h * 0.3, 10, true), RUST, x, Y + h * 0.15, z);
  };
  const spot = (x, z, w, h, mat) => {
    add(B(w, h, w), mat, x, Y + h / 2, z);
    add(B(w + 0.03, 0.03, w + 0.03), WOOD2, x, Y + h - 0.015, z);
    add(B(w - 0.03, 0.01, w - 0.03), SOIL, x, Y + h - 0.025, z);
    add(B(w * 0.5, h * 0.4, 0.012), RUST, x, Y + h * 0.3, z + w / 2 + 0.002);
  };
  const cross = (x, y, z, w, h, mat) => { add(new THREE.PlaneGeometry(w, h), mat, x, y, z, 0, 0.5, 0); add(new THREE.PlaneGeometry(w, h), mat, x, y, z, 0, 0.5 + Math.PI / 2, 0); };
  // tree in a square planter
  spot(0.25, -0.25, 0.36, 0.34, WOOD);
  add(C(0.02, 0.035, 0.60, 6, true), STEM, 0.25, Y + 0.62, -0.25, 0.05, 0, -0.05);
  add(new THREE.SphereGeometry(0.20, 8, 5), FOL, 0.25, Y + 1.0, -0.25);
  add(new THREE.SphereGeometry(0.14, 7, 5), FOL2, 0.10, Y + 0.88, -0.15);
  add(new THREE.SphereGeometry(0.13, 7, 5), FOL3, 0.38, Y + 0.84, -0.36);
  cross(0.25, Y + 1.0, -0.25, 0.55, 0.40, FOL2);
  // tall glazed pot, leggy plant
  rpot(-0.42, -0.22, 0.15, 0.12, 0.34, GLAZE);
  add(C(0.006, 0.008, 0.55, 5, true), STEM, -0.42, Y + 0.58, -0.22, 0.1, 0, 0.15);
  cross(-0.42, Y + 0.72, -0.22, 0.40, 0.30, FOL);
  add(new THREE.SphereGeometry(0.07, 6, 4), FOL3, -0.36, Y + 0.85, -0.20);
  // small square planter with grass
  spot(-0.12, -0.32, 0.22, 0.22, WOOD3);
  for (let i = 0; i < 5; i++) add(new THREE.ConeGeometry(0.02, 0.36, 3), FOL3, -0.12 + (i - 2) * 0.03, Y + 0.22 + 0.16, -0.32 + ((i * 7) % 3) * 0.03 - 0.03, 0.1 * (i - 2), 0, -0.15 * (i - 2));
  // two small round pots
  rpot(-0.38, 0.22, 0.10, 0.08, 0.18, TERRA);
  cross(-0.38, Y + 0.30, 0.22, 0.28, 0.24, FOL2);
  rpot(0.05, 0.16, 0.09, 0.07, 0.16, TERRA2);
  add(new THREE.SphereGeometry(0.08, 6, 4), FOL3, 0.05, Y + 0.20, 0.16);
  add(new THREE.SphereGeometry(0.06, 6, 4), FOL, 0.02, Y + 0.26, 0.20);
  // hose: three-high coil
  add(new THREE.TorusGeometry(0.22, 0.018, 6, 14), HOSE, 0.05, Y + 0.02, 0.26, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.20, 0.018, 6, 14), HOSE2, 0.06, Y + 0.05, 0.25, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.21, 0.018, 6, 14), HOSE, 0.04, Y + 0.08, 0.27, Math.PI / 2, 0, 0);
  add(C(0.018, 0.018, 0.28, 6), HOSE2, -0.20, Y + 0.02, 0.40, 0, 0.5, Math.PI / 2);
  add(C(0.02, 0.022, 0.05, 6), GALV2, -0.33, Y + 0.02, 0.47, 0, 0.5, Math.PI / 2);
  // watering can with a boxy bail handle
  add(C(0.11, 0.12, 0.30, 12), GALV, 0.50, Y + 0.15, 0.20);
  add(C(0.122, 0.122, 0.04, 12, true), RUST, 0.50, Y + 0.08, 0.20);
  add(C(0.06, 0.06, 0.03, 10), GALV2, 0.50, Y + 0.315, 0.20);
  add(C(0.014, 0.03, 0.40, 6, true), GALV, 0.66, Y + 0.30, 0.10, 0, 0, -0.9);
  add(C(0.045, 0.035, 0.03, 8), GALV2, 0.80, Y + 0.42, 0.10, 0, 0, -0.9);
  add(B(0.02, 0.10, 0.02), GALV2, 0.50, Y + 0.36, 0.30);
  add(B(0.02, 0.10, 0.02), GALV2, 0.50, Y + 0.36, 0.10);
  add(B(0.02, 0.02, 0.22), GALV2, 0.50, Y + 0.41, 0.20);
  add(B(0.02, 0.02, 0.10), GALV2, 0.38, Y + 0.22, 0.20, 0, 0, 0);
  // --- the six lines: measure vertices, base to y=0, centre x/z ---------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
