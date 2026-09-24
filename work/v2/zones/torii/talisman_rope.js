// talisman_rope — a 7 m straw rope of paper shide strung across the path, from the env_torii board
// (the shide ropes between the gates). Authored ALONG X (ends at x = +-3.5), rope ends at 4.5 with a
// 0.3 m sag, a twisted strand wound round the core cord, lashings at the ends, nine zigzag shide, seven
// tanzaku strips and three straw tassels hanging from it. Recentred so the lowest paper is at y = 0;
// userData.hangAt says where the rope ends belong. The level places it at y = hangAt - size.y + 0.03.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const ROPE = mk(0x8b6141, 'fabric', 0.95);
  const ROPE2 = mk(0x6c4028, 'fabric', 0.95);
  const ROPE3 = mk(0xbf7c42, 'fabric', 0.90);
  const KNOT = mk(0x37201b, 'fabric', 0.95);
  const PAPER = mk(0xe6ddd0, 'fabric', 0.90, { side: DS });
  const PAPER2 = mk(0xeee2c8, 'fabric', 0.90, { side: DS });

  const L = 3.5, Y0 = 4.5, SAG = 0.30;
  const ry = (x) => Y0 - SAG * (1 - (x / L) ** 2);
  const pts = []; for (let i = 0; i <= 14; i++) { const x = -L + i * (2 * L / 14); pts.push(new THREE.Vector3(x, ry(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 42, 0.028, 5, false), ROPE, 0, 0, 0);
  for (let s = 0; s < 2; s++) {
    const p = []; for (let i = 0; i <= 84; i++) { const x = -L + i * (2 * L / 84), a = i * 0.75 + s * Math.PI; p.push(new THREE.Vector3(x, ry(x) + 0.03 * Math.sin(a), 0.03 * Math.cos(a))); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), 84, 0.011, 3, false), s ? ROPE2 : ROPE3, 0, 0, 0);
  }
  for (const s of [-1, 1]) {
    const x = s * (L - 0.12);
    add(new THREE.TorusGeometry(0.05, 0.014, 4, 8), KNOT, x, ry(x), 0, 0, Math.PI / 2, 0);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 5), KNOT, x, ry(x) - 0.10, 0);
  }
  // shide: zigzag paper, four folds, alternately offset with a little yaw so the folds catch light
  const shide = (x, yaw) => {
    const y0 = ry(x);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 5), KNOT, x, y0 - 0.03, 0);
    for (let k = 0; k < 4; k++) {
      const b = add(new THREE.BoxGeometry(0.10, 0.11, 0.004), k % 2 ? PAPER : PAPER2, x + (k % 2 ? 0.045 : -0.045), y0 - 0.07 - 0.055 - k * 0.105, 0);
      b.rotation.y = yaw + (k % 2 ? 0.35 : -0.35); b.rotation.z = k % 2 ? 0.06 : -0.06;
    }
  };
  for (let k = 0; k < 9; k++) shide(-3.2 + k * 0.8, (k % 2 ? 1 : -1) * (0.55 + hash(k, 1) * 0.6));
  for (let k = 0; k < 7; k++) {
    const x = -2.6 + k * 0.8;
    const b = add(new THREE.BoxGeometry(0.045, 0.34, 0.004), PAPER2, x, ry(x) - 0.05 - 0.17, 0);
    b.rotation.y = (hash(k, 2) - 0.5) * 2.4; b.rotation.z = (hash(k, 3) - 0.5) * 0.1;
  }
  for (const [x, zt] of [[-2.0, 0.09], [0.4, -0.09], [2.8, 0.09]]) {
    add(new THREE.ConeGeometry(0.055, 0.28, 7), ROPE, x, ry(x) - 0.17, zt);
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 6), KNOT, x, ry(x) - 0.06, zt);
  }
  g.userData.hangAt = 4.5;
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
