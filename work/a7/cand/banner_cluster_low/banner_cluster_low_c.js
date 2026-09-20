// banner_cluster_low — arm C: a different breakdown. Each banner is a subdivided
// PlaneGeometry (4 × 10) whose vertices are pushed into a gentle wind-bow in Z and whose
// bottom row is torn (raised unevenly) by writing to geometry.attributes.position; loose
// threads are thin cylinders hanging below. Rope is a TubeGeometry catenary with knots.
// Five 0.48 × 1.9 m banners (`fabric`, faded indigo), 2.5 m rope; ROLL obstacle, base
// y = 0 at the lowest thread, rope at the top (~2.05 m). The game hangs it so hems are at
// 1.3 m clearance (rope ≈ 3.3 m). Depth ≤ 0.4 m. userData.obstacle = { kind:'roll', lanes:1 }.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const CLOTH = [mk(0x212841, 'fabric', { side: DS }), mk(0x262c48, 'fabric', { side: DS }), mk(0x1c2238, 'fabric', { side: DS })];
  const HEM = mk(0x2b2a33, 'fabric', { side: DS });
  const THREAD = mk(0x8b8378, 'fabric', { roughness: 0.95 });
  const ROPE = mk(0x8b6141, 'fabric', { roughness: 0.95 });
  const ROPE2 = mk(0x6c4028, 'fabric', { roughness: 0.95 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;

  const N = 5, BW = 0.48, GAP = 0.025, BH = 1.78, ROPE_Y = 2.02, L = 2.5, TH = 0.12;
  const pitch = BW + GAP, x0 = -((N - 1) * pitch) / 2;
  const pts = [];
  for (let i = 0; i <= 10; i++) { const x = -L / 2 + (i / 10) * L; pts.push(new THREE.Vector3(x, ROPE_Y - 0.05 * (1 - (x / (L / 2)) ** 2), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.012, 5, false), ROPE, 0, 0, 0);
  for (const sx of [-1, 1]) add(new THREE.TorusGeometry(0.03, 0.013, 4, 7), ROPE2, sx * (L / 2 - 0.05), ROPE_Y - 0.05, 0, 0, sx * 0.6, 0);
  for (let b = 0; b < N; b++) {
    const bx = x0 + b * pitch, mat = CLOTH[b % 3], phase = rnd(b) * 6.28, amp = 0.02 + rnd(b + 3) * 0.03;
    const geo = new THREE.PlaneGeometry(BW, BH, 3, 8);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const t = (y + BH / 2) / BH;                                   // 0 at hem, 1 at rope
      p.setZ(i, amp * Math.sin(t * 5 + phase) * (1 - t) + 0.01 * Math.sin(x * 20 + phase) * (1 - t));
      if (t < 0.01) p.setY(i, y + rnd(b * 13 + i) * 0.10);          // torn hem
    }
    geo.computeVertexNormals();
    const tilt = (rnd(b + 11) - 0.5) * 0.08;
    add(geo, mat, bx, TH + BH / 2, 0, 0, tilt, 0);
    // stitched top hem band and two tabs
    add(new THREE.BoxGeometry(BW, 0.05, 0.014), mat, bx, TH + BH - 0.025, 0, 0, tilt, 0);
    for (const tx of [-0.17, 0.17]) add(new THREE.BoxGeometry(0.05, 0.12, 0.04), mat, bx + tx, ROPE_Y - 0.03, 0);
    // loose threads below the torn edge
    for (let s = 0; s < 6; s++) {
      const len = 0.04 + rnd(b * 19 + s) * TH;
      const x = bx - BW / 2 + (s + 0.5) * (BW / 6) + (rnd(s) - 0.5) * 0.04;
      add(new THREE.CylinderGeometry(0.003, 0.003, len, 4, 1, true), s % 2 ? THREAD : HEM, x, TH + 0.02 - len / 2, 0.004, 0, 0, (rnd(s + b) - 0.5) * 0.2);
    }
    // grime band (wear)
    add(new THREE.PlaneGeometry(BW * 0.85, 0.14), HEM, bx, TH + 0.14, 0.03, 0, tilt, 0);
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
