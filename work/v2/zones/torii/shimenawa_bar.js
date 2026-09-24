// shimenawa_bar — ROLL obstacle, the shrine path's slide-under, authored like awning_strut_low: base at
// the GROUND, a rope-wrapped timber bar centred at 1.30 m between two posts that stand at x = +-0.88
// (1.9 m overall, the posts at the lane's edges and well outside the rolling runner's box), each on a
// stone foot with a dark grounding band. Two straw strands wind round the bar, a heavier straw cord is
// slung under it with four short shide and two tassels (all hanging above 0.95 m, clear of a rolling
// runner), the posts carry saddle brackets, iron pins, an iron band and finials.
// userData.obstacle = { kind: 'roll', lanes: 1 }: the hitbox starts at 1.3 m, where the bar is.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const WOOD = mk(0x6c4028, 'timber', 0.85);
  const WOOD2 = mk(0x4f2d21, 'timber', 0.90);
  const HEART = mk(0x8b6141, 'timber', 0.85);
  const BLACK = mk(0x110f12, 'stone', 0.90);
  const STONE = mk(0x8a8378, 'stone', 0.65);
  const ROPE = mk(0x8b6141, 'fabric', 0.95);
  const ROPE2 = mk(0x6c4028, 'fabric', 0.95);
  const ROPE3 = mk(0xbf7c42, 'fabric', 0.90);
  const KNOT = mk(0x37201b, 'fabric', 0.95);
  const PAPER = mk(0xe6ddd0, 'fabric', 0.90, { side: DS });
  const PAPER2 = mk(0xeee2c8, 'fabric', 0.90, { side: DS });
  const IRON = mk(0x231718, 'metal', 0.70, { metalness: 0.3, side: DS });

  const PX = 0.88, BY = 1.30, BR = 0.06;
  for (const s of [-1, 1]) {
    const x = s * PX;
    add(box(0.14, 0.05, 0.14), BLACK, x, 0.025, 0);
    add(box(0.13, 0.10, 0.13), STONE, x, 0.10, 0);
    add(new THREE.CylinderGeometry(0.042, 0.048, 1.38, 9), s > 0 ? WOOD : WOOD2, x, 0.84, 0);
    add(new THREE.SphereGeometry(0.052, 8, 6), WOOD2, x, 1.56, 0);
    add(box(0.13, 0.07, 0.15), WOOD2, x, BY - 0.075, 0);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.17, 5), IRON, x, BY, 0, Math.PI / 2, 0, 0);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 9, 1, true), IRON, x, 0.9 + s * 0.15, 0);
  }
  add(new THREE.CylinderGeometry(BR, BR, 1.90, 10), WOOD, 0, BY, 0, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(BR * 0.85, BR * 0.85, 0.01, 10), HEART, s * 0.953, BY, 0, 0, 0, Math.PI / 2);
  // two strands wound round the bar, 11 turns over 1.5 m, a half turn apart
  const helix = (phase, rr) => {
    const pts = []; for (let i = 0; i <= 110; i++) { const t = i / 110, a = t * Math.PI * 2 * 11 + phase; pts.push(new THREE.Vector3(-0.75 + t * 1.5, BY + rr * Math.cos(a), rr * Math.sin(a))); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 150, 0.017, 4, false);
  };
  add(helix(0, BR + 0.01), ROPE, 0, 0, 0);
  add(helix(Math.PI, BR + 0.01), ROPE2, 0, 0, 0);
  // the slung shimenawa with its shide and tassels
  const sag = (x) => BY - BR - 0.03 - 0.06 * (1 - (x / 0.8) ** 2);
  const pts = []; for (let i = 0; i <= 10; i++) { const x = -0.8 + i * 0.16; pts.push(new THREE.Vector3(x, sag(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.028, 5, false), ROPE3, 0, 0, 0);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) {
    const y0 = sag(x);
    add(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 5), KNOT, x, y0 - 0.03, 0);
    for (let k = 0; k < 2; k++) { const b = add(box(0.08, 0.09, 0.004), k ? PAPER : PAPER2, x + (k ? 0.035 : -0.035), y0 - 0.06 - 0.045 - k * 0.085, 0); b.rotation.y = k ? 0.35 : -0.35; }
  }
  for (const x of [-0.4, 0.4]) { add(new THREE.ConeGeometry(0.035, 0.16, 6), ROPE, x, sag(x) - 0.11, 0.03); add(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6), KNOT, x, sag(x) - 0.04, 0.03); }

  g.userData.obstacle = { kind: 'roll', lanes: 1 };
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
