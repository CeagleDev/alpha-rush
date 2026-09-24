// shrine_fox_statue — a 1.2 m stone kitsune on a two-tier plinth for the shrine path: seated, facing
// +Z, haunches and chest, straight forelegs on paws, a raised head with a pointed snout and tall ears,
// a bushy tail curling up the back, and a red cloth bib (the one spot of colour). Wear: moss on the
// plinth foot and the fox's back, lichen blotches, a chipped plinth cap, a crack line. Grounding
// band under the plinth. Base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const sph = (r, ws = 10, hs = 7) => new THREE.SphereGeometry(r, ws, hs);

  const STONE = mk(0x8a8378, 'stone', 0.65);
  const STONE2 = mk(0x77716a, 'stone', 0.70);
  const PLINTH = mk(0x6f6a62, 'stone', 0.60);
  const DARK = mk(0x4a4a4c, 'stone', 0.80);
  const BLACK = mk(0x110f12, 'stone', 0.90);
  const MOSS = mk(0x3d4a22, 'foliage', 0.95);
  const LICHEN = mk(0xa8a08a, 'stone', 0.80);
  const RED = mk(0xb8302a, 'fabric', 0.85, { side: DS });

  // plinth: grounding band, base, chamfer step, block, cap
  add(box(0.58, 0.05, 0.58), BLACK, 0, 0.025, 0);
  add(box(0.54, 0.12, 0.54), PLINTH, 0, 0.11, 0);
  add(box(0.46, 0.04, 0.46), STONE2, 0, 0.19, 0);
  add(box(0.40, 0.20, 0.40), PLINTH, 0, 0.31, 0);
  add(box(0.44, 0.03, 0.44), STONE2, 0, 0.425, 0);
  add(box(0.05, 0.06, 0.05), DARK, 0.20, 0.415, 0.20, 0, Math.PI / 4, 0);            // a chipped cap corner, cut into the cap (wear)
  add(box(0.012, 0.16, 0.006), DARK, -0.12, 0.30, 0.203, 0, 0, 0.3);                 // a crack line
  // the fox: haunches, torso, forelegs and paws, neck, head, snout, ears, tail
  add(sph(0.17), STONE, 0, 0.60, -0.06).scale.set(1.05, 0.85, 1.15);
  add(new THREE.CylinderGeometry(0.10, 0.155, 0.42, 10), STONE, 0, 0.80, 0.02, 0.2, 0, 0);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.035, 0.042, 0.36, 7), STONE, s * 0.075, 0.62, 0.14, 0.05, 0, 0);
    add(box(0.075, 0.05, 0.12), STONE2, s * 0.075, 0.465, 0.17);
  }
  add(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 8), STONE, 0, 1.01, 0.08, 0.25, 0, 0);
  add(sph(0.095), STONE, 0, 1.09, 0.11).scale.set(0.95, 1.0, 1.1);
  add(new THREE.ConeGeometry(0.045, 0.15, 7), STONE2, 0, 1.065, 0.235, Math.PI / 2 + 0.15, 0, 0);
  for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.04, 0.13, 6), STONE2, s * 0.06, 1.17, 0.07, -0.1, 0, -s * 0.25);
  const tail = new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 0.50, -0.20), new THREE.Vector3(0.17, 0.62, -0.27), new THREE.Vector3(0.13, 0.85, -0.23), new THREE.Vector3(0.06, 1.0, -0.15)]);
  add(new THREE.TubeGeometry(tail, 12, 0.055, 7, false), STONE, 0, 0, 0);
  add(sph(0.075, 8, 6), STONE, 0.155, 0.66, -0.26);
  add(sph(0.06, 8, 6), STONE2, 0.06, 1.0, -0.15);
  // the bib: a collar and a hanging flap
  add(new THREE.CylinderGeometry(0.085, 0.09, 0.06, 10, 1, true), RED, 0, 0.99, 0.07, 0.25, 0, 0);
  add(box(0.13, 0.13, 0.008), RED, 0, 0.92, 0.155, 0.35, 0, 0);
  // moss and lichen
  for (const [x, z] of [[-0.2, 0.16], [0.17, -0.2], [0.21, 0.08]]) add(sph(0.10, 7, 4), MOSS, x, 0.05, z).scale.set(1, 0.4, 1);
  add(sph(0.07, 7, 4), MOSS, -0.06, 0.78, -0.12).scale.set(1, 0.4, 1.2);
  for (const [x, y, z, ry] of [[0.28, 0.12, 0.10, Math.PI / 2], [0.05, 0.33, 0.203, 0], [-0.19, 0.60, -0.06, -Math.PI / 2]]) add(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 7), LICHEN, x, y, z, Math.PI / 2, ry, 0);

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
