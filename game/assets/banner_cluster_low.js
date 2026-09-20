// banner_cluster_low — WINNER (arm A): primitives. Five faded indigo noren banners (0.46 × 1.9 m,
// material `fabric` so the game may drop a stroke sprite on it) hung by box tabs from a
// 2.5 m rope built of sagging cylinder links with a knot at each end. Each banner is a thin
// DoubleSide box body plus a row of hanging strips of unequal length for the frayed hem.
// ROLL obstacle: base y = 0 is the LOWEST hem thread; the rope is at the top (~2.05 m).
// The game hangs it so the hems sit at 1.3 m clearance (rope ≈ 3.3 m). Depth ≤ 0.4 m.
// userData.obstacle = { kind: 'roll', lanes: 1 }.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const CLOTH = [mk(0x212841, 'fabric', { side: DS }), mk(0x262c48, 'fabric', { side: DS }), mk(0x1c2238, 'fabric', { side: DS })];
  const HEM = mk(0x2b2a33, 'fabric', { side: DS });          // mud-stained hems (wear)
  const ROPE = mk(0x8b6141, 'fabric', { roughness: 0.95 });
  const ROPE2 = mk(0x6c4028, 'fabric', { roughness: 0.95 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;   // deterministic 0..1

  const N = 5, BW = 0.46, GAP = 0.05, BH = 1.9, HEM_MAX = 0.14, ROPE_Y = 2.02;
  const pitch = BW + GAP, x0 = -((N - 1) * pitch) / 2;
  // rope: 12 links along a shallow sag, plus the knots
  const L = 2.5, links = 12;
  for (let i = 0; i < links; i++) {
    const xa = -L / 2 + (i / links) * L, xb = -L / 2 + ((i + 1) / links) * L;
    const sag = (x) => ROPE_Y - 0.05 * (1 - (x / (L / 2)) ** 2);
    const dx = xb - xa, dy = sag(xb) - sag(xa);
    add(new THREE.CylinderGeometry(0.012, 0.012, Math.hypot(dx, dy) + 0.004, 6), i % 2 ? ROPE : ROPE2, (xa + xb) / 2, (sag(xa) + sag(xb)) / 2, 0, 0, 0, Math.atan2(dy, dx) - Math.PI / 2);
  }
  for (const sx of [-1, 1]) add(new THREE.TorusGeometry(0.03, 0.013, 5, 8), ROPE2, sx * (L / 2 - 0.05), ROPE_Y - 0.05, 0, 0, sx * 0.6, 0);
  for (let b = 0; b < N; b++) {
    const bx = x0 + b * pitch;
    const mat = CLOTH[b % 3];
    const tilt = (rnd(b) - 0.5) * 0.10, twist = (rnd(b + 7) - 0.5) * 0.18;
    const yBody = HEM_MAX + (BH - HEM_MAX) / 2;
    const body = add(new THREE.BoxGeometry(BW, BH - HEM_MAX, 0.008), mat, bx, yBody, 0, tilt, twist, 0);
    // tabs over the rope
    for (const tx of [-0.16, 0.16]) add(new THREE.BoxGeometry(0.05, 0.10, 0.04), mat, bx + tx, ROPE_Y - 0.02, 0);
    // frayed hem: 9 strips of unequal length hanging from the body's lower edge
    const strips = 9, sw = BW / strips;
    for (let s = 0; s < strips; s++) {
      const len = 0.04 + rnd(b * 17 + s) * (HEM_MAX - 0.04);
      const x = -BW / 2 + sw * (s + 0.5);
      const m = add(new THREE.BoxGeometry(sw * 0.8, len, 0.006), s % 3 === 1 ? HEM : mat, 0, 0, 0);
      m.position.set(bx + x, HEM_MAX - len / 2, 0.002);
      m.rotation.set(tilt, twist, (rnd(s + b) - 0.5) * 0.1);
    }
    // a mud band low on the body (wear)
    add(new THREE.PlaneGeometry(BW * 0.9, 0.18), HEM, bx, HEM_MAX + 0.12, 0.006, tilt, twist, 0);
  }

  g.userData.obstacle = { kind: 'roll', lanes: 1 };
  finish(THREE, g);
  return g;
}
function finish(THREE, g) {
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
}
