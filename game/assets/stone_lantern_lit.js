// stone_lantern_lit — a 1.8 m stone lantern (toro) from the env_torii board: a square base slab and
// pedestal, a round column with a node ring, a flared platform, a firebox with open windows front and
// back (a stone mullion on the side windows) glowing with a candle-lit interior, a square roof with
// upturned eaves carrying moss, and a jewel finial. Wear: a chipped base corner, lichen blotches, a
// damp streak under the roof, moss at the foot. Emissive interior + one warm userData.lights entry.
// Base y = 0, the open windows face +Z and -Z (the chunk turns it to face the path).
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const STONE = mk(0x8a8378, 'stone', 0.60);
  const STONE2 = mk(0x77716a, 'stone', 0.65);
  const DARK = mk(0x4a4a4c, 'stone', 0.75);
  const ROOF = mk(0x6f6a62, 'stone', 0.70, { flatShading: true, side: DS });
  const BLACK = mk(0x110f12, 'stone', 0.90);
  const MOSS = mk(0x3d4a22, 'foliage', 0.95);
  const MOSS2 = mk(0x4a5a2a, 'foliage', 0.95);
  const LICHEN = mk(0xa8a08a, 'stone', 0.80);
  const STREAK = mk(0x37201b, 'stone', 0.95);
  const GLOW = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 2.6, roughness: 0.35 });
  const FLAME = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe5b055), emissiveIntensity: 3.0, roughness: 0.35 });

  // base: grounding band, slab, chamfer step, pedestal
  add(box(0.62, 0.05, 0.62), BLACK, 0, 0.025, 0);
  add(box(0.60, 0.10, 0.60), STONE, 0, 0.10, 0);
  add(box(0.52, 0.04, 0.52), STONE2, 0, 0.17, 0);
  add(box(0.44, 0.12, 0.44), STONE, 0, 0.25, 0);
  add(box(0.12, 0.11, 0.12), DARK, 0.30, 0.10, 0.30, 0, Math.PI / 4, 0).scale.set(0.6, 1, 0.6);   // chipped corner (wear)
  // column with a base ring and a node ring
  add(new THREE.CylinderGeometry(0.15, 0.16, 0.05, 12), STONE2, 0, 0.335, 0);
  add(new THREE.CylinderGeometry(0.12, 0.13, 0.55, 12), STONE, 0, 0.60, 0);
  add(new THREE.CylinderGeometry(0.145, 0.145, 0.05, 12), STONE2, 0, 0.60, 0);
  // platform (chudai), flaring outwards
  add(box(0.34, 0.05, 0.34), STONE2, 0, 0.885, 0);
  add(box(0.46, 0.10, 0.46), STONE, 0, 0.96, 0);
  // firebox: rails, four corner posts, mullions on the side windows, the glowing interior
  add(box(0.40, 0.05, 0.40), STONE, 0, 1.035, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.06, 0.30, 0.06), STONE2, sx * 0.17, 1.21, sz * 0.17);
  for (const sx of [-1, 1]) add(box(0.05, 0.30, 0.05), STONE2, sx * 0.17, 1.21, 0);
  add(box(0.40, 0.05, 0.40), STONE, 0, 1.385, 0);
  add(box(0.28, 0.29, 0.28), GLOW, 0, 1.21, 0);
  add(new THREE.CylinderGeometry(0.02, 0.025, 0.08, 6), FLAME, 0, 1.10, 0.145);       // the candle, just inside the front window
  add(box(0.062, 0.14, 0.062), STREAK, -0.17, 1.30, 0.17);                              // damp streak on one post (wear)
  // roof: a 4-segment lathe (square in plan) with upturned eaves, flat shaded
  const prof = [[0.12, 0.00], [0.34, 0.00], [0.37, 0.04], [0.36, 0.07], [0.28, 0.12], [0.19, 0.19], [0.10, 0.25], [0.0, 0.28]];
  add(new THREE.LatheGeometry(prof.map(([s, h]) => new THREE.Vector2(s * Math.SQRT2, h)), 4), ROOF, 0, 1.41, 0, 0, Math.PI / 4, 0);
  for (const [x, z, r] of [[0.16, 0.10, 0.13], [-0.12, -0.18, 0.11], [0.02, 0.24, 0.09]]) {
    const mo = add(new THREE.SphereGeometry(r, 7, 4), r > 0.1 ? MOSS : MOSS2, x, 1.41 + 0.28 - (Math.abs(x) + Math.abs(z)) * 0.6, z); mo.scale.set(1.2, 0.3, 1);
  }
  // finial: collar and jewel
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 8), STONE2, 0, 1.705, 0);
  add(new THREE.SphereGeometry(0.048, 8, 6), STONE, 0, 1.765, 0);
  // lichen blotches and moss at the foot
  for (const [x, y, z, ry] of [[0.30, 0.22, 0.05, Math.PI / 2], [-0.05, 0.55, 0.13, 0], [0.13, 0.75, -0.02, -Math.PI / 2]]) {
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.004, 7), LICHEN, x, y, z, Math.PI / 2, ry, 0);
  }
  for (const [x, z] of [[-0.25, 0.2], [0.18, -0.28]]) { const mo = add(new THREE.SphereGeometry(0.12, 7, 4), MOSS, x, 0.05, z); mo.scale.set(1, 0.4, 1); }

  finish(THREE, g, [{ x: 0, y: 1.21, z: 0, color: 0xf0a060, intensity: 1.2, range: 4 }]);
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
