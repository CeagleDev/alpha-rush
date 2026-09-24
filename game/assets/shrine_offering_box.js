// shrine_offering_box — BLOCK obstacle: a wooden saisen (offering) box for the shrine path, 1.9 m tall
// x 1.88 m wide. A stone plinth on a dark grounding band, a timber leg frame, the panelled box body
// with iron corner straps and a faded panel on one side (wear), a slatted grille lid over a dark
// slot, and above it the bell frame: two posts and a crossbar carrying a striped bell rope and a
// brass suzu. An ofuda paper strip on the front, moss at the plinth foot. Front faces +Z.
// userData.obstacle = { kind: 'block', lanes: 1 }. Base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const WOOD = mk(0x4f2d21, 'timber', 0.85);
  const WOOD2 = mk(0x37201b, 'timber', 0.90);
  const WOOD3 = mk(0x6c4028, 'timber', 0.85);
  const FADE = mk(0x8b6141, 'timber', 0.90);
  const STONE = mk(0x6f6a62, 'stone', 0.60);
  const BLACK = mk(0x110f12, 'stone', 0.90);
  const IRON = mk(0x231718, 'metal', 0.70, { metalness: 0.3 });
  const BRASS = mk(0xbf7c42, 'metal', 0.45, { metalness: 0.3 });
  const RED = mk(0xb8302a, 'fabric', 0.85);
  const WHITE = mk(0xeee2c8, 'fabric', 0.85, { side: DS });
  const PAPER = mk(0xe6ddd0, 'plaster', 0.90);
  const MOSS = mk(0x3d4a22, 'foliage', 0.95);

  const W = 1.80, D = 0.95;
  add(box(1.88, 0.05, 1.03), BLACK, 0, 0.025, 0);
  add(box(1.86, 0.10, 1.01), STONE, 0, 0.10, 0);
  add(box(0.08, 0.09, 0.08), BLACK, 0.90, 0.105, 0.47, 0, Math.PI / 4, 0);      // chipped plinth corner (wear)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.10, 0.28, 0.10), WOOD2, sx * (W / 2 - 0.07), 0.29, sz * (D / 2 - 0.07));
  for (const sz of [-1, 1]) add(box(W - 0.2, 0.06, 0.06), WOOD2, 0, 0.40, sz * (D / 2 - 0.07));
  for (const sx of [-1, 1]) add(box(0.06, 0.06, D - 0.2), WOOD2, sx * (W / 2 - 0.07), 0.40, 0);
  // body 0.43..1.18 with a dark stain band at its foot
  add(box(W, 0.75, D), WOOD, 0, 0.805, 0);
  add(box(W + 0.01, 0.10, D + 0.01), WOOD2, 0, 0.48, 0);
  // panel framing, front and back (rails and three mullions), sides (rails and two mullions)
  for (const sz of [-1, 1]) {
    const z = sz * (D / 2 + 0.015);
    add(box(W, 0.06, 0.03), WOOD3, 0, 1.15, z); add(box(W, 0.06, 0.03), WOOD3, 0, 0.56, z);
    for (const x of [-W / 2 + 0.03, 0, W / 2 - 0.03]) add(box(0.06, 0.75, 0.03), WOOD3, x, 0.805, z);
  }
  for (const sx of [-1, 1]) {
    const x = sx * (W / 2 + 0.015);
    add(box(0.03, 0.06, D), WOOD3, x, 1.15, 0); add(box(0.03, 0.06, D), WOOD3, x, 0.56, 0);
    for (const z of [-D / 2 + 0.03, D / 2 - 0.03]) add(box(0.03, 0.75, 0.06), WOOD3, x, 0.805, z);
  }
  add(box(0.006, 0.50, 0.70), FADE, -W / 2 - 0.003, 0.85, 0);                        // sun-faded left panel (wear)
  // iron corner straps and a lock plate
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0.50, 1.12]) {
    add(box(0.16, 0.05, 0.012), IRON, sx * (W / 2 - 0.08), y, sz * (D / 2 + 0.036));
    add(box(0.012, 0.05, 0.16), IRON, sx * (W / 2 + 0.036), y, sz * (D / 2 - 0.08));
  }
  add(box(0.10, 0.14, 0.012), IRON, 0.35, 0.85, D / 2 + 0.036);
  // grille lid 1.18..1.30: rails, a dark slot, nine slanted slats
  add(box(W - 0.16, 0.02, D - 0.16), BLACK, 0, 1.19, 0);
  for (const sz of [-1, 1]) add(box(W, 0.12, 0.08), WOOD2, 0, 1.24, sz * (D / 2 - 0.04));
  for (const sx of [-1, 1]) add(box(0.08, 0.12, D - 0.16), WOOD2, sx * (W / 2 - 0.04), 1.24, 0);
  for (let i = 0; i < 9; i++) add(box(W - 0.16, 0.08, 0.03), WOOD3, 0, 1.25, -D / 2 + 0.12 + i * ((D - 0.24) / 8), 0.75, 0, 0);
  // bell frame: posts, crossbar, brackets, the rope and the suzu
  for (const sx of [-1, 1]) { add(box(0.09, 0.58, 0.09), WOOD2, sx * (W / 2 - 0.045), 1.59, 0); add(box(0.05, 0.16, 0.05), WOOD3, sx * (W / 2 - 0.13), 1.75, 0, 0, 0, sx * 0.7); }
  add(box(W + 0.06, 0.10, 0.11), WOOD2, 0, 1.85, 0);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 8), RED, 0, 1.68, 0);
  for (const y of [1.62, 1.74]) add(new THREE.CylinderGeometry(0.047, 0.047, 0.04, 8, 1, true), WHITE, 0, y, 0);
  add(new THREE.TorusGeometry(0.05, 0.012, 4, 8), WOOD2, 0, 1.79, 0, Math.PI / 2, 0, 0);
  add(new THREE.SphereGeometry(0.13, 12, 9), BRASS, 0, 1.45, 0);
  add(new THREE.TorusGeometry(0.035, 0.008, 4, 8), BRASS, 0, 1.585, 0, 0, 0, 0);
  for (const sz of [-1, 1]) add(box(0.16, 0.022, 0.03), BLACK, 0, 1.43, sz * 0.12);
  add(new THREE.TorusGeometry(0.128, 0.01, 4, 16), IRON, 0, 1.45, 0, Math.PI / 2, 0, 0);   // the seam band round the bell
  // ofuda strip and moss
  add(box(0.10, 0.32, 0.006), PAPER, 0.62, 0.85, D / 2 + 0.034, 0, 0, 0.03);
  for (const [x, z] of [[-0.8, 0.45], [0.7, -0.44]]) add(new THREE.SphereGeometry(0.12, 7, 4), MOSS, x, 0.05, z).scale.set(1.3, 0.4, 1);

  g.userData.obstacle = { kind: 'block', lanes: 1 };
  finish(THREE, g);
  return g;
}
function finish(THREE, g, lights) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  if (lights) g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
