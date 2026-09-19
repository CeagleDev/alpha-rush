// cable_span — arm C: a different reading. The cables are not four loose lines
// but two TWISTED PAIRS per crossing, wound round each other along the sag (the
// way the reference's bundle coils), bound every 1.5 m by a taped clip, with one
// heavier feeder cable slung separately. Tubes along CatmullRom curves whose
// points carry the twist. The spare loop is a real drooping coil (three turns),
// and the junction box sits ON the feeder with a drop to a second small box.
// Base y = 0 is the LOWEST cable point; the game places the group at y = 4.5.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); s.name = name; return s; };
  const CABLE = mat(0x110f12, 'metal', 0.75, 0.3);
  const CABLE2 = mat(0x171317, 'metal', 0.70, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const BOX   = mat(0x37201b, 'metal', 0.85, 0.3);
  const TAPE  = mat(0x241a1a, 'fabric', 0.95);
  const TIMB  = mat(0x37201b, 'timber', 0.90);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const tube = (pts, r, material, segs) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), segs, r, 6, false), material); g.add(m); return m; };
  const sagY = (y0, y1, sag, t) => y0 + (y1 - y0) * t - 4 * sag * t * (1 - t);

  // a twisted pair: two tubes wound about the pair's axis, 'turns' twists across the span
  const pair = (y0, y1, sag, z, turns, phase, r) => {
    for (let k = 0; k < 2; k++) {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, a = phase + k * Math.PI + t * turns * Math.PI * 2;
        pts.push(new THREE.Vector3(-4.5 + 9 * t, sagY(y0, y1, sag, t) + Math.sin(a) * 0.022, z + Math.cos(a) * 0.022));
      }
      tube(pts, r, k ? CABLE2 : CABLE, 26);
    }
    // taped clips binding the pair
    for (let i = 1; i < 6; i++) { const t = i / 6; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 6, 1, true), TAPE); c.material.side = THREE.DoubleSide; c.rotation.z = Math.PI / 2; c.position.set(-4.5 + 9 * t, sagY(y0, y1, sag, t), z); g.add(c); }
  };
  const single = (y0, y1, sag, z, r, material) => {
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector3(-4.5 + 9 * t, sagY(y0, y1, sag, t), z + (hash(i, z) - 0.5) * 0.04)); }
    return tube(pts, r, material, 20);
  };
  const crossings = [
    { z: -10, lo: 0.75, hi: 1.35, feed: 1.75, sag: 0.55, tilt: 0.12, turns: 2.5 },
    { z: 0,   lo: 0.60, hi: 1.10, feed: 1.95, sag: 0.60, tilt: -0.10, turns: 3 },
    { z: 10,  lo: 0.85, hi: 1.50, feed: 1.80, sag: 0.50, tilt: 0.18, turns: 2 },
  ];
  crossings.forEach((c, ci) => {
    pair(c.lo - c.tilt, c.lo + c.tilt, c.sag, c.z - 0.06, c.turns, ci, 0.012);
    pair(c.hi - c.tilt, c.hi + c.tilt, c.sag * 0.9, c.z + 0.06, c.turns + 0.5, ci + 1, 0.012);
    single(c.feed - c.tilt, c.feed + c.tilt, c.sag * 1.1, c.z, 0.018, CABLE);
    for (const sx of [-1, 1]) {
      B(0.10, 0.6, 0.24, TIMB, sx * 4.47, c.lo + 0.45, c.z);
      B(0.16, 0.04, 0.12, RUST, sx * 4.45, c.feed + (sx < 0 ? -c.tilt : c.tilt) + 0.03, c.z);
      for (const y of [c.lo, c.hi]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 6), RUST); k.rotation.z = Math.PI / 2; k.position.set(sx * 4.41, y + (sx < 0 ? -c.tilt : c.tilt), c.z + (y === c.lo ? -0.06 : 0.06)); g.add(k); }
    }
  });
  // junction box on the middle feeder, x = 2.6, with a drop to a small box below
  B(0.30, 0.22, 0.16, BOX, 2.6, 1.45, 0); B(0.32, 0.02, 0.18, RUST, 2.6, 1.57, 0);
  tube([new THREE.Vector3(2.6, 1.34, 0.02), new THREE.Vector3(2.62, 1.1, 0.05), new THREE.Vector3(2.58, 0.9, 0.04)], 0.009, CABLE, 6);
  B(0.16, 0.20, 0.10, BOX, 2.58, 0.80, 0.04);
  // spare coil: three drooping turns hung from the middle pair at x = -2.4
  {
    const pts = [];
    for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI * 6; pts.push(new THREE.Vector3(-2.4 + Math.cos(a) * 0.30, 0.92 - (0.5 + 0.5 * Math.sin(a - Math.PI / 2)) * 0.62, -0.05 + (i / 36) * 0.10 + Math.sin(a) * 0.04)); }
    tube(pts, 0.011, CABLE2, 60);
    for (const dx of [-0.3, 0.3]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 4, 8), TAPE); t.position.set(-2.4 + dx, 0.92, 0); g.add(t); }
  }
  g.userData.mountHeight = 4.5;

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
