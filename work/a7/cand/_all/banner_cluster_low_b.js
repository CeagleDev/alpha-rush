// banner_cluster_low — arm B: profiles. Each banner is ONE THREE.Shape with a jagged,
// torn lower edge, extruded 8 mm (DoubleSide `fabric`, faded indigo, three tones), hung
// from a rope that is a TubeGeometry along a catenary with rope loops (tori) as the tabs.
// Five banners 0.46 × 1.9 m on a 2.5 m rope; ROLL obstacle: base y = 0 is the lowest hem
// point, rope at the top (~2.05 m). The game hangs it so hems are at 1.3 m clearance
// (rope ≈ 3.3 m). Depth ≤ 0.4 m. userData.obstacle = { kind: 'roll', lanes: 1 }.
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
  const ROPE = mk(0x8b6141, 'fabric', { roughness: 0.95 });
  const ROPE2 = mk(0x6c4028, 'fabric', { roughness: 0.95 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;

  const N = 5, BW = 0.46, GAP = 0.05, BH = 1.9, ROPE_Y = 2.02, L = 2.5;
  const pitch = BW + GAP, x0 = -((N - 1) * pitch) / 2;
  // rope
  const pts = [];
  for (let i = 0; i <= 10; i++) { const x = -L / 2 + (i / 10) * L; pts.push(new THREE.Vector3(x, ROPE_Y - 0.05 * (1 - (x / (L / 2)) ** 2), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.012, 5, false), ROPE, 0, 0, 0);
  for (const sx of [-1, 1]) add(new THREE.TorusGeometry(0.03, 0.013, 4, 7), ROPE2, sx * (L / 2 - 0.05), ROPE_Y - 0.05, 0, 0, sx * 0.6, 0);
  // banners
  for (let b = 0; b < N; b++) {
    const bx = x0 + b * pitch, mat = CLOTH[b % 3];
    const s = new THREE.Shape();
    s.moveTo(-BW / 2, BH); s.lineTo(BW / 2, BH); s.lineTo(BW / 2, 0.16);
    const teeth = 12;
    for (let k = 0; k <= teeth; k++) {
      const x = BW / 2 - (k / teeth) * BW;
      const y = (k === teeth) ? 0.16 : 0.02 + rnd(b * 31 + k) * 0.14 * (k % 2 ? 1 : 0.35);
      s.lineTo(x, y);
    }
    s.lineTo(-BW / 2, BH);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
    const m = add(geo, mat, bx, 0, -0.004, (rnd(b) - 0.5) * 0.10, (rnd(b + 7) - 0.5) * 0.18, 0);
    // a mud band and a bleached patch (wear)
    const mud = add(new THREE.PlaneGeometry(BW * 0.9, 0.16), HEM, bx, 0.26, 0.009);
    mud.rotation.copy(m.rotation);
    // rope loops as tabs
    for (const tx of [-0.16, 0.16]) add(new THREE.TorusGeometry(0.028, 0.008, 3, 6), ROPE2, bx + tx, ROPE_Y - 0.03, 0, 0, Math.PI / 2, 0);
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
